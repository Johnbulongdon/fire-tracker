import { isUS, STATE_TAX } from '../../fire-data';
import type { Locale, TaxBreakdown } from '../types';
import { computeIntlTakeHome, computeUSTakeHome } from './us';

/**
 * Resolve a city's jurisdiction key into a typed Locale. The 'custom' sentinel
 * means the user typed in a city we do not have in the dataset — we mark it
 * unknown so callers do not silently inherit Texas rates (the historical bug
 * UNTAAAA-3 closed).
 */
export function getLocale(jurisdiction: string): Locale {
  if (!jurisdiction || jurisdiction === 'custom') {
    return { kind: 'unknown', jurisdiction: 'custom' };
  }
  return isUS(jurisdiction)
    ? { kind: 'us', jurisdiction }
    : { kind: 'intl', jurisdiction };
}

/**
 * The single tax seam for the FIRE engine.
 *
 *   takeHomePay(gross, locale, year) -> TaxBreakdown
 *
 * Adding a new locale (richer US state model, a new country) plugs in here
 * without touching the wizard or planner code.
 */
export function takeHomePay(
  gross: number,
  locale: Locale,
  year: number,
): TaxBreakdown {
  if (locale.kind === 'unknown') {
    const label = STATE_TAX[locale.jurisdiction]?.label
      ?? 'Custom city — tax estimate unavailable, enter take-home directly';
    return {
      fedTax: 0,
      fica: 0,
      stateTax: 0,
      takeHome: gross,
      effectiveRate: 0,
      jurisdictionLabel: label,
      isUSCity: false,
      unknownJurisdiction: true,
    };
  }
  if (locale.kind === 'us') {
    return computeUSTakeHome(gross, locale.jurisdiction, year);
  }
  return computeIntlTakeHome(gross, locale.jurisdiction, year);
}

/**
 * Drop-in replacement for the legacy `calcTakeHome(gross, stateKey)`. Callers
 * that already know their stateKey should not need to construct a Locale by
 * hand.
 */
export function calcTakeHome(
  gross: number,
  jurisdiction: string,
  year: number = new Date().getFullYear(),
): TaxBreakdown {
  return takeHomePay(gross, getLocale(jurisdiction), year);
}
