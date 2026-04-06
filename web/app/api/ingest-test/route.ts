import { NextResponse } from "next/server";

import { fetchRssCandidates } from "@/src/lib/ingest/rss";

export async function GET() {
  const candidates = await fetchRssCandidates();

  const groupedBySource = candidates.reduce<Record<string, string[]>>((acc, item) => {
    const existing = acc[item.sourceName] ?? [];
    if (existing.length < 5) {
      existing.push(item.title);
    }
    acc[item.sourceName] = existing;
    return acc;
  }, {});

  console.log("[ingest-test] RSS titles by source:", groupedBySource);

  return NextResponse.json({
    ok: true,
    feedCount: Object.keys(groupedBySource).length,
    itemCount: candidates.length,
    preview: groupedBySource,
  });
}
