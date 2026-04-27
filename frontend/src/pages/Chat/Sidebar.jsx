import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";
import { messageURI } from "../../mainApi";

/* 🎨 ROLE COLORS */
const ROLE_COLORS = {
  hr: "#E5534A",
  manager: "#618DF4",
  employee: "#F7C43C",
  admin: "#E9CFA6",
  superadmin: "#E9CFA6",
};

const getRoleColor = (role = "") => {
  const key = role.toLowerCase().replace("-", "").trim();
  return ROLE_COLORS[key] || "#64748b";
};

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const [users, setUsers] = useState([]);
  const [unseen, setUnseen] = useState({});
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await axios.get(`${messageURI}/users`, { withCredentials: true });
        if (res.data?.success) {
          setUsers(res.data.users || []);
          setUnseen(res.data.unSeenMessages || {});
        }
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    loadUsers();

    socket.on("newMessage", (msg) => {
      setUsers((prevUsers) => {
        return prevUsers.map((u) => {
          if (u._id === msg.sender || u._id === msg.receiver) {
            return { 
              ...u, 
              lastMessage: { 
                ...u.lastMessage, 
                createdAt: msg.createdAt || new Date().toISOString() 
              } 
            };
          }
          return u;
        });
      });

      if (msg.sender !== selectedUser?._id) {
        setUnseen((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
      }
    });

    return () => socket.off("newMessage");
  }, [selectedUser?._id]);

  const filteredAndSortedUsers = users
    .filter((u) => {
      const matchName = u.userName?.toLowerCase().includes(search.toLowerCase());
      const dbRole = u.role ? u.role.toLowerCase().trim() : "";
      const selected = roleFilter.toLowerCase().trim();

      if (selected === "all") return matchName;
      if (selected === "superadmin" || selected === "admin") {
        return matchName && dbRole.includes("admin");
      }
      return matchName && dbRole === selected;
    })
    .sort((a, b) => {
      const timeA = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
      return timeB - timeA;
    });

  return (
    <div className="w-80 bg-white border-r shadow-2xl h-full flex flex-col text-sm">
      <div className="p-4 text-lg font-bold text-indigo-400 border-b">Gaint Chat</div>

      <div className="p-3 space-y-2 border-b">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-md outline-none"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full px-3 py-2 border rounded-md outline-none"
        >
          <option value="all">All Roles</option>
          <option value="HR">HR</option>
          <option value="Manager">Manager</option>
          <option value="Employee">Employee</option>
          <option value="superAdmin">Admin</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredAndSortedUsers.length === 0 ? (
          <p className="text-center p-10 text-gray-400">No users found</p>
        ) : (
          filteredAndSortedUsers.map((u) => (
            <div
              key={u._id}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors ${
                selectedUser?._id === u._id ? "bg-indigo-100" : ""
              }`}
            >
              <div
                className="w-12 h-12 rounded-full border-2 overflow-hidden shrink-0"
                style={{ borderColor: getRoleColor(u.role) }}
              >
                <img
                  src={u.imageUrl || `https://ui-avatars.com/api/?name=${u.userName}`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: getRoleColor(u.role) + "22", color: getRoleColor(u.role) }}
                >
                  {u.role}
                </span>
                <p className="font-semibold text-slate-900 truncate">{u.userName}</p>
              </div>

              {unseen[u._id] > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  {unseen[u._id]}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;