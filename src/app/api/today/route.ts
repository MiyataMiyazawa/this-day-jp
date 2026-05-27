import { NextResponse } from "next/server";
import { getDayCard } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const card = await getDayCard();
    return NextResponse.json(card, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[api/today] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate today's card" },
      { status: 500, headers: corsHeaders }
    );
  }
}
