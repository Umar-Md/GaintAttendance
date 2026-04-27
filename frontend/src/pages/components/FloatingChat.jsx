import React, { useState } from "react";
import ChatPage from "../Chat/ChatPage";
import { FiMessageSquare, FiX } from "react-icons/fi";

const FloatingChat = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    /* Added pointer-events-none to the wrapper so it doesn't block background clicks */
    <div className="fixed bottom-5 right-5 z-9999 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window Container */}
      {isOpen && (
        <div 
          className="mb-4 w-87.5 sm:w-95 h-125 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header - Fixed Height, Removed Resize Button */}
         <div className="bg-indigo-600 px-4 py-3 text-white flex justify-between items-center shrink-0">
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
    <span className="font-bold text-sm tracking-wide">
  {user.userName || user.name || user.username || "User"} •{" "}
  {user.designation || user.role}
</span>

  </div>
  <button 
    onClick={() => setIsOpen(false)} 
    className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
  >
    <FiX size={20} />
  </button>
</div>

          
          {/* The Content Area 
            - flex-1 and min-h-0 are critical to make the ChatPage 
              fit inside without pushing the input box out of view 
          */}
          <div className="flex-1 min-h-0 overflow-hidden bg-white">
            <ChatPage user={user} />
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 flex items-center justify-center rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 active:scale-95 pointer-events-auto ${
          isOpen ? "bg-slate-800 rotate-90" : "bg-indigo-600"
        } text-white`}
      >
        {isOpen ? <FiX size={28} /> : <FiMessageSquare size={28} />}
      </button>
    </div>
  );
};

export default FloatingChat;