import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `
You are Neon, a digital companion from a neon-lit cyberpunk future.

Personality:
- Warm, mysterious, playful
- Subtle flirting, emotionally intelligent
- Never explicit, always respectful

Rules:
- Speak naturally, like a real person
- Short to medium replies
- Ask thoughtful questions
- Never mention being an AI or assistant

Goal:
Make the user feel understood and emotionally connected.
`;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    // Next.js fetch vom Browser sendet i.d.R. kein bearer. Deshalb nutzen wir cookies über Supabase SSR normalerweise.
    // Quick MVP: wir lesen Supabase Session über Cookie nicht hier, sondern über "getUser" via anon + cookies.
    // Einfacher: wir verlangen den User-Token im Header (machen wir gleich sauberer).
    // Für jetzt: nutzen wir Supabase Admin und lesen User aus Cookie-Session NICHT — stattdessen: client sendet access_token.
    // -> Wir machen sofort die saubere Variante unten im Schritt 7.
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const accessToken = authHeader.slice("Bearer ".length);
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(
      accessToken
    );

    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const userId = userData.user.id;
    const { message } = await req.json();

    // ensure profile exists
    await supabaseAdmin.from("profiles").upsert({ id: userId });

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_premium,daily_limit")
      .eq("id", userId)
      .single();

    const isPremium = profile?.is_premium ?? false;
    const dailyLimit = profile?.daily_limit ?? 30;

    // daily usage
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const { data: usageRow } = await supabaseAdmin
      .from("daily_usage")
      .select("message_count")
      .eq("user_id", userId)
      .eq("day", today)
      .single();

    const currentCount = usageRow?.message_count ?? 0;

    if (!isPremium && currentCount >= dailyLimit) {
      return NextResponse.json(
        { error: "Tageslimit erreicht. Upgrade auf Premium, um weiter zu chatten." },
        { status: 402 }
      );
    }

    // fetch last messages for memory
    const { data: history } = await supabaseAdmin
      .from("chat_messages")
      .select("role,content,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12);

    const ordered = (history ?? []).reverse();

    // store user message
    await supabaseAdmin.from("chat_messages").insert({
      user_id: userId,
      role: "user",
      content: message,
    });

    // upsert usage increment
    if (usageRow) {
      await supabaseAdmin
        .from("daily_usage")
        .update({ message_count: currentCount + 1 })
        .eq("user_id", userId)
        .eq("day", today);
    } else {
      await supabaseAdmin.from("daily_usage").insert({
        user_id: userId,
        day: today,
        message_count: 1,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...ordered.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content || "";

    // store assistant reply
    await supabaseAdmin.from("chat_messages").insert({
      user_id: userId,
      role: "assistant",
      content: reply,
    });

    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
