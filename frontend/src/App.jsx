import React, { useState, useEffect } from 'react';
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// Hardcoded values
const appId = "c53554d82fbd4a07b394bcc22ccd2b1e";
const token = "007eJxTYGDVemwjNPX/vU2byrRyzn56kpTE/tI27NAFPl6Bk/Nz5+UqMCSbGpuamqRYGKUlpZgkGpgnGVuaJCUnGxklJ6cYJRmmxu+Ymt4QyMhw2EmRmZEBAkF8bobkjMS8vNQcv8TcVAYGAFr5IpQ=";

export default function App() {
    const [channelName, setChannelName] = useState("channelName");
    const [clientUID, setClientUID] = useState(1234); // The "client" user
    const [agentUID, setAgentUID] = useState(9999);   // The AI agent UID
    const [loading, setLoading] = useState(false);
    const [agentRunning, setAgentRunning] = useState(false);

    // Client data for negotiation
    const [clientName, setClientName] = useState("Jane Doe");
    const [clientDOB, setClientDOB] = useState("1990-01-01");
    const [clientAddress, setClientAddress] = useState("123 Main St");
    const [clientAccount, setClientAccount] = useState("ACC123456");

    useEffect(() => {
        // Automatically join the channel as a normal user so we can hear
        (async () => {
            try {
                await client.join(appId, channelName, token, clientUID);

                // Subscribe to remote users' audio tracks
                client.on("user-published", async (user, mediaType) => {
                    await client.subscribe(user, mediaType);
                    if (mediaType === "audio") {
                        user.audioTrack.play();
                    }
                });

                // Subscribe to AI Agent's audio
                const subscribeAgentAudio = async () => {
                    const agentUser = await client.getUserByUID(agentUID);
                    if (agentUser) {
                        await client.subscribe(agentUser, "audio");
                        if (agentUser.audioTrack) {
                            agentUser.audioTrack.play();
                        }
                    }
                };

                // Listen for AI Agent joining
                client.on("user-joined", async (user) => {
                    if (user.uid === agentUID) {
                        await subscribeAgentAudio();
                    }
                });

                console.log("Client joined channel:", channelName);
            } catch (err) {
                console.error("Failed to join channel:", err);
                alert("Failed to join channel. Please check the console for more details.");
            }
        })();

        // Cleanup on unmount
        return () => {
            if (agentRunning) {
                stopAgent();
            }
            client.leave();
        };
    }, [agentRunning, channelName, clientUID, agentUID]);

    const startAgent = async () => {
        setLoading(true);
        try {
            const serverUrl = "http://localhost:8080"; // Replace <container_ip> with the actual IP address of the container
            const resp = await axios.post(`${serverUrl}/start_agent`, {
                channel_name: channelName,
                uid: parseInt(agentUID), // Ensure uid is sent as an integer
                language: "en",
                system_instruction: "",
                voice: "alloy",
                client_data: {
                    name: clientName,
                    date_of_birth: clientDOB,
                    home_address: clientAddress,
                    account_number: clientAccount
                },
                client_name: clientName,
                client_dob: clientDOB,
                client_address: clientAddress,
                client_account_number: clientAccount
            });
            console.log(resp.data);
            alert("AI Agent started!");
            setAgentRunning(true);
        } catch (err) {
            console.error("Error details:", err);
            if (!err.response) {
                console.error("Network error details:", err);
                alert("Network error: Please check your connection and try again.");
            } else if (err.response.status === 400) {
                alert("Bad request: " + err.response.data.error);
                if (err.response.data.error.includes("OPENAI_API_KEY")) {
                    console.error("Server missing OPENAI_API_KEY.");
                    alert("Server missing OPENAI_API_KEY.");
                }
            } else if (err.response.status === 500) {
                alert("Server error: " + err.response.data.error);
            } else {
                alert("Failed to start agent: " + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const stopAgent = async () => {
        setLoading(true);
        try {
            const serverUrl = "http://localhost:8080"; // Replace <container_ip> with the actual IP address of the container
            const resp = await axios.post(`${serverUrl}/stop_agent`, {
                channel_name: channelName,
            });
            console.log(resp.data);
            alert("AI Agent stopped.");
            setAgentRunning(false);
        } catch (err) {
            console.error(err);
            alert("Failed to stop agent: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>ISP Negotiation Demo</h1>
            <p>
                This demo app lets an AI agent join the channel and negotiate using
                OpenAI’s Realtime Voice.
            </p>

            <div style={{ marginBottom: 10 }}>
                <label>Client UID: </label>
                <input
                    type="number"
                    value={clientUID}
                    onChange={(e) => setClientUID(Number(e.target.value))}
                />
            </div>

            <div style={{ marginBottom: 10 }}>
                <label>AI Agent UID: </label>
                <input
                    type="number"
                    value={agentUID}
                    onChange={(e) => setAgentUID(Number(e.target.value))}
                />
            </div>

            <h2>Client Data</h2>
            <div style={{ marginBottom: 10 }}>
                <label>Name: </label>
                <input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>DOB: </label>
                <input
                    value={clientDOB}
                    onChange={(e) => setClientDOB(e.target.value)} />
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>Address: </label>
                <input
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                />
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>Account #: </label>
                <input
                    value={clientAccount}
                    onChange={(e) => setClientAccount(e.target.value)} />
            </div>

            <hr />
            <button onClick={agentRunning ? stopAgent : startAgent} disabled={loading}>
                {loading
                    ? (agentRunning ? "Stopping AI Agent..." : "Starting AI Agent...")
                    : (agentRunning ? "Stop AI Agent" : "Start AI Agent")}
            </button>

            <p style={{ marginTop: 20, fontStyle: "italic" }}>
                **Say "hold the call" to the AI. The AI should politely ask the ISP agent to wait,
                then talk privately to the client. When you’re done, the AI says "Thanks for waiting, let's continue."
            </p>
        </div>
    );
}
