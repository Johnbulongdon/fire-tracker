export interface UserPreferences {
  preferredCurrency: string; // "" = show per-currency breakdown
  defaultCurrency: string;   // default currency for new expenses
}

const KEY = "untilfire_prefs";

export const DEFAULT_PREFS: UserPreferences = { preferredCurrency: "", defaultCurrency: "USD" };

export function loadPrefs(): UserPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PREFS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(p: UserPreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}
