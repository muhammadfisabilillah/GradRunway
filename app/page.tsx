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
  CURRENCY_RATES,
  CURRENCY_SYMBOLS,
  type Currency,
  formatCurrency,
} from "@/lib/currency";
import {
  STUDENT_PRESETS,
  type AIAdvisorReport,
  type StudentPreset,
} from "@/lib/presets";

type ViewMode = "welcome" | "guide" | "demo" | "wizard" | "dashboard";

const T = {
  en: {
    reset: "Reset to defaults",
    exit: "Exit",
    presets: "Presets:",
    back: "Back to Setup / Scenarios",
    readiness: "Transition Readiness",
    readinessTip: "Composite score (0-100) from runway days, buffer months, and cash-cliff penalties. Below 40 = high risk.",
    burn: "Post-Grad Monthly Burn",
    burnTip: "Your monthly cost after graduation: rent, food, transport, bills + fixed loan repayment.",
    burnSub: "Cost of living + loan repayment",
    lowBal: "Lowest Projected Balance",
    lowBalTip: "The lowest cash balance across all 24 months. Negative = cash cliff, you run out of money.",
    negBal: "Cash cliff — negative balance projected",
    posBal: "Balance stays positive across 24 months",
    survival: "Post-Grad Survival Buffer",
    survivalTip: "How many days your savings last after graduation (after deposit), before your first paycheck arrives.",
    days: "days",
    survivalSub: "Cash at grad covers burn after deposit",
    stressImpact: "Stress-Test Impact",
    vsBaseline: "vs. baseline (no crisis toggles)",
    runway: "Runway",
    low: "Low balance",
    ready: "Readiness",
    campusCash: "Campus Cashflow",
    savings: "Current savings",
    savingsTip: "Cash you could touch today in an emergency.",
    income: "Monthly student income",
    incomeTip: "Allowance, part-time work, or side gigs while on campus.",
    spend: "Monthly student spend",
    spendTip: "Everything you spend in a normal month on campus.",
    budget: "Budget Breakdown",
    incomeLabel: "Income",
    spendLabel: "Spend",
    net: "Net",
    gradLabel: "Graduation & Relocation",
    gradTip: "Months until graduation",
    gradTipSub: "How many months until you walk the stage?",
    deposit: "Upfront moving deposit",
    depositTip: "Security deposit plus first-month rent due at move-in — often before your first paycheck.",
    firstJob: "First Job Reality",
    salary: "Expected starting salary",
    salaryTip: "Your expected gross monthly pay in your first role.",
    jobSearch: "Job search months",
    jobTip: "Realistic months hunting before your first paycheck arrives.",
    postGrad: "Post-grad monthly cost",
    postGradTip: "Rent, food, transport, and bills once you move out — your burn rate.",
    loan: "Monthly loan repayment",
    loanTip: "Fixed student-loan payment due every month.",
    crisis: "What-If Crisis Stress-Test",
    crisisSub: "Layer worst-case shocks onto your runway.",
    delayed: "Delayed Job Offer",
    delayedHint: "+2 extra months of job hunting",
    salaryCut: "Starting Salary -20%",
    salaryCutHint: "First-job pay cut reality check",
    emergency: "Unexpected $1,500 Emergency",
    emergencyHint: "Expense 2 months after graduation",
    runAI: "Run AI Stress-Test & Action Plan",
    analyzing: "Analyzing runway…",
    runwayTitle: "24-Month Cash Runway",
    cashCliff: "Cash cliff at",
    preview: "Preview Micro-Action Savings Plan",
    advisor: "AI Financial Advisor",
    campusPhase: "Campus phase cash flow",
  },
  id: {
    reset: "Reset ke default",
    exit: "Keluar",
    presets: "Preset:",
    back: "Kembali ke Setup / Skenario",
    readiness: "Kesiapan Transisi",
    readinessTip: "Skor komposit (0-100) dari hari runway, bulan buffer, dan penalti cash cliff. Di bawah 40 = risiko tinggi.",
    burn: "Burn Rate Bulanan Pasca-Lulus",
    burnTip: "Biaya bulanan setelah kelulusan: sewa, makan, transportasi, tagihan + cicilan pinjaman tetap.",
    burnSub: "Biaya hidup + cicilan pinjaman",
    lowBal: "Saldo Terendah yang Diproyeksikan",
    lowBalTip: "Saldo kas terendah selama 24 bulan. Negatif = cash cliff, uang habis.",
    negBal: "Cash cliff — saldo negatif diproyeksikan",
    posBal: "Saldo tetap positif selama 24 bulan",
    survival: "Buffer Survival Pasca-Lulus",
    survivalTip: "Berapa hari tabungan bertahan setelah kelulusan (setelah deposit), sebelum gaji pertama cair.",
    days: "hari",
    survivalSub: "Kas saat kelulusan menutupi burn setelah deposit",
    stressImpact: "Dampak Stress-Test",
    vsBaseline: "vs. baseline (tanpa toggle krisis)",
    runway: "Runway",
    low: "Saldo terendah",
    ready: "Kesiapan",
    campusCash: "Arus Kas Kampus",
    savings: "Tabungan saat ini",
    savingsTip: "Uang yang bisa kamu ambil hari ini kalau darurat.",
    income: "Penghasilan bulanan mahasiswa",
    incomeTip: "Uang bulanan, kerja part-time, atau side gig di kampus.",
    spend: "Pengeluaran bulanan mahasiswa",
    spendTip: "Semua yang kamu belanjakan dalam sebulan di kampus.",
    budget: "Rincian Anggaran",
    incomeLabel: "Pemasukan",
    spendLabel: "Pengeluaran",
    net: "Net",
    gradLabel: "Kelulusan & Relokasi",
    gradTip: "Bulan menuju kelulusan",
    gradTipSub: "Berapa bulan lagi sampai kamu wisuda?",
    deposit: "Deposit pindahan di muka",
    depositTip: "Deposit keamanan plus sewa bulan pertama saat pindah — sering sebelum gaji pertama.",
    firstJob: "Realitas Kerja Pertama",
    salary: "Perkiraan gaji awal",
    salaryTip: "Perkiraan gaji kotor bulanan di posisi pertama.",
    jobSearch: "Bulan job search",
    jobTip: "Realistis berapa bulan mencari kerja sebelum gaji pertama cair.",
    postGrad: "Biaya bulanan pasca-lulus",
    postGradTip: "Sewa, makan, transportasi, dan tagihan setelah pindah — burn rate kamu.",
    loan: "Cicilan pinjaman bulanan",
    loanTip: "Pembayaran pinjaman mahasiswa tetap setiap bulan.",
    crisis: "What-If Skenario Krisis",
    crisisSub: "Tambahkan shock terburuk ke runway kamu.",
    delayed: "Penawaran Kerja Tertunda",
    delayedHint: "+2 bulan ekstra job hunting",
    salaryCut: "Gaji Awal -20%",
    salaryCutHint: "Realitas potongan gaji pertama",
    emergency: "Darurat Tak Terduga $1,500",
    emergencyHint: "Pengeluaran 2 bulan setelah kelulusan",
    runAI: "Jalankan AI Stress-Test & Rencana Aksi",
    analyzing: "Menganalisis runway…",
    runwayTitle: "Runway Kas 24 Bulan",
    cashCliff: "Cash cliff di",
    preview: "Preview Rencana Aksi Mikro",
    advisor: "AI Financial Advisor",
    campusPhase: "Arus kas fase kampus",
  },
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
              title={T[lang].reset}
            >
              <RotateCcw className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("welcome")}
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[10px] font-bold text-stone-600 transition hover:border-stone-400"
            >
              {T[lang].exit}
            </button>
          </div>
        )}
      </div>

      {viewMode === "dashboard" && (
        <div className="border-t border-stone-100 bg-white/60">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 py-1.5 sm:px-6">
            <span className="mr-1 text-[9px] font-bold uppercase tracking-wider text-stone-400">
              {T[lang].presets}
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
        lang={lang}
        onLangChange={setLang}
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
        lang={lang}
      />
    );
  }

  if (viewMode === "demo") {
    return (
      <DemoScenarios
        presets={STUDENT_PRESETS}
        onSelect={applyPreset}
        onBack={() => setViewMode("welcome")}
        lang={lang}
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
              {T[lang].stressImpact}
            </span>
            {stressDiff.runwayDiff !== 0 && (
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                stressDiff.runwayDiff < 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                {T[lang].runway} {stressDiff.runwayDiff > 0 ? "+" : ""}{stressDiff.runwayDiff} {T[lang].days}
              </span>
            )}
            {stressDiff.balanceDiff !== 0 && (
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                stressDiff.balanceDiff < 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                {T[lang].low} {stressDiff.balanceDiff > 0 ? "+" : ""}{formatCurrency(stressDiff.balanceDiff, currency)}
              </span>
            )}
            {stressDiff.readinessDiff !== 0 && (
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                stressDiff.readinessDiff < 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                {T[lang].ready} {stressDiff.readinessDiff > 0 ? "+" : ""}{stressDiff.readinessDiff} pts
              </span>
            )}
            <span className="ml-auto text-[10px] text-stone-400">
{T[lang].vsBaseline}
            </span>
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label={T[lang].readiness}
            tooltip={T[lang].readinessTip}
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
            label={T[lang].burn}
            tooltip={T[lang].burnTip}
            icon={Flame}
            iconClass="text-amber-400"
          >
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {formatCurrency(simulation.postGradBurnRate, currency)}
              <span className="text-sm font-medium text-stone-400">/mo</span>
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {T[lang].burnSub}
            </p>
          </KpiCard>

          <KpiCard
            label={T[lang].lowBal}
            tooltip={T[lang].lowBalTip}
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
                ? T[lang].negBal
                : T[lang].posBal
              }
            </p>
          </KpiCard>

          <KpiCard
            label={T[lang].survival}
            tooltip={T[lang].survivalTip}
            icon={LifeBuoy}
            iconClass="text-sky-400"
          >
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {simulation.runwayDaysAfterGrad}
              <span className="text-sm font-medium text-stone-400"> {T[lang].days}</span>
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {T[lang].survivalSub}
            </p>
          </KpiCard>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(340px,420px)_1fr]">
          <section className="flex flex-col gap-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-serif mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Landmark className="h-4 w-4 text-sky-400" />
                {T[lang].campusCash}
              </h2>
              <div className="flex flex-col gap-4">
                <SliderRow
                  label={T[lang].savings}
                  helper={T[lang].savingsTip}
                  value={inputs.currentSavings}
                  min={0}
                  max={20000}
                  step={100}
                  prefix={CURRENCY_SYMBOLS[currency]}
                  onChange={(v) => updateInput("currentSavings", v)}
                />
                <SliderRow
                  label={T[lang].income}
                  helper={T[lang].incomeTip}
                  value={inputs.monthlyStudentIncome}
                  min={0}
                  max={3000}
                  step={50}
                  prefix={CURRENCY_SYMBOLS[currency]}
                  onChange={(v) => updateInput("monthlyStudentIncome", v)}
                />
                <SliderRow
                  label={T[lang].spend}
                  helper={T[lang].spendTip}
                  value={inputs.monthlyStudentSpend}
                  min={0}
                  max={3000}
                  step={50}
                  prefix={CURRENCY_SYMBOLS[currency]}
                  onChange={(v) => updateInput("monthlyStudentSpend", v)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-serif mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Wallet className="h-4 w-4 text-sky-400" />
                {T[lang].budget}
              </h2>
              <div className="flex items-center gap-5">
                <div className="relative h-28 w-28 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e7e5e4" strokeWidth="3.5" />
                    <circle
                      cx="18" cy="18" r="15.5" fill="none"
                      stroke="#10b981" strokeWidth="3.5"
                      strokeDasharray={`${Math.min(100, (inputs.monthlyStudentIncome / Math.max(1, inputs.monthlyStudentIncome)) * 100)} 100`}
                      strokeLinecap="round"
                    />
                    {inputs.monthlyStudentSpend > 0 && (
                      <circle
                        cx="18" cy="18" r="15.5" fill="none"
                        stroke="#f59e0b" strokeWidth="3.5"
                        strokeDasharray={`${Math.min(100, (inputs.monthlyStudentSpend / Math.max(1, inputs.monthlyStudentIncome)) * 100)} 100`}
                        strokeDashoffset={`${-Math.min(100, (inputs.monthlyStudentIncome / Math.max(1, inputs.monthlyStudentIncome)) * 100)} 100`}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-stone-400">
                      {inputs.monthlyStudentIncome > 0
                        ? Math.round((inputs.monthlyStudentSpend / inputs.monthlyStudentIncome) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="text-stone-500">{T[lang].incomeLabel}</span>
                    <span className="ml-auto font-bold text-stone-900">{formatCurrency(inputs.monthlyStudentIncome, currency)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="text-stone-500">{T[lang].spendLabel}</span>
                    <span className="ml-auto font-bold text-stone-900">{formatCurrency(inputs.monthlyStudentSpend, currency)}</span>
                  </div>
                  <div className="flex items-center gap-2 border-t border-stone-100 pt-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
                    <span className="text-stone-500">{T[lang].net}</span>
                    <span className={`ml-auto font-bold ${inputs.monthlyStudentIncome - inputs.monthlyStudentSpend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatCurrency(inputs.monthlyStudentIncome - inputs.monthlyStudentSpend, currency)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[10px] text-stone-400">
                {T[lang].campusPhase}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-serif mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                {T[lang].gradLabel}
              </h2>
              <div className="flex flex-col gap-4">
                <SliderRow
                  label={T[lang].gradTip}
                  helper={T[lang].gradTipSub}
                  value={inputs.monthsUntilGraduation}
                  min={1}
                  max={24}
                  step={1}
                  suffix=" mo"
                  onChange={(v) => updateInput("monthsUntilGraduation", v)}
                />
                <SliderRow
                  label={T[lang].deposit}
                  helper={T[lang].depositTip}
                  value={inputs.upfrontMovingDeposit}
                  min={0}
                  max={8000}
                  step={100}
                  prefix={CURRENCY_SYMBOLS[currency]}
                  onChange={(v) => updateInput("upfrontMovingDeposit", v)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-serif mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Wallet className="h-4 w-4 text-amber-400" />
                {T[lang].firstJob}
              </h2>
              <div className="flex flex-col gap-4">
                <SliderRow
                  label={T[lang].salary}
                  helper={T[lang].salaryTip}
                  value={inputs.expectedStartingSalary}
                  min={0}
                  max={8000}
                  step={100}
                  prefix={CURRENCY_SYMBOLS[currency]}
                  onChange={(v) => updateInput("expectedStartingSalary", v)}
                />
                <SliderRow
                  label={T[lang].jobSearch}
                  helper={T[lang].jobTip}
                  value={inputs.jobSearchMonths}
                  min={0}
                  max={9}
                  step={1}
                  suffix=" mo"
                  onChange={(v) => updateInput("jobSearchMonths", v)}
                />
                <SliderRow
                  label={T[lang].postGrad}
                  helper={T[lang].postGradTip}
                  value={inputs.postGradMonthlyCost}
                  min={0}
                  max={6000}
                  step={50}
                  prefix={CURRENCY_SYMBOLS[currency]}
                  onChange={(v) => updateInput("postGradMonthlyCost", v)}
                />
                <SliderRow
                  label={T[lang].loan}
                  helper={T[lang].loanTip}
                  value={inputs.monthlyLoanRepayment}
                  min={0}
                  max={1500}
                  step={25}
                  prefix={CURRENCY_SYMBOLS[currency]}
                  onChange={(v) => updateInput("monthlyLoanRepayment", v)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-serif mb-1 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                {T[lang].crisis}
              </h2>
              <p className="mb-4 text-xs text-stone-500">
{T[lang].crisisSub}
              </p>
              <div className="flex flex-col gap-2.5">
                <ToggleRow
                  label={T[lang].delayed}
                  hint={T[lang].delayedHint}
                  checked={inputs.delayedJobOffer}
                  delta={crisisDeltas.delayedJobOffer}
                  onChange={() => toggleFlag("delayedJobOffer")}
                />
                <ToggleRow
                  label={T[lang].salaryCut}
                  hint={T[lang].salaryCutHint}
                  checked={inputs.salaryCut20Percent}
                  delta={crisisDeltas.salaryCut20Percent}
                  onChange={() => toggleFlag("salaryCut20Percent")}
                />
                <ToggleRow
                  label={T[lang].emergency}
                  hint={T[lang].emergencyHint}
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
                    {T[lang].analyzing}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {T[lang].runAI}
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <VerdictBanner simulation={simulation} currency={currency} />

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-serif flex items-center gap-2 text-sm font-semibold text-stone-900">
                  <BrainCircuit className="h-4 w-4 text-emerald-400" />
                   {T[lang].runwayTitle}
                </h2>
                {simulation.zeroCashMonth && (
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700">
                    {T[lang].cashCliff} {simulation.zeroCashMonth}
                  </span>
                )}
              </div>
              <RunwayChart
                timeline={simulation.timeline}
                comparison={overlayTimeline}
                showComparison={simulatePlan}
                currency={currency}
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
                {T[lang].preview}
              </button>
            </div>

            <div>
              <h2 className="font-serif mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                {T[lang].advisor}
              </h2>
              <AdvisorPanel
                report={report}
                loading={loading}
                error={error}
                simulatePlan={simulatePlan}
                onToggleSimulatePlan={() => setSimulatePlan((prev) => !prev)}
                onRunAi={runAiAnalysis}
                totalPlanWeeklySaving={totalPlanWeeklySaving}
                currency={currency}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
