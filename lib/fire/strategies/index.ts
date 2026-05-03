import type { FireStrategy } from '../types';
import { traditionalStrategy } from './traditional';

const registry = new Map<string, FireStrategy>();
registry.set(traditionalStrategy.id, traditionalStrategy);

export function registerFireStrategy(strategy: FireStrategy): void {
  registry.set(strategy.id, strategy);
}

export function getFireStrategy(id: string): FireStrategy {
  const s = registry.get(id);
  if (!s) {
    throw new Error(`Unknown FIRE strategy: ${id}. Available: ${Array.from(registry.keys()).join(', ')}`);
  }
  return s;
}

export function listFireStrategies(): FireStrategy[] {
  return Array.from(registry.values());
}

export const DEFAULT_FIRE_STRATEGY_ID = traditionalStrategy.id;

export { traditionalStrategy };
