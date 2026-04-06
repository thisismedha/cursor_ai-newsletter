export type EditionSectionId =
  | "industry-news-signals"
  | "concept-of-the-day"
  | "from-the-lab"
  | "things-to-explore"
  | "thought-leadership-angle";

export interface EditionSource {
  label: string;
  href: string;
  publishedAt?: string;
}

export interface Section {
  id: EditionSectionId;
  title: string;
  summary?: string;
  body: string;
  sources: EditionSource[];
}

export interface Edition {
  generatedAt: string;
  sections: Section[];
  signalsThin?: boolean;
}

export interface SourceCandidate {
  sourceId: string;
  sourceName: string;
  sourceTier?: "tier1" | "tier2" | "tier3" | "research";
  title: string;
  url: string;
  publishedAt?: string;
  summary?: string;
  contentSnippet?: string;
  raw?: unknown;
}

export interface RssSourceConfig {
  id: string;
  name: string;
  url: string;
  tier?: "tier1" | "tier2" | "tier3" | "research";
}

export interface SourcesConfig {
  rss: RssSourceConfig[];
}
