import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  // 👇 Platzhalter-Antwort (kommt gleich AI rein)
  const neonReply = `Ich höre dir zu… "${message}" klingt wichtig. Erzähl mir mehr.`;

  return NextResponse.json({
    reply: neonReply,
  });
}
