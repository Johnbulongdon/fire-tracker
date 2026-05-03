import { STATE_TAX } from '../../fire-data';
import type { TaxBreakdown } from '../types';

// 2025 US Federal brackets (single, standard deduction $15,000). Year-keyed so
// future tables drop in beside this one without changing the takeHomePay seam.
const FED_BRACKETS_2025 = [
  { l: 11925,    r: 0.10 },
  { l: 48475,    r: 0.12 },
  { l: 103350,   r: 0.22 },
  { l: 197300,   r: 0.24 },
  { l: 250525,   r: 0.32 },
  { l: 626350,   r: 0.35 },
  { l: Infinity, r: 0.37 },
];

const STD_DEDUCTION_2025 = 15000;

const FICA_SS_BASE_2025 = 176100;
const FICA_SS_RATE = 0.062;
const FICA_MEDICARE_RATE = 0.0145;
const FICA_ADDL_MEDICARE_THRESHOLD = 200000;
const FICA_ADDL_MEDICARE_RATE = 0.009;

function fedTax2025(gross: number): number {
  const taxable = Math.max(0, gross - STD_DEDUCTION_2025);
  let tax = 0;
  let prev = 0;
  for (const b of FED_BRACKETS_2025) {
    if (taxable <= prev) break;
    tax += (Math.min(taxable, b.l) - prev) * b.r;
    prev = b.l;
  }
  return Math.round(tax);
}

function fica2025(gross: number): number {
  return Math.round(
    Math.min(gross, FICA_SS_BASE_2025) * FICA_SS_RATE +
    gross * FICA_MEDICARE_RATE +
    (gross > FICA_ADDL_MEDICARE_THRESHOLD
      ? (gross - FICA_ADDL_MEDICARE_THRESHOLD) * FICA_ADDL_MEDICARE_RATE
      : 0),
  );
}

/**
 * Compute take-home for a US jurisdiction. `year` is taken so the seam stays
 * year-aware; v1 only ships the 2025 table and falls back to it for unknown
 * years rather than fabricating brackets.
 */
export function computeUSTakeHome(
  gross: number,
  jurisdiction: string,
  _year: number,
): TaxBreakdown {
  const si = STATE_TAX[jurisdiction] ?? { rate: 0, label: 'Unknown' };
  const fed = fedTax2025(gross);
  const fic = fica2025(gross);
  const st = Math.round(gross * si.rate);
  const takeHome = gross - fed - fic - st;
  return {
    fedTax: fed,
    fica: fic,
    stateTax: st,
    takeHome,
    effectiveRate: gross > 0 ? ((fed + fic + st) / gross) * 100 : 0,
    jurisdictionLabel: si.label,
    isUSCity: true,
    unknownJurisdiction: false,
  };
}

/**
 * Compute take-home for a non-US jurisdiction using the dataset's effective
 * rate. We deliberately do not synthesize fed/FICA — those are US concepts.
 */
export function computeIntlTakeHome(
  gross: number,
  jurisdiction: string,
  _year: number,
): TaxBreakdown {
  const si = STATE_TAX[jurisdiction] ?? { rate: 0, label: 'Unknown' };
  const st = Math.round(gross * si.rate);
  return {
    fedTax: 0,
    fica: 0,
    stateTax: st,
    takeHome: gross - st,
    effectiveRate: si.rate * 100,
    jurisdictionLabel: si.label,
    isUSCity: false,
    unknownJurisdiction: false,
  };
}
