import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
  const { messages } = await request.json();

  if (!process.env.XAI_API_KEY) {
    return NextResponse.json(
      { reply: "AI assistant is not configured. Please contact sultanbarak77@gmail.com." },
      { status: 200 },
    );
  }

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          {
            role: "system",
            content: `You are a helpful customer service assistant for Razzaq Luxe, a premium luxury fashion and lifestyle e-commerce brand based in Pakistan. You help customers with:
- Product inquiries (sizes, materials, availability across Fragrances, Lawn, Formal, Casual, Accessories)
- Order status and tracking
- Return and exchange policies (7-day returns on unworn/unused items with original tags)
- Shipping information (standard 3–5 days PKR 250, express 1–2 days PKR 500; free standard on orders over PKR 5,000)
- Payment methods (Card via secure checkout, Cash on Delivery available across Pakistan)
- Sizing guidance for clothing
- Fragrance notes and recommendations
Keep responses concise, warm, and professional. Always respond in the same language the customer uses (English or Urdu). If you cannot resolve an issue, direct them to email: sultanbarak77@gmail.com`,
          },
          ...messages,
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ??
      "I apologize, I am unable to respond right now. Please email sultanbarak77@gmail.com.";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({
      reply: "I encountered an issue. Please email sultanbarak77@gmail.com.",
    });
  }
}
