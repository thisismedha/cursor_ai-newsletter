import type { Edition, EditionSectionId, Section, SourceCandidate } from "@/src/lib/types";

const SECTION_ORDER: EditionSectionId[] = [
  "industry-news-signals",
  "concept-of-the-day",
  "from-the-lab",
  "things-to-explore",
  "thought-leadership-angle",
];

const SECTION_TITLES: Record<EditionSectionId, string> = {
  "industry-news-signals": "Industry news and signals",
  "concept-of-the-day": "Concept of the day",
  "from-the-lab": "From the lab",
  "things-to-explore": "Things to explore and try",
  "thought-leadership-angle": "Thought leadership angle",
};

type LlmPayload = {
  sections: Section[];
  signalsThin?: boolean;
};

function sortByFreshness(items: SourceCandidate[]): SourceCandidate[] {
  return [...items].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
}

function topSourceLinks(items: SourceCandidate[], max = 3) {
  return sortByFreshness(items).slice(0, max).map((item) => ({
    label: item.sourceName,
    href: item.url,
    publishedAt: item.publishedAt,
  }));
}

function fallbackEdition(candidates: SourceCandidate[]): Edition {
  const topSignals = sortByFreshness(candidates).slice(0, 3);
  const links = topSourceLinks(candidates, 10);
  const signalsThin = topSignals.length < 3;

  // Prefer unique source hrefs across sections (FR-11). If we run out of unique hrefs,
  // we may reuse for best-effort links.
  const used = new Set<string>();
  const takeUnique = (n: number) => {
    const taken: Array<{ label: string; href: string; publishedAt?: string }> = [];
    for (const l of links) {
      if (taken.length >= n) break;
      if (used.has(l.href)) continue;
      used.add(l.href);
      taken.push(l);
    }
    return taken;
  };

  const signalsSources = takeUnique(3);
  const conceptSources = takeUnique(1);
  const labSources = takeUnique(1);
  const trySources = takeUnique(3);
  const thoughtSources = takeUnique(2);

  const fillIfEmpty = <T extends { href: string }>(arr: T[], fallback: T[]) => {
    if (arr.length > 0) return arr;
    return fallback.slice(0, 1);
  };

  const sections: Section[] = [
    {
      id: "industry-news-signals",
      title: SECTION_TITLES["industry-news-signals"],
      summary: "Top items from configured feeds.",
      body:
        topSignals.length > 0
          ? topSignals
              .map((s, i) => `${i + 1}. ${s.title} (${s.sourceName})`)
              .join("\n")
          : "No fresh signal items were found in the current feed pull.",
      sources: signalsSources.length > 0 ? signalsSources : topSourceLinks(topSignals.length > 0 ? topSignals : candidates, 3),
    },
    {
      id: "concept-of-the-day",
      title: SECTION_TITLES["concept-of-the-day"],
      summary: "Temporary non-LLM draft content.",
      body:
        "Version A (business): Retrieval-augmented generation helps an AI answer using your own trusted documents, reducing made-up answers.\n\nVersion B (technical): RAG retrieves relevant chunks from an indexed corpus at query time and injects them into the model context before generation.",
      sources: fillIfEmpty(conceptSources, links).slice(0, 1),
    },
    {
      id: "from-the-lab",
      title: SECTION_TITLES["from-the-lab"],
      summary: "Temporary non-LLM draft content.",
      body:
        "What: Use one recent research-related signal and explain it in plain language.\nWhy it matters: It gives practical direction for CDP/MarTech experimentation.\nSo what: Translate the signal into one concrete recommendation for client conversations.",
      sources: fillIfEmpty(labSources, links).slice(0, 1),
    },
    {
      id: "things-to-explore",
      title: SECTION_TITLES["things-to-explore"],
      summary: "Temporary non-LLM draft content.",
      body:
        "1) Add recency filtering before prompting.\n2) Add URL deduplication before rendering.\n3) Add structured output validation for section shape and source links.",
      sources: trySources.length > 0 ? trySources.slice(0, 3) : links.slice(0, 3),
    },
    {
      id: "thought-leadership-angle",
      title: SECTION_TITLES["thought-leadership-angle"],
      summary: "Temporary non-LLM draft content.",
      body:
        "The AI opportunity in marketing is less about a single breakthrough model and more about operational trust: fresh signals, traceable sources, and repeatable decision quality.",
      sources: thoughtSources.length > 0 ? thoughtSources.slice(0, 2) : links.slice(0, 2),
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    sections,
    signalsThin,
  };
}

function buildPrompt(candidates: SourceCandidate[]): string {
  const allowedUrls = candidates.map((c) => c.url);
  const corpus = sortByFreshness(candidates)
    .slice(0, 30)
    .map(
      (c, i) =>
        `${i + 1}. title="${c.title}" source="${c.sourceName}" url="${c.url}" date="${c.publishedAt ?? "unknown"}" snippet="${(c.summary ?? "").replace(/\s+/g, " ").slice(0, 280)}"`,
    )
    .join("\n");

  return [
    "You are composing a single-edition AI newsletter for a CDP/MarTech/AdTech consultant.",
    "Return ONLY valid JSON (no markdown).",
    "JSON shape:",
    '{ "sections": [{"id":"industry-news-signals|concept-of-the-day|from-the-lab|things-to-explore|thought-leadership-angle","title":"...","summary":"...","body":"...","sources":[{"label":"...","href":"https://...","publishedAt":"ISO optional"}]}], "signalsThin": boolean }',
    "Rules:",
    "- Include exactly 5 sections, one for each id.",
    "- Keep narrative concise and practical.",
    "- Do NOT reuse the same source.href across different sections (keep sources unique across sections when possible).",
    "- Every source.href must be from this allowed URL list:",
    JSON.stringify(allowedUrls),
    "Candidate corpus:",
    corpus,
  ].join("\n");
}

function validateEditionPayload(
  payload: unknown,
  allowedUrls: Set<string>,
): payload is LlmPayload {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as { sections?: unknown; signalsThin?: unknown };
  if (!Array.isArray(candidate.sections)) return false;

  const ids = new Set<string>();
  const allHrefs: string[] = [];
  for (const section of candidate.sections) {
    if (!section || typeof section !== "object") return false;
    const s = section as Section;
    if (!SECTION_ORDER.includes(s.id)) return false;
    ids.add(s.id);
    if (typeof s.title !== "string" || typeof s.body !== "string") return false;
    if (!Array.isArray(s.sources) || s.sources.length === 0) return false;
    for (const src of s.sources) {
      if (!src || typeof src !== "object") return false;
      const href = (src as { href?: unknown }).href;
      if (typeof href !== "string") return false;
      if (!allowedUrls.has(href)) return false;
      allHrefs.push(href);
    }
  }

  if (!SECTION_ORDER.every((id) => ids.has(id))) return false;
  // FR-11: no repetition within an edition (no duplicate primary URLs)
  return new Set(allHrefs).size === allHrefs.length;
}

async function tryOpenAiEdition(candidates: SourceCandidate[]): Promise<Edition | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = buildPrompt(candidates);
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an expert editor. Return strict JSON only. No prose outside JSON.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    console.error("[llm] OpenAI request failed:", res.status, await res.text());
    return null;
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  const allowedUrls = new Set(candidates.map((c) => c.url));
  if (!validateEditionPayload(parsed, allowedUrls)) return null;

  const payload = parsed as LlmPayload;
  return {
    generatedAt: new Date().toISOString(),
    sections: payload.sections,
    signalsThin: payload.signalsThin,
  };
}

async function tryGroqEdition(candidates: SourceCandidate[]): Promise<Edition | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = buildPrompt(candidates);
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an expert editor. Return strict JSON only. No prose outside JSON.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    console.error("[llm] Groq request failed:", res.status, await res.text());
    return null;
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  const allowedUrls = new Set(candidates.map((c) => c.url));
  if (!validateEditionPayload(parsed, allowedUrls)) return null;

  const payload = parsed as LlmPayload;
  return {
    generatedAt: new Date().toISOString(),
    sections: payload.sections,
    signalsThin: payload.signalsThin,
  };
}

async function tryAnthropicEdition(
  candidates: SourceCandidate[],
): Promise<Edition | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const prompt = buildPrompt(candidates);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest",
      max_tokens: 2500,
      temperature: 0.3,
      system:
        "You are an expert editor. Return strict JSON only. No prose outside JSON.",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    console.error(
      "[llm] Anthropic request failed:",
      res.status,
      await res.text(),
    );
    return null;
  }

  const json = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const content = json.content?.find((item) => item.type === "text")?.text;
  if (!content) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  const allowedUrls = new Set(candidates.map((c) => c.url));
  if (!validateEditionPayload(parsed, allowedUrls)) return null;

  const payload = parsed as LlmPayload;
  return {
    generatedAt: new Date().toISOString(),
    sections: payload.sections,
    signalsThin: payload.signalsThin,
  };
}

export async function composeEdition(candidates: SourceCandidate[]): Promise<Edition> {
  const groqEdition = await tryGroqEdition(candidates);
  if (groqEdition) return groqEdition;

  const anthropicEdition = await tryAnthropicEdition(candidates);
  if (anthropicEdition) return anthropicEdition;

  const llmEdition = await tryOpenAiEdition(candidates);
  if (llmEdition) return llmEdition;

  return fallbackEdition(candidates);
}
