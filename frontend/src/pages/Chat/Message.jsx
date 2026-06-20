

import React, { useState, useEffect, useRef } from "react";
import {
  FiDownload,
  FiEdit2,
  FiFile,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";

const Message = ({ msg, myId, onEdit, onDelete }) => {
  const getId = (value) => value?._id || value?.id || value?.toString?.() || value;
  const isMine = getId(msg.sender) === getId(myId);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const hasFile = Boolean(msg.fileUrl);
  const fileType = msg.fileType || "document";
  const fileName = msg.fileName || "Open file";
  const sentAt = msg.createdAt || msg.updatedAt || null;
  const dateTimeLabel = sentAt
    ? new Date(sentAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderFile = () => {
    if (!hasFile) return null;

    if (fileType === "image") {
      return (
        <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="block">
          <img
            src={msg.fileUrl}
            alt={msg.text || "Sent image"}
            className="mt-2 max-h-60 max-w-full rounded-md object-contain"
            loading="lazy"
          />
        </a>
      );
    }

    if (fileType === "video") {
      return (
        <video
          src={msg.fileUrl}
          controls
          className="mt-2 max-h-60 max-w-full rounded-md bg-black"
        />
      );
    }

    return (
      <a
        href={msg.fileUrl}
        target="_blank"
        rel="noreferrer"
        className={`mt-2 flex items-center gap-3 rounded-md border p-3 text-sm transition ${
          isMine
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
        }`}
      >
        <FiFile className="shrink-0" size={22} />
        <span className="min-w-0 flex-1 truncate">{fileName}</span>
        <FiDownload className="shrink-0" size={18} />
      </a>
    );
  };

  return (
    <div className={`flex min-w-0 ${isMine ? "justify-end" : "justify-start"} group relative mb-4`}>
      <div className={`relative min-w-0 w-fit max-w-[88%] sm:max-w-[78%] md:max-w-[70%] p-3 rounded-lg shadow ${
        isMine ? "bg-indigo-600 text-white" : "bg-white text-slate-800"
      }`}>
        {msg.isEdited && <span className="text-[9px] block mb-1 opacity-70 italic">(edited)</span>}
        {msg.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {msg.text}
          </p>
        )}
        {renderFile()}
        {dateTimeLabel && (
          <div className="mt-1 flex justify-end">
            <span
              className={`text-[10px] font-bold ${
                isMine ? "text-white/80" : "text-slate-400"
              }`}
            >
              {dateTimeLabel}
            </span>
          </div>
        )}

        {/* Triple Dot Menu - Now visible to both but Edit only for owner */}
        <div className={`absolute top-2 ${isMine ? "-left-6" : "-right-6"}`} ref={menuRef}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 transition-all"
          >
            <FiMoreVertical size={16} />
          </button>
          
          {showMenu && (
            <div className={`absolute mt-1 w-24 bg-white shadow-xl rounded-md border border-slate-100 z-100 overflow-hidden ${isMine ? "left-0" : "right-0"}`}>
              {isMine && msg.text && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(msg); setShowMenu(false); }}
                  className="flex items-center gap-2 p-2 hover:bg-slate-50 w-full text-[11px] text-slate-700"
                >
                  <FiEdit2 size={12} className="text-indigo-500"/> Edit
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(msg._id); setShowMenu(false); }}
                className="flex items-center gap-2 p-2 hover:bg-slate-50 w-full text-[11px] text-red-500 border-t"
              >
                <FiTrash2 size={12}/> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
