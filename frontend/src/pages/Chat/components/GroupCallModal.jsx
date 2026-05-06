import React from "react";
import { FiX, FiPhone, FiVideo } from "react-icons/fi";

const GroupCallModal = ({
  showGroupCallModal,
  setShowGroupCallModal,
  groupUsers,
  selectedGroupMemberIds,
  groupCallType,
  setGroupCallType,
  toggleGroupMember,
  startGroupCall,
}) => {
  if (!showGroupCallModal) return null;

  return (
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
                <p className="text-xs text-slate-400 ">{member.role}</p>
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
  );
};

export default GroupCallModal;