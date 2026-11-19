"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  Flame,
  GraduationCap,
  Landmark,
  LifeBuoy,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import RunwayChart from "@/components/RunwayChart";
import AdvisorPanel from "@/components/AdvisorPanel";
import WelcomeHero from "@/components/WelcomeHero";
import SetupWizard from "@/components/SetupWizard";
import DemoScenarios from "@/components/DemoScenarios";
import GuidedFlowStepper, {
  type GuideStage,
} from "@/components/GuidedFlowStepper";
import VerdictBanner from "@/components/VerdictBanner";
import {
  DEFAULT_INPUTS,
  simulateTimeline,
  withBaseline,
  type FinanceInputs,
  type MonthlyPoint,
  type SimulationResult,
} from "@/lib/financeEngine";
import {
  STUDENT_PRESETS,
  type AIAdvisorReport,
  type Currency,
  type StudentPreset,
} from "@/lib/presets";

type ViewMode = "welcome" | "guide" | "demo" | "wizard" | "dashboard";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  HKD: "HK$",
  IDR: "Rp",
};

const CURRENCY_LOCALES: Record<Currency, string> = {
  USD: "en-US",
  HKD: "en-HK",
  IDR: "id-ID",
};

interface SliderRowProps {
  label: string;
  helper?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
}

function SliderRow({
  label,
  helper,
  value,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
  onChange,
}: SliderRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-medium text-stone-700">{label}</label>
        <div className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-1">
          <span className="text-xs text-stone-400">{prefix}</span>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 bg-transparent text-right text-xs font-semibold text-stone-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-xs text-stone-400">{suffix}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      {helper && (
        <p className="text-[11px] leading-relaxed text-stone-400">{helper}</p>
      )}
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  hint: string;
  checked: boolean;
  delta?: number | null;
  onChange: (next: boolean) => void;
}

function ToggleRow({ label, hint, checked, delta, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
        checked
          ? "border-rose-300 bg-rose-50"
          : "border-stone-200 bg-stone-50 hover:border-stone-300"
      }`}
    >
      <span>
        <span className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          {label}
          {checked && delta !== undefined && delta !== null && delta < 0 && (
            <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-300">
              {delta} days
            </span>
          )}
        </span>
        <span className="block text-xs text-stone-500">{hint}</span>
      </span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? "bg-rose-500" : "bg-stone-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

function formatCurrency(value: number, curr: Currency = "USD"): string {
  const sign = value < 0 ? "-" : "";
  const symbol = CURRENCY_SYMBOLS[curr];
  const locale = CURRENCY_LOCALES[curr];
  return `${sign}${symbol}${Math.abs(Math.round(value)).toLocaleString(locale)}`;
}

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return String(Math.abs(hash));
}

function riskBadgeClass(riskLevel: string): string {
  if (riskLevel === "SAFE") return "bg-emerald-100 text-emerald-700";
  if (riskLevel === "MODERATE") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

interface KpiCardProps {
  label: string;
  tooltip: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass?: string;
  children: React.ReactNode;
}

function KpiCard({ label, tooltip, icon: Icon, iconClass = "text-stone-400", children }: KpiCardProps) {
  return (
    <div className="group relative rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </div>
      {children}
      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-xl border border-stone-300 bg-stone-100 p-3 text-xs leading-relaxed text-stone-700 opacity-0 shadow-xl transition group-hover:opacity-100">
        {tooltip}
      </div>
    </div>
  );
}

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("welcome");
  const [inputs, setInputs] = useState<FinanceInputs>(DEFAULT_INPUTS);
  const [report, setReport] = useState<AIAdvisorReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulatePlan, setSimulatePlan] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [wizardInputs, setWizardInputs] = useState<FinanceInputs>(DEFAULT_INPUTS);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [lang, setLang] = useState<"en" | "id">("en");

  const simulation: SimulationResult = useMemo(
    () => simulateTimeline(inputs),
    [inputs],
  );

  const overlayTimeline = useMemo<MonthlyPoint[]>(
    () => withBaseline(inputs, simulation, 125),
    [inputs, simulation],
  );

  const activeStage: GuideStage = report
    ? 3
    : inputs.delayedJobOffer ||
        inputs.salaryCut20Percent ||
        inputs.emergencyShock
      ? 2
      : 1;

  const updateInput = useCallback(
    <K extends keyof FinanceInputs>(key: K, value: FinanceInputs[K]) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
      setActivePreset(null);
    },
    [],
  );

  const toggleFlag = useCallback(
    (key: "delayedJobOffer" | "salaryCut20Percent" | "emergencyShock") => {
      setInputs((prev) => ({ ...prev, [key]: !prev[key] }));
      setActivePreset(null);
    },
    [],
  );

  const applyPreset = useCallback((preset: StudentPreset) => {
    setInputs({ ...preset.inputs });
    setReport(preset.cachedReport);
    setActivePreset(preset.id);
    setError(null);
    setSimulatePlan(false);
    setCurrency(preset.currency);
    setViewMode("dashboard");
  }, []);

  const finishWizard = useCallback(() => {
    setInputs({ ...wizardInputs });
    setViewMode("dashboard");
  }, [wizardInputs]);

  const analysisHash = useMemo(
    () =>
      hashString(
        JSON.stringify({
          inputs,
          zeroCashMonth: simulation.zeroCashMonth,
          lowestBalance: simulation.lowestBalance,
          postGradBurnRate: simulation.postGradBurnRate,
          runwayDaysAfterGrad: simulation.runwayDaysAfterGrad,
          readinessScore: simulation.readinessScore,
        }),
      ),
    [inputs, simulation],
  );

  const crisisDeltas = useMemo(() => {
    const simulateWith = (flag: "delayedJobOffer" | "salaryCut20Percent" | "emergencyShock") =>
      simulateTimeline({ ...inputs, [flag]: !inputs[flag] });
    return {
      delayedJobOffer: inputs.delayedJobOffer
        ? simulation.runwayDaysAfterGrad - simulateWith("delayedJobOffer").runwayDaysAfterGrad
        : null,
      salaryCut20Percent: inputs.salaryCut20Percent
        ? simulation.runwayDaysAfterGrad - simulateWith("salaryCut20Percent").runwayDaysAfterGrad
        : null,
      emergencyShock: inputs.emergencyShock
        ? simulation.runwayDaysAfterGrad - simulateWith("emergencyShock").runwayDaysAfterGrad
        : null,
    };
  }, [inputs, simulation]);

  const baselineSimulation = useMemo(
    () =>
      simulateTimeline({
        ...inputs,
        delayedJobOffer: false,
        salaryCut20Percent: false,
        emergencyShock: false,
      }),
    [inputs],
  );

  const stressDiff = useMemo(() => {
    const runwayDiff = simulation.runwayDaysAfterGrad - baselineSimulation.runwayDaysAfterGrad;
    const balanceDiff = simulation.lowestBalance - baselineSimulation.lowestBalance;
    const readinessDiff = simulation.readinessScore - baselineSimulation.readinessScore;
    const hasStress = inputs.delayedJobOffer || inputs.salaryCut20Percent || inputs.emergencyShock;
    return { runwayDiff, balanceDiff, readinessDiff, hasStress };
  }, [simulation, baselineSimulation, inputs]);

  const storageKey = `gradrunway-report-${analysisHash}`;

  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(storageKey);
      if (cached) {
        setReport(JSON.parse(cached) as AIAdvisorReport);
        setError(null);
      }
    } catch {
      /* ignore unavailable or corrupt storage */
    }
  }, [storageKey]);

  const runAiAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, simulation }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as AIAdvisorReport;
      setReport(data);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        /* storage quota or unavailable: non-fatal */
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `AI request failed: ${err.message}. Showing last available insights.`
          : "AI request failed.",
      );
    } finally {
      setLoading(false);
    }
  }, [inputs, simulation, storageKey]);

  const totalPlanWeeklySaving = report
    ? report.microActionPlan.reduce((sum, a) => sum + a.weeklySaving, 0)
    : 0;

  const navbar = (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#faf8f5]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setViewMode("welcome")}
          className="flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900">
            <GraduationCap className="h-4 w-4 text-white" />
          </span>
          <span className="font-serif text-base font-bold tracking-tight text-stone-900">
            GradRunway
          </span>
        </button>

        {viewMode === "dashboard" && (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <div className="flex items-center rounded-full border border-stone-300 bg-white px-0.5">
              {(["USD", "HKD", "IDR"] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`rounded-full px-2 py-1 text-[10px] font-bold transition ${
                    currency === c
                      ? "bg-stone-900 text-white"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setInputs({ ...DEFAULT_INPUTS });
                setReport(null);
                setActivePreset(null);
                setError(null);
                setSimulatePlan(false);
                setCurrency("USD");
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-500 transition hover:border-rose-300 hover:text-rose-500"
              title={lang === "en" ? "Reset to defaults" : "Reset ke default"}
            >
              <RotateCcw className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("welcome")}
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[10px] font-bold text-stone-600 transition hover:border-stone-400"
            >
              {lang === "en" ? "Exit" : "Keluar"}
            </button>
          </div>
        )}
      </div>

      {viewMode === "dashboard" && (
        <div className="border-t border-stone-100 bg-white/60">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 py-1.5 sm:px-6">
            <span className="mr-1 text-[9px] font-bold uppercase tracking-wider text-stone-400">
              {lang === "en" ? "Presets:" : "Preset:"}
            </span>
            {STUDENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                  activePreset === preset.id
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );

  if (viewMode === "welcome") {
    return (
      <WelcomeHero
        onStartGuided={() => {
          setWizardInputs({ ...DEFAULT_INPUTS });
          setViewMode("wizard");
        }}
        onExploreDemos={() => setViewMode("demo")}
      />
    );
  }

  if (viewMode === "wizard") {
    return (
      <SetupWizard
        inputs={wizardInputs}
        onInputChange={(key, value) =>
          setWizardInputs((prev) => ({ ...prev, [key]: value }))
        }
        onFinish={finishWizard}
        onBack={() => setViewMode("welcome")}
      />
    );
  }

  if (viewMode === "demo") {
    return (
      <DemoScenarios
        presets={STUDENT_PRESETS}
        onSelect={applyPreset}
        onBack={() => setViewMode("welcome")}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-900">
      {navbar}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <GuidedFlowStepper activeStage={activeStage} />
        </div>

        {stressDiff.hasStress && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Stress-Test Impact
            </span>
            {stressDiff.runwayDiff !== 0 && (
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                stressDiff.runwayDiff < 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                Runway {stressDiff.runwayDiff > 0 ? "+" : ""}{stressDiff.runwayDiff} days
              </span>
            )}
            {stressDiff.balanceDiff !== 0 && (
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                stressDiff.balanceDiff < 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                Low balance {stressDiff.balanceDiff > 0 ? "+" : ""}{formatCurrency(stressDiff.balanceDiff, currency)}
              </span>
            )}
            {stressDiff.readinessDiff !== 0 && (
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                stressDiff.readinessDiff < 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                Readiness {stressDiff.readinessDiff > 0 ? "+" : ""}{stressDiff.readinessDiff} pts
              </span>
            )}
            <span className="ml-auto text-[10px] text-stone-400">
              vs. baseline (no crisis toggles)
            </span>
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Transition Readiness"
            tooltip="Composite score (0-100) from runway days, buffer months, and cash-cliff penalties. Below 40 = high risk."
            icon={ShieldCheck}
          >
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight">
                {simulation.readinessScore}
              </span>
              <span
                className={`mb-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${riskBadgeClass(
                  simulation.riskLevel,
                )}`}
              >
                {simulation.riskLevel}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className={`h-full rounded-full ${
                  simulation.readinessScore >= 70
                    ? "bg-emerald-500"
                    : simulation.readinessScore >= 40
                      ? "bg-amber-400"
                      : "bg-rose-400"
                }`}
                style={{ width: `${simulation.readinessScore}%` }}
              />
            </div>
          </KpiCard>

          <KpiCard
            label="Post-Grad Monthly Burn"
            tooltip="Your monthly cost after graduation: rent, food, transport, bills + fixed loan repayment."
            icon={Flame}
            iconClass="text-amber-400"
          >
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {formatCurrency(simulation.postGradBurnRate, currency)}
              <span className="text-sm font-medium text-stone-400">/mo</span>
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Cost of living + loan repayment
            </p>
          </KpiCard>

          <KpiCard
            label="Lowest Projected Balance"
            tooltip="The lowest cash balance across all 24 months. Negative = cash cliff, you run out of money."
            icon={Wallet}
          >
            <p
              className={`mt-2 text-3xl font-bold tracking-tight ${
                simulation.lowestBalance < 0
                  ? "text-rose-400"
                  : "text-stone-900"
              }`}
            >
              {formatCurrency(simulation.lowestBalance, currency)}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {simulation.lowestBalance < 0
                ? "Cash cliff — negative balance projected"
                : "Balance stays positive across 24 months"
              }
            </p>
          </KpiCard>

          <KpiCard
            label="Post-Grad Survival Buffer"
            tooltip="How many days your savings last after graduation (after deposit), before your first paycheck arrives."
            icon={LifeBuoy}
            iconClass="text-sky-400"
          >
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {simulation.runwayDaysAfterGrad}
              <span className="text-sm font-medium text-stone-400"> days</span>
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Cash at grad covers burn after deposit
            </p>
          </KpiCard>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(340px,420px)_1fr]">
          <section className="flex flex-col gap-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-serif mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Landmark className="h-4 w-4 text-sky-400" />
                Campus Cashflow
              </h2>
              <div className="flex flex-col gap-4">
                <SliderRow
                  label="Current savings"
                  helper="Cash you could touch today in an emergency."
                  value={inputs.currentSavings}
                  min={0}
                  max={20000}
                  step={100}
                  prefix="$"
                  onChange={(v) => updateInput("currentSavings", v)}
                />
                <SliderRow
                  label="Monthly student income"
                  helper="Allowance, part-time work, or side gigs while on campus."
                  value={inputs.monthlyStudentIncome}
                  min={0}
                  max={3000}
                  step={50}
                  prefix="$"
                  onChange={(v) => updateInput("monthlyStudentIncome", v)}
                />
                <SliderRow
                  label="Monthly student spend"
                  helper="Everything you spend in a normal month on campus."
                  value={inputs.monthlyStudentSpend}
                  min={0}
                  max={3000}
                  step={50}
                  prefix="$"
                  onChange={(v) => updateInput("monthlyStudentSpend", v)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-serif mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                Graduation &amp; Relocation
              </h2>
              <div className="flex flex-col gap-4">
                <SliderRow
                  label="Months until graduation"
                  helper="How many months until you walk the stage?"
                  value={inputs.monthsUntilGraduation}
                  min={1}
                  max={24}
                  step={1}
                  suffix=" mo"
                  onChange={(v) => updateInput("monthsUntilGraduation", v)}
                />
                <SliderRow
                  label="Upfront moving deposit"
                  helper="Security deposit plus first-month rent due at move-in — often before your first paycheck."
                  value={inputs.upfrontMovingDeposit}
                  min={0}
                  max={8000}
                  step={100}
                  prefix="$"
                  onChange={(v) => updateInput("upfrontMovingDeposit", v)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-serif mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Wallet className="h-4 w-4 text-amber-400" />
                First Job Reality
              </h2>
              <div className="flex flex-col gap-4">
                <SliderRow
                  label="Expected starting salary"
                  helper="Your expected gross monthly pay in your first role."
                  value={inputs.expectedStartingSalary}
                  min={0}
                  max={8000}
                  step={100}
                  prefix="$"
                  onChange={(v) => updateInput("expectedStartingSalary", v)}
                />
                <SliderRow
                  label="Job search months"
                  helper="Realistic months hunting before your first paycheck arrives."
                  value={inputs.jobSearchMonths}
                  min={0}
                  max={9}
                  step={1}
                  suffix=" mo"
                  onChange={(v) => updateInput("jobSearchMonths", v)}
                />
                <SliderRow
                  label="Post-grad monthly cost"
                  helper="Rent, food, transport, and bills once you move out — your burn rate."
                  value={inputs.postGradMonthlyCost}
                  min={0}
                  max={6000}
                  step={50}
                  prefix="$"
                  onChange={(v) => updateInput("postGradMonthlyCost", v)}
                />
                <SliderRow
                  label="Monthly loan repayment"
                  helper="Fixed student-loan payment due every month."
                  value={inputs.monthlyLoanRepayment}
                  min={0}
                  max={1500}
                  step={25}
                  prefix="$"
                  onChange={(v) => updateInput("monthlyLoanRepayment", v)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-serif mb-1 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                What-If Crisis Stress-Test
              </h2>
              <p className="mb-4 text-xs text-stone-500">
                Layer worst-case shocks onto your runway.
              </p>
              <div className="flex flex-col gap-2.5">
                <ToggleRow
                  label="Delayed Job Offer"
                  hint="+2 extra months of job hunting"
                  checked={inputs.delayedJobOffer}
                  delta={crisisDeltas.delayedJobOffer}
                  onChange={() => toggleFlag("delayedJobOffer")}
                />
                <ToggleRow
                  label="Starting Salary -20%"
                  hint="First-job pay cut reality check"
                  checked={inputs.salaryCut20Percent}
                  delta={crisisDeltas.salaryCut20Percent}
                  onChange={() => toggleFlag("salaryCut20Percent")}
                />
                <ToggleRow
                  label="Unexpected $1,500 Emergency"
                  hint="Expense 2 months after graduation"
                  checked={inputs.emergencyShock}
                  delta={crisisDeltas.emergencyShock}
                  onChange={() => toggleFlag("emergencyShock")}
                />
              </div>

              <button
                type="button"
                onClick={runAiAnalysis}
                disabled={loading}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-950 border-t-transparent" />
                    Analyzing runway&hellip;
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Run AI Stress-Test &amp; Action Plan
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <VerdictBanner simulation={simulation} currencySymbol={CURRENCY_SYMBOLS[currency]} />

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-serif flex items-center gap-2 text-sm font-semibold text-stone-900">
                  <BrainCircuit className="h-4 w-4 text-emerald-400" />
                  24-Month Cash Runway
                </h2>
                {simulation.zeroCashMonth && (
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700">
                    Cash cliff at {simulation.zeroCashMonth}
                  </span>
                )}
              </div>
              <RunwayChart
                timeline={simulation.timeline}
                comparison={overlayTimeline}
                showComparison={simulatePlan}
                currencySymbol={CURRENCY_SYMBOLS[currency]}
              />
              <button
                type="button"
                onClick={() => setSimulatePlan((prev) => !prev)}
                className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  simulatePlan
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-stone-300 text-stone-700 hover:border-violet-500/50 hover:text-violet-300"
                }`}
              >
                Preview Micro-Action Savings Plan
              </button>
            </div>

            <div>
              <h2 className="font-serif mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                AI Financial Advisor
              </h2>
              <AdvisorPanel
                report={report}
                loading={loading}
                error={error}
                simulatePlan={simulatePlan}
                onToggleSimulatePlan={() => setSimulatePlan((prev) => !prev)}
                onRunAi={runAiAnalysis}
                totalPlanWeeklySaving={totalPlanWeeklySaving}
                currencySymbol={CURRENCY_SYMBOLS[currency]}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
