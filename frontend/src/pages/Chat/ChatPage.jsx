import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import socket from "../socket";
import { messageURI } from "../../mainApi";
import {
  FiChevronLeft,
  FiMic,
  FiMicOff,
  FiPhone,
  FiPhoneCall,
  FiPhoneOff,
  FiUsers,
  FiVideo,
  FiVideoOff,
  FiX,
} from "react-icons/fi";

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const ChatPage = ({
  user,
  keepSocketAlive = false,
  pendingIncomingCall = null,
  onPendingCallConsumed,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [callType, setCallType] = useState("audio");
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showGroupCallModal, setShowGroupCallModal] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState([]);
  const [groupCallType, setGroupCallType] = useState("audio");

  const peerConnectionRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const currentPeerIdsRef = useRef([]);
  const callStatusRef = useRef("idle");
  const selectedUserRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

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
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const cleanupCall = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    peerConnectionsRef.current = {};

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    currentPeerIdsRef.current = [];

    setLocalStream(null);
    setRemoteStream(null);
    setRemoteStreams([]);
    setIncomingCall(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setCallStatus("idle");
  };

  const getLocalMedia = async (type) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });

    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  };

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;
    peerConnectionsRef.current[peerId] = pc;
    currentPeerIdsRef.current = Array.from(new Set([...currentPeerIdsRef.current, peerId]));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("call:ice-candidate", {
          to: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamRef.current = stream;
      setRemoteStream(stream);
      setRemoteStreams((prev) => {
        const next = prev.filter((item) => item.peerId !== peerId);
        return [...next, { peerId, stream }];
      });
      setCallStatus("connected");
    };

    pc.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
        cleanupCall();
      }
    };

    return pc;
  };

  const removePeerFromCall = (peerId) => {
    peerConnectionsRef.current[peerId]?.close();
    delete peerConnectionsRef.current[peerId];
    currentPeerIdsRef.current = currentPeerIdsRef.current.filter((id) => id !== peerId);
    setRemoteStreams((prev) => prev.filter((item) => item.peerId !== peerId));

    if (currentPeerIdsRef.current.length === 0 && callStatusRef.current !== "incoming") {
      cleanupCall();
    }
  };

  const emitOfferToPeer = async (peer, type, stream, groupCallId, participants) => {
    const pc = createPeerConnection(peer._id);

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
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

  const startCall = async (type) => {
    if (!selectedUser?._id || callStatusRef.current !== "idle") return;

    try {
      setCallType(type);
      setCallStatus("calling");
      const stream = await getLocalMedia(type);
      await emitOfferToPeer(selectedUser, type, stream);
    } catch (err) {
      console.error("Call start failed", err);
      alert("Could not start the call. Please allow microphone/camera access.");
      cleanupCall();
    }
  };

  const loadGroupUsers = async () => {
    try {
      const res = await axios.get(`${messageURI}/users`, { withCredentials: true });
      setGroupUsers(res.data?.users || []);
    } catch (err) {
      console.error("Failed to load call members", err);
    }
  };

  const openGroupCallModal = () => {
    setSelectedGroupMemberIds(selectedUser?._id ? [selectedUser._id] : []);
    setGroupCallType("audio");
    setShowGroupCallModal(true);
    loadGroupUsers();
  };

  const toggleGroupMember = (memberId) => {
    setSelectedGroupMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const startGroupCall = async () => {
    if (selectedGroupMemberIds.length === 0 || callStatusRef.current !== "idle") return;

    const invitedMembers = groupUsers.filter((member) =>
      selectedGroupMemberIds.includes(member._id)
    );

    if (invitedMembers.length === 0) return;

    try {
      setShowGroupCallModal(false);
      setCallType(groupCallType);
      setCallStatus("calling");

      const stream = await getLocalMedia(groupCallType);
      const groupCallId = `${user._id}-${Date.now()}`;
      const participants = [
        {
          _id: user._id,
          userName: user.userName,
          role: user.role,
          imageUrl: user.imageUrl,
        },
        ...invitedMembers,
      ];

      await Promise.all(
        invitedMembers.map((member) =>
          emitOfferToPeer(member, groupCallType, stream, groupCallId, participants)
        )
      );
    } catch (err) {
      console.error("Group call failed", err);
      alert("Could not start group call. Please allow microphone/camera access.");
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      setCallStatus("connecting");
      setCallType(incomingCall.callType);
      setSelectedUser(incomingCall.from);

      const stream = await getLocalMedia(incomingCall.callType);
      const pc = createPeerConnection(incomingCall.from._id);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

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
      socket.emit("call:reject", { to: incomingCall.from._id });
      cleanupCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall?.from?._id) {
      socket.emit("call:reject", { to: incomingCall.from._id });
    }
    cleanupCall();
  };

  const endCall = () => {
    currentPeerIdsRef.current.forEach((peerId) => {
      socket.emit("call:end", { to: peerId });
    });
    cleanupCall();
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    localStreamRef.current
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !nextMuted));
    setIsMuted(nextMuted);
  };

  const toggleCamera = () => {
    const nextCameraOff = !isCameraOff;
    localStreamRef.current
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = !nextCameraOff));
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
      const pc = peerConnectionsRef.current[from] || peerConnectionRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setCallStatus("connected");
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      const pc = peerConnectionsRef.current[from] || peerConnectionRef.current;
      if (!pc || !candidate) return;

      try {
        await pc.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("Failed to add ICE candidate", err);
      }
    };

    const handleCallEnd = ({ from }) => {
      if (from && currentPeerIdsRef.current.length > 1) {
        removePeerFromCall(from);
        return;
      }

      cleanupCall();
    };

    const handleCallRejected = ({ from }) => {
      if (from && currentPeerIdsRef.current.length > 1) {
        removePeerFromCall(from);
        return;
      }

      alert("Call declined or user is busy.");
      cleanupCall();
    };

    const handleUnavailable = () => {
      alert("User is not available for calls right now.");
      cleanupCall();
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
    if (!pendingIncomingCall || callStatusRef.current !== "idle") return;

    setIncomingCall(pendingIncomingCall);
    setCallType(pendingIncomingCall.callType);
    setCallStatus("incoming");
    onPendingCallConsumed?.();
  }, [onPendingCallConsumed, pendingIncomingCall]);

  useEffect(() => cleanupCall, []);

  const callPartner = incomingCall?.from || selectedUser;
  const isCallVisible = callStatus !== "idle";
  const isGroupCall = remoteStreams.length > 1 || currentPeerIdsRef.current.length > 1 || incomingCall?.participants?.length > 2;

  return (
    <div className="flex h-full w-full bg-white overflow-hidden relative">
      {!selectedUser ? (
        /* SIDEBAR VIEW: Full width when searching for colleagues */
        <div className="w-full h-full animate-in fade-in duration-300">
          <Sidebar
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </div>
      ) : (
        /* CHAT VIEW: Replaces Sidebar when a user is selected */
        <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] animate-in slide-in-from-right duration-300">
          {/* High-End Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 shadow-sm">
            <button
              onClick={() => setSelectedUser(null)}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-all text-indigo-600 active:scale-90"
            >
              <FiChevronLeft size={24} />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={
                    selectedUser.imageUrl ||
                    `https://ui-avatars.com/api/?name=${selectedUser.userName}&background=random`
                  }
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                  alt="profile"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[14px] leading-tight">
                  {selectedUser.userName}
                </h3>
                <p className="text-[12px] text-slate-400 font-bold uppercase">
                  {selectedUser.role || "Team Member"}
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={openGroupCallModal}
                disabled={callStatus !== "idle"}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all disabled:opacity-40"
                title="Group call"
              >
                <FiUsers size={20} />
              </button>
              <button
                onClick={() => startCall("audio")}
                disabled={callStatus !== "idle"}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all disabled:opacity-40"
                title="Audio call"
              >
                <FiPhone size={19} />
              </button>
              <button
                onClick={() => startCall("video")}
                disabled={callStatus !== "idle"}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all disabled:opacity-40"
                title="Video call"
              >
                <FiVideo size={20} />
              </button>
            </div>
          </div>

          {/* Messaging Window */}
          <div className="flex-1 overflow-hidden relative">
            <ChatWindow selectedUser={selectedUser} currentUser={user} />
          </div>
        </div>
      )}

      {showGroupCallModal && (
        <div className="absolute inset-0 z-40 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900">Group call</h3>
                <p className="text-xs text-slate-500">Select members and call type</p>
              </div>
              <button
                onClick={() => setShowGroupCallModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <FiX />
              </button>
            </div>

            <div className="p-3 border-b flex gap-2">
              <button
                onClick={() => setGroupCallType("audio")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${
                  groupCallType === "audio"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <FiPhone /> Audio
              </button>
              <button
                onClick={() => setGroupCallType("video")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${
                  groupCallType === "video"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <FiVideo /> Video
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {groupUsers.map((member) => (
                <label
                  key={member._id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedGroupMemberIds.includes(member._id)}
                    onChange={() => toggleGroupMember(member._id)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <img
                    src={
                      member.imageUrl ||
                      `https://ui-avatars.com/api/?name=${member.userName}&background=random`
                    }
                    alt={member.userName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{member.userName}</p>
                    <p className="text-xs text-slate-400 uppercase">{member.role}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-3 border-t">
              <button
                onClick={startGroupCall}
                disabled={selectedGroupMemberIds.length === 0}
                className="w-full rounded-xl bg-indigo-600 py-3 text-white font-black hover:bg-indigo-700 disabled:bg-slate-300"
              >
                Start {groupCallType} call ({selectedGroupMemberIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {isCallVisible && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 text-white flex flex-col">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-slate-300">
                {callStatus === "incoming"
                  ? `Incoming ${incomingCall?.participants?.length > 2 ? "group " : ""}${callType} call`
                  : callStatus === "calling"
                    ? isGroupCall
                      ? `Calling ${currentPeerIdsRef.current.length} members`
                      : `Calling ${callPartner?.userName || "user"}`
                    : `${isGroupCall ? "Group " : ""}${callType === "video" ? "Video" : "Audio"} call`}
              </p>
              <h2 className="text-xl font-bold">
                {isGroupCall ? "Team call" : callPartner?.userName}
              </h2>
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
              <div className={`h-full w-full grid gap-2 p-2 ${
                remoteStreams.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}>
                {remoteStreams.map(({ peerId, stream }) => (
                  <video
                    key={peerId}
                    ref={(node) => {
                      if (node) node.srcObject = stream;
                    }}
                    autoPlay
                    playsInline
                    className="h-full min-h-0 w-full rounded-lg object-cover bg-black"
                  />
                ))}
              </div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                <img
                  src={
                    callPartner?.imageUrl ||
                    `https://ui-avatars.com/api/?name=${callPartner?.userName || "User"}&background=4f46e5&color=fff`
                  }
                  alt="caller"
                  className="w-24 h-24 rounded-full border-4 border-white/10 object-cover"
                />
                <div className="text-center">
                  <p className="text-lg font-semibold">{callPartner?.userName}</p>
                  <p className="text-sm text-slate-400">
                    {callStatus === "connected"
                      ? "Connected"
                      : callStatus === "incoming"
                        ? incomingCall?.participants?.length > 2
                          ? `${incomingCall.from?.userName} invited you and ${incomingCall.participants.length - 2} others`
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
      )}
    </div>
  );
};

export default ChatPage;
