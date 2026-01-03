"use client";

import { useState } from "react";
import Image from "next/image";

export default function ChatPage() {
  const [messages, setMessages] = useState<
    { sender: "user" | "neon"; text: string }[]
  >([
    { sender: "neon", text: "Hey… ich bin Neon. Schön, dass du hier bist." },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { sender: "neon", text: data.reply },
    ]);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 flex items-center gap-4">
        <Image
          src="/neon.png"
          alt="Neon"
          width={48}
          height={48}
          className="rounded-full border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
        />
        <span className="text-pink-500 font-bold text-lg">Neon</span>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-xs px-4 py-2 rounded-2xl ${
              msg.sender === "user"
                ? "ml-auto bg-pink-600"
                : "mr-auto bg-gray-800"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800 flex gap-2">
        <input
          className="flex-1 bg-gray-900 rounded-full px-4 py-2 outline-none"
          placeholder="Schreib mit Neon…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
        >
          ➤
        </button>
      </div>
    </main>
  );
}
