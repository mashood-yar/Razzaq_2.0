import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // Send auto-reply (don't fail if email fails). Dynamic import keeps Resend off the
  // critical path during `next build` / Collecting page data when env may be unset.
  try {
    const { sendContactAutoReply } = await import("@/lib/resend/client");
    await sendContactAutoReply(name, email, subject);
  } catch (e) {
    console.error("[Contact] auto-reply failed:", e);
  }

  return NextResponse.json({ success: true });
}
