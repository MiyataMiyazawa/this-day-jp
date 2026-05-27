import { WikiEvent } from "./types";

const EXCLUDED_KEYWORDS = [
  "world war",
  "independence",
  "olympic",
  "president",
  "united states",
  "united kingdom",
  "super bowl",
  "world cup",
  "world series",
  "nobel prize",
  "academy award",
  "grammy",
  "emmy",
  "coronation",
  "assassination",
  "civil war",
  "nazi",
  "holocaust",
  "atomic bomb",
  "nuclear",
  "apollo 11",
  "moon landing",
  "titanic",
  "september 11",
];

export function filterEvents(events: WikiEvent[]): WikiEvent[] {
  return events.filter((event) => {
    const text = event.text.toLowerCase();
    return !EXCLUDED_KEYWORDS.some((kw) => text.includes(kw));
  });
}

export async function filterByPageviews(
  events: WikiEvent[],
  fetchPv: (title: string) => Promise<number>,
  threshold = 5000
): Promise<WikiEvent[]> {
  const results: WikiEvent[] = [];
  for (const event of events) {
    const mainPage = event.pages[0];
    if (!mainPage) {
      results.push(event);
      continue;
    }
    const pv = await fetchPv(mainPage.title);
    if (pv < threshold) {
      results.push(event);
    }
  }
  return results;
}
