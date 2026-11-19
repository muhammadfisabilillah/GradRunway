import type { FinanceInputs } from "@/lib/financeEngine";
import { simulateTimeline } from "@/lib/financeEngine";

export interface HiddenCost {
  title: string;
  estimatedCost: number;
  reason: string;
}

export interface MicroAction {
  action: string;
  weeklySaving: number;
  extraRunwayDays: number;
  impactSummary: string;
}

export interface AIAdvisorReport {
  executiveSummary: string;
  hiddenCostsAlert: HiddenCost[];
  microActionPlan: MicroAction[];
  source: "llm" | "smart-fallback";
}

export type Currency = "USD" | "HKD" | "IDR";

export interface StudentPreset {
  id: string;
  label: string;
  blurb: string;
  currency: Currency;
  inputs: FinanceInputs;
  cachedReport: AIAdvisorReport;
}

function weeklySavingToRunwayDays(
  weeklySaving: number,
  postGradBurnRate: number,
): number {
  if (postGradBurnRate <= 0) return 0;
  const monthlySaving = weeklySaving * 4.33;
  return Math.round((monthlySaving / postGradBurnRate) * 30);
}

const metroHkInputs: FinanceInputs = {
  currentSavings: 3500,
  monthlyStudentIncome: 650,
  monthlyStudentSpend: 550,
  monthsUntilGraduation: 6,
  expectedStartingSalary: 2600,
  jobSearchMonths: 3,
  postGradMonthlyCost: 1950,
  upfrontMovingDeposit: 2800,
  monthlyLoanRepayment: 200,
  delayedJobOffer: false,
  salaryCut20Percent: false,
  emergencyShock: false,
};

const techLoanInputs: FinanceInputs = {
  currentSavings: 4200,
  monthlyStudentIncome: 700,
  monthlyStudentSpend: 560,
  monthsUntilGraduation: 5,
  expectedStartingSalary: 3400,
  jobSearchMonths: 2,
  postGradMonthlyCost: 1600,
  upfrontMovingDeposit: 1800,
  monthlyLoanRepayment: 350,
  delayedJobOffer: false,
  salaryCut20Percent: false,
  emergencyShock: false,
};

const sideHustlerInputs: FinanceInputs = {
  currentSavings: 1800,
  monthlyStudentIncome: 900,
  monthlyStudentSpend: 600,
  monthsUntilGraduation: 7,
  expectedStartingSalary: 2300,
  jobSearchMonths: 4,
  postGradMonthlyCost: 1350,
  upfrontMovingDeposit: 1200,
  monthlyLoanRepayment: 150,
  delayedJobOffer: false,
  salaryCut20Percent: false,
  emergencyShock: false,
};

function buildMetroHkReport(): AIAdvisorReport {
  const sim = simulateTimeline(metroHkInputs);
  return {
    executiveSummary: `Your metro move burns through high fixed costs before your first paycheck lands. With a security deposit near $2,800 and burn of $${sim.postGradBurnRate}/mo, you have only ${sim.runwayDaysAfterGrad} days of cash runway after graduation and a projected low of $${sim.lowestBalance}.`,
    hiddenCostsAlert: [
      {
        title: "Security deposit + first/last month rent",
        estimatedCost: 2800,
        reason:
          "Metro landlords often require a deposit plus advance rent before you are employed, draining cash in month one of the job hunt.",
      },
      {
        title: "Loss of campus meal & transit subsidies",
        estimatedCost: 340,
        reason:
          "Student transit passes and subsidized dining vanish at graduation, silently raising your monthly cost of living.",
      },
      {
        title: "Interview & networking travel",
        estimatedCost: 260,
        reason:
          "Multiple on-site interviews across the city add transit, attire, and meal costs before any salary arrives.",
      },
    ],
    microActionPlan: [
      {
        action: "Negotiate a split security deposit or deposit-waiver plan",
        weeklySaving: 30,
        extraRunwayDays: weeklySavingToRunwayDays(30, sim.postGradBurnRate),
        impactSummary:
          "Freeing part of the deposit over two installments keeps $1,400 liquid during your highest-risk month.",
      },
      {
        action: "Switch to a subsidized transit pass + packed lunches",
        weeklySaving: 45,
        extraRunwayDays: weeklySavingToRunwayDays(45, sim.postGradBurnRate),
        impactSummary:
          "Replacing daily takeout and single-ride fares with a monthly pass reclaims meaningful runway.",
      },
      {
        action: "Book one paid gig or tutoring slot per week",
        weeklySaving: 40,
        extraRunwayDays: weeklySavingToRunwayDays(40, sim.postGradBurnRate),
        impactSummary:
          "Bridge income continues while you hunt and offsets the job-search-phase burn rate.",
      },
    ],
    source: "smart-fallback",
  };
}

function buildTechLoanReport(): AIAdvisorReport {
  const sim = simulateTimeline(techLoanInputs);
  return {
    executiveSummary: `Your strong starting salary gives headroom, but the $${techLoanInputs.monthlyLoanRepayment}/mo loan repayment locks in a fixed drain during the job hunt. You project a low of $${sim.lowestBalance} and ${sim.runwayDaysAfterGrad} days of post-grad runway.`,
    hiddenCostsAlert: [
      {
        title: "Loan grace period ending",
        estimatedCost: 350,
        reason:
          "Federal loan grace windows typically close six months post-graduation, adding repayment exactly when cash is tightest.",
      },
      {
        title: "Relocation deposit & utility activation",
        estimatedCost: 1800,
        reason:
          "Moving deposit plus utility setup fees and first-month bills hit before your first salary cycle.",
      },
      {
        title: "Tech onboarding gear gap",
        estimatedCost: 300,
        reason:
          "Cold-start software, a monitor for remote hires, or [reimbursement] lags can create upfront out-of-pocket costs.",
      },
    ],
    microActionPlan: [
      {
        action: "Apply for income-driven repayment before the grace period ends",
        weeklySaving: 25,
        extraRunwayDays: weeklySavingToRunwayDays(25, sim.postGradBurnRate),
        impactSummary:
          "Lowering the loan payment in lean months protects your runway right at graduation.",
      },
      {
        action: "Use a signing bonus to pre-fund three months of loan payments",
        weeklySaving: 35,
        extraRunwayDays: weeklySavingToRunwayDays(35, sim.postGradBurnRate),
        impactSummary:
          "Pre-funding fixed debt converts one lump into steady runway protection.",
      },
      {
        action: "Set up a one-month buffer fund from campus-side freelance work",
        weeklySaving: 50,
        extraRunwayDays: weeklySavingToRunwayDays(50, sim.postGradBurnRate),
        impactSummary:
          "A small recurring buffer closes the gap between graduation and your first paycheck.",
      },
    ],
    source: "smart-fallback",
  };
}

function buildSideHustlerReport(): AIAdvisorReport {
  const sim = simulateTimeline(sideHustlerInputs);
  return {
    executiveSummary: `Your side income is a real asset, but a 4-month job hunt and low starting savings make the transition tight. Projected low balance is $${sim.lowestBalance} with ${sim.runwayDaysAfterGrad} days of post-grad runway at your burn rate.`,
    hiddenCostsAlert: [
      {
        title: "Self-employment tax surprise",
        estimatedCost: 480,
        reason:
          "Freelance and side-hustle income is not pre-taxed, so a quarterly bill can land exactly during the job hunt.",
      },
      {
        title: "Relocation deposit & setup",
        estimatedCost: 1200,
        reason:
          "Even a modest deposit plus moving expenses draws down your thin cash cushion before salary starts.",
      },
      {
        title: "Health insurance gap",
        estimatedCost: 320,
        reason:
          "Losing student coverage before employer benefits begin leaves a costly uninsured window.",
      },
    ],
    microActionPlan: [
      {
        action: "Ringfence 25% of side income for taxes now",
        weeklySaving: 30,
        extraRunwayDays: weeklySavingToRunwayDays(30, sim.postGradBurnRate),
        impactSummary:
          "Pre-saving the tax reserve prevents a lump-sum shock mid-job hunt.",
      },
      {
        action: "Bundle one premium service tier per week",
        weeklySaving: 55,
        extraRunwayDays: weeklySavingToRunwayDays(55, sim.postGradBurnRate),
        impactSummary:
          "Upselling existing clients raises bridge income without new acquisition cost.",
      },
      {
        action: "Cut one subscription and one weekly delivery order",
        weeklySaving: 35,
        extraRunwayDays: weeklySavingToRunwayDays(35, sim.postGradBurnRate),
        impactSummary:
          "Trimming two low-value recurring costs directly extends your employment runway.",
      },
    ],
    source: "smart-fallback",
  };
}

export const STUDENT_PRESETS: StudentPreset[] = [
  {
    id: "metro-hk",
    label: "Metro / HK Fresh Grad",
    blurb:
      "High security deposit, lost meal & transit subsidies, pricey city job hunt.",
    currency: "USD",
    inputs: metroHkInputs,
    cachedReport: buildMetroHkReport(),
  },
  {
    id: "tech-loan",
    label: "Tech Grad w/ Student Loan",
    blurb:
      "Strong salary offset by a monthly loan repayment and deposit costs.",
    currency: "USD",
    inputs: techLoanInputs,
    cachedReport: buildTechLoanReport(),
  },
  {
    id: "side-hustler",
    label: "Bootstrapped Side-Hustler",
    blurb:
      "Real side income, lower savings, and a longer job hunt to survive.",
    currency: "USD",
    inputs: sideHustlerInputs,
    cachedReport: buildSideHustlerReport(),
  },
  {
    id: "polyu-local",
    label: "PolyU Local Student",
    blurb:
      "HK local grad: HKD 15k salary, HKD 10k deposit, HKD 2k loan repayment.",
    currency: "HKD",
    inputs: {
      currentSavings: 20000,
      monthlyStudentIncome: 5000,
      monthlyStudentSpend: 4200,
      monthsUntilGraduation: 6,
      expectedStartingSalary: 15000,
      jobSearchMonths: 2,
      postGradMonthlyCost: 8500,
      upfrontMovingDeposit: 10000,
      monthlyLoanRepayment: 2000,
      delayedJobOffer: false,
      salaryCut20Percent: false,
      emergencyShock: false,
    },
    cachedReport: {
      executiveSummary:
        "Your HKD 15k starting salary looks comfortable, but the HKD 10k deposit plus HKD 10.5k/mo burn rate leaves only 38 days of runway. The 2-month job hunt in Hong Kong's rental market is your highest-risk window.",
      hiddenCostsAlert: [
        {
          title: "Rental deposit + first month (2+1)",
          estimatedCost: 10000,
          reason:
            "HK landlords typically require 2 months deposit + 1 month advance rent before move-in, draining HKD 10k+ before your first paycheck.",
        },
        {
          title: "Loss of JUPAS subsidies & student transport",
          estimatedCost: 600,
          reason:
            "Student Travel Scheme and subsidised campus dining end at graduation, silently raising your monthly transport and food costs.",
        },
        {
          title: "Loan grace period ending",
          estimatedCost: 2000,
          reason:
            "Your HKD 2k/mo student loan repayment begins 6 months post-graduation, adding a fixed drain during the job hunt.",
        },
      ],
      microActionPlan: [
        {
          action: "Negotiate 1-month deposit waiver or split payment",
          weeklySaving: 200,
          extraRunwayDays: 8,
          impactSummary:
            "Freeing HKD 4k of deposit over two installments keeps cash liquid during your highest-risk month.",
        },
        {
          action: "Apply for income-driven repayment before grace ends",
          weeklySaving: 150,
          extraRunwayDays: 6,
          impactSummary:
            "Lowering the HKD 2k/mo loan payment in lean months protects your runway at graduation.",
        },
        {
          action: "Take one paid tutoring or freelance gig per week",
          weeklySaving: 300,
          extraRunwayDays: 12,
          impactSummary:
            "HK$300/week bridge income continues while you hunt and offsets the HKD 10.5k/mo burn rate.",
        },
      ],
      source: "smart-fallback",
    },
  },
];

export function getPresetById(id: string): StudentPreset | undefined {
  return STUDENT_PRESETS.find((preset) => preset.id === id);
}
