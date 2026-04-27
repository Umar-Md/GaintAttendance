import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";
import { FiX, FiSend, FiMessageCircle } from "react-icons/fi";

const SOCKET_URL = "http://localhost:7000";

const ChatbotUI = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatType, setChatType] = useState("GROUP"); // GROUP | PRIVATE

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  /* ================= CONNECT SOCKET ================= */
  useEffect(() => {
    if (!open || !user) return;

    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    socketRef.current.emit("join_chat", {
      type: chatType,
      department: user.department || "PUBLIC",
      userId: user._id,
    });

    socketRef.current.on("previous_messages", (msgs) => {
      setMessages(msgs);
    });

    socketRef.current.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("bot_message", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          senderName: "OfficeBot",
          role: "BOT",
          text: msg.text,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });

    return () => socketRef.current.disconnect();
  }, [open, chatType, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND ================= */
  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    socketRef.current.emit("send_message", {
      text,
      senderId: user._id,
      department: user.department || "PUBLIC",
      chatType,
    });

    setText("");
  };

  /* ================= UI ================= */
  return (
    <div className="fixed bottom-5 right-5 z-9999">
      {open ? (
        <div className="w-80 h-135 bg-white rounded-xl shadow-xl flex flex-col">
          {/* HEADER */}
          <div className="bg-green-600 text-white px-4 py-3 flex justify-between">
            <div>
              <p className="font-bold text-sm">{user.userName}</p>
              <p className="text-xs">{user.role}</p>
            </div>
            <button onClick={() => setOpen(false)}>
              <FiX />
            </button>
          </div>

          {/* CHAT TYPE */}
          <div className="flex border-b text-sm">
            <button
              onClick={() => {
                setChatType("GROUP");
                setMessages([]);
              }}
              className={`flex-1 py-2 ${
                chatType === "GROUP" ? "bg-green-600 text-white" : "bg-gray-100"
              }`}
            >
              Team Chat
            </button>
            <button
              onClick={() => {
                setChatType("PRIVATE");
                setMessages([]);
              }}
              className={`flex-1 py-2 ${
                chatType === "PRIVATE"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Office Assistant
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-100">
            {messages.map((m) => {
              const mine = m.senderName === user.userName;
              return (
                <div
                  key={m.id}
                  className={`mb-2 p-2 rounded-lg text-sm max-w-[80%] ${
                    mine
                      ? "bg-green-200 ml-auto"
                      : m.role === "BOT"
                        ? "bg-yellow-100"
                        : "bg-white"
                  }`}
                >
                  <p className="text-[10px] font-bold">{m.senderName}</p>
                  <p>{m.text}</p>
                  <p className="text-[9px] text-right">{m.time}</p>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <form onSubmit={handleSend} className="p-2 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                chatType === "PRIVATE"
                  ? "Type 'apply leave'..."
                  : "Type message..."
              }
              className="flex-1 border rounded-full px-3"
            />
            <button className="bg-green-600 text-white p-2 rounded-full">
              <FiSend />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 bg-green-600 text-white rounded-full shadow flex items-center justify-center"
        >
          <FiMessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default function Chatbot({ user }) {
  return ReactDOM.createPortal(<ChatbotUI user={user} />, document.body);
}