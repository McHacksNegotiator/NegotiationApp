import {
    LocalUser,
    RemoteUser,
    useIsConnected,
    useJoin,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
  } from "agora-rtc-react";
  import React, { useState } from "react";
  
  //import "./styles.css";

  export const Basics = () => {
    const [calling, setCalling] = useState(false);
    const isConnected = useIsConnected(); // Store the user's connection status
    const [appId, setAppId] =  useState(import.meta.env.VITE_AGORA_APP_ID);
    const [channel, setChannel] = useState(import.meta.env.VITE_AGORA_CHANNEL_NAME);
    const [token, setToken] = useState("");
  
    useJoin({appid: appId, channel: channel, token: token ? token : null}, calling);
  
    const [micOn, setMic] = useState(true);
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    usePublish([localMicrophoneTrack]);
  
    const remoteUsers = useRemoteUsers();
  
    return (
      <>
        <div className="room">
          {isConnected ? (
            <div className="user-list">
              <div className="user">
                <LocalUser
                  audioTrack={localMicrophoneTrack}
                  micOn={micOn}
                  cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                >
                  <samp className="user-name">You</samp>
                </LocalUser>
              </div>
              {remoteUsers.map((user) => (
                <div className="user" key={user.uid}>
                  <RemoteUser cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg" user={user}>
                    <samp className="user-name">{user.uid}</samp>
                  </RemoteUser>
                </div>
              ))}
            </div>
          ) : (
            <div className="join-room">
              <input
                placeholder="<Your app ID>"
                value={appId}
                disabled
              />
              <input
                placeholder="callChannel"
                value={channel}
                disabled
              />
  
              <button
                className={`join-channel ${!appId || !channel ? "disabled" : ""}`}
                disabled={!appId || !channel}
                onClick={() => setCalling(true)}
              >
                <span>Join Channel</span>
              </button>
            </div>
          )}
        </div>
        {isConnected && (
          <div className="control">
            <div className="left-control">
              <button className="btn" onClick={() => setMic(a => !a)}>
                <i className={`i-microphone ${!micOn ? "off" : ""}`} />
              </button>
            </div>
            <button
              className={`btn btn-phone ${calling ? "btn-phone-active" : ""}`}
              onClick={() => setCalling(a => !a)}
            >
              {calling ? <i className="i-phone-hangup" /> : <i className="i-mdi-phone" />}
            </button>
          </div>
        )}
      </>
    );
  };
  
  export default Basics;