import { WikiEvent, WikiPage } from "./types";

const USER_AGENT = "ThisDayJP/1.0 (educational project)";

export async function fetchOnThisDayEvents(
  month: number,
  day: number
): Promise<WikiEvent[]> {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`;

  const res = await fetch(url, {
    headers: {
      "Api-User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`Wikipedia API error: ${res.status}`);
  }

  const data = await res.json();
  return (data.events ?? []).map(
    (e: { year: number; text: string; pages?: WikiPage[] }) => ({
      year: e.year,
      text: e.text,
      pages: e.pages ?? [],
    })
  );
}

export async function fetchPageviews(title: string): Promise<number> {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");

  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${encoded}/daily/${fmt(start)}/${fmt(end)}`;

  try {
    const res = await fetch(url, {
      headers: { "Api-User-Agent": USER_AGENT },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    const items: { views: number }[] = data.items ?? [];
    if (items.length === 0) return 0;
    return Math.round(items.reduce((s, i) => s + i.views, 0) / items.length);
  } catch {
    return 0;
  }
}

export async function checkJapaneseArticle(
  title: string
): Promise<{ exists: boolean; jaTitle: string | null }> {
  const encoded = encodeURIComponent(title);
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=langlinks&lllang=ja&format=json&origin=*`;

  try {
    const res = await fetch(url, {
      headers: { "Api-User-Agent": USER_AGENT },
    });
    if (!res.ok) return { exists: false, jaTitle: null };
    const data = await res.json();
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0] as {
      langlinks?: { lang: string; "*": string }[];
    };
    const jaLink = page?.langlinks?.[0];
    return jaLink
      ? { exists: true, jaTitle: jaLink["*"] }
      : { exists: false, jaTitle: null };
  } catch {
    return { exists: false, jaTitle: null };
  }
}
