import { NextResponse } from "next/server";
import type { FinanceInputs, SimulationResult, MonthlyPoint } from "@/lib/financeEngine";
import type { AIAdvisorReport, HiddenCost, MicroAction } from "@/lib/presets";

export const runtime = "nodejs";

interface AnalyzeRequestBody {
  inputs: FinanceInputs;
  simulation: SimulationResult;
  lang?: "en" | "id";
}

const PLACEHOLDER_KEYS = new Set([
  "",
  "paste_your_free_api_key_here",
]);

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidInputs(value: unknown): value is FinanceInputs {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const numericKeys: (keyof FinanceInputs)[] = [
    "currentSavings",
    "monthlyStudentIncome",
    "monthlyStudentSpend",
    "monthsUntilGraduation",
    "expectedStartingSalary",
    "jobSearchMonths",
    "postGradMonthlyCost",
    "upfrontMovingDeposit",
    "monthlyLoanRepayment",
  ];
  for (const key of numericKeys) {
    if (!isFiniteNumber(v[key])) return false;
  }
  const boolKeys: (keyof FinanceInputs)[] = [
    "delayedJobOffer",
    "salaryCut20Percent",
    "emergencyShock",
  ];
  for (const key of boolKeys) {
    if (typeof v[key] !== "boolean") return false;
  }
  return true;
}

function isValidSimulation(value: unknown): value is SimulationResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.timeline) &&
    v.timeline.length > 0 &&
    isFiniteNumber(v.lowestBalance) &&
    isFiniteNumber(v.postGradBurnRate) &&
    isFiniteNumber(v.runwayDaysAfterGrad) &&
    isFiniteNumber(v.readinessScore) &&
    (v.zeroCashMonth === null || typeof v.zeroCashMonth === "string") &&
    typeof v.riskLevel === "string"
  );
}

function extractJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in model output");
    return JSON.parse(match[0]);
  }
}

function safeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function sanitizeReport(raw: unknown): AIAdvisorReport {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<
    string,
    unknown
  >;

  const hiddenRaw = Array.isArray(obj.hiddenCostsAlert)
    ? obj.hiddenCostsAlert
    : [];
  const actionsRaw = Array.isArray(obj.microActionPlan) ? obj.microActionPlan : [];

  const hiddenCostsAlert: HiddenCost[] = hiddenRaw.slice(0, 3).map((item) => {
    const h = (typeof item === "object" && item !== null ? item : {}) as Record<
      string,
      unknown
    >;
    return {
      title: typeof h.title === "string" ? h.title : "Hidden cost",
      estimatedCost: safeNumber(h.estimatedCost, 0),
      reason: typeof h.reason === "string" ? h.reason : "",
    };
  });

  const microActionPlan: MicroAction[] = actionsRaw.slice(0, 3).map((item) => {
    const a = (typeof item === "object" && item !== null ? item : {}) as Record<
      string,
      unknown
    >;
    return {
      action: typeof a.action === "string" ? a.action : "Micro action",
      weeklySaving: safeNumber(a.weeklySaving, 0),
      extraRunwayDays: safeNumber(a.extraRunwayDays, 0),
      impactSummary: typeof a.impactSummary === "string" ? a.impactSummary : "",
    };
  });

  if (hiddenCostsAlert.length < 3 || microActionPlan.length < 3) {
    throw new Error("Model response missing required report items");
  }

  return {
    executiveSummary:
      typeof obj.executiveSummary === "string" && obj.executiveSummary.length > 0
        ? obj.executiveSummary
        : "Cash runway analysis complete.",
    hiddenCostsAlert,
    microActionPlan,
    source: "llm",
  };
}

function runwayDaysFromWeekly(
  weeklySaving: number,
  postGradBurnRate: number,
): number {
  if (postGradBurnRate <= 0) return 0;
  return Math.round(((weeklySaving * 4.33) / postGradBurnRate) * 30);
}

const EN_TEXTS = {
  riskCritical: "critical",
  riskTight: "tight",
  riskHealthy: "healthy",
  balanceZeroBy: "Your balance hits $0 by",
  balanceNeverZero: "Your balance never reaches $0 across the 24-month window.",
  transitionIs: "Your transition is",
  postGradBurn: "post-grad burn runs about",
  and: "and",
  projectedLow: "your projected low is",
  leaving: "leaving roughly",
  daysOfRunway: "days of runway after graduation.",
  hiddenDeposit: "Relocation deposit & first-month setup",
  depositNote: (amt: string) => `Your upfront moving deposit of $${amt} is drained before your first paycheck, shrinking the cash you actually have to survive on.`,
  depositImpact: "",
  hiddenJobHunt: "Extended job-search burn",
  jobHuntNote: (months: number, burn: string) => `A ${months}-month job hunt at $${burn}/mo of fixed costs adds up before any salary arrives.`,
  jobHuntImpact: "",
  hiddenLoan: "Fixed loan repayment squeeze",
  loanNote: (amt: string) => `Your $${amt}/mo loan repayment is committed cash that keeps draining during lean months.`,
  loanImpact: "",
  action1: "Bank one extra paid task or shift per week before graduation",
  action1Impact: (weekly: number, burn: string) => `Saving $${weekly}/week adds real buffer against your $${burn}/mo post-grad burn.`,
  action2: "Trim one subscription and one delivery order weekly",
  action2Impact: "Cutting low-value recurring costs directly extends your runway without lifestyle collapse.",
  action3: "Move part of the upfront deposit into a separate buffer account",
  action3Impact: (amt: string) => `Spreading your $${amt} deposit cost protects liquidity during the highest-risk months.`,
};

const ID_TEXTS = {
  riskCritical: "kritis",
  riskTight: "terbatas",
  riskHealthy: "sehat",
  balanceZeroBy: "Saldo Anda hit $0 pada",
  balanceNeverZero: "Saldo Anda tidak pernah mencapai $0 sepanjang 24 bulan.",
  transitionIs: "Transisi Anda",
  postGradBurn: "konsumsi pascapencuci",
  and: "dan",
  projectedLow: "saldo terendah proyeksi Anda",
  leaving: "memberikan ruang",
  daysOfRunway: "hari runway pascapencuci.",
  hiddenDeposit: "Deposit pindahan & pemasangan awal",
  depositNote: (amt: string) => `Deposit pindahan Anda $${amt} dihabiskan sebelum gaji pertama, mengurangi dana yang Anda pegang untuk bertahan.`,
  depositImpact: "",
  hiddenJobHunt: "Eksporasi lama mencari kerja",
  jobHuntNote: (months: number, burn: string) => `Dalam ${months} bulan mencari kerja, biaya tetap $${burn}/mo menambah beban sebelum gaji datang.`,
  jobHuntImpact: "",
  hiddenLoan: "Cicilan pinjaman tetap",
  loanNote: (amt: string) => `Cicilan pinjaman $${amt}/mo yang berbayar setiap bulan adalah kas tetap yang terus berkurang.`,
  loanImpact: "",
  action1: "Cadangan uang dari kegiatan baru setiap minggu sebelum kelulusan",
  action1Impact: (weekly: number, burn: string) => `Menabung $${weekly}/minggu memberi ruang buffer untuk lawan biaya pascapencuci $${burn}/mo.`,
  action2: "Kurangi satu berlangganan dan satu barang hemat sekali seminggu",
  action2Impact: "Menurunkan biaya berulang yang tidak begitu penting akan memanjangkan runway secara signifikan.",
  action3: "Bagi bagian deposit awal jadi dana buffer terpisah",
  action3Impact: (amt: string) => `Memanfaatkan $${amt} deposit untuk melindungi dana di bulan beban tertinggi.`,
};

function buildFallbackReport(
  inputs: FinanceInputs,
  simulation: SimulationResult,
  lang: "en" | "id" = "en",
): AIAdvisorReport {
  const t = lang === "id" ? ID_TEXTS : EN_TEXTS;
  const burn = simulation.postGradBurnRate;
  const zero = simulation.zeroCashMonth;
  const low = simulation.lowestBalance;
  const runway = simulation.runwayDaysAfterGrad;
  const deposit = inputs.upfrontMovingDeposit;

  const timeline: MonthlyPoint[] = simulation.timeline;
  const jobHuntMonths = timeline.filter((p) => p.phase === "Job Hunt").length;

  const riskPhrase =
    simulation.riskLevel === "CRITICAL"
      ? t.riskCritical
      : simulation.riskLevel === "MODERATE"
        ? t.riskTight
        : t.riskHealthy;

  const zeroPhrase = zero
    ? `${t.balanceZeroBy} ${zero}.`
    : t.balanceNeverZero;

  const executiveSummary = `${t.transitionIs} ${riskPhrase}: ${t.postGradBurn} about $${burn.toFixed(0)}/mo ${t.and} ${t.projectedLow} $${low.toFixed(0)}, ${t.leaving} roughly ${runway} ${t.daysOfRunway}. ${zeroPhrase}`;

  const hiddenCostsAlert: HiddenCost[] = [
    {
      title: t.hiddenDeposit,
      estimatedCost: deposit,
      reason: `${t.depositNote(deposit.toFixed(0))} ${t.depositImpact}`,
    },
    {
      title: t.hiddenJobHunt,
      estimatedCost: Math.round(burn * Math.max(1, jobHuntMonths)),
      reason: `${t.jobHuntNote(jobHuntMonths, burn.toFixed(0))} ${t.jobHuntImpact}`,
    },
    {
      title: t.hiddenLoan,
      estimatedCost: Math.round(inputs.monthlyLoanRepayment * 12),
      reason: `${t.loanNote(inputs.monthlyLoanRepayment.toFixed(0))} ${t.loanImpact}`,
    },
  ];

  const baseActionWeekly = Math.max(20, Math.round(burn * 0.02));

  const microActionPlan: MicroAction[] = [
    {
      action: t.action1,
      weeklySaving: baseActionWeekly,
      extraRunwayDays: runwayDaysFromWeekly(baseActionWeekly, burn),
      impactSummary: t.action1Impact(baseActionWeekly, burn.toFixed(0)),
    },
    {
      action: t.action2,
      weeklySaving: Math.round(baseActionWeekly * 0.8),
      extraRunwayDays: runwayDaysFromWeekly(Math.round(baseActionWeekly * 0.8), burn),
      impactSummary: t.action2Impact,
    },
    {
      action: t.action3,
      weeklySaving: Math.round(deposit / 12),
      extraRunwayDays: runwayDaysFromWeekly(Math.round(deposit / 12), burn),
      impactSummary: t.action3Impact(deposit.toFixed(0)),
    },
  ];

  return {
    executiveSummary,
    hiddenCostsAlert,
    microActionPlan,
    source: "smart-fallback",
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { inputs, simulation, lang = "en" } = (body ?? {}) as Partial<AnalyzeRequestBody>;

  if (!isValidInputs(inputs) || !isValidSimulation(simulation)) {
    return NextResponse.json(
      { error: "Invalid inputs or simulation payload" },
      { status: 400 },
    );
  }

  const apiKey = process.env.AI_API_KEY ?? "";
  const baseUrl = process.env.AI_BASE_URL ?? "";
  const model = process.env.AI_MODEL ?? "gemini-2.5-flash";

  const hasValidKey =
    !PLACEHOLDER_KEYS.has(apiKey.trim()) && apiKey.trim().length > 0;

  if (!hasValidKey || baseUrl.trim().length === 0) {
    return NextResponse.json(buildFallbackReport(inputs, simulation, lang), {
      status: 200,
    });
  }

  const prompt = `You are a pragmatic student financial advisor. Analyze this graduate's cash runway and respond with ONLY a JSON object.

Language requirement: Write the report in ${lang === "id" ? "Indonesian" : "English"}.

INPUTS:
${JSON.stringify(inputs)}

SIMULATION METRICS:
${JSON.stringify({
    zeroCashMonth: simulation.zeroCashMonth,
    lowestBalance: simulation.lowestBalance,
    postGradBurnRate: simulation.postGradBurnRate,
    runwayDaysAfterGrad: simulation.runwayDaysAfterGrad,
    readinessScore: simulation.readinessScore,
    riskLevel: simulation.riskLevel,
  })}

Return JSON with this exact shape:
{
  "executiveSummary": "two sharp, pragmatic sentences",
  "hiddenCostsAlert": [{"title": "string", "estimatedCost": number, "reason": "string"}],
  "microActionPlan": [{"action": "string", "weeklySaving": number, "extraRunwayDays": number, "impactSummary": "string"}]
}
hiddenCostsAlert must have exactly 3 items. microActionPlan must have exactly 3 items. Use the user's exact numbers.`;

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a concise, pragmatic student finance advisor. Always respond with valid JSON only. Write reports in ${lang === "id" ? "Indonesian" : "English"}.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Upstream status ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty model content");

    const parsed = extractJson(content);
    const report = sanitizeReport(parsed);

    return NextResponse.json(report, { status: 200 });
  } catch {
    return NextResponse.json(buildFallbackReport(inputs, simulation, lang), {
      status: 200,
    });
  }
}
