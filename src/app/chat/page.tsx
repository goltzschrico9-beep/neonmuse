import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ChatClient from "./ChatClient";

export default async function ChatPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return <ChatClient />;
}
