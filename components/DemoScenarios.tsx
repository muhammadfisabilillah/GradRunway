"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  PiggyBank,
  Wallet,
} from "lucide-react";
import type { StudentPreset } from "@/lib/presets";
import { type Currency, formatCurrency } from "@/lib/currency";

interface DemoScenariosProps {
  presets: StudentPreset[];
  onSelect: (preset: StudentPreset) => void;
  onBack: () => void;
  lang?: "en" | "id";
}

const personaAccents: Record<string, string> = {
  "metro-hk": "from-rose-400 to-orange-400",
  "tech-loan": "from-sky-400 to-indigo-400",
  "side-hustler": "from-emerald-400 to-teal-400",
  "polyu-local": "from-violet-400 to-purple-400",
};

const personaIcons: Record<string, typeof Building2> = {
  "metro-hk": Building2,
  "tech-loan": GraduationCap,
  "side-hustler": PiggyBank,
  "polyu-local": GraduationCap,
};

const personaStories: Record<string, string> = {
  "metro-hk":
    "Landed a city job but faces a $2,800 security deposit and loses campus meal and transit subsidies. High fixed costs hit before the first paycheck.",
  "tech-loan":
    "Strong starting salary, but a $350/mo loan repayment locks in a fixed drain exactly when cash is tightest during the job hunt.",
  "side-hustler":
    "Real freelance income, thin savings, and a longer 4-month job hunt. Bridge work keeps cash flowing, but taxes and gaps bite.",
  "polyu-local":
    "HK PolyU grad: HKD 15k/month salary, HKD 10k rental deposit (2+1), HKD 2k/mo loan. The 2-month HK job hunt + highest rents in Asia = tightest runway.",
};

const t = {
  en: {
    back: "Back to welcome",
    title: "Instant Demo Scenarios",
    subtitle: "Pick a student story to load a fully simulated 24-month runway and a pre-computed AI advisor report — zero setup, zero API calls. Judges: this is the fastest path to the demo.",
    savings: "savings",
    salary: "starting salary",
    load: "Load this scenario",
  },
  id: {
    back: "Kembali ke awal",
    title: "Skenario Demo Instan",
    subtitle: "Pilih cerita mahasiswa untuk memuat runway 24 bulan dan laporan AI advisor — tanpa setup, tanpa API call. Juri: ini cara tercepat untuk demo.",
    savings: "tabungan",
    salary: "gaji awal",
    load: "Muat skenario ini",
  },
};

export default function DemoScenarios({
  presets,
  onSelect,
  onBack,
  lang = "en",
}: DemoScenariosProps) {
  const tx = t[lang];
  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-900">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-stone-500 transition hover:text-emerald-300"
        >
          <ArrowLeft className="h-4 w-4" />
          {tx.back}
        </button>

        <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
          {tx.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">
          {tx.subtitle}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {presets.map((preset) => {
            const Icon = personaIcons[preset.id] ?? Wallet;
            const curr = preset.currency as Currency;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelect(preset)}
                className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 text-left transition hover:border-emerald-500/50 hover:bg-stone-50"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${
                      personaAccents[preset.id] ?? "from-emerald-400 to-sky-500"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-stone-950" />
                  </span>
                  <span className="text-sm font-bold text-stone-900">
                    {preset.label}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-stone-500">
                  {personaStories[preset.id] ?? preset.blurb}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-stone-500">
                  <span className="rounded-lg bg-stone-100 px-2.5 py-2">
                    <span className="block font-semibold text-stone-800">
                      {formatCurrency(preset.inputs.currentSavings, curr)}
                    </span>
                    {tx.savings}
                  </span>
                  <span className="rounded-lg bg-stone-100 px-2.5 py-2">
                    <span className="block font-semibold text-stone-800">
                      {formatCurrency(preset.inputs.expectedStartingSalary, curr)}
                    </span>
                    {tx.salary}
                  </span>
                </div>

                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 transition group-hover:gap-2.5">
                  {tx.load}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
