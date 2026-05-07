import { useEffect, useRef, useState } from "react";
import socket from "../../socket";
import {
  rtcConfig,
  getLocalMedia,
  createPeerConnection,
  cleanupCall,
} from "../utils/callUtils";

export const useCall = (user, keepSocketAlive) => {
  const [callStatus, setCallStatus] = useState("idle");
  const [callType, setCallType] = useState("audio");
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [peerCount, setPeerCount] = useState(0);

  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const currentPeerIdsRef = useRef([]);
  const pendingIceCandidatesRef = useRef({});
  const callStatusRef = useRef("idle");

  // Important fix: store ICE candidates until remoteDescription is set
  const pendingCandidatesRef = useRef({});

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    if (!user?._id) return;

    socket.io.opts.query = { userId: user._id };
    socket.connect();

    return () => {
      if (!keepSocketAlive) {
        socket.disconnect();
      }
    };
  }, [keepSocketAlive, user?._id]);

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStreamRef.current) {
      remoteStreamRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleCleanupCall = () => {
    cleanupCall(
      peerConnectionsRef,
      localStreamRef,
      setLocalStream,
      setRemoteStream,
      setRemoteStreams,
      setIncomingCall,
      setIsMuted,
      setIsCameraOff,
      setCallStatus,
      setPeerCount,
    );
  };

  const handleCreatePeerConnection = (peerId) => {
    const pc = createPeerConnection(
      rtcConfig,
      peerId,
      (peerId, candidate) => {
        socket.emit("call:ice-candidate", { to: peerId, candidate });
      },
      (peerId, stream) => {
        remoteStreamRef.current = stream;
        setRemoteStream(stream);

        setRemoteStreams((prev) => {
          const next = prev.filter((item) => item.peerId !== peerId);
          return [...next, { peerId, stream }];
        });

        setCallStatus("connected");
      },
      () => {
        handleCleanupCall();
      },
    );

    peerConnectionsRef.current[peerId] = pc;
    currentPeerIdsRef.current = Array.from(
      new Set([...currentPeerIdsRef.current, peerId]),
    );
    setPeerCount(currentPeerIdsRef.current.length);

    return pc;
  };

  const setLocalMediaStream = (stream) => {
    localStreamRef.current = stream;
    setLocalStream(stream);
  };

  const removePeerFromCall = (peerId) => {
    peerConnectionsRef.current[peerId]?.close();
    delete peerConnectionsRef.current[peerId];

    currentPeerIdsRef.current = currentPeerIdsRef.current.filter(
      (id) => id !== peerId,
    );

    delete pendingCandidatesRef.current[peerId];

    setPeerCount(currentPeerIdsRef.current.length);
    setRemoteStreams((prev) => prev.filter((item) => item.peerId !== peerId));

    if (
      currentPeerIdsRef.current.length === 0 &&
      callStatusRef.current !== "incoming"
    ) {
      handleCleanupCall();
    }
  };

  const emitOfferToPeer = async (
    peer,
    type,
    stream,
    groupCallId,
    participants,
  ) => {
    const pc = handleCreatePeerConnection(peer._id);

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call:offer", {
      to: peer._id,
      from: {
        _id: user._id,
        userName: user.userName,
        role: user.role,
        imageUrl: user.imageUrl,
      },
      offer,
      callType: type,
      groupCallId,
      participants,
    });
  };

  const startCall = async (selectedUser, type) => {
    if (!selectedUser?._id || callStatusRef.current !== "idle") return;

    try {
      setCallType(type);
      setCallStatus("calling");

      const stream = await getLocalMedia(type);
      localStreamRef.current = stream;
      setLocalStream(stream);
      await emitOfferToPeer(selectedUser, type, stream);
    } catch (err) {
      console.error("Call start failed", err);
      alert("Could not start the call. Please allow microphone/camera access.");
      handleCleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      setCallStatus("connecting");
      setCallType(incomingCall.callType);

      const stream = await getLocalMedia(incomingCall.callType);
      localStreamRef.current = stream;
      setLocalStream(stream);
      const pc = handleCreatePeerConnection(incomingCall.from._id);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer),
      );

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", {
        to: incomingCall.from._id,
        answer,
      });

      setIncomingCall(null);
    } catch (err) {
      console.error("Accept call failed", err);
      alert("Could not join the call. Please allow microphone/camera access.");

      if (incomingCall?.from?._id) {
        socket.emit("call:reject", { to: incomingCall.from._id });
      }

      handleCleanupCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall?.from?._id) {
      socket.emit("call:reject", { to: incomingCall.from._id });
    }

    handleCleanupCall();
  };

  const endCall = () => {
    currentPeerIdsRef.current.forEach((peerId) => {
      socket.emit("call:end", { to: peerId });
    });

    handleCleanupCall();
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;

    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });

    setIsMuted(nextMuted);
  };

  const toggleCamera = () => {
    const nextCameraOff = !isCameraOff;

    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !nextCameraOff;
    });

    setIsCameraOff(nextCameraOff);
  };

  useEffect(() => {
    const handleIncomingOffer = ({ from, offer, callType: incomingType }) => {
      if (callStatusRef.current !== "idle") {
        socket.emit("call:reject", { to: from._id });
        return;
      }

      setIncomingCall({ from, offer, callType: incomingType });
      setCallType(incomingType);
      setCallStatus("incoming");
    };

    const handleAnswer = async ({ from, answer }) => {
      const pc = peerConnectionsRef.current[from];
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      setCallStatus("connected");
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      const pc = peerConnectionsRef.current[from];
      if (!pc || !candidate) return;
      try {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          if (!pendingCandidatesRef.current[from]) {
            pendingCandidatesRef.current[from] = [];
          }

          pendingCandidatesRef.current[from].push(candidate);
        }
      } catch (err) {
        console.error("Failed to add ICE candidate", err);
      }
    };

    const handleCallEnd = ({ from }) => {
      if (from && currentPeerIdsRef.current.length > 1) {
        removePeerFromCall(from);
        return;
      }

      handleCleanupCall();
    };

    const handleCallRejected = ({ from }) => {
      if (from && currentPeerIdsRef.current.length > 1) {
        removePeerFromCall(from);
        return;
      }

      alert("Call declined or user is busy.");
      handleCleanupCall();
    };

    const handleUnavailable = () => {
      alert("User is not available for calls right now.");
      handleCleanupCall();
    };

    socket.on("call:offer", handleIncomingOffer);
    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIceCandidate);
    socket.on("call:end", handleCallEnd);
    socket.on("call:reject", handleCallRejected);
    socket.on("call:unavailable", handleUnavailable);

    return () => {
      socket.off("call:offer", handleIncomingOffer);
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIceCandidate);
      socket.off("call:end", handleCallEnd);
      socket.off("call:reject", handleCallRejected);
      socket.off("call:unavailable", handleUnavailable);
    };
  }, []);

  useEffect(() => {
    return () => {
      handleCleanupCall();
    };
  }, []);

  return {
    callStatus,
    callType,
    incomingCall,
    localStream,
    remoteStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    peerCount,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    handleCleanupCall,
    emitOfferToPeer,
    setLocalMediaStream,
    setCallStatus,
    setCallType,
    setIncomingCall,
  };
};
