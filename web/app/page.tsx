"use client";

import { useEffect, useState } from "react";

import type { Edition, EditionSectionId } from "@/src/lib/types";

type EditionApiResponse =
  | {
      ok: true;
      edition: Edition;
    }
  | {
      ok: false;
      error?: string;
    };

const SECTION_LABELS: Record<EditionSectionId, string> = {
  "industry-news-signals": "Section 1",
  "concept-of-the-day": "Section 2",
  "from-the-lab": "Section 3",
  "things-to-explore": "Section 4",
  "thought-leadership-angle": "Section 5",
};

export default function Home() {
  const RECENT_KEY = "brief_recent_urls_v1";

  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [edition, setEdition] = useState<Edition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [todayLabel, setTodayLabel] = useState<string>("");

  useEffect(() => {
    setTodayLabel(
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    );
  }, []);

  async function generate() {
    setPhase("loading");
    setError(null);
    try {
      let excludeUrls: string[] = [];
      try {
        const raw = window.localStorage.getItem(RECENT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            excludeUrls = parsed.filter((v) => typeof v === "string");
          }
        }
      } catch {
        // localStorage might be blocked; continue without exclusions.
      }

      const res = await fetch("/api/edition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ excludeUrls }),
      });
      const json = (await res.json()) as EditionApiResponse;
      if (!res.ok || !json.ok) {
        throw new Error(
          json.ok ? "Unknown edition generation error" : json.error ?? "Failed to generate edition",
        );
      }
      setEdition(json.edition);
      setPhase("ready");

      // FR-12 (no cross-day repetition): store the sources we just used.
      try {
        const prevRaw = window.localStorage.getItem(RECENT_KEY);
        const prev = prevRaw ? (JSON.parse(prevRaw) as unknown) : [];
        const prevUrls = Array.isArray(prev) ? prev.filter((v) => typeof v === "string") : [];

        const usedUrls = json.edition.sections.flatMap((s) =>
          s.sources.map((src) => src.href).filter(Boolean),
        );

        const seen = new Set<string>();
        const merged: string[] = [];
        for (const u of [...prevUrls, ...usedUrls]) {
          if (seen.has(u)) continue;
          seen.add(u);
          merged.push(u);
        }

        window.localStorage.setItem(RECENT_KEY, JSON.stringify(merged.slice(-50)));
      } catch {
        // Ignore localStorage write failures.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setPhase("error");
    }
  }

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-200">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(99,102,241,0.22),transparent)]"
        aria-hidden
      />

      <header className="relative border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-10 sm:py-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Personal Daily AI Brief
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Daily AI Brief
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
              AI news and research through a{" "}
              <span className="text-zinc-300">
                marketing, MarTech, CDP, and AdTech
              </span>{" "}
              consulting lens — five sections, every citation linked, fresh on
              demand.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500" suppressHydrationWarning>
              {todayLabel}
            </p>
            <button
              type="button"
              onClick={generate}
              disabled={phase === "loading"}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              {phase === "loading"
                ? "Composing…"
                : phase === "ready"
                  ? "Regenerate edition"
                  : "Generate today’s edition"}
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-5 py-12 pb-24 sm:py-16">
        {phase === "idle" && (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-14 text-center">
            <p className="text-lg font-medium text-zinc-300">
              No edition loaded yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              Click <strong className="text-zinc-400">Generate today’s edition</strong>{" "}
              to run RSS ingest, LLM composition, and source-linked section rendering.
            </p>
          </div>
        )}

        {phase === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div
              className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-600 border-t-white"
              aria-hidden
            />
            <p className="text-sm text-zinc-400">
              Fetching feeds and composing your five sections…
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-red-100">
            <p className="font-medium">Could not generate edition.</p>
            <p className="mt-1 text-sm text-red-200/90">
              {error ?? "Unknown error"}
            </p>
          </div>
        )}

        {phase === "ready" && edition && (
          <div className="space-y-10">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs text-zinc-400">
              Generated at: {new Date(edition.generatedAt).toLocaleString()}
            </div>

            {edition.signalsThin && (
              <p className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/95">
                Signals are thin today — fewer items passed recency and quality
                checks.
              </p>
            )}

            {edition.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-20 border-b border-zinc-800 pb-10 last:border-b-0"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
                  {SECTION_LABELS[section.id]}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  {section.title}
                </h2>
                {section.summary && (
                  <p className="mt-2 text-sm text-zinc-500">{section.summary}</p>
                )}
                <p className="mt-6 whitespace-pre-line text-base leading-8 text-zinc-200">
                  {section.body}
                </p>
                {section.sources.length > 0 && (
                  <ul className="mt-6 space-y-2">
                    {section.sources.map((source) => (
                      <li key={`${section.id}:${source.href}`}>
                        <a
                          href={source.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-indigo-400 underline decoration-indigo-500/40 underline-offset-4 hover:text-indigo-300"
                        >
                          {source.label}
                        </a>
                        {source.publishedAt && (
                          <span className="ml-2 text-xs text-zinc-500">
                            ({new Date(source.publishedAt).toLocaleDateString()})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
