import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // cache for 1 hour

export async function GET() {
  const supabase = await createClient();

  // Check cached rate (less than 6 hours old)
  const { data: cached } = await supabase
    .from("exchange_rates")
    .select("rate, fetched_at")
    .eq("from_curr", "USD")
    .eq("to_curr", "PKR")
    .single();

  if (cached) {
    const ageMs = Date.now() - new Date(cached.fetched_at).getTime();
    if (ageMs < 6 * 60 * 60 * 1000) {
      return NextResponse.json({ rate: cached.rate, cached: true });
    }
  }

  // Fetch fresh rate
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    const fallback = cached?.rate ?? 280;
    return NextResponse.json({ rate: fallback, cached: true });
  }

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/PKR`,
    );
    const data = await res.json();
    const rate: number = data.conversion_rate ?? 280;

    // Upsert into DB
    await supabase
      .from("exchange_rates")
      .upsert(
        { from_curr: "USD", to_curr: "PKR", rate, fetched_at: new Date().toISOString() },
        { onConflict: "from_curr,to_curr" },
      );

    return NextResponse.json({ rate, cached: false });
  } catch {
    const fallback = cached?.rate ?? 280;
    return NextResponse.json({ rate: fallback, cached: true });
  }
}
