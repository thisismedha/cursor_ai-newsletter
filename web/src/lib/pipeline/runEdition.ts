import { fetchRssCandidates } from "@/src/lib/ingest/rss";
import { composeEdition } from "@/src/lib/llm/compose-edition";
import type { Edition, SourceCandidate } from "@/src/lib/types";

type RunEditionOptions = {
  excludeUrls?: string[];
};

function dedupeCandidatesByUrl(items: SourceCandidate[]): SourceCandidate[] {
  const seen = new Set<string>();
  const deduped: SourceCandidate[] = [];

  for (const item of items) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    deduped.push(item);
  }

  return deduped;
}

function uniqueByUrl(items: SourceCandidate[]): SourceCandidate[] {
  return dedupeCandidatesByUrl(items);
}

function ageMs(publishedAt: string): number | null {
  const t = new Date(publishedAt).getTime();
  if (Number.isNaN(t)) return null;
  return Date.now() - t;
}

function pickByRecency(items: SourceCandidate[]): SourceCandidate[] {
  const withDate = items
    .filter((i) => !!i.publishedAt)
    .map((i) => ({ i, ageMs: ageMs(i.publishedAt as string) }))
    .filter((x) => x.ageMs !== null) as Array<{
    i: SourceCandidate;
    ageMs: number;
  }>;
  const withoutDate = items.filter((i) => !i.publishedAt);

  const H72 = 72 * 60 * 60 * 1000;
  const D7 = 7 * 24 * 60 * 60 * 1000;
  const D30 = 30 * 24 * 60 * 60 * 1000;

  const D21 = 21 * 24 * 60 * 60 * 1000;
  const D90 = 90 * 24 * 60 * 60 * 1000;

  const industryFresh = withDate.filter((x) => x.ageMs <= H72).map((x) => x.i);
  const industryWithin7d = withDate.filter((x) => x.ageMs <= D7).map((x) => x.i);
  const industryWithin30d = withDate.filter((x) => x.ageMs <= D30).map((x) => x.i);

  // If signals are thin, allow older candidates (still bounded).
  const industryAllowed =
    industryFresh.length >= 3
      ? industryWithin7d
      : uniqueByUrl([...industryWithin7d, ...industryWithin30d]);

  const labWithin21d = withDate.filter((x) => x.ageMs <= D21).map((x) => x.i);
  const labAllowed = labWithin21d.length > 0 ? labWithin21d : withDate.filter((x) => x.ageMs <= D90).map((x) => x.i);

  // Prefer dated items; only include undated if we otherwise have too few.
  const combined = uniqueByUrl([...industryAllowed, ...labAllowed]);
  if (combined.length >= 8) return combined;

  return uniqueByUrl([...combined, ...withoutDate.slice(0, 6)]);
}

export async function runEdition(options: RunEditionOptions = {}): Promise<Edition> {
  const ingested = await fetchRssCandidates();
  const exclude = new Set((options.excludeUrls ?? []).filter(Boolean));
  const filtered = ingested.filter((c) => !exclude.has(c.url));
  const deduped = dedupeCandidatesByUrl(filtered);

  const recencyFiltered = pickByRecency(deduped);
  // Keep prompt/corpus inputs bounded for cost and latency.
  const bounded = recencyFiltered.slice(0, 60);
  return composeEdition(bounded);
}
