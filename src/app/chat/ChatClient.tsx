"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase/client";

type Msg = { sender: "user" | "neon"; text: string };

export default function ChatClient() {
  const supabase = supabaseBrowser();

  const [messages, setMessages] = useState<Msg[]>([
    { sender: "neon", text: "Hey… ich bin Neon. Schön, dass du hier bist." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // optional: alte Nachrichten laden (wir machen das gleich serverseitig im API auch)
  useEffect(() => {}, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMessages((prev) => [
        ...prev,
        { sender: "neon", text: data?.error || "Irgendwas ist schiefgelaufen…" },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { sender: "neon", text: data.reply }]);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/neon.png"
            alt="Neon"
            width={48}
            height={48}
            className="rounded-full border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
          />
          <span className="text-pink-500 font-bold text-lg">Neon</span>
        </div>
        <button onClick={logout} className="text-gray-400 hover:text-white">
          Logout
        </button>
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
          className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "…" : "➤"}
        </button>
      </div>
    </main>
  );
}
