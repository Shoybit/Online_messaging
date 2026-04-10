"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/src/lib/socket";
import { useChatStore } from "@/src/store/chatStore";

export default function Home() {
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { messages, addMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
  }
}, []);

const sendMessage = () => {
  if (!text.trim()) return;

let user = {};

try {
  const stored = localStorage.getItem("user");
  if (stored && stored !== "undefined") {
    user = JSON.parse(stored);
  }
} catch (err) {
  console.log("Invalid user in localStorage");
}
  const msg = {
    text,
    sender: user._id,
    name: user.name,
  };

  socket.emit("send_message", msg);
  addMessage(msg);
  setText("");
};

useEffect(() => {
  if (socket.connected) {
    setIsConnected(true);
  }

  socket.on("connect", () => {
    setIsConnected(true);
  });

  socket.on("disconnect", () => {
    setIsConnected(false);
  });

  socket.on("receive_message", (data) => {
    addMessage(data);
  });

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("receive_message");
  };
}, []);



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">DashChat</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-3">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Send a message to start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={m.id || i}
                className="flex items-start space-x-3 animate-fade-in"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">
                    {String.fromCharCode(65 + (i % 26))}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-lg shadow-sm border p-3 max-w-md">
                    <p className="text-gray-800">{m.text}</p>
                  </div>
                  {m.timestamp && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
<input
  ref={inputRef}
  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12"
  placeholder="Type your message..."
  value={text}
  onChange={(e) => setText(e.target.value)}
  onKeyDown={handleKeyPress}
  disabled={false}
/>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hidden sm:block">
                ↵
              </div>
            </div>
<button
  onClick={sendMessage}
  className="bg-blue-500 text-white px-6 py-3 rounded-lg"
>
  Send
</button>
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">
            Press Enter to send
          </div>
        </div>
      </div>

      {/* Add animation styles */}
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