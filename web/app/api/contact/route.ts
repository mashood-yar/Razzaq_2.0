import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendContactAutoReply } from "@/lib/resend/client";

export async function POST(request: Request) {
  const { name, email, subject, message } = await request.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").insert({
    name,
    email,
    subject,
    message,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send auto-reply (don't fail if email fails)
  try {
    await sendContactAutoReply(name, email, subject);
  } catch (e) {
    console.error("[Contact] auto-reply failed:", e);
  }

  return NextResponse.json({ success: true });
}
