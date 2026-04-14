"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/src/lib/socket";
import { useChatStore } from "@/src/store/chatStore";
import { Send } from "lucide-react";

export default function Home() {
  const [text, setText] = useState("");
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [conversationId, setConversationId] = useState("");

  const { messages, addMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔐 Protect page + load user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      console.log("Invalid user");
    }
  }, []);

  // 👥 load users
  useEffect(() => {
    fetch("http://localhost:5002/api/auth/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  // 💬 create/get conversation
useEffect(() => {
  if (!currentChat || !user?._id) return;

  console.log("🔥 Creating conversation...");

  fetch("http://localhost:5002/api/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      senderId: user._id,
      receiverId: currentChat._id,
    }),
  })
    .then(res => res.json())
    .then(data => {
      console.log("✅ Conversation:", data);
      setConversationId(data._id);
    });

}, [currentChat, user?._id]); // 🔥 CHANGE THIS




  // 🔌 socket
  useEffect(() => {
    socket.on("receive_message", (data) => {
      addMessage(data);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [addMessage]);

  // 📩 send message
const sendMessage = () => {
  console.log("CLICKED 🔥");

if (!text.trim() || !conversationId) {
  console.log("BLOCKED ❌", { text, conversationId });
  return;
}

};

  // 🎯 filter messages (IMPORTANT)
  const filteredMessages = messages.filter(
    (m: any) => m.conversationId === conversationId
  );

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  return (
    <div className="flex h-screen">

      {/* 🔵 Sidebar */}
      <div className="w-1/4 border-r p-4">
        <h2 className="text-lg font-bold mb-4">Users</h2>

        {users.map((u) => (
          <div
            key={u._id}
           onClick={() => {
  console.log("SELECT USER:", u);
  setCurrentChat(u);
}}
            className={`p-2 cursor-pointer rounded ${
              currentChat?._id === u._id ? "bg-blue-200" : "hover:bg-gray-100"
            }`}
          >
            {u.name}
          </div>
        ))}
      </div>

      {/* 💬 Chat Area */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="p-4 border-b font-semibold">
          {currentChat ? currentChat.name : "Select a user"}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredMessages.map((m, i) => (
            <div
              key={i}
              className={`p-2 rounded max-w-xs ${
                m.sender === user?._id
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200"
              }`}
            >
              <p className="text-sm">{m.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <input
            className="flex-1 border p-2 rounded"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 rounded flex items-center gap-1"
          >
            <Send size={16} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}