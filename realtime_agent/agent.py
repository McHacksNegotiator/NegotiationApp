import asyncio
import base64
import logging
import os
import signal
from builtins import anext
from typing import Any

from agora.rtc.rtc_connection import RTCConnection, RTCConnInfo
from agora.rtc import RtcEngine  # Correct import
from attr import dataclass

from agora_realtime_ai_api.rtc import Channel, ChatMessage, RtcEngine, RtcOptions

from .logger import setup_logger
from .realtime.struct import (
    ErrorMessage,
    FunctionCallOutputItemParam,
    InputAudioBufferCommitted,
    InputAudioBufferSpeechStarted,
    InputAudioBufferSpeechStopped,
    InputAudioTranscription,
    ItemCreate,
    ItemCreated,
    ItemInputAudioTranscriptionCompleted,
    RateLimitsUpdated,
    ResponseAudioDelta,
    ResponseAudioDone,
    ResponseAudioTranscriptDelta,
    ResponseAudioTranscriptDone,
    ResponseContentPartAdded,
    ResponseContentPartDone,
    ResponseCreate,
    ResponseCreated,
    ResponseDone,
    ResponseFunctionCallArgumentsDelta,
    ResponseFunctionCallArgumentsDone,
    ResponseOutputItemAdded,
    ResponseOutputItemDone,
    ServerVADUpdateParams,
    SessionUpdate,
    SessionUpdateParams,
    SessionUpdated,
    Voices,
    to_json,
    ClientData,
)
from .realtime.connection import RealtimeApiConnection
from .tools import ClientToolCallResponse, ToolContext
from .utils import PCMWriter

# Set up the logger with color and timestamp support
logger = setup_logger(name=__name__, log_level=logging.INFO)


def _monitor_queue_size(
    queue: asyncio.Queue, queue_name: str, threshold: int = 5
) -> None:
    queue_size = queue.qsize()
    if queue_size > threshold:
        logger.warning(
            f"Queue {queue_name} size exceeded {threshold}: current size {queue_size}"
        )


@dataclass(frozen=True, kw_only=True)
class InferenceConfig:
    system_message: str | None = None
    turn_detection: ServerVADUpdateParams | None = None  # MARK: CHECK!
    voice: Voices | None = None
    client_data: ClientData | None = None


class RealtimeKitAgent:
    engine: RtcEngine
    channel: Channel
    connection: RealtimeApiConnection
    audio_queue: asyncio.Queue[bytes] = asyncio.Queue()

    message_queue: asyncio.Queue[ResponseAudioTranscriptDelta] = asyncio.Queue()
    message_done_queue: asyncio.Queue[ResponseAudioTranscriptDone] = asyncio.Queue()
    tools: ToolContext | None = None

    _client_tool_futures: dict[str, asyncio.Future[ClientToolCallResponse]]

    @classmethod
    async def setup_and_run_agent(
        cls,
        *,
        engine: RtcEngine,
        options: RtcOptions,
        inference_config: InferenceConfig,
        tools: ToolContext | None,
    ) -> None:
        channel = engine.create_channel(options)
        await channel.connect()

        try:
            async with RealtimeApiConnection(
                base_uri=os.getenv("REALTIME_API_BASE_URI", "wss://api.openai.com"),
                api_key=os.getenv("OPENAI_API_KEY"),
                verbose=False,
            ) as connection:
                await connection.send_request(
                    SessionUpdate(
                        session=SessionUpdateParams(
                            # MARK: check this
                            turn_detection=inference_config.turn_detection,
                            tools=tools.model_description() if tools else [],
                            tool_choice="auto",
                            input_audio_format="pcm16",
                            output_audio_format="pcm16",
                            instructions=inference_config.system_message,
                            voice=inference_config.voice,
                            model=os.environ.get(
                                "OPENAI_MODEL", "gpt-4o-realtime-preview"
                            ),
                            modalities=["text", "audio"],
                            temperature=0.8,
                            max_response_output_tokens="inf",
                            input_audio_transcription=InputAudioTranscription(
                                model="whisper-1"
                            ),
                        )
                    )
                )

                start_session_message = await anext(connection.listen())
                # assert isinstance(start_session_message, messages.StartSession)
                if isinstance(start_session_message, SessionUpdated):
                    logger.info(
                        f"Session started: {start_session_message.session.id} model: {start_session_message.session.model}"
                    )
                elif isinstance(start_session_message, ErrorMessage):
                    logger.info(f"Error: {start_session_message.error}")

                agent = cls(
                    connection=connection,
                    tools=tools,
                    channel=channel,
                )
                await agent.run()

        finally:
            await channel.disconnect()
            await connection.close()

    def __init__(
        self,
        *,
        connection: RealtimeApiConnection,
        tools: ToolContext | None,
        channel: Channel,
    ) -> None:
        self.connection = connection
        self.tools = tools
        self._client_tool_futures = {}
        self.channel = channel
        self.subscribe_user = None
        self.write_pcm = os.environ.get("WRITE_AGENT_PCM", "false") == "true"
        logger.info(f"Write PCM: {self.write_pcm}")

        # Register signal handler for hold call
        signal.signal(signal.SIGUSR1, self.handle_hold_call_signal)

    def handle_hold_call_signal(self, signum, frame):
        logger.info("Received hold call signal")
        asyncio.create_task(self.connection.hold_call())

    async def run(self) -> None:
        logger.info("Agent started running.")
        try:

            def log_exception(t: asyncio.Task[Any]) -> None:
                if not t.cancelled() and t.exception():
                    logger.error(
                        "unhandled exception",
                        exc_info=t.exception(),
                    )

            def on_stream_message(
                agora_local_user, user_id, stream_id, data, length
            ) -> None:
                logger.info(f"Received stream message with length: {length}")

            self.channel.on("stream_message", on_stream_message)

            # Subscribe to any user who joins
            async def on_user_joined(conn, user_id):
                logger.info(f"User joined: {user_id}")
                await self.channel.subscribe_audio(user_id)

            self.channel.on("user_joined", on_user_joined)

            # Subscribe to all current remote users
            for user_id in self.channel.remote_users.keys():
                logger.info(f"Subscribing to existing user: {user_id}")
                await self.channel.subscribe_audio(user_id)

            async def on_user_left(
                agora_rtc_conn: RTCConnection, user_id: int, reason: int
            ):
                logger.info(f"User left: {user_id}")
                if self.subscribe_user == user_id:
                    self.subscribe_user = None
                    logger.info("Subscribed user left, disconnecting")
                    await self.channel.disconnect()

            self.channel.on("user_left", on_user_left)

            disconnected_future = asyncio.Future[None]()

            def callback(agora_rtc_conn: RTCConnection, conn_info: RTCConnInfo, reason):
                logger.info(f"Connection state changed: {conn_info.state}")
                if conn_info.state == 1:
                    if not disconnected_future.done():
                        disconnected_future.set_result(None)

            self.channel.on("connection_state_changed", callback)

            asyncio.create_task(self.rtc_to_model()).add_done_callback(log_exception)
            asyncio.create_task(self.model_to_rtc()).add_done_callback(log_exception)

            asyncio.create_task(self._process_model_messages()).add_done_callback(
                log_exception
            )

            # Publish the AI agent's audio track
            await self.publish_audio()

            await disconnected_future
            logger.info("Agent finished running")
        except asyncio.CancelledError:
            logger.info("Agent cancelled")
        except Exception as e:
            logger.error(f"Error running agent: {e}")
            raise

    async def publish_audio(self) -> None:
        """
        Publish the AI agent's audio track to the Agora channel.
        """
        # Initialize audio track using RtcEngine
        self.audio_track = self.engine.create_audio_track()  # Updated method

        # Publish the audio track
        await self.channel.publish([self.audio_track])
        logger.info("AI Agent audio track published to the channel.")

    async def rtc_to_model(self) -> None:
        # Just loop forever, checking audio for each subscribed user
        pcm_writer = PCMWriter(prefix="rtc_to_model", write_pcm=self.write_pcm)

        try:
            while True:
                for user_id in self.channel.remote_users.keys():
                    audio_frames = self.channel.get_audio_frames(user_id)
                    if not audio_frames:
                        continue
                    async for audio_frame in audio_frames:
                        _monitor_queue_size(self.audio_queue, "audio_queue")
                        await self.connection.send_audio_data(audio_frame.data)
                        await pcm_writer.write(audio_frame.data)
                await asyncio.sleep(0.05)
        except asyncio.CancelledError:
            await pcm_writer.flush()
            raise

    async def model_to_rtc(self) -> None:
        # Initialize PCMWriter for sending audio
        pcm_writer = PCMWriter(prefix="model_to_rtc", write_pcm=self.write_pcm)

        try:
            while True:
                # Wait for an audio chunk from the model
                audio_chunk = await self.audio_queue.get()
                if not audio_chunk:
                    continue
                # Write the chunk to disk if needed
                await pcm_writer.write(audio_chunk)
                # Send audio frames to Agora
                await self.channel.send_audio_frames(audio_chunk)
                # Ensure AI agent's audio is sent back to the channel
                await self.audio_track.play()
        except asyncio.CancelledError:
            await pcm_writer.flush()
            raise

    async def handle_funtion_call(
        self, message: ResponseFunctionCallArgumentsDone
    ) -> None:
        function_call_response = await self.tools.execute_tool(
            message.name, message.arguments
        )
        logger.info(f"Function call response: {function_call_response}")
        await self.connection.send_request(
            ItemCreate(
                item=FunctionCallOutputItemParam(
                    call_id=message.call_id,
                    output=function_call_response.json_encoded_output,
                )
            )
        )
        await self.connection.send_request(ResponseCreate())

    async def _process_model_messages(self) -> None:
        async for message in self.connection.listen():
            try:
                # logger.info(f"Received message {message=}")
                match message:
                    case ResponseAudioDelta():
                        # logger.info("Received audio message")
                        self.audio_queue.put_nowait(base64.b64decode(message.delta))
                        # loop.call_soon_threadsafe(self.audio_queue.put_nowait, base64.b64decode(message.delta))
                        logger.debug(
                            f"TMS:ResponseAudioDelta: response_id:{message.response_id},item_id: {message.item_id}"
                        )
                    case ResponseAudioTranscriptDelta():
                        # logger.info(f"Received text message {message=}")
                        asyncio.create_task(
                            self.channel.chat.send_message(
                                ChatMessage(
                                    message=to_json(message), msg_id=message.item_id
                                )
                            )
                        )

                    case ResponseAudioTranscriptDone():
                        logger.info(f"Text message done: {message=}")
                        asyncio.create_task(
                            self.channel.chat.send_message(
                                ChatMessage(
                                    message=to_json(message), msg_id=message.item_id
                                )
                            )
                        )
                    case InputAudioBufferSpeechStarted():
                        await self.channel.clear_sender_audio_buffer()
                        # clear the audio queue so audio stops playing
                        while not self.audio_queue.empty():
                            self.audio_queue.get_nowait()
                        logger.info(
                            f"TMS:InputAudioBufferSpeechStarted: item_id: {message.item_id}"
                        )
                    case InputAudioBufferSpeechStopped():
                        logger.info(
                            f"TMS:InputAudioBufferSpeechStopped: item_id: {message.item_id}"
                        )
                        pass
                    case ItemInputAudioTranscriptionCompleted():
                        logger.info(f"ItemInputAudioTranscriptionCompleted: {message=}")
                        asyncio.create_task(
                            self.channel.chat.send_message(
                                ChatMessage(
                                    message=to_json(message), msg_id=message.item_id
                                )
                            )
                        )
                    #  InputAudioBufferCommitted
                    case InputAudioBufferCommitted():
                        pass
                    case ItemCreated():
                        pass
                    # ResponseCreated
                    case ResponseCreated():
                        pass
                    # ResponseDone
                    case ResponseDone():
                        pass

                    # ResponseOutputItemAdded
                    case ResponseOutputItemAdded():
                        pass

                    # ResponseContenPartAdded
                    case ResponseContentPartAdded():
                        pass
                    # ResponseAudioDone
                    case ResponseAudioDone():
                        pass
                    # ResponseContentPartDone
                    case ResponseContentPartDone():
                        pass
                    # ResponseOutputItemDone
                    case ResponseOutputItemDone():
                        pass
                    case SessionUpdated():
                        pass
                    case RateLimitsUpdated():
                        pass
                    case ResponseFunctionCallArgumentsDone():
                        if message.name == "hold_call":
                            await self.connection.hold_call()
                        else:
                            asyncio.create_task(self.handle_funtion_call(message))
                    case ResponseFunctionCallArgumentsDelta():
                        pass

                    case _:
                        logger.warning(f"Unhandled message {message=}")
            except Exception as e:
                logger.error(f"Error processing message {message}: {e}")
