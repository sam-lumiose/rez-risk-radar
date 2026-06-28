# REZ Risk Radar — Cowork daily-job spec

A specification for a daily Claude Cowork job that scans the news, distils
emerging-risk signals for NSW EnergyCo's Renewable Energy Zone rollout, and
publishes a styled digest to GitHub Pages.

It is designed around one principle that keeps the automation robust: **the agent
writes structured data (JSON), never HTML.** Styling and layout live in the
static-site scaffold (provided separately). That separation means the daily job
can't break the page, the same JSON can later feed an email or a Slack post, and
the output is far more reliable than asking an agent to hand-write correct HTML
every morning.

---

## 1. Source register (with access status)

Grouped by the risk lens each source best illuminates. "Access" tells the job how
to treat it. **You hold AFR and SMH subscriptions** — handled under §2.

### Free — full ingest (RSS-first, respect robots.txt)

| Source | Risk lens | Notes |
|---|---|---|
| **EnergyCo NSW** (latest-updates / media releases) | Regulatory, Delivery, Social licence | Your own agency — the anchor source |
| **AEMO** (market notices, ISP) | Market, Delivery | REZ-region constraints, connection events |
| **AEMO Services** (Consumer Trustee, REZ tenders/LTESAs) | Market, Counterparty | REZ procurement signals |
| **AER** | Regulatory | Revenue determinations, transmission compliance |
| **AEMC** | Regulatory | National Electricity Rule changes |
| **IPART NSW** | Regulatory | Pricing, licensing |
| **DCCEEW** (NSW + federal) | Political, Policy | Policy and funding shifts |
| **Clean Energy Regulator** | Regulatory | Accreditation, certificates |
| **NSW Planning Portal / Major Projects** | Approvals, Social licence | EIS exhibitions + submissions — a key opposition signal |
| **ASX company announcements** | Counterparty | Developer disclosures (Origin, AGL, Squadron, ACCIONA/ACEREZ, Spark, Neoen, Tilt, BayWa) |
| **RenewEconomy** (+ The Driven) | Market, Delivery | Free, RSS |
| **pv magazine Australia** | Market, Technology | Free, RSS |
| **WattClarity** | Market | Dispatch/market analysis, RSS |
| **Utility Magazine** | Delivery, Networks | Free |
| **Energy Source & Distribution** | Delivery, Networks | Free |
| **ABC News + ABC regional** (Western Plains, New England NW, Riverina, Illawarra) | Social licence, Political | Free, RSS — your best free regional/community signal |
| **The Guardian Australia** | Political, Environment | Free, RSS |
| **Reuters** | Supply chain, Macro | Mostly free/metered — transformers, turbines, commodities |
| **Clean Energy Council / Smart Energy Council** | Industry sentiment | Media releases |
| **Energy Networks Australia** | Networks, Delivery | Media releases |
| **NSW Farmers Association** | Social licence | Landholder/easement sentiment |
| **Community / opposition groups** (regional action groups) | Social licence | Monitoring the opposition is core risk work |

### Paid — headline + public standfirst only, flagged for manual read

| Source | Risk lens | Status |
|---|---|---|
| **Australian Financial Review** | Market, Political, Reputational | **Paid — you hold access** (see §2) |
| **Sydney Morning Herald** | Political, Reputational | **Paid — you hold access** (see §2) |
| **The Australian** | Political, Energy | Paid (News Corp) — not held |
| **Newcastle Herald** | Social licence (Hunter, Port) | Paid/metered (ACM) |
| **Illawarra Mercury** | Social licence (Illawarra, offshore wind) | Paid/metered (ACM) |
| **Daily Liberal** (Dubbo) | Social licence (Central-West Orana) | Paid/metered (ACM) |
| **Northern Daily Leader** (Tamworth) | Social licence (New England) | Paid/metered (ACM) |
| **Daily Advertiser** (Wagga) | Social licence (South West) | Paid/metered (ACM) |
| **The Land** | Social licence (rural NSW) | Paid/metered (ACM) |
| **Carbon Pulse** | Markets, Policy | Paid (high-cost) — optional |
| **Bloomberg** | Macro, Supply chain | Paid — optional |

**Practical note on the regional mastheads:** the ACM titles above carry the
richest *community/social-licence* reporting — exactly the REZ-specific risk that
matters most — but are largely paywalled. Lean on **ABC regional** and **The Land**
headlines as the free substitute, and treat the ACM titles as headline-only feeds.

---

## 2. Paywall & copyright policy (bake into the job)

- **Free sources:** fetch (RSS-first), summarise **in your own words**, link out.
- **Paid sources you don't hold** (The Australian, ACM titles, Carbon Pulse,
  Bloomberg): ingest only the publicly visible **headline + standfirst**, set
  `"paywall": true`, link out. **Do not attempt to bypass the paywall.**
- **AFR & SMH (held):** default to the same headline-only treatment with
  `"paywall": true` so the item appears in the digest and links to the article you
  open in your own subscription. The automated agent should **not** log in and
  scrape full text. If you want a fuller summary of a specific AFR/SMH piece, use
  the **optional manual augmentation**: because you're licensed to read it, paste
  that article's text into the job's input and the agent will summarise *that*.
- **Always paraphrase. Never reproduce article paragraphs or lift sentences.**
  Each item is your own one- to two-sentence summary plus a "so what" risk read,
  with a link to the original.

---

## 3. The Cowork job — paste-in prompt

> Replace `{{REPO_PATH}}` with your local clone path and `{{SITE_URL}}` with your
> GitHub Pages URL. Run on a schedule (see §6).

```text
ROLE
You are the risk-intelligence analyst for the NSW EnergyCo risk function. Each run
you produce one daily "REZ Risk Radar" digest: a scan of the last 24 hours of news
for emerging risks to EnergyCo and the rollout of NSW's five Renewable Energy Zones
(Central-West Orana, New England, Hunter-Central Coast, Illawarra, South West).

SCOPE / RELEVANCE
Include an item only if it plausibly affects EnergyCo, a declared REZ, REZ
transmission, or a connected generation/storage project. Match on: EnergyCo, REZ,
the five zone names, ACEREZ, Transgrid, HumeLink, Project EnergyConnect, Waratah
Super Battery, transmission line/easement/corridor, energy hub, OSOM, network
operator, energisation, access scheme/rights, Electricity Infrastructure Roadmap,
AEMO Services / Consumer Trustee / LTESA; the developers (Origin, AGL, Squadron,
ACCIONA, Spark, Someva, Neoen, Tilt, BayWa); and risk terms (delay, cost overrun,
landholder, compulsory acquisition, protest/opposition, biodiversity, bushfire,
supply chain, transformer shortage, contractor/insolvency, cyber). Drop national/
global items with no NSW-REZ nexus.

SOURCES
Work from the source register in this project. RSS-first; respect robots.txt.
For paid sources, use only the public headline + standfirst and set "paywall": true
— never bypass a paywall. If I have pasted article text into today's input, you may
summarise that text (I am licensed to read it).

RISK TAXONOMY — assign each item exactly one category:
1. Regulatory & Approvals   2. Delivery, Schedule & Cost
3. Social Licence & Community   4. Market, Financial & Counterparty
5. Supply Chain & Logistics   6. Safety, Environment & Biodiversity
7. Political & Policy   8. Cyber & Security

SEVERITY — assign exactly one:
- "act"    Material and time-sensitive; warrants a decision or response now.
- "watch"  Developing; could escalate; monitor closely.
- "inform" Contextual; situational awareness only.
Be disciplined — most items are "watch" or "inform". Reserve "act" for genuinely
material, time-sensitive signals.

WRITING RULES
- Paraphrase everything in your own words. Never reproduce article sentences.
- headline: a plain, rewritten one-liner (not the publisher's headline verbatim).
- summary: 1–2 sentences, neutral, own words.
- so_what: 1–2 sentences naming the risk implication for EnergyCo (the value-add).
- Deduplicate across sources and against the previous 3 days' digests.
- Never fabricate. If a claim isn't supported by a source, drop it. Every item
  needs a real source name and URL.
- If nothing relevant surfaced, emit a digest with empty sections and say so.

OUTPUT — write two files, then commit and push:
1. Write data/digests/{{DATE}}.json  (schema below; {{DATE}} = today, YYYY-MM-DD,
   Australia/Sydney time).
2. Prepend a new entry to the top of the "digests" array in data/manifest.json:
   { "date","file","posture","counts": { "act","watch","inform" } }
   Keep the array newest-first. Don't touch existing entries.
3. git add -A && git commit -m "digest: {{DATE}}" && git push
Repo: {{REPO_PATH}}. Site: {{SITE_URL}}.

Before finishing, validate that both JSON files parse. Report a 3-line summary to
me: date, counts by severity, and the single highest-priority item.
```

---

## 4. Digest JSON schema

```jsonc
{
  "date": "2026-06-28",                       // YYYY-MM-DD, Australia/Sydney
  "generated_at": "2026-06-28T06:02:00+10:00",
  "posture": "One-line risk posture for the day.",
  "summary": "2–3 sentence executive overview.",
  "counts": { "act": 2, "watch": 4, "inform": 4 },
  "sections": [
    {
      "category": "Regulatory & Approvals",   // one of the 8 taxonomy categories
      "items": [
        {
          "severity": "act",                   // act | watch | inform
          "headline": "Rewritten one-liner.",
          "summary": "1–2 sentences, own words.",
          "so_what": "Why it matters to EnergyCo's risk posture.",
          "rez_tags": ["New England"],         // affected zones/projects
          "source": "EnergyCo NSW",
          "url": "https://…",
          "published": "2026-06-27",
          "paywall": false
        }
      ]
    }
  ]
}
```

The renderer sorts items by severity within each section and only shows sections
that have items, so the agent can include or omit categories freely.

## 5. manifest.json update rule

Prepend one object to `digests` (newest-first); leave `site` and existing entries
untouched:

```json
{ "date": "2026-06-28", "file": "data/digests/2026-06-28.json",
  "posture": "…", "counts": { "act": 2, "watch": 4, "inform": 4 } }
```

---

## 6. Scheduling & ops

- **Cadence:** business mornings (e.g. 06:00 Australia/Sydney). Confirm what
  recurring-schedule and git-push capability your current Cowork version exposes
  before relying on it; if scheduling isn't available, trigger the same prompt
  manually or from a cron/Action that opens the job.
- **Lookback:** last 24h (Monday picks up the weekend).
- **Dedup:** within the run and against the prior 3 digests.
- **No-news days:** still publish (empty sections) so the archive shows continuity
  — itself a useful "ran clean" signal.
- **Failure:** if a source errors, skip it and note the gap; never block the digest
  on one source.
- **Commit message:** `digest: YYYY-MM-DD` for a clean, dated history.

## 7. Optional extensions (same JSON, more reach)

Because the digest is structured data, you can fan it out without re-doing the
analysis: a second step can read today's JSON and (a) POST a condensed version to a
**Slack/Discord webhook**, or (b) send an **email** of the "act"/"watch" items.
For a portfolio, the GitHub Pages site is the durable, linkable artifact; the
webhook/email is a nice "delivery" demonstration to show alongside it.

---

### Portfolio framing tip
Structuring by **risk category + severity** is what turns this from a news reader
into a risk radar — which is precisely the lens a Chief Risk Officer is hired to
bring. Three weeks of dated, consistent digests in the archive is a stronger
artifact than any single polished page.
