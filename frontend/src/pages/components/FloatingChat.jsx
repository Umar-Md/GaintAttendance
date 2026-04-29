import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ChatPage from "../Chat/ChatPage";
import socket from "../socket";
import { messageURI } from "../../mainApi";
import { FiMessageSquare, FiPhoneIncoming, FiX } from "react-icons/fi";

const getId = (value) => value?._id || value?.id || value?.toString?.() || value;

const FloatingChat = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCall, setPendingCall] = useState(null);
  const [callPopup, setCallPopup] = useState(null);
  const isOpenRef = useRef(false);
  const popupTimeoutRef = useRef(null);

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.error("Call beep failed", err);
    }
  };

  const showCallPopup = (call) => {
    const isGroupCall = (call.participants?.length || 0) > 2;
    setCallPopup({
      title: isGroupCall ? "Incoming group call" : "Incoming call",
      message: `${call.from?.userName || "Someone"} is calling`,
    });

    window.clearTimeout(popupTimeoutRef.current);
    popupTimeoutRef.current = window.setTimeout(() => {
      setCallPopup(null);
    }, 6000);
  };

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!user?._id) return;

    const loadUnreadCount = async () => {
      try {
        const res = await axios.get(`${messageURI}/users`, {
          withCredentials: true,
        });
        const unreadMap = res.data?.unSeenMessages || {};
        const totalUnread = Object.values(unreadMap).reduce(
          (total, count) => total + Number(count || 0),
          0
        );

        if (!isOpenRef.current) {
          setUnreadCount(totalUnread);
        }
      } catch (err) {
        console.error("Failed to load chat unread count", err);
      }
    };

    socket.io.opts.query = { userId: user._id };
    socket.connect();
    loadUnreadCount();

    const handleNewMessage = (msg) => {
      const receiverId = getId(msg.receiver);
      const senderId = getId(msg.sender);

      if (receiverId === user._id && senderId !== user._id && !isOpenRef.current) {
        setUnreadCount((count) => count + 1);
      }
    };

    const handleIncomingCall = (call) => {
      playBeep();
      showCallPopup(call);

      if (!isOpenRef.current) {
        setPendingCall(call);
      }
    };

    const clearPendingCall = () => {
      setPendingCall(null);
      setCallPopup(null);
      window.clearTimeout(popupTimeoutRef.current);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("call:offer", handleIncomingCall);
    socket.on("call:end", clearPendingCall);
    socket.on("call:reject", clearPendingCall);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("call:offer", handleIncomingCall);
      socket.off("call:end", clearPendingCall);
      socket.off("call:reject", clearPendingCall);
      window.clearTimeout(popupTimeoutRef.current);
    };
  }, [user?._id]);

  const toggleChat = () => {
    setIsOpen((open) => !open);
    setUnreadCount(0);
  };

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
            <ChatPage
              user={user}
              keepSocketAlive
              pendingIncomingCall={pendingCall}
              onPendingCallConsumed={() => setPendingCall(null)}
            />
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {(callPopup || (!isOpen && (pendingCall || unreadCount > 0))) && (
        <div className="mb-2 max-w-48 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xl border border-slate-200 pointer-events-auto">
          {callPopup ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <FiPhoneIncoming />
              <span>
                {callPopup.title}: {callPopup.message}
              </span>
            </div>
          ) : pendingCall ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <FiPhoneIncoming />
              <span>Incoming call</span>
            </div>
          ) : (
            <span>
              {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
            </span>
          )}
        </div>
      )}

      <button
        onClick={toggleChat}
        title="Team Chat"
        aria-label="Team Chat"
        className={`group relative w-14 h-14 flex items-center justify-center rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 active:scale-95 pointer-events-auto ${
          isOpen ? "bg-slate-800 rotate-90" : "bg-indigo-600"
        } ${pendingCall ? "ring-4 ring-emerald-300 animate-pulse" : ""} ${
          !isOpen && unreadCount > 0 ? "ring-4 ring-red-200" : ""
        } text-white`}
      >
        {isOpen ? <FiX size={28} /> : <FiMessageSquare size={28} />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 border-2 border-white text-[11px] font-black leading-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {!isOpen && pendingCall && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
            <FiPhoneIncoming size={11} />
          </span>
        )}
        <span className="absolute right-16 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
          Team Chat
        </span>
      </button>
    </div>
  );
};

export default FloatingChat;
