"use client";

import { useEffect, useState } from "react";
import { socket } from "@/src/lib/socket";
import { useChatStore } from "@/src/store/chatStore";

export default function Home() {
  const [text, setText] = useState("");
  const { messages, addMessage } = useChatStore();

  useEffect(() => {
    socket.on("receive_message", (data) => {
      addMessage(data);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = () => {
    const msg = { text };
    socket.emit("send_message", msg);
    addMessage(msg);
    setText("");
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">DashChat</h1>

      <div className="border p-4 h-64 overflow-y-auto">
        {messages.map((m, i) => (
          <p key={i}>{m.text}</p>
        ))}
      </div>

      <input
        className="border p-2 mt-2"
        value={text}
onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setText(e.target.value)
}      />
      <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white p-2">
        Send
      </button>
    </div>
  );
}