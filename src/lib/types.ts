export interface WikiEvent {
  year: number;
  text: string;
  pages: WikiPage[];
}

export interface WikiPage {
  title: string;
  extract?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls?: {
    desktop: { page: string };
    mobile: { page: string };
  };
  lang_links?: { lang: string; title: string }[];
}

export interface RankedEvent {
  index: number;
  obscurity: number;
  wow_strength: number;
  reason: string;
}

export interface FormattedEvent {
  title: string;
  subtitle: string;
  body: string;
  tags: [string, string, string];
  wow: string;
}

export interface DayCard {
  date: string;
  year: number;
  title: string;
  subtitle: string;
  body: string;
  tags: [string, string, string];
  wow: string;
  obscurity: number;
  wow_strength: number;
  source_url: string;
  source_title: string;
  image_url: string | null;
  image_credit: string | null;
}
