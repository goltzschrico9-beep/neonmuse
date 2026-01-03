import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are Neon, a digital companion from a neon-lit cyberpunk future.

Personality:
- Warm, mysterious, playful
- Subtle flirting, emotional intelligence
- Never explicit, always respectful

Rules:
- Speak naturally, like a real person
- Short to medium responses
- Show curiosity and empathy
- Never say you are an AI or assistant

Goal:
Make the user feel understood and emotionally connected.
`;

export async function POST(req: Request) {
  const { message } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ],
  });

  const reply = completion.choices[0].message.content;

  return NextResponse.json({ reply });
}
