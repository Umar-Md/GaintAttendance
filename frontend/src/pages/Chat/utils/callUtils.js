const splitList = (value) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) || [];

const turnUrls = splitList(import.meta.env.VITE_TURN_URLS);
const turnUsername = import.meta.env.VITE_TURN_USERNAME;
const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

export const rtcConfig = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] },
    ...(turnUrls.length && turnUsername && turnCredential
      ? [{ urls: turnUrls, username: turnUsername, credential: turnCredential }]
      : []),
  ],
};

export const getLocalMedia = async (type) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video:
      type === "video"
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          }
        : false,
  });
  return stream;
};

export const createPeerConnection = (rtcConfig, peerId, onIceCandidate, onTrack, onConnectionStateChange) => {
  const pc = new RTCPeerConnection(rtcConfig);

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(peerId, event.candidate);
    }
  };

  const fallbackStream = new MediaStream();

  pc.ontrack = (event) => {
    const [stream] = event.streams;
    if (stream) {
      onTrack(peerId, stream);
      return;
    }

    fallbackStream.addTrack(event.track);
    onTrack(peerId, fallbackStream);
  };

  pc.onconnectionstatechange = () => {
    if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
      onConnectionStateChange(peerId);
    }
  };

  return pc;
};

export const cleanupCall = (peerConnectionsRef, localStreamRef, setLocalStream, setRemoteStream, setRemoteStreams, setIncomingCall, setIsMuted, setIsCameraOff, setCallStatus, setPeerCount) => {
  Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
  peerConnectionsRef.current = {};

  localStreamRef.current?.getTracks().forEach((track) => track.stop());
  localStreamRef.current = null;

  setLocalStream(null);
  setRemoteStream(null);
  setRemoteStreams([]);
  setIncomingCall(null);
  setIsMuted(false);
  setIsCameraOff(false);
  setCallStatus("idle");
  setPeerCount(0);
};
