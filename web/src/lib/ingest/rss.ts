import Parser from "rss-parser";

import sources from "@/config/sources.json";
import type {
  RssSourceConfig,
  SourceCandidate,
  SourcesConfig,
} from "@/src/lib/types";

const parser = new Parser({
  timeout: 15_000,
  customFields: {
    item: ["media:content", "dc:creator"],
  },
});

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function normalizeItem(
  source: RssSourceConfig,
  item: Parser.Item,
): SourceCandidate | null {
  const title = item.title?.trim();
  const url = item.link?.trim();

  if (!title || !url) {
    return null;
  }

  return {
    sourceId: source.id,
    sourceName: source.name,
    sourceTier: source.tier,
    title,
    url,
    publishedAt: toIsoDate(item.isoDate ?? item.pubDate),
    summary: item.contentSnippet?.trim() || item.content?.trim(),
    contentSnippet: item.contentSnippet?.trim(),
    raw: item,
  };
}

export async function fetchRssCandidates(): Promise<SourceCandidate[]> {
  const config = sources as SourcesConfig;
  const candidates: SourceCandidate[] = [];

  await Promise.all(
    config.rss.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        for (const item of feed.items) {
          const normalized = normalizeItem(source, item);
          if (normalized) candidates.push(normalized);
        }
      } catch (error) {
        console.error(`[rss] Failed to fetch ${source.name} (${source.url})`, error);
      }
    }),
  );

  return candidates;
}
