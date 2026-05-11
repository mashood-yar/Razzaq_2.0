import { NextResponse } from "next/server";
import { sendHelloWorldTestEmail } from "@/lib/resend/client";

/** Dev-only smoke test for Resend. Disabled in production. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let to: string | undefined;
  try {
    const body = await request.json();
    to = typeof body?.to === "string" ? body.to : undefined;
  } catch {
    // optional body
  }

  try {
    await sendHelloWorldTestEmail(to);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
