import { GoogleGenAI } from "@google/genai";
import { WikiEvent, RankedEvent, FormattedEvent } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function callGemini(prompt: string, retries = 5): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text ?? "";
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if ((status === 429 || status === 503) && attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Gemini API: max retries exceeded");
}

function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

export async function rankEvents(
  events: WikiEvent[]
): Promise<RankedEvent | null> {
  if (events.length === 0) return null;

  const candidates = events.slice(0, 40).map((e, i) => ({
    index: i,
    year: e.year,
    text: e.text.slice(0, 200),
  }));

  const prompt = `You are a history curator selecting obscure but fascinating events.

Given these historical events, rank them by "obscurity x wow factor".
Pick events that most people have NEVER heard of but would find genuinely surprising.

Events:
${JSON.stringify(candidates)}

For the TOP 5 events, return JSON array:
[{"index": <number>, "obscurity": <1-5>, "wow_strength": <1-5>, "reason": "<brief>"}]

Rules:
- obscurity: 5 = almost nobody knows this, 1 = very famous
- wow_strength: 5 = jaw-dropping, 1 = mundane
- ONLY return the JSON array, no other text
- Prefer events with vivid, story-worthy details`;

  const raw = await callGemini(prompt);
  try {
    const ranked: RankedEvent[] = JSON.parse(extractJson(raw));
    const scored = ranked
      .filter((r) => r.obscurity >= 3 && r.wow_strength >= 3)
      .sort((a, b) => {
        const sa = a.obscurity * 2 + a.wow_strength * 3;
        const sb = b.obscurity * 2 + b.wow_strength * 3;
        return sb - sa;
      });
    return scored[0] ?? ranked[0] ?? null;
  } catch {
    return null;
  }
}

export async function formatEventNarrative(
  event: WikiEvent,
  jaTitle: string | null
): Promise<FormattedEvent | null> {
  const prompt = `You are a Japanese history writer creating content for smart glasses.
The reader will see this for ~10 seconds, so it must be concise and captivating.

Historical event:
- Year: ${event.year}
- Description: ${event.text}
- Wikipedia article: ${event.pages[0]?.title ?? "N/A"}
${jaTitle ? `- Japanese article title: ${jaTitle}` : ""}

Generate a JSON object with:
{
  "title": "<catchy Japanese title, max 20 chars>",
  "subtitle": "<one-line Japanese subtitle, max 40 chars>",
  "body": "<narrative Japanese text, 140-180 chars, storytelling style>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "wow": "<one surprising fact in Japanese, max 60 chars, starts with a hook>"
}

Rules:
- Write in natural, engaging Japanese (not machine-translation style)
- DO NOT alter facts - only translate and narrate
- Tags should be short Japanese category labels (2-4 chars each)
- The "wow" should make the reader say "え、マジで？"
- ONLY return the JSON object, no other text`;

  const raw = await callGemini(prompt);
  try {
    return JSON.parse(extractJson(raw)) as FormattedEvent;
  } catch {
    return null;
  }
}
