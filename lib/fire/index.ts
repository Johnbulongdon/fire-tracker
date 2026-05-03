// Public surface of the FIRE engine. Routes, components, and scripts should
// import from here rather than reaching into submodules — the seam is what
// makes the planner math swappable later.

export type {
  FireInputs,
  FireOutput,
  FireStrategy,
  Locale,
  LocaleKind,
  TaxBreakdown,
} from './types';

export {
  DEFAULT_FIRE_STRATEGY_ID,
  getFireStrategy,
  listFireStrategies,
  registerFireStrategy,
  traditionalStrategy,
} from './strategies';

export { calcFIRE } from './strategies/traditional';

export { calcTakeHome, getLocale, takeHomePay } from './tax';

export { monteCarloFIRE } from './monte-carlo';
export type { MonteCarloResult } from './monte-carlo';

export {
  ensureDefaultScenario,
  loadDefaultScenario,
  saveDefaultScenario,
} from './scenarios';
export type {
  DefaultScenarioPayload,
  ScenarioAssumptions,
} from './scenarios';
