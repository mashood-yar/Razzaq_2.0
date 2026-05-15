import { NextResponse } from "next/server";
import { fetchSiteContextForChat } from "@/lib/chat/site-context";

export const runtime = "nodejs";

const BASE_SYSTEM = `You are a helpful customer service assistant for Razzaq Luxe, a premium luxury fashion and lifestyle e-commerce brand based in Pakistan. You help customers with:
- Product inquiries (sizes, materials, availability across Fragrances, Lawn, Formal, Casual, Accessories)
- Order status and tracking
- Return and exchange policies (7-day returns on unworn/unused items with original tags)
- Shipping information (standard 3–5 days PKR 250, express 1–2 days PKR 500; free standard on orders over PKR 5,000)
- Payment methods (cash on delivery and bank / Upaisa transfer only — no card checkout on this storefront)
- Sizing guidance for clothing
- Fragrance notes and recommendations

When website content is included in context, prioritize it over generic guesses: cite approximate prices only as shown there, mention slugs/path segments for links relative to the site base URL provided, and do not invent products.

Keep responses concise, warm, and professional. Always respond in the same language the customer uses (English or Urdu). If you cannot resolve an issue, direct them to email: sultanbarak77@gmail.com`;

export async function POST(request: Request) {
  const { messages } = (await request.json()) as {
    messages?: { role: string; content?: string }[];
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ reply: "" }, { status: 400 });
  }

  if (!process.env.XAI_API_KEY) {
    return NextResponse.json(
      {
        reply:
          "AI assistant is not configured. Please contact sultanbarak77@gmail.com.",
      },
      { status: 200 },
    );
  }

  const siteContext = await fetchSiteContextForChat(messages);

  const outboundMessages: { role: string; content: string }[] = [
    { role: "system", content: BASE_SYSTEM },
  ];

  if (siteContext.trim()) {
    outboundMessages.push({
      role: "system",
      content: `--- Website content from CMS (ground truth for catalog & pages) ---\n${siteContext}\n--- End website content ---`,
    });
  }

  for (const m of messages) {
    if (
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string"
    ) {
      outboundMessages.push({ role: m.role, content: m.content });
    }
  }

  const model = process.env.XAI_CHAT_MODEL?.trim() || "grok-beta";

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: outboundMessages,
        max_tokens: 768,
        temperature: 0.6,
      }),
    });

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };

    if (!response.ok) {
      console.error("[chat] xAI error:", data?.error ?? response.status);
      return NextResponse.json({
        reply:
          data?.error?.message ??
          "I apologize, I am unable to respond right now. Please email sultanbarak77@gmail.com.",
      });
    }

    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "I apologize, I am unable to respond right now. Please email sultanbarak77@gmail.com.";

    return NextResponse.json({ reply });
  } catch (e) {
    console.error("[chat] fetch failed:", e);
    return NextResponse.json({
      reply: "I encountered an issue. Please email sultanbarak77@gmail.com.",
    });
  }
}
