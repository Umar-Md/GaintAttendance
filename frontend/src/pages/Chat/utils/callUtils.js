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

  pc.onconnectionstatechange = async () => {
    try {
      console.log(`[webrtc] connectionState for ${peerId}:`, pc.connectionState);

      // When connected, dump important getStats reports once and a few periodic samples
      if (pc.connectionState === "connected") {
        try {
          const stats = await pc.getStats();
          stats.forEach((report) => {
            if (
              report.type === "inbound-rtp" ||
              report.type === "outbound-rtp" ||
              report.type === "candidate-pair" ||
              report.type === "remote-inbound-rtp"
            ) {
              console.log(`[webrtc][stats][${peerId}]`, report.type, report);
            }
          });
        } catch (e) {
          console.error(`[webrtc] initial getStats failed for ${peerId}:`, e);
        }

        // periodic short-lived stats (for ~30s)
        let rounds = 0;
        const statsInterval = setInterval(async () => {
          try {
            const s = await pc.getStats();
            s.forEach((r) => {
              if (
                r.type === "inbound-rtp" ||
                r.type === "outbound-rtp" ||
                r.type === "candidate-pair" ||
                r.type === "remote-inbound-rtp"
              ) {
                console.log(`[webrtc][stats][${peerId}] sample`, rounds, r.type, r);
              }
            });
          } catch (err) {
            console.error(`[webrtc] periodic getStats error for ${peerId}:`, err);
          }
          rounds += 1;
          if (rounds >= 6) clearInterval(statsInterval); // ~30s of samples (6 * 5s)
        }, 5000);
      }
    } catch (err) {
      console.error(`[webrtc] onconnectionstatechange handler error for ${peerId}:`, err);
    }

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
