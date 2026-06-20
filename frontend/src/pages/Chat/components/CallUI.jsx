import React, { useEffect, useRef, useState } from "react";
import {
  FiMic,
  FiMicOff,
  FiPhoneCall,
  FiPhoneOff,
  FiVideo,
  FiVideoOff,
} from "react-icons/fi";

const RemoteAudio = ({ stream, peerId }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
      try {
        audioRef.current.muted = false;
        audioRef.current.volume = 1;
        const playPromise = audioRef.current.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch((err) => {
            console.warn("[CallUI] audio.play() failed:", err);
            // retry once after a short delay (may help if browser needs user gesture)
            setTimeout(() => {
              audioRef.current.play().catch((e) =>
                console.error("[CallUI] retry audio.play() failed:", e),
              );
            }, 250);
          });
        }
      } catch (e) {
        console.error("[CallUI] audio attach/play error:", e);
      }
    }
  }, [stream]);

  return <audio key={`audio-${peerId}`} ref={audioRef} autoPlay playsInline />;
};

const CallUI = ({
  isCallVisible,
  callStatus,
  callType,
  incomingCall,
  remoteStreams,
  peerCount,
  callPartner,
  localStream,
  isMuted,
  isCameraOff,
  acceptCall,
  rejectCall,
  endCall,
  toggleMute,
  toggleCamera,
}) => {
  const localVideoRef = useRef(null);
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    if (callType !== "video" || !localStream || !localVideoRef.current) return;

    if (localVideoRef.current.srcObject !== localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [callType, localStream]);

  useEffect(() => {
    if (callStatus !== "connected") {
      setCallSeconds(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCallSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [callStatus]);

  if (!isCallVisible) return null;

  const isGroupCall =
    remoteStreams.length > 1 ||
    peerCount > 1 ||
    incomingCall?.participants?.length > 2;
  const durationLabel = `${String(Math.floor(callSeconds / 60)).padStart(
    2,
    "0",
  )}:${String(callSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 text-white flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-slate-300">
            {callStatus === "incoming"
              ? `Incoming ${
                  incomingCall?.participants?.length > 2 ? "group " : ""
                }${callType} call`
              : callStatus === "calling"
              ? isGroupCall
                ? `Calling ${peerCount} members`
                : `Calling ${callPartner?.userName || "user"}`
              : `${isGroupCall ? "Group " : ""}${
                  callType === "video" ? "Video" : "Audio"
                } call`}
          </p>

          <h2 className="text-xl font-bold">
            {isGroupCall ? "Team call" : callPartner?.userName}
          </h2>
          {callStatus === "connected" && (
            <p className="mt-1 font-mono text-sm font-bold text-emerald-300">
              {durationLabel}
            </p>
          )}
        </div>

        <button
          onClick={callStatus === "incoming" ? rejectCall : endCall}
          className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-all"
          title="End call"
        >
          <FiPhoneOff size={20} />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden bg-slate-900">
        {callType === "video" && remoteStreams.length > 0 ? (
          <div
            className={`h-full w-full grid gap-2 p-2 ${
              remoteStreams.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {remoteStreams.map(({ peerId, stream }) => (
              <video
                key={peerId}
                ref={(node) => {
                  if (node && stream) node.srcObject = stream;
                }}
                autoPlay
                playsInline
                className="h-full min-h-0 w-full rounded-lg object-cover bg-black"
              />
            ))}
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-4">
            {remoteStreams.map(({ peerId, stream }) => (
              <RemoteAudio key={`audio-${peerId}`} peerId={peerId} stream={stream} />
            ))}

            <img
              src={
                callPartner?.imageUrl ||
                `https://ui-avatars.com/api/?name=${
                  callPartner?.userName || "User"
                }&background=4f46e5&color=fff`
              }
              alt="caller"
              className="w-24 h-24 rounded-full border-4 border-white/10 object-cover"
            />

            <div className="text-center">
              <p className="text-lg font-semibold">{callPartner?.userName}</p>
              <p className="text-sm text-slate-400">
                {callStatus === "connected"
                  ? `Connected • ${durationLabel}`
                  : callStatus === "incoming"
                  ? incomingCall?.participants?.length > 2
                    ? `${incomingCall.from?.userName} invited you and ${
                        incomingCall.participants.length - 2
                      } others`
                    : "Waiting for your response"
                  : "Waiting for answer"}
              </p>
            </div>
          </div>
        )}

        {callType === "video" && localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 h-32 w-24 rounded-lg object-cover border border-white/20 bg-black shadow-xl"
          />
        )}
      </div>

      {callStatus === "incoming" ? (
        <div className="p-5 flex items-center justify-center gap-4 bg-slate-950">
          <button
            onClick={rejectCall}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-red-500 hover:bg-red-600 font-bold transition-all"
          >
            <FiPhoneOff /> Decline
          </button>

          <button
            onClick={acceptCall}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 font-bold transition-all"
          >
            <FiPhoneCall /> Accept
          </button>
        </div>
      ) : (
        <div className="p-5 flex items-center justify-center gap-3 bg-slate-950">
          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
          </button>

          {callType === "video" && (
            <button
              onClick={toggleCamera}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              title={isCameraOff ? "Turn camera on" : "Turn camera off"}
            >
              {isCameraOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
            </button>
          )}

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all"
            title="End call"
          >
            <FiPhoneOff size={22} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallUI;
