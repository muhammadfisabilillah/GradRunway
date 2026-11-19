export type Currency = "USD" | "HKD" | "IDR";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  HKD: "HK$",
  IDR: "Rp",
};

export const CURRENCY_LOCALES: Record<Currency, string> = {
  USD: "en-US",
  HKD: "en-HK",
  IDR: "id-ID",
};

export const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  HKD: 7.8,
  IDR: 15000,
};

export function formatCurrency(value: number, curr: Currency = "USD"): string {
  const sign = value < 0 ? "-" : "";
  const symbol = CURRENCY_SYMBOLS[curr];
  const locale = CURRENCY_LOCALES[curr];
  const converted = Math.abs(Math.round(value * CURRENCY_RATES[curr]));
  return `${sign}${symbol}${converted.toLocaleString(locale)}`;
}