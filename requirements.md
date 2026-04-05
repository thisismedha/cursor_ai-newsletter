# Product Requirements: Personal Daily AI Brief (Newsletter Web App)

**Owner:** Solo user (AI Deployment Consultant — CDP, MarTech, AdTech)  
**Document type:** MVP product requirements  
**Last updated:** 2026-04-05

---

## 1. Problem statement

Staying credibly current on AI while serving marketing and data-strategy clients requires scanning many publication tiers (tier-1 media, practitioner newsletters, and real-time social signals), then reframing developments for **business and technical audiences** in CDP, MarTech, and AdTech contexts. Manual curation is slow and inconsistent; generic AI digests are not filtered through a **marketing and strategic consulting lens**, and they rarely bundle **client-ready explanations**, **R&D watch items**, **hands-on experiments**, and **original thought leadership** in one daily artifact.

This product delivers a **single daily web experience** that regenerates on demand, synthesizes signals from a defined source registry, and enforces **narrative, HBR-meets-Stratechery tone** with **every factual claim linked to a source** — so the user can open a browser, read one edition, and walk into client or LinkedIn conversations prepared. Editions must feel **of-the-moment**: **recent sources only**, **no recycling of stale articles as “news,”** and **minimal repetition** within and across consecutive days (within MVP constraints).

---

## 2. User story

**As** the only user — an AI deployment consultant focused on CDP, MarTech, and AdTech —  
**I want** a personal daily newsletter web app that, on each visit or refresh, produces a fresh edition with five fixed sections (industry signals, concept of the day, lab note, things to try, thought leadership),  
**So that** I can stay strategically and technically current, explain concepts confidently to both business and technical stakeholders, and have one original angle ready for clients or LinkedIn — with **fresh, non-repetitive, recently published** material — without maintaining a database or signing in for MVP.

---

## 3. Functional requirements

Requirements are **one per major newsletter section**, plus cross-cutting generation and presentation behavior.

| ID | Requirement |
|----|-------------|
| **FR-1 — Industry news and signals** | The app shall generate **Section 1** by surfacing and summarizing the most relevant AI-related developments **through a marketing / MarTech / AdTech / strategic consulting lens**, drawing from sources in the **Source registry** (Tier 1–3). Each summarized item shall include a **hyperlink to the primary source** (article, post, thread, or official publication as applicable). Content shall favor **trusted, named outlets and voices** over unattributed rumor. |
| **FR-2 — Concept of the day** | The app shall generate **Section 2** with **one** concept per edition, directly applicable to CDP, MarTech, AdTech, or strategic consulting. It shall present **Version A** (business stakeholder: no jargon, outcome-focused) and **Version B** (technical stakeholder: precise, mechanism-focused), each readable as a short narrative, not a bullet dump. |
| **FR-3 — From the lab (R&D and research)** | The app shall generate **Section 3** with **one** emerging idea from academia or industry R&D (see registry: arXiv, major labs, universities, conference themes). Format shall include: **what was published**, **why it matters for the user’s industry**, and **one practical “so what”** for CDP/MarTech/AdTech, written so it is **explainable in a client meeting without a PhD**. **Hyperlink required** to the paper, blog post, or official summary. |
| **FR-4 — Things to explore and try** | The app shall generate **Section 4** with **2–3** recommendations per edition. Each item shall state: **what it is**, **why it matters to the user’s work**, and **one concrete way to try it this week**. Categories may include: tool/model/API, prompt technique, framework/methodology, dataset/benchmark/evaluation. **Hyperlink required** where a public resource exists. |
| **FR-5 — Thought leadership angle** | The app shall generate **Section 5** as **one** original strategic “so what” that **connects the edition’s signals** into an insight suitable for **LinkedIn or a client conversation**. Tone: strategic, consulting-focused, storytelling-driven, **technically credible but not overly technical**, aligned with the **Writing style** constraints in §4. |
| **FR-6 — Daily freshness** | Each generation shall produce content intended to reflect **the current day’s** landscape (no static template text masquerading as news). The user may **regenerate on demand**; MVP does not require persistence of past editions. Freshness is further constrained by **FR-10–FR-12**. |
| **FR-7 — Web app delivery** | The product shall run as a **web application** viewable in a standard desktop/mobile browser, with all five sections visible in one coherent reading flow (scrolling or clear in-page navigation). |
| **FR-8 — No auth (MVP)** | The MVP shall **not** require login, accounts, or access control. |
| **FR-9 — No database (MVP)** | The MVP shall **not** depend on a database for storage of editions, users, or preferences. Generation is **stateless / on demand** (e.g., assembled at request time from live retrieval + synthesis, per implementation). Cross-day deduplication (FR-12) may use **non-database** mechanisms (e.g. browser **localStorage** or short-lived server cache) without violating this constraint. |
| **FR-10 — Recent articles and posts only** | **Section 1** (industry news and signals) and any **Tier 3** items presented as “what’s moving” shall be grounded in **recent** primary sources only: each linked item shall have a **publication, post, or last-updated date** within the **recency windows** defined in §4 (*Recency and staleness*). The edition shall **not** treat **very old** articles, threads, or papers as if they were **today’s** news. **Sections 2–5** may reference older material only when **clearly labeled** as evergreen, historical context, or foundational background — not as current signal. |
| **FR-11 — No repetition within an edition** | A single generated edition shall **not** repeat the same story: **no duplicate primary URLs**, and **no redundant coverage** of the same underlying event across sections (one canonical link and summary per story unless a single cross-reference is needed for narrative clarity). |
| **FR-12 — Limited repetition across daily editions** | The product shall **avoid carrying over** the same **primary sources** from one **calendar day’s** reading session to the next where possible, so consecutive daily newsletters do not **re-hash the same articles**. Without a database, implementation shall use an **explicit strategy** (e.g. **localStorage** or **session-scoped** list of recently used URLs / story IDs, refreshed on a **rolling window** aligned with §4). If no memory is available (new browser, cleared storage), recency rules (FR-10) still apply. |

---

## 4. Non-functional requirements

| Category | Requirement |
|----------|-------------|
| **Tone and voice** | Prose shall be **not corporate, not dry, intellectually alive**, **storytelling-forward** (narrative thread per section), aimed at someone **technically fluent** who values **strategic context** over implementation detail. Benchmark: **HBR × Stratechery × sharp consultant who ships**. |
| **Sourcing integrity** | **Every claim, article, study, or specific external reference** in the generated edition shall include a **working hyperlink** to the source (or to the closest official permalink: publication page, arXiv abstract, blog post, etc.). |
| **Performance** | Typical full edition generation should complete within a **target upper bound** appropriate for interactive use (recommendation: **under ~2–3 minutes** on a normal connection; exact SLA left to implementation with user-visible loading/progress). |
| **Reliability** | If a source class is unavailable (rate limit, timeout, parse failure), the app shall **degrade gracefully**: still deliver all five sections with explicit note where data is thin, rather than failing silently or omitting sections without explanation. |
| **Maintainability** | Source lists and tier definitions shall live in a **structured, editable registry** (this document §5 + code/config as implemented) so outlets and handles can be updated without rewriting core app logic. |
| **Recency and staleness** | **Industry signals (Section 1, Tier 1–3):** prefer sources **published or posted within the last 72 hours** of the edition date; **do not** surface items **older than 7 days** as headline signal unless no sufficient recent material exists — in that case, the edition shall **state that signals are thin** and still respect FR-11 (no filler duplicates). **R&D (Section 3):** prefer **recently released** papers, posts, or summaries (e.g. **within 21 days** of publication on arXiv or the lab blog); **do not** feature seminal or years-old work as “emerging” without relabeling it as **background**, not lab news. **Things to try (Section 4):** tools and techniques should be **currently relevant** (generally **not** deprecated products or multi-year-old blog posts as the sole “try this” link unless framed as classic baseline). Exact thresholds may live in **config** but shall honor the intent: **recent only, no very old articles posing as news.** |
| **Deduplication** | Generation logic shall enforce **FR-11** programmatically where feasible (URL and normalized-title dedupe). **FR-12** is **best effort** under MVP storage limits; preference is **novel URLs** per day over maximum section length. |

---

## 5. Source registry

Structured list of **intended** sources by tier and type. Implementation may use RSS, official APIs, scraping where permitted, or search-assisted retrieval; URLs below are **canonical homepages or well-known entry points** for human verification and link-out (not an endorsement of any particular automation method).

### Tier 1 — Authoritative publications (industry news and signals)

| Source | Type | Canonical reference (homepage or main feed hub) |
|--------|------|---------------------------------------------------|
| MIT Technology Review | Publication | https://www.technologyreview.com/ |
| Harvard Business Review | Publication | https://hbr.org/ |
| Gartner | Research / analyst | https://www.gartner.com/en |
| McKinsey Global Institute | Think tank / research | https://www.mckinsey.com/mgi |
| Forrester Research | Analyst | https://www.forrester.com/ |
| Marketing Week | Trade publication | https://www.marketingweek.com/ |
| The Drum | Trade publication | https://www.thedrum.com/ |
| Martech Alliance | Industry / community | https://martechalliance.org/ |
| AdExchanger | AdTech trade | https://www.adexchanger.com/ |
| Digiday | Media / marketing trade | https://digiday.com/ |

### Tier 2 — Practitioner and community voices (industry news and signals)

| Source | Type | Canonical reference |
|--------|------|---------------------|
| TLDR AI | Newsletter | https://tldr.tech/ai (TLDR AI section) |
| The Batch (DeepLearning.AI / Andrew Ng) | Newsletter | https://www.deeplearning.ai/the-batch/ |
| Import AI (Jack Clark) | Newsletter | https://importai.substack.com/ |
| Stratechery | Analysis / newsletter | https://stratechery.com/ |
| Lenny’s Newsletter | Product / growth | https://www.lennysnewsletter.com/ |

### Tier 3 — Real-time signals from people and communities (industry news and signals)

| Source | Type | Notes |
|--------|------|--------|
| X (Twitter) — named voices | Social | Examples (non-exhaustive): Andrej Karpathy, Yann LeCun, Sam Altman, Ethan Mollick, Allie K. Miller, Paul Roetzer — **profile URLs** used for attribution and linking (implementation must respect platform ToS and API rules). |
| LinkedIn — MarTech / CDP / AdTech thought leaders | Social / professional | Curated list of profiles or company voices (implementation-specific); links must be **per-post** when citing. |
| Reddit — r/MachineLearning | Community | https://www.reddit.com/r/MachineLearning/ |
| Reddit — r/artificial | Community | https://www.reddit.com/r/artificial/ |
| Reddit — r/marketing | Community | https://www.reddit.com/r/marketing/ |

### Research and R&D (Section 3 — From the lab)

| Source | Type | Canonical reference |
|--------|------|---------------------|
| arXiv | Preprints | https://arxiv.org/ |
| Google DeepMind | Lab blog | https://deepmind.google/blog/ |
| Anthropic | Research | https://www.anthropic.com/research |
| OpenAI | Research | https://openai.com/research/ |
| Meta AI | Research / blog | https://ai.meta.com/ |
| Microsoft Research | Research | https://www.microsoft.com/en-us/research/ |
| Stanford HAI | Institute | https://hai.stanford.edu/ |
| MIT CSAIL | Lab | https://www.csail.mit.edu/ |
| NeurIPS | Conference | https://neurips.cc/ |
| ICML | Conference | https://icml.cc/ |
| ACL | Conference | https://www.aclweb.org/ |
| ICLR | Conference | https://iclr.cc/ |

---

## 6. Out of scope for MVP

- User authentication, authorization, and multi-tenant data isolation  
- Database persistence of historical editions, bookmarks, or reading state  
- Email delivery, push notifications, or calendar scheduling  
- Payment, subscriptions, or usage billing  
- Admin UI for non-developer editing of prompts or source registry (registry may be file-based)  
- Guaranteed 100% coverage of every registry source every day (coverage is **best effort** with graceful degradation)  
- Legal compliance review automation (user remains responsible for third-party ToS and content use)  
- Full automation of paywalled content retrieval without user credentials  

---

## 7. Future features (post-MVP)

- **Persistent archive** of past editions with search and tags (requires storage); enables **stronger cross-day deduplication** and “already read” surfacing without relying on localStorage  
- **Scheduled daily generation** (cron + optional email/PDF export)  
- **Lightweight preferences** (e.g., weight AdTech vs CDP, exclude topics) stored in local storage or a small DB  
- **OAuth or API keys** stored securely for higher-rate or paywalled sources the user is entitled to  
- **One-click “copy for LinkedIn”** with character count and optional tone tweak  
- **Source health dashboard** (which feeds succeeded/failed, latency)  
- **Multi-device sync** once auth and backend storage exist  
- **Citation QA pass** — automated check that every paragraph with a factual claim has an adjacent link  

---

## Appendix: Section summary (product shorthand)

| Section | Working title | Purpose |
|---------|----------------|---------|
| 1 | Industry news and signals | Curated, linked signal scan through consulting lens |
| 2 | Concept of the day | Dual-audience explainer for client conversations |
| 3 | From the lab | One tractable R&D item + industry “so what” |
| 4 | Things to explore and try | 2–3 actionable experiments this week |
| 5 | Thought leadership angle | One connected narrative for LinkedIn / clients |
