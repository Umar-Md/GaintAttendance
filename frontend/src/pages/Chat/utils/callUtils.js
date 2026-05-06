export const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const getLocalMedia = async (type) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: type === "video",
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

  pc.ontrack = (event) => {
    const [stream] = event.streams;
    onTrack(peerId, stream);
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