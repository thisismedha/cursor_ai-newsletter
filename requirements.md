# Product Requirements: Personal Daily AI Brief (Newsletter Web App)

**Owner:** Solo user (AI Deployment Consultant — CDP, MarTech, AdTech)  
**Document type:** MVP product requirements  
**Last updated:** 2026-04-05

---

## 1. Problem statement

Staying credibly current on AI while serving marketing and data-strategy clients requires scanning many publication tiers (tier-1 media, practitioner newsletters, and real-time social signals), then reframing developments for **business and technical audiences** in CDP, MarTech, and AdTech contexts. Manual curation is slow and inconsistent; generic AI digests are not filtered through a **marketing and strategic consulting lens**, and they rarely bundle **client-ready explanations**, **R&D watch items**, **hands-on experiments**, and **original thought leadership** in one daily artifact.

This product delivers a **single daily web experience** that regenerates on demand, synthesizes signals from a defined source registry, and uses **narrative, HBR-meets-Stratechery tone** with **every factual claim linked to a source** — so the user can open a browser, read one edition, and walk into client or LinkedIn conversations prepared. Editions must feel **of-the-moment**: **recent sources only**, **no recycling of stale articles as news**, and **minimal repetition** within and across consecutive days (within MVP constraints).

---

## 2. User story

**As** the only user — an AI deployment consultant focused on CDP, MarTech, and AdTech —  
**I want** a personal daily newsletter web app that, on each visit or refresh, produces a fresh edition with five fixed sections (industry signals, concept of the day, lab note, things to try, thought leadership),  
**So that** I can stay strategically and technically current, explain concepts confidently to both business and technical stakeholders, and have one original angle ready for clients or LinkedIn — using **fresh, non-repetitive, recently published** material — without a database or sign-in for MVP.

---

## 3. Functional requirements

### 3.1 Newsletter content (five sections)

| ID | Requirement |
|----|-------------|
| **FR-1 — Industry news and signals** | Generate **Section 1** by surfacing and summarizing the most relevant AI-related developments **through a marketing / MarTech / AdTech / strategic consulting lens**, using the **Source registry** (Tier 1–3). Each item shall include a **hyperlink to the primary source** (article, post, thread, or official publication). Favor **trusted, named outlets and voices** over unattributed rumor. |
| **FR-2 — Concept of the day** | Generate **Section 2** with **one** concept per edition, applicable to CDP, MarTech, AdTech, or strategic consulting. Provide **Version A** (business stakeholder: no jargon, outcome-focused) and **Version B** (technical stakeholder: precise, mechanism-focused), each as a **short narrative**, not a bullet dump. |
| **FR-3 — From the lab (R&D and research)** | Generate **Section 3** with **one** emerging idea from academia or industry R&D (see §5 and research sources). Include: **what was published**, **why it matters for this industry**, and **one practical “so what”** for CDP/MarTech/AdTech, **explainable in a client meeting without a PhD**. **Hyperlink required** to the paper, blog post, or official summary. |
| **FR-4 — Things to explore and try** | Generate **Section 4** with **2–3** recommendations per edition. Each item: **what it is**, **why it matters to this work**, and **one concrete way to try it this week**. Categories may include tool/model/API, prompt technique, framework/methodology, dataset/benchmark/evaluation. **Hyperlink required** where a public resource exists. |
| **FR-5 — Thought leadership angle** | Generate **Section 5** as **one** original strategic “so what” that **connects the edition’s signals** into an insight suitable for **LinkedIn or a client conversation**: strategic, consulting-focused, storytelling-driven, **technically credible but not overly technical** — consistent with **§4.1 Tone, voice, and style**. |

### 3.2 Product behavior (MVP)

| ID | Requirement |
|----|-------------|
| **FR-6 — Daily freshness** | Each generation reflects **the current day’s** landscape (no static template posing as news). The user may **regenerate on demand**; MVP does not require persistence of past editions. Constrained further by **FR-10–FR-12** and **§4.2 Recency and staleness**. |
| **FR-7 — Web app delivery** | Run as a **web application** in a standard desktop/mobile browser, with all **five sections** in one coherent reading flow (scroll or in-page navigation). |
| **FR-8 — No authentication (MVP)** | No login, accounts, or access control. |
| **FR-9 — No database (MVP)** | No database for editions, users, or preferences. Generation is **stateless / on demand**. **FR-12** may use **localStorage** or a **short-lived server cache** without violating this constraint. |
| **FR-10 — Recent sources for signal sections** | **Section 1** and **Tier 3** items framed as “what’s moving” must use **recent** primary sources: publication, post, or last-updated date within **§4.2**. Do not present **very old** material as **today’s** news. **Sections 2–5** may use older material only if **clearly labeled** evergreen, historical, or foundational — not as current signal. |
| **FR-11 — No repetition within an edition** | No **duplicate primary URLs** and no **redundant coverage** of the same underlying event across sections (one canonical link per story unless a single cross-reference serves narrative clarity). |
| **FR-12 — Limited repetition across days** | **Avoid reusing** the same **primary sources** from one **calendar day** to the next where possible. Use an explicit strategy (**localStorage** or **session-scoped** recent URL/story IDs, **rolling window** per §4.2). If no memory exists, **FR-10** still applies. |

---

## 4. Non-functional requirements

### 4.1 Tone, voice, and style

- **Not** corporate or dry; **intellectually alive** and **storytelling-forward** (a narrative thread per section, not a bullet dump).
- Audience: **technically fluent**, prefers **strategic context** over implementation detail.
- Benchmark: **HBR × Stratechery × sharp consultant who ships**.

### 4.2 Recency and staleness

| Domain | Rule |
|--------|------|
| **Industry signals (Section 1, Tier 1–3)** | Prefer sources **published or posted within 72 hours** of the edition date. Do **not** surface items **older than 7 days** as headline signal unless insufficient recent material exists — then **state that signals are thin** and still satisfy **FR-11**. |
| **R&D (Section 3)** | Prefer work **within ~21 days** on arXiv or lab blogs. Do **not** treat seminal or years-old work as “emerging” without relabeling as **background**. |
| **Things to try (Section 4)** | Prefer **currently relevant** tools and links; avoid deprecated or ancient posts as the sole “try this” unless framed as **classic baseline**. |

Thresholds may live in **config**; intent is **recent-only signal**, **no old articles posing as breaking news**.

### 4.3 Other NFRs

| Category | Requirement |
|----------|-------------|
| **Sourcing integrity** | **Every claim, article, study, or specific external reference** shall include a **working hyperlink** (or closest official permalink). |
| **Performance** | Typical full generation within **~2–3 minutes** on a normal connection; **user-visible loading/progress** (exact SLA implementation-defined). |
| **Reliability** | On source failure (rate limit, timeout, parse error), **degrade gracefully**: still deliver **all five sections** with explicit note where data is thin — no silent omission of sections. |
| **Maintainability** | Source lists and tiers live in a **structured, editable registry** (§5 + code/config). |
| **Deduplication** | Enforce **FR-11** in code where feasible (URL + normalized title). **FR-12** is **best effort** under MVP storage limits; prefer **novel URLs** per day over padding length. |

---

## 5. Source registry

Structured list of **intended** sources. Implementation may use RSS, official APIs, permitted scraping, or search-assisted retrieval. URLs are **canonical entry points** for verification and linking.

### Tier 1 — Authoritative publications

| Source | Type | Reference |
|--------|------|-----------|
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

### Tier 2 — Practitioner and community voices

| Source | Type | Reference |
|--------|------|-----------|
| TLDR AI | Newsletter | https://tldr.tech/ai |
| The Batch (Andrew Ng / DeepLearning.AI) | Newsletter | https://www.deeplearning.ai/the-batch/ |
| Import AI (Jack Clark) | Newsletter | https://importai.substack.com/ |
| Stratechery | Analysis / newsletter | https://stratechery.com/ |
| Lenny’s Newsletter | Product / growth | https://www.lennysnewsletter.com/ |

### Tier 3 — People and communities (real-time signals)

| Source | Type | Notes |
|--------|------|--------|
| X (Twitter) | Social | e.g. Andrej Karpathy, Yann LeCun, Sam Altman, Ethan Mollick, Allie K. Miller, Paul Roetzer — respect **ToS/API** rules; **per-post** links when citing. |
| LinkedIn | Social / professional | MarTech / CDP / AdTech voices; **per-post** links when citing. |
| r/MachineLearning | Community | https://www.reddit.com/r/MachineLearning/ |
| r/artificial | Community | https://www.reddit.com/r/artificial/ |
| r/marketing | Community | https://www.reddit.com/r/marketing/ |

### Research and R&D (Section 3)

| Source | Type | Reference |
|--------|------|-----------|
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

- Authentication, authorization, multi-tenant isolation  
- Database persistence of editions, bookmarks, or reading state  
- Email, push notifications, calendar scheduling  
- Payments, subscriptions, billing  
- Admin UI for prompts/registry (file-based config is fine)  
- Guaranteed daily coverage of every registry source (**best effort** + graceful degradation)  
- Automated legal/ToS compliance (user responsible for third-party terms)  
- Full automation of paywalled content without user credentials  

---

## 7. Future features (post-MVP)

- **Archive** of past editions with search/tags (storage-backed **cross-day deduplication** and “already read”)  
- **Scheduled** daily generation (cron; optional email/PDF)  
- **Preferences** (e.g. weight AdTech vs CDP, topic excludes) via local storage or small DB  
- **OAuth / API keys** for entitled paywalled or rate-limited sources  
- **One-click “copy for LinkedIn”** with length and optional tone tweak  
- **Source health** dashboard (feed success, latency)  
- **Multi-device sync** after auth + backend storage  
- **Citation QA** — automated check that factual claims have adjacent links  

---

## Appendix — Section summary

| # | Title | Purpose |
|---|--------|---------|
| 1 | Industry news and signals | Linked signal scan through consulting lens |
| 2 | Concept of the day | Dual-audience explainer for clients |
| 3 | From the lab | One R&D item + industry “so what” |
| 4 | Things to explore and try | 2–3 actionable experiments this week |
| 5 | Thought leadership angle | One connected narrative for LinkedIn / clients |
