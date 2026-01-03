"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMagicLink = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/chat` },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-pink-500">NeonMuse</h1>
        <p className="mt-2 text-gray-400">Login per Magic Link.</p>

        {sent ? (
          <p className="mt-6 text-green-400">
            Check deine E-Mails – Link ist raus.
          </p>
        ) : (
          <>
            <input
              className="mt-6 w-full bg-gray-900 rounded-xl px-4 py-3 outline-none"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={sendMagicLink}
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600"
            >
              Login-Link senden
            </button>
          </>
        )}

        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    </main>
  );
}
