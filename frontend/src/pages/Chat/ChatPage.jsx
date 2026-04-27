import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import socket from "../socket";
import { FiChevronLeft } from "react-icons/fi";

const ChatPage = ({ user }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    socket.io.opts.query = { userId: user._id };
    socket.connect();

    return () => socket.disconnect();
  }, [user?._id]);

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
          </div>

          {/* Messaging Window */}
          <div className="flex-1 overflow-hidden relative">
            <ChatWindow selectedUser={selectedUser} currentUser={user} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
