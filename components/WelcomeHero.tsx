"use client";

import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Globe,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

interface WelcomeHeroProps {
  onStartGuided: () => void;
  onExploreDemos: () => void;
}

type Lang = "en" | "id";

const content = {
  en: {
    badge: "SMBP FinHack 2026 · Finance Track",
    title: "Know your cash runway",
    titleAccent: "before graduation does.",
    subtitle:
      "GradRunway simulates 24 months of your finances — from campus through job hunt to first paycheck. Toggle crisis scenarios, see exactly when you run out of cash, and get a micro-action plan that adds real runway days.",
    stats: [
      { value: "24", unit: "months", label: "Cash simulation" },
      { value: "4", unit: "KPIs", label: "Live risk metrics" },
      { value: "3", unit: "shocks", label: "Crisis stress-tests" },
      { value: "0", unit: "login", label: "No bank data needed" },
    ],
    features: [
      {
        icon: BarChart3,
        title: "24-Month Runway Chart",
        text: "See your balance month-by-month across Campus, Job Hunt, and Employed phases. The $0 cliff line shows exactly when cash runs out.",
      },
      {
        icon: ShieldCheck,
        title: "Crisis Stress-Tests",
        text: "Toggle a delayed job offer, 20% salary cut, or $1,500 emergency. See runway days lost instantly with delta badges.",
      },
      {
        icon: TrendingUp,
        title: "Micro-Action Savings Plan",
        text: "Get 3 specific actions with weekly savings targets. Preview the savings curve overlay to see how many extra days you gain.",
      },
      {
        icon: Globe,
        title: "4 Student Personas",
        text: "Metro HK, Tech Loan, Side Hustler, and PolyU Local — each with pre-computed reports. Zero API calls for instant demos.",
      },
    ],
    ctaPrimary: "Start Guided Setup",
    ctaSecondary: "Explore Demo Scenarios",
    footerNote: "No login. No bank data. Your numbers stay in your browser.",
  },
  id: {
    badge: "SMBP FinHack 2026 · Finance Track",
    title: "Kenali cash runway-mu",
    titleAccent: "sebelum kelulusan tiba.",
    subtitle:
      "GradRunway mensimulasikan 24 bulan keuanganmu — dari masa kuliah, job hunt, hingga gaji pertama. Toggle skenario krisis, lihat kapan kamu kehabisan uang, dan dapatkan rencana aksi kecil yang menambah hari runway.",
    stats: [
      { value: "24", unit: "bulan", label: "Simulasi kas" },
      { value: "4", unit: "KPI", label: "Metrik risiko" },
      { value: "3", unit: "shock", label: "Skenario krisis" },
      { value: "0", unit: "login", label: "Tanpa data bank" },
    ],
    features: [
      {
        icon: BarChart3,
        title: "Grafik Runway 24 Bulan",
        text: "Lihat saldo per bulan dari fase Kampus, Job Hunt, dan Employed. Garis $0 menunjukkan kapan uang habis.",
      },
      {
        icon: ShieldCheck,
        title: "Stress-Test Krisis",
        text: "Toggle delayed job offer, potongan gaji 20%, atau darurat $1,500. Lihat langsung berapa hari runway yang hilang.",
      },
      {
        icon: TrendingUp,
        title: "Rencana Aksi Mikro",
        text: "Dapatkan 3 aksi spesifik dengan target saving mingguan. Preview kurva saving untuk lihat tambahan hari runway.",
      },
      {
        icon: Globe,
        title: "4 Persona Mahasiswa",
        text: "Metro HK, Tech Loan, Side Hustler, dan PolyU Local — masing-masing dengan laporan pre-computed. Zero API call.",
      },
    ],
    ctaPrimary: "Mulai Setup 3 Langkah",
    ctaSecondary: "Lihat Skenario Demo",
    footerNote: "Tanpa login. Tanpa data bank. Angka kamu tetap di browser.",
  },
};

const miniChartMonths = ["M-5", "M-4", "M-3", "M-2", "M-1", "Grad", "M+1", "M+2", "M+3", "M+4", "M+5", "M+6"];
const miniBalances = [3200, 3300, 3400, 3500, 3600, 3700, 800, -200, -1200, 400, 1400, 2400];

function MiniChart() {
  const maxVal = 4000;
  const minVal = -1500;
  const range = maxVal - minVal;
  const zeroY = ((maxVal - 0) / range) * 100;

  const points = miniBalances.map((val, i) => {
    const x = (i / (miniBalances.length - 1)) * 100;
    const y = ((maxVal - val) / range) * 100;
    return { x, y, val };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `M0,100 ${linePath.replace("M", "L")} L100,100 Z`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            24-Month Runway Preview
          </p>
          <p className="mt-0.5 text-xs text-stone-500">Sample: Metro HK persona</p>
        </div>
        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-600">
          CRITICAL
        </span>
      </div>

      <div className="relative h-32">
        <div
          className="absolute left-0 right-0 border-t border-dashed border-rose-300"
          style={{ top: `${zeroY}%` }}
        >
          <span className="absolute right-0 -top-4 text-[8px] font-bold text-rose-400">$0 cliff</span>
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="miniArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#miniArea)" />
          <path d={linePath} fill="none" stroke="#10b981" strokeWidth="0.8" />
          <circle
            cx={points[7].x}
            cy={points[7].y}
            r="1.5"
            fill="#f43f5e"
          />
        </svg>
      </div>

      <div className="mt-2 flex justify-between">
        {miniChartMonths.map((m) => (
          <span key={m} className="text-[8px] font-medium text-stone-400">{m}</span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-stone-50 p-2 text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Burn</p>
          <p className="font-serif text-sm font-bold text-stone-900">$2,150<span className="text-[10px] text-stone-400">/mo</span></p>
        </div>
        <div className="rounded-lg bg-rose-50 p-2 text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-rose-400">Low</p>
          <p className="font-serif text-sm font-bold text-rose-600">-$1,200</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-2 text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500">Runway</p>
          <p className="font-serif text-sm font-bold text-amber-700">12<span className="text-[10px] text-amber-400"> days</span></p>
        </div>
      </div>
    </div>
  );
}

export default function WelcomeHero({
  onStartGuided,
  onExploreDemos,
}: WelcomeHeroProps) {
  const [lang, setLang] = useState<Lang>("en");
  const t = content[lang];

  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900">
              <Wallet className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-serif text-lg font-bold tracking-tight">GradRunway</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-stone-300 bg-white px-1">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                  lang === "en"
                    ? "bg-stone-900 text-white"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("id")}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                  lang === "id"
                    ? "bg-stone-900 text-white"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                ID
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <span className="inline-block rounded-full border border-stone-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-600">
              {t.badge}
            </span>

            <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              {t.title}
              <span className="block text-stone-400">{t.titleAccent}</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-500 sm:text-base">
              {t.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onStartGuided}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-stone-700"
              >
                <Sparkles className="h-4 w-4" />
                {t.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onExploreDemos}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-6 py-3.5 text-sm font-bold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              >
                {t.ctaSecondary}
              </button>
            </div>

            <p className="mt-4 text-[11px] text-stone-400">{t.footerNote}</p>
          </div>

          <MiniChart />
        </div>

        <div className="mt-20">
          <h2 className="font-serif text-xl font-bold tracking-tight text-stone-900">
            {lang === "en" ? "What makes GradRunway different" : "Apa yang membuat GradRunway beda"}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white p-5 transition hover:border-stone-300 hover:shadow-md"
              >
                <div className={`absolute top-0 left-0 h-1 w-full ${
                  i === 0 ? "bg-emerald-400" : i === 1 ? "bg-amber-400" : i === 2 ? "bg-violet-400" : "bg-sky-400"
                }`} />
                <feature.icon className={`h-5 w-5 ${
                  i === 0 ? "text-emerald-600" : i === 1 ? "text-amber-600" : i === 2 ? "text-violet-600" : "text-sky-600"
                }`} />
                <h3 className="mt-3 text-sm font-bold text-stone-900">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-stone-500">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-stone-900 p-8 text-center sm:p-12">
          <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
            {lang === "en"
              ? "Your first paycheck is months away. Start planning today."
              : "Gaji pertamamu masih bulan lagi. Mulai rencana sekarang."}
          </h2>
          <p className="mt-3 text-sm text-stone-400">
            {lang === "en"
              ? "Free. No signup. Works entirely in your browser."
              : "Gratis. Tanpa daftar. Berjalan sepenuhnya di browser kamu."}
          </p>
          <button
            type="button"
            onClick={onStartGuided}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-stone-900 transition hover:bg-stone-100"
          >
            <Zap className="h-4 w-4" />
            {t.ctaPrimary}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}