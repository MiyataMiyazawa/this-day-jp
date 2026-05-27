import { DayCard, WikiEvent } from "./types";
import { fetchOnThisDayEvents, fetchPageviews, checkJapaneseArticle } from "./wikipedia";
import { filterEvents, filterByPageviews } from "./filter";
import { rankEvents, formatEventNarrative } from "./gemini";
import { getCached, setCache, getTodayKey } from "./cache";

function getJSTDate(): { month: number; day: number } {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return { month: jst.getUTCMonth() + 1, day: jst.getUTCDate() };
}

function buildFallbackCard(event: WikiEvent, dateStr: string): DayCard {
  const page = event.pages[0];
  return {
    date: dateStr,
    year: event.year,
    title: page?.title ?? "Unknown Event",
    subtitle: `${event.year}年のこの日`,
    body: event.text.slice(0, 180),
    tags: ["歴史", "世界", "発見"],
    wow: event.text.slice(0, 60),
    obscurity: 3,
    wow_strength: 3,
    source_url: page?.content_urls?.desktop.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(page?.title ?? "")}`,
    source_title: page?.title ?? "Wikipedia",
    image_url: page?.originalimage?.source ?? page?.thumbnail?.source ?? null,
    image_credit: page?.originalimage?.source ? "Wikimedia Commons" : null,
  };
}

export async function getDayCard(): Promise<DayCard> {
  const dateKey = getTodayKey();

  const cached = await getCached(dateKey);
  if (cached) {
    console.log(`[pipeline] Cache hit for ${dateKey}`);
    return cached;
  }

  console.log(`[pipeline] Generating card for ${dateKey}`);
  const { month, day } = getJSTDate();

  // Fetch events from Wikipedia
  let events: WikiEvent[];
  try {
    events = await fetchOnThisDayEvents(month, day);
  } catch (err) {
    console.error("[pipeline] Wikipedia fetch failed:", err);
    return {
      date: dateKey,
      year: 0,
      title: "データ取得エラー",
      subtitle: "Wikipediaに接続できませんでした",
      body: "しばらく時間をおいてからもう一度お試しください。",
      tags: ["エラー", "再試行", "接続"],
      wow: "インターネット接続を確認してください",
      obscurity: 0,
      wow_strength: 0,
      source_url: "https://en.wikipedia.org",
      source_title: "Wikipedia",
      image_url: null,
      image_credit: null,
    };
  }

  // Filter out famous events
  let filtered = filterEvents(events);
  try {
    filtered = await filterByPageviews(filtered.slice(0, 30), fetchPageviews);
  } catch {
    // Pageview filter is optional
  }

  if (filtered.length === 0) {
    filtered = filterEvents(events);
  }

  // Rank with Gemini
  let selectedEvent: WikiEvent;
  let obscurity = 3;
  let wowStrength = 3;

  try {
    const ranked = await rankEvents(filtered);
    if (ranked && ranked.index < filtered.length) {
      selectedEvent = filtered[ranked.index];
      obscurity = ranked.obscurity;
      wowStrength = ranked.wow_strength;
    } else {
      selectedEvent = filtered[Math.floor(Math.random() * filtered.length)];
    }
  } catch (err) {
    console.error("[pipeline] Gemini ranking failed:", err);
    selectedEvent = filtered[Math.floor(Math.random() * filtered.length)];
  }

  // Check for Japanese article
  const mainPage = selectedEvent.pages[0];
  let jaTitle: string | null = null;
  if (mainPage) {
    try {
      const ja = await checkJapaneseArticle(mainPage.title);
      jaTitle = ja.jaTitle;
    } catch {
      // Japanese check is optional
    }
  }

  // Format with Gemini
  let card: DayCard;
  try {
    const formatted = await formatEventNarrative(selectedEvent, jaTitle);
    if (formatted) {
      const sourceUrl = mainPage?.content_urls?.desktop.page ??
        `https://en.wikipedia.org/wiki/${encodeURIComponent(mainPage?.title ?? "")}`;
      card = {
        date: dateKey,
        year: selectedEvent.year,
        title: formatted.title,
        subtitle: formatted.subtitle,
        body: formatted.body,
        tags: formatted.tags,
        wow: formatted.wow,
        obscurity,
        wow_strength: wowStrength,
        source_url: sourceUrl,
        source_title: jaTitle ?? mainPage?.title ?? "Wikipedia",
        image_url: mainPage?.originalimage?.source ?? mainPage?.thumbnail?.source ?? null,
        image_credit: mainPage?.originalimage?.source ? "Wikimedia Commons" : null,
      };
    } else {
      card = buildFallbackCard(selectedEvent, dateKey);
    }
  } catch (err) {
    console.error("[pipeline] Gemini formatting failed:", err);
    card = buildFallbackCard(selectedEvent, dateKey);
  }

  await setCache(dateKey, card);
  console.log(`[pipeline] Card generated: ${card.title} (${card.year})`);
  return card;
}
