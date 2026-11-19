# GradRunway

**Small Money, Big Plan — Campus-to-Career Financial Stress-Tester.**

GradRunway is a zero-login fintech dashboard built for the **SMBP FinHack (Small Money, Big Plan — Finance Track)**. It simulates a student's 24-month cash runway from campus through graduation, job hunting, and the first paycheck — then stress-tests the result against real-world crisis scenarios and a free-tier AI advisor.

---

## Problem

Fresh graduates plan their move around a salary number they have not received yet. They miss the silent killers: security deposits drained before the first paycheck, lost campus meal/transit subsidies, loan repayments that start mid-job-hunt, and the one emergency that turns a tight budget into a negative balance. A single bad month after graduation can spiral into credit-card debt before the career even begins.

## Solution

GradRunway turns a student's real numbers into a deterministic 24-month cash simulation and makes the risk visible:

1. **4 live KPIs** — Transition Readiness Score (0–100), post-grad monthly burn, lowest projected balance, and survival buffer in days.
2. **What-if crisis toggles** — delayed job offer (+2 months), -20% starting salary, and a $1,500 emergency shock.
3. **24-month runway chart** — a Recharts area chart with a $0 "bankruptcy cliff" reference line and campus/job-hunt/employed phase markers.
4. **AI Financial Advisor** — executive summary, 3 hidden-cost alerts, and 3 "Small Money, Big Plan" micro-habit actions with weekly saving and extra runway days.
5. **Plan preview** — toggle to overlay the micro-action savings curve next to the baseline.

Click any of the 3 preset personas to load a fully pre-computed advisor report with **zero API calls**.

## Hybrid Architecture

```
┌─────────────────────────────────────────────────────────┐
│ app/page.tsx (client)                                   │
│  sliders, crisis toggles, KPI cards, chart, advisor UI  │
└───────────────┬─────────────────────────┬───────────────┘
                │ pure math (local)       │ POST /api/analyze
                ▼                         ▼
┌──────────────────────────┐   ┌────────────────────────────┐
│ lib/financeEngine.ts     │   │ app/api/analyze/route.ts   │
│ deterministic TS engine  │   │ OpenAI-compatible fetch    │
│ zero AI arithmetic       │   │ AbortSignal.timeout(10000) │
│ 24-month timeline,       │   │ response_format json_object│
│ readiness, risk, runway  │   │ + rule-based fallback      │
└──────────────────────────┘   └──────────────┬─────────────┘
                                              ▼
                            ┌────────────────────────────┐
                            │ lib/presets.ts             │
                            │ 3 personas + cached reports│
                            └────────────────────────────┘
```

- **Deterministic core**: every number on the dashboard comes from pure TypeScript in `lib/financeEngine.ts`. No AI, no randomness, fully reproducible.
- **Safe AI layer**: `/api/analyze` calls any OpenAI-compatible endpoint (default: Gemini free tier) and parses strict JSON. If the key is missing, rate-limited, times out, or throws, the endpoint computes a tailored report from the user's exact simulation metrics and returns HTTP 200 with `source: "smart-fallback"`. The client never sees a 500.
- **Zero duplicate calls**: the client hashes the input+simulation payload, stores the report under that hash in `localStorage`, and reuses it for identical inputs.

## Free-Tier Cost Efficiency

- Default `AI_BASE_URL` targets the **free Gemini OpenAI-compatible endpoint** (`generativelanguage.googleapis.com/v1beta/openai/chat/completions`) with model `gemini-2.5-flash`.
- Preset personas ship with pre-computed `AIAdvisorReport` objects, so the most common demo flow makes **0 external API calls**.
- `localStorage` hash caching means re-running the same scenario costs nothing.
- The 10-second `AbortSignal.timeout` plus regex-JSON fallback keeps flaky free-tier responses from ever crashing the UI.

## Local Setup

```bash
git clone https://github.com/muhammadfisabilillah/GradRunway.git
cd GradRunway
npm install
```

Create `.env.local` (a template is already provided as `.env.example`):

```env
AI_API_KEY=paste_your_free_api_key_here
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
AI_MODEL=gemini-2.5-flash
```

Paste your free API key into `.env.local`. If you leave it as the placeholder, the app silently runs on the built-in smart-fallback advisor — no key required.

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Production build check:

```bash
npm run build
```

## Repository Map

| Path | Purpose |
| --- | --- |
| `lib/financeEngine.ts` | Pure TS cash-runway engine: `FinanceInputs`, `MonthlyPoint`, `SimulationResult`, `simulateTimeline`, `simulateImprovedTimeline`, `withBaseline`. |
| `lib/presets.ts` | `STUDENT_PRESETS` — 3 personas with cached `AIAdvisorReport` objects. |
| `app/api/analyze/route.ts` | POST endpoint: validation, OpenAI-compatible fetch, timeout, JSON extraction, rule-based fallback. |
| `components/RunwayChart.tsx` | Recharts area chart with $0 cliff, phases, comparison overlay. |
| `components/AdvisorPanel.tsx` | Executive summary, hidden-cost cards, micro-action cards, plan-simulation toggle. |
| `app/page.tsx` | Dashboard shell: navbar, KPIs, sliders, crisis toggles, caching, chart wiring. |

## Built for

SMBP FinHack — Small Money, Big Plan, Finance Track.
