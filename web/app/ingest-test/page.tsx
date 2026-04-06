"use client";

import { useEffect, useState } from "react";

type IngestTestResponse = {
  ok: boolean;
  feedCount: number;
  itemCount: number;
  preview: Record<string, string[]>;
};

export default function IngestTestPage() {
  const [data, setData] = useState<IngestTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        const res = await fetch("/api/ingest-test");
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        const json = (await res.json()) as IngestTestResponse;
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, []);

  return (
    <main className="min-h-full bg-zinc-950 px-5 py-12 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">RSS Ingest Test</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Visual check for feed ingestion output from <code>/api/ingest-test</code>.
        </p>

        {loading && <p className="mt-8 text-zinc-300">Loading feed preview...</p>}

        {error && (
          <p className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
          </p>
        )}

        {data && (
          <section className="mt-8 space-y-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-300">
              <p>Feeds: {data.feedCount}</p>
              <p>Total items: {data.itemCount}</p>
            </div>

            {Object.entries(data.preview).map(([source, titles]) => (
              <article
                key={source}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4"
              >
                <h2 className="text-base font-semibold text-white">{source}</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
                  {titles.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
