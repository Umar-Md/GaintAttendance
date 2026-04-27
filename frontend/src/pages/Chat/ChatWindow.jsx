// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import socket from "../socket";
// import Message from "./Message";
// import { CLOUD_NAME, messageURI, preset } from "../../mainApi";
// import { FiCamera, FiPaperclip, FiSend, FiX } from "react-icons/fi";

// const ChatWindow = ({ selectedUser, currentUser }) => {
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [editingMessage, setEditingMessage] = useState(null);
  
//   // Camera Modal State
//   const [showCamera, setShowCamera] = useState(false);
//   const [cameraStream, setCameraStream] = useState(null);
//   const videoRef = useRef(null);
//   const bottomRef = useRef(null);

//   useEffect(() => {
//     if (!selectedUser?._id) return;

//     const loadMessages = async () => {
//       try {
//         const res = await axios.get(`${messageURI}/${selectedUser._id}`, {
//           withCredentials: true,
//         });
//         setMessages(res.data.messages || []);
//       } catch (err) {
//         console.error("Failed to load messages", err);
//       }
//     };

//     loadMessages();

//     // --- REAL-TIME LISTENERS ---
//     socket.on("newMessage", (msg) => {
//       if (msg.sender === selectedUser._id || msg.receiver === selectedUser._id) {
//         setMessages((prev) => [...prev, msg]);
//       }
//     });

//     socket.on("messageDeleted", (messageId) => {
//       setMessages((prev) => prev.filter((m) => m._id !== messageId));
//     });

//     socket.on("messageUpdated", (updatedMsg) => {
//       setMessages((prev) =>
//         prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
//       );
//     });

//     return () => {
//       socket.off("newMessage");
//       socket.off("messageDeleted");
//       socket.off("messageUpdated");
//     };
//   }, [selectedUser?._id]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // --- ACTIONS: DELETE & EDIT ---
//   const handleDelete = async (messageId) => {
//     if (!window.confirm("Delete this message?")) return;
//     try {
//       await axios.delete(`${messageURI}/delete/${messageId}`, { withCredentials: true });
//       setMessages((prev) => prev.filter((m) => m._id !== messageId));
//       socket.emit("deleteMessage", { messageId, receiverId: selectedUser._id });
//     } catch (error) {
//       console.error("Delete failed", error);
//     }
//   };

//   const handleStartEdit = (msg) => {
//     setEditingMessage(msg);
//     setText(msg.text); 
//   };

//   const handleCancelEdit = () => {
//     setEditingMessage(null);
//     setText("");
//   };

//   // --- CAMERA MODAL LOGIC ---
//   const startCamera = async () => {
//     setShowCamera(true);
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       setCameraStream(stream);
//       if (videoRef.current) videoRef.current.srcObject = stream;
//     } catch (err) {
//       alert("Camera access denied. Check browser permissions.");
//       setShowCamera(false);
//     }
//   };

//   const takePhoto = () => {
//     const canvas = document.createElement("canvas");
//     canvas.width = videoRef.current.videoWidth;
//     canvas.height = videoRef.current.videoHeight;
//     canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    
//     canvas.toBlob((blob) => {
//       const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
//       handleFileUpload(file);
//       stopCamera();
//     }, "image/jpeg");
//   };

//   const stopCamera = () => {
//     if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
//     setCameraStream(null);
//     setShowCamera(false);
//   };

//   // --- FILE HANDLING ---
//   const uploadToCloudinary = async (file) => {
//     const data = new FormData();
//     data.append("file", file);
//     data.append("upload_preset", preset);
//     let resource = file.type.startsWith("video") ? "video" : file.type.includes("pdf") ? "raw" : "image";
    
//     const res = await axios.post(
//       `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource}/upload`,
//       data
//     );
//     return { url: res.data.secure_url, type: resource === "raw" ? "document" : resource };
//   };

//   const handleFileUpload = async (file) => {
//     if (!file) return;
//     try {
//       setIsUploading(true);
//       const { url, type } = await uploadToCloudinary(file);
//       const res = await axios.post(
//         `${messageURI}/send/${selectedUser._id}`,
//         { fileUrl: url, fileType: type },
//         { withCredentials: true }
//       );
//       setMessages((prev) => [...prev, res.data.newMessage]);
//     } catch (error) {
//       console.error("Upload failed", error);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // --- SEND / UPDATE LOGIC ---
//   const sendMessage = async () => {
//     if (!text.trim()) return;
//     try {
//       if (editingMessage) {
//         const res = await axios.put(`${messageURI}/update/${editingMessage._id}`, { text }, { withCredentials: true });
//         const updated = res.data.updatedMessage;
//         setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
//         socket.emit("updateMessage", { updatedMsg: updated, receiverId: selectedUser._id });
//         setEditingMessage(null);
//       } else {
//         const res = await axios.post(`${messageURI}/send/${selectedUser._id}`, { text }, { withCredentials: true });
//         setMessages((prev) => [...prev, res.data.newMessage]);
//       }
//       setText("");
//     } catch (error) {
//       console.error("Action failed", error);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-slate-50 relative">
      
//       {/* CAMERA UI */}
//       {showCamera && (
//         <div className="absolute inset-0 z-50 bg-blue-200 flex flex-col items-center justify-center">
//           <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[70%] bg-slate-900" />
//           <div className="flex gap-4 mt-4">
//             <button onClick={stopCamera} className="p-4 m-2 bg-red-500 text-white rounded-2xl"><FiX size={20}/></button>
//             <button onClick={takePhoto} className="p-4 bg-green-400 text-white rounded-full border-4 border-slate-200 active:scale-90"><FiCamera size={30}/></button>
//           </div>
//         </div>
//       )}

//       {/* 1. MESSAGES AREA */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
//         {messages.map((msg) => (
//           <Message 
//             key={msg._id} 
//             msg={msg} 
//             myId={currentUser._id} 
//             onDelete={handleDelete}
//             onEdit={handleStartEdit}
//           />
//         ))}
//         <div ref={bottomRef} />
//       </div>

//       {/* 2. INPUT BAR */}
//       <div className="shrink-0 p-3 bg-white border-t border-slate-200 shadow-lg">
//         {editingMessage && (
//           <div className="flex items-center justify-between bg-indigo-50 px-4 py-2 mb-2 rounded-lg text-xs text-indigo-600 border border-indigo-100">
//             <span>Editing message...</span>
//             <button onClick={handleCancelEdit}><FiX size={14}/></button>
//           </div>
//         )}

//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => document.getElementById("fileInput").click()}
//             className={`p-2 rounded-full transition-colors ${isUploading ? "text-slate-300 animate-spin" : "text-slate-500 hover:bg-slate-100"}`}
//             disabled={isUploading}
//           >
//             <FiPaperclip size={20} />
//           </button>
          
//           <button onClick={startCamera} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
//             <FiCamera size={20} />
//           </button>

//           <input type="file" hidden id="fileInput" accept="image/*,video/*,.pdf,.doc" onChange={(e) => handleFileUpload(e.target.files[0])} />

//           <div className="flex-1 flex items-center bg-slate-100 rounded-2xl px-3 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
//             <input
//               value={text}
//               onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//               onChange={(e) => setText(e.target.value)}
//               className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 outline-none text-slate-700"
//               placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
//             />
//           </div>

//           <button onClick={sendMessage} disabled={!text.trim()} className={`p-2.5 rounded-full transition-all flex items-center justify-center ${!text.trim() ? "text-slate-300" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:scale-90"}`}>
//             <FiSend size={18} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatWindow;

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import socket from "../socket";
import Message from "./Message";
import { CLOUD_NAME, messageURI, preset } from "../../mainApi";
import { FiCamera, FiPaperclip, FiSend, FiX, FiCheck, FiSlash } from "react-icons/fi";

const ChatWindow = ({ selectedUser, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isRequestPending, setIsRequestPending] = useState(false); 
  
  // Camera Modal State
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const bottomRef = useRef(null);

  // 1. Load Messages and Setup Status Logic
  useEffect(() => {
    if (!selectedUser?._id) return;

    const loadMessages = async () => {
      try {
        const res = await axios.get(`${messageURI}/${selectedUser._id}`, {
          withCredentials: true,
        });
        const msgs = res.data.messages || [];
        setMessages(msgs);

        // BANNER LOGIC: Show if last message is 'pending' and sent by the other person
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.status === "pending" && lastMsg.sender === selectedUser._id) {
          setIsRequestPending(true);
        } else {
          setIsRequestPending(false);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    loadMessages();

    // 2. Real-time Socket Listeners
    socket.on("newMessage", (msg) => {
      if (msg.sender === selectedUser._id || msg.receiver === selectedUser._id) {
        setMessages((prev) => [...prev, msg]);
        if (msg.sender === selectedUser._id && msg.status === "pending") {
          setIsRequestPending(true);
        }
      }
    });

    socket.on("messageDeleted", (messageId) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    socket.on("messageUpdated", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
      // If the last message was updated to 'rejected', hide the banner
      if (updatedMsg.status !== 'pending') {
          setIsRequestPending(false);
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageDeleted");
      socket.off("messageUpdated");
    };
  }, [selectedUser?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- ACTIONS ---

  const handleAccept = async () => {
    try {
      await axios.put(`${messageURI}/accept/${selectedUser._id}`, {}, { withCredentials: true });
      setIsRequestPending(false);
      const res = await axios.get(`${messageURI}/${selectedUser._id}`, { withCredentials: true });
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Accept failed", err);
    }
  };

  const handleIgnore = async (messageId) => {
    if (!messageId) return;

    try {
      // Logic changed: PUT request to update status to 'rejected' instead of DELETE
      const res = await axios.put(`${messageURI}/reject/${messageId}`, {}, { withCredentials: true });
      
      if (res.data.success) {
        const updatedMsg = res.data.updatedMessage;
        // Update local state to reflect the status change
        setMessages((prev) => 
          prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
        );
        // Hide the banner
        setIsRequestPending(false);
      }
    } catch (error) {
      console.error("Ignore failed:", error.response?.data?.message || error.message);
    }
  };

  const handleDelete = async (messageId) => {
    if (!messageId || !messages.find(m => m._id === messageId)) return;
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await axios.delete(`${messageURI}/delete/${messageId}`, { withCredentials: true });
      if (res.data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleStartEdit = (msg) => {
    setEditingMessage(msg);
    setText(msg.text); 
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setText("");
  };

  // --- MEDIA HANDLING ---

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setShowCamera(false);
    }
  };

  const takePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      handleFileUpload(file);
      stopCamera();
    }, "image/jpeg");
  };

  const stopCamera = () => {
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    setCameraStream(null);
    setShowCamera(false);
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", preset);
    let resource = file.type.startsWith("video") ? "video" : file.type.includes("pdf") ? "raw" : "image";
    const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource}/upload`, data);
    return { url: res.data.secure_url, type: resource === "raw" ? "document" : resource };
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setIsUploading(true);
      const { url, type } = await uploadToCloudinary(file);
      const res = await axios.post(`${messageURI}/send/${selectedUser._id}`, { fileUrl: url, fileType: type }, { withCredentials: true });
      setMessages((prev) => [...prev, res.data.newMessage]);
    } catch (error) {
      console.error("Upload failed", error);
    } finally { setIsUploading(false); }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      if (editingMessage) {
        const res = await axios.put(`${messageURI}/update/${editingMessage._id}`, { text }, { withCredentials: true });
        const updated = res.data.updatedMessage;
        setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
        socket.emit("updateMessage", { updatedMsg: updated, receiverId: selectedUser._id });
        setEditingMessage(null);
      } else {
        const res = await axios.post(`${messageURI}/send/${selectedUser._id}`, { text }, { withCredentials: true });
        setMessages((prev) => [...prev, res.data.newMessage]);
      }
      setText("");
    } catch (error) { console.error("Action failed", error); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* CAMERA UI */}
      {showCamera && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[70%]" />
          <div className="flex gap-4 mt-4">
            <button onClick={stopCamera} className="p-4 bg-red-500 text-white rounded-full"><FiX size={24}/></button>
            <button onClick={takePhoto} className="p-4 bg-green-500 text-white rounded-full"><FiCamera size={30}/></button>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg) => (
          <Message key={msg._id} msg={msg} myId={currentUser._id} onDelete={handleDelete} onEdit={handleStartEdit} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* FOOTER */}
      {isRequestPending ? (
        <div className="p-6 bg-white border-t flex flex-col items-center text-center shadow-md">
          <p className="text-sm font-bold text-slate-800 mb-1">{selectedUser.userName} ({selectedUser.role}) wants to message you.</p>
          <p className="text-xs text-slate-500 mb-4">Accept to chat with them.</p>
          <div className="flex gap-3">
            <button onClick={handleAccept} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-2 rounded-full font-bold transition-all hover:bg-indigo-700">
              <FiCheck /> Accept
            </button>
            <button 
              onClick={() => handleIgnore(messages[messages.length - 1]?._id)} 
              className="flex items-center gap-2 bg-slate-100 text-slate-600 px-8 py-2 rounded-full font-bold transition-all hover:bg-slate-200"
            >
              <FiSlash /> Ignore
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-white border-t shadow-lg">
          {editingMessage && (
            <div className="flex items-center justify-between bg-indigo-50 px-4 py-2 mb-2 rounded-lg text-xs text-indigo-600">
              <span>Editing message...</span>
              <button onClick={handleCancelEdit}><FiX /></button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => document.getElementById("fileInput").click()} disabled={isUploading} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <FiPaperclip size={20} className={isUploading ? "animate-spin" : ""} />
            </button>
            <button onClick={startCamera} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><FiCamera size={20} /></button>
            <input type="file" hidden id="fileInput" accept="image/*,video/*,.pdf,.doc" onChange={(e) => handleFileUpload(e.target.files[0])} />
            <input
              value={text}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-slate-100 rounded-2xl px-4 py-2 text-sm outline-none focus:bg-white transition-all"
              placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            />
            <button onClick={sendMessage} disabled={!text.trim()} className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-300">
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;