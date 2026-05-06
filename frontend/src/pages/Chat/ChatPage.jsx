/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { useCall } from "./hooks/useCall";
import { useGroupCall } from "./hooks/useGroupCall";
import GroupCallModal from "./components/GroupCallModal";
import CallUI from "./components/CallUI";
import {
  FiChevronLeft,
  FiPhone,
  FiUsers,
  FiVideo,
} from "react-icons/fi";

const ChatPage = ({
  user,
  keepSocketAlive = false,
  pendingIncomingCall = null,
  onPendingCallConsumed,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const {
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
    setCallStatus,
    setCallType,
  } = useCall(user, keepSocketAlive);

  const {
    showGroupCallModal,
    setShowGroupCallModal,
    groupUsers,
    selectedGroupMemberIds,
    groupCallType,
    setGroupCallType,
    openGroupCallModal,
    toggleGroupMember,
    startGroupCall,
  } = useGroupCall(user, startCall, callStatus, setCallStatus, setCallType, handleCleanupCall);

  useEffect(() => {
    if (!pendingIncomingCall || callStatus !== "idle") return;
    setIncomingCall(pendingIncomingCall);
    setCallType(pendingIncomingCall.callType);
    setCallStatus("incoming");
    onPendingCallConsumed?.();
  }, [onPendingCallConsumed, pendingIncomingCall]);

  const callPartner = incomingCall?.from || selectedUser;
  const isCallVisible = callStatus !== "idle";
  const isGroupCall = remoteStreams.length > 1 || peerCount > 1 || incomingCall?.participants?.length > 2;

  return (
    <div className="flex h-full w-full bg-white overflow-hidden relative">
      {!selectedUser ? (
        <div className="w-full h-full animate-in fade-in duration-300">
          <Sidebar
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] animate-in slide-in-from-right duration-300">
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
                <p className="text-[12px] text-slate-400 font-bold ">
                  {selectedUser.role || "Team Member"}
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => openGroupCallModal(selectedUser)}
                disabled={callStatus !== "idle"}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all disabled:opacity-40"
                title="Group call"
              >
                <FiUsers size={20} />
              </button>
              <button
                onClick={() => startCall(selectedUser, "audio")}
                disabled={callStatus !== "idle"}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all disabled:opacity-40"
                title="Audio call"
              >
                <FiPhone size={19} />
              </button>
              <button
                onClick={() => startCall(selectedUser, "video")}
                disabled={callStatus !== "idle"}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all disabled:opacity-40"
                title="Video call"
              >
                <FiVideo size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <ChatWindow selectedUser={selectedUser} currentUser={user} />
          </div>
        </div>
      )}

      <GroupCallModal
        showGroupCallModal={showGroupCallModal}
        setShowGroupCallModal={setShowGroupCallModal}
        groupUsers={groupUsers}
        selectedGroupMemberIds={selectedGroupMemberIds}
        groupCallType={groupCallType}
        setGroupCallType={setGroupCallType}
        toggleGroupMember={toggleGroupMember}
        startGroupCall={startGroupCall}
      />

      <CallUI
        isCallVisible={isCallVisible}
        callStatus={callStatus}
        callType={callType}
        incomingCall={incomingCall}
        remoteStreams={remoteStreams}
        peerCount={peerCount}
        callPartner={callPartner}
        localStream={localStream}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        acceptCall={acceptCall}
        rejectCall={rejectCall}
        endCall={endCall}
        toggleMute={toggleMute}
        toggleCamera={toggleCamera}
      />
    </div>
  );
};

export default ChatPage;
