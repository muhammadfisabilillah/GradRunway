"use client";

import {
  AlertTriangle,
  Loader2,
  PiggyBank,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { AIAdvisorReport } from "@/lib/presets";

interface AdvisorPanelProps {
  report: AIAdvisorReport | null;
  loading: boolean;
  error: string | null;
  simulatePlan: boolean;
  onToggleSimulatePlan: () => void;
  onRunAi: () => void;
  totalPlanWeeklySaving: number;
  currencySymbol?: string;
}

function currency(value: number, symbol = "$"): string {
  return `${symbol}${Math.round(value).toLocaleString("en-US")}`;
}

export default function AdvisorPanel({
  report,
  loading,
  error,
  simulatePlan,
  onToggleSimulatePlan,
  onRunAi,
  totalPlanWeeklySaving,
  currencySymbol = "$",
}: AdvisorPanelProps) {
  if (loading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white p-6">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="text-sm text-stone-500">
          Running your AI stress-test&hellip;
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
        <Sparkles className="h-9 w-9 text-emerald-400" />
        <div>
          <p className="text-base font-semibold text-stone-900">
            No AI stress-test yet
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Run the advisor to surface hidden post-grad costs and a 3-step
            &ldquo;Small Money, Big Plan&rdquo; action plan.
          </p>
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <button
          type="button"
          onClick={onRunAi}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
        >
          <Sparkles className="h-4 w-4" />
          Run AI Stress-Test
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Executive Summary
          </h3>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
              report.source === "llm"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-sky-100 text-sky-700"
            }`}
          >
            {report.source === "llm" ? "Live AI" : "Smart fallback"}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-stone-700">
          {report.executiveSummary}
        </p>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Hidden Post-Grad Cost Alerts
        </h3>
        <div className="flex flex-col gap-2.5">
          {report.hiddenCostsAlert.map((cost, index) => (
            <div
              key={`${cost.title}-${index}`}
              className="rounded-xl border border-amber-200 bg-amber-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-amber-800">
                  {cost.title}
                </p>
                <span className="shrink-0 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {currency(cost.estimatedCost, currencySymbol)}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                {cost.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <PiggyBank className="h-4 w-4 text-emerald-400" />
            Small Money, Big Plan
          </h3>
          <span className="text-xs text-stone-500">
            Total: {currency(totalPlanWeeklySaving, currencySymbol)}/wk
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          {report.microActionPlan.map((action, index) => (
            <div
              key={`${action.action}-${index}`}
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-emerald-800">
                  {action.action}
                </p>
                <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {currency(action.weeklySaving, currencySymbol)}/wk
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                {action.impactSummary}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-emerald-700">
                <TrendingUp className="h-3 w-3" />+{action.extraRunwayDays} extra
                runway days
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={simulatePlan}
        onClick={onToggleSimulatePlan}
        className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition ${
          simulatePlan
            ? "border-violet-300 bg-violet-50"
            : "border-stone-200 bg-white hover:border-stone-300"
        }`}
      >
        <span className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              simulatePlan ? "bg-violet-100" : "bg-stone-100"
            }`}
          >
            <Zap
              className={`h-4 w-4 ${
                simulatePlan ? "text-violet-700" : "text-stone-500"
              }`}
            />
          </span>
          <span>
            <span className="block text-sm font-semibold text-stone-900">
              Simulate Applying Action Plan
            </span>
            <span className="block text-xs text-stone-500">
              Overlay the savings curve on the runway chart
            </span>
          </span>
        </span>
        <span
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
            simulatePlan ? "bg-violet-500" : "bg-stone-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              simulatePlan ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </span>
      </button>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <button
        type="button"
        onClick={onRunAi}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-emerald-500/50 hover:text-emerald-300"
      >
        <Sparkles className="h-4 w-4" />
        Re-run AI Stress-Test
      </button>
    </div>
  );
}
