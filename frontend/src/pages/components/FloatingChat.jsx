import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ChatPage from "../Chat/ChatPage";
import socket from "../socket";
import { messageURI } from "../../mainApi";
import {
  FiMessageSquare,
  FiPhoneIncoming,
  FiX,
} from "react-icons/fi";

const getId = (value) => value?._id || value?.id || value?.toString?.() || value;

const FloatingChat = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCall, setPendingCall] = useState(null);
  const [callPopup, setCallPopup] = useState(null);
  const [panelHeightPx, setPanelHeightPx] = useState(500);
  const isOpenRef = useRef(false);
  const popupTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const ringtoneIntervalRef = useRef(null);
  const resizeRef = useRef({
    active: false,
    startClientY: 0,
    startHeight: 0,
  });

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  useEffect(() => {
    const unlockAudio = () => {
      const ctx = initAudioContext();
      if (!ctx) return;

      const gain = ctx.createGain();
      const oscillator = ctx.createOscillator();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.01);
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  const playTone = ({
    frequency = 880,
    duration = 0.35,
    volume = 0.35,
    delay = 0,
    type = "sine",
  } = {}) => {
    try {
      const ctx = initAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + delay;
      const endTime = startTime + duration;

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, endTime);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(startTime);
      oscillator.stop(endTime + 0.02);
    } catch (err) {
      console.error("Notification sound failed", err);
    }
  };

  const playMessageTone = () => {
    playTone({ frequency: 988, duration: 0.14, volume: 0.58, type: "triangle" });
    playTone({ frequency: 1318, duration: 0.18, volume: 0.52, delay: 0.14, type: "triangle" });
    playTone({ frequency: 1760, duration: 0.12, volume: 0.42, delay: 0.3, type: "sine" });
  };

  const playCallRingtone = () => {
    playTone({ frequency: 659, duration: 0.18, volume: 0.58, type: "triangle" });
    playTone({ frequency: 880, duration: 0.2, volume: 0.56, delay: 0.18, type: "triangle" });
    playTone({ frequency: 1175, duration: 0.24, volume: 0.52, delay: 0.4, type: "sine" });
    playTone({ frequency: 880, duration: 0.18, volume: 0.44, delay: 0.68, type: "triangle" });
  };

  const startCallRingtone = () => {
    if (ringtoneIntervalRef.current) return;
    playCallRingtone();
    ringtoneIntervalRef.current = window.setInterval(playCallRingtone, 1700);
  };

  const stopCallRingtone = () => {
    window.clearInterval(ringtoneIntervalRef.current);
    ringtoneIntervalRef.current = null;
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

      if (receiverId === user._id && senderId !== user._id) {
        playMessageTone();
        if (!isOpenRef.current) {
          setUnreadCount((count) => count + 1);
        }
      }
    };

    const handleIncomingCall = (call) => {
      startCallRingtone();
      showCallPopup(call);

      if (!isOpenRef.current) {
        setPendingCall(call);
      }
    };

    const clearPendingCall = () => {
      stopCallRingtone();
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
      stopCallRingtone();
      window.clearTimeout(popupTimeoutRef.current);
    };
  }, [user?._id]);

  const toggleChat = () => {
    setIsOpen((open) => !open);
    setUnreadCount(0);
    if (!isOpen) {
      initAudioContext();
    } else {
      stopCallRingtone();
    }
  };

  const clampHeight = (nextHeight) => {
    const viewportH =
      typeof window !== "undefined" ? window.innerHeight || 0 : 0;
    const maxHeight = Math.max(260, Math.floor(viewportH * 0.8));
    const minHeight = 260;
    return Math.min(Math.max(nextHeight, minHeight), maxHeight);
  };

  const startResize = (e) => {
    resizeRef.current.active = true;
    resizeRef.current.startClientY = e.clientY;
    resizeRef.current.startHeight = panelHeightPx;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onResizeMove = (e) => {
    if (!resizeRef.current.active) return;
    const deltaY = e.clientY - resizeRef.current.startClientY;
    const nextHeight = resizeRef.current.startHeight - deltaY;
    setPanelHeightPx(clampHeight(nextHeight));
  };

  const endResize = () => {
    resizeRef.current.active = false;
  };

  if (!user) return null;

  return (
    /* Added pointer-events-none to the wrapper so it doesn't block background clicks */
    <div className="fixed bottom-3 left-3 right-3 z-9999 flex flex-col items-stretch sm:bottom-5 sm:left-auto sm:right-5 sm:items-end pointer-events-none">
       
      {/* Chat Window Container */}
      {isOpen && (
        <div 
          className="mb-4 w-full sm:w-95 max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-5 duration-300"
          style={{ height: `${panelHeightPx}px` }}
        >
          {/* Resize handle (drag up/down to change height) */}
          <div
            className="h-3 bg-indigo-600 flex items-center justify-center cursor-ns-resize select-none shrink-0"
            onPointerDown={startResize}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            title="Drag to resize"
            aria-label="Drag to resize chat"
          >
            <div className="h-1 w-12 rounded-full bg-white/70" />
          </div>
          {/* Header - Fixed Height, Removed Resize Button */}
         <div className="bg-indigo-600 px-4 py-3 text-white flex justify-between items-center shrink-0">
  <div className="flex min-w-0 items-center gap-2">
     <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0"></div>
    <span className="font-bold text-sm tracking-wide truncate">
  {user.userName || user.name || user.username || "User"} •{" "}
  {user.designation || user.role}
</span>

  </div>
  <div className="flex items-center gap-1">
    <button 
      type="button"
      onClick={() => setIsOpen(false)} 
      className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
      title="Close"
      aria-label="Close chat"
    >
      <FiX size={20} />
    </button>
  </div>
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
              onPendingCallConsumed={() => {
                stopCallRingtone();
                setPendingCall(null);
              }}
              onStopNotificationSound={stopCallRingtone}
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

      <div className="relative flex items-center justify-end">
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
        </button>
        {!isOpen && (
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            Team Chat
          </span>
        )}
      </div>
    </div>
  );
};

export default FloatingChat;
