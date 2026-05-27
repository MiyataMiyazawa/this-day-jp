import { NextResponse } from "next/server";
import { getDayCard } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const card = await getDayCard();
    return NextResponse.json(card, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[api/today] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate today's card" },
      { status: 500 }
    );
  }
}
