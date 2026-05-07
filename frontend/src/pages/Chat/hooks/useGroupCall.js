import { useState } from "react";
import axios from "axios";
import { messageURI } from "../../../mainApi";
import { getLocalMedia } from "../utils/callUtils";

export const useGroupCall = (user, emitOfferToPeer, callStatus, setCallStatus, setCallType, handleCleanupCall, setLocalMediaStream) => {
  const [showGroupCallModal, setShowGroupCallModal] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState([]);
  const [groupCallType, setGroupCallType] = useState("audio");

  const loadGroupUsers = async () => {
    try {
      const res = await axios.get(`${messageURI}/users`, { withCredentials: true });
      setGroupUsers(res.data?.users || []);
    } catch (err) {
      console.error("Failed to load call members", err);
    }
  };

  const openGroupCallModal = (selectedUser) => {
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
    if (selectedGroupMemberIds.length === 0 || callStatus !== "idle") return;

    const invitedMembers = groupUsers.filter((member) =>
      selectedGroupMemberIds.includes(member._id)
    );

    if (invitedMembers.length === 0) return;

    try {
      setShowGroupCallModal(false);
      setCallType(groupCallType);
      setCallStatus("calling");

      const stream = await getLocalMedia(groupCallType);
      setLocalMediaStream(stream);

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
      handleCleanupCall();
    }
  };

  return {
    showGroupCallModal,
    setShowGroupCallModal,
    groupUsers,
    selectedGroupMemberIds,
    groupCallType,
    setGroupCallType,
    openGroupCallModal,
    toggleGroupMember,
    startGroupCall,
  };
};
