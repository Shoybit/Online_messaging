"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/src/lib/socket";
import { useChatStore } from "@/src/store/chatStore";
import { Send, MessageCircle, Users, LogOut, Menu, X, Smile } from "lucide-react";

export default function Home() {
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [user, setUser] = useState(null);
  const { messages, addMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔐 protect page & get user
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
    } catch (err) {
      console.log("Invalid user");
    }
  }, []);

  // 🔌 socket connection
  useEffect(() => {
    if (socket.connected) {
      setIsConnected(true);
    } else {
      socket.connect();
    }

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });
    
    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    socket.on("receive_message", (data) => {
      addMessage(data);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
    };
  }, [addMessage]);

  // 📩 send message
  const sendMessage = () => {
    if (!text.trim()) return;

    const msg = {
      text: text.trim(),
      sender: user?._id || "unknown",
      name: user?.name || "Anonymous",
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };

    socket.emit("send_message", msg);
    setText("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-80 bg-white shadow-xl transform transition-transform duration-300
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">DashChat</h1>
                <p className="text-sm text-blue-100">Real-time messaging</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span>{isConnected ? "Connected" : "Disconnecting..."}</span>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email || user._id}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}

          {/* Online Users (Placeholder) */}
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-700">Online Users</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>You ({user?.name})</span>
              </div>
              {/* Add logic for other online users here */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800"># general</h2>
              <p className="text-sm text-gray-500">
                {messages.length} messages • Real-time chat
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No messages yet</h3>
              <p className="text-gray-400">Be the first to send a message!</p>
            </div>
          )}
          
          {messages.map((msg, idx) => {
            const isOwnMessage = msg.sender === user?._id;
            const showAvatar = idx === 0 || messages[idx - 1]?.name !== msg.name;
            
            return (
              <div
                key={msg.id || idx}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex gap-3 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  {showAvatar && !isOwnMessage && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {msg.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {showAvatar && (
                      <span className={`text-xs font-medium text-gray-600 mb-1 ${isOwnMessage ? 'text-right' : ''}`}>
                        {isOwnMessage ? 'You' : msg.name}
                      </span>
                    )}
                    <div className={`
                      px-4 py-2 rounded-2xl shadow-sm
                      ${isOwnMessage 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                      }
                    `}>
                      <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.timestamp && (
                      <span className="text-xs text-gray-400 mt-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                className="absolute right-2 bottom-2 p-1.5 text-gray-400 hover:text-gray-600 transition"
                title="Add emoji (coming soon)"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={sendMessage}
              disabled={!text.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition flex items-center gap-2 font-medium shadow-md"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <div className="text-xs text-gray-400 text-center mt-2">
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}