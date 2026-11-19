# GradRunway — Devpost Submission Copy

## Problem Introduction

College students in Hong Kong and across Asia face a brutal financial cliff at graduation. They plan their post-campus life around a salary number they have not received yet, while ignoring the silent killers: a $2,800 security deposit due before the first paycheck, the sudden loss of subsidised campus meals and transit, student loan repayments that kick in mid-job-hunt, and the one emergency bill that turns a tight budget into credit-card debt.

In Hong Kong, a fresh graduate earning HKD 15,000/month can easily burn HKD 12,000 on rent, transport, and loan repayments — leaving almost nothing for the 2–4 months of job hunting that typically follow graduation. A single delayed offer or a $1,500 emergency can wipe out months of savings in weeks.

Existing budgeting apps are backward-looking: they track what you already spent. None of them simulate the transition period — the dangerous gap between campus life and your first stable paycheck. Students need a forward-looking tool that makes this gap visible before it becomes a crisis.

## Solution Introduction

GradRunway is a 24-month cash runway simulator and financial stress-tester built for college students about to graduate. It answers one question: "Will my money last until my first paycheck — and what happens if things go wrong?"

The user enters 9 simple inputs (current savings, student income/spend, graduation timeline, job search duration, expected salary, moving deposit, post-grad monthly costs, and loan repayment). GradRunway instantly projects a month-by-month balance across 24 months, broken into three phases: Campus, Job Hunt, and Employed.

Three crisis toggles let students stress-test their runway: a delayed job offer (+2 months), a 20% salary cut, and a $1,500 emergency shock. The dashboard shows a 24-month area chart with a $0 "bankruptcy cliff" reference line, four live KPIs (Transition Readiness Score, post-grad burn rate, lowest projected balance, survival buffer in days), and a verdict banner (SAFE / MODERATE / CRITICAL).

The AI Financial Advisor generates an executive summary, three hidden-cost alerts, and a three-step micro-action savings plan with weekly saving targets and extra runway days. A plan preview overlay shows how these micro-actions extend the runway curve.

A guided 3-step wizard walks first-time users through setup, and three preset personas (Metro HK, Tech Loan, Side Hustler) provide instant zero-setup demos.

## Technical Introduction

**Architecture:** Hybrid client-server design with a deterministic TypeScript core and a safe AI layer.

**Frontend:** Next.js 15 (App Router) with React 19, Tailwind CSS v4, Recharts for the 24-month runway chart, and Lucide React icons. The dashboard is a single-page client component with view-mode routing (welcome, wizard, demo, dashboard).

**Financial Engine (`lib/financeEngine.ts`):** Pure TypeScript functions — `simulateTimeline()`, `simulateImprovedTimeline()`, `withBaseline()`, and `computeReadinessScore()`. All 24 monthly data points, KPI calculations, and risk-level classifications are computed locally. No AI, no randomness, fully reproducible.

**AI Advisor (`app/api/analyze/route.ts`):** POST endpoint that calls any OpenAI-compatible API (default: Google Gemini 2.5 Flash free tier). Includes a 10-second timeout, strict JSON response format enforcement, input validation, and a rule-based fallback that generates tailored reports from the user's exact simulation metrics if the API key is missing, rate-limited, or unreachable — always returns HTTP 200.

**Caching:** Client-side hash-based localStorage caching means identical inputs reuse cached reports with zero API calls. Preset personas ship with pre-computed reports.

**Cost Efficiency:** Default demo flow (preset personas) makes 0 external API calls. The smart-fallback ensures the app never crashes.

**Deployment:** Deployed on Vercel. Environment variables: `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`.