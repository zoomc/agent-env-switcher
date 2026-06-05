const STORAGE_KEY = 'sidebar-target-order';

export type TargetId = 'hermes' | 'claude-code' | 'codex' | 'openclaw';

export const DEFAULT_ORDER: TargetId[] = ['hermes', 'claude-code', 'codex', 'openclaw'];

/**
 * Load target order from localStorage, falling back to default order.
 */
export function loadTargetOrder(): TargetId[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as TargetId[];
      // Validate all required targets are present
      if (
        Array.isArray(parsed) &&
        DEFAULT_ORDER.every((id) => parsed.includes(id))
      ) {
        return parsed;
      }
    }
  } catch {
    // Invalid JSON, fall through to default
  }
  return DEFAULT_ORDER;
}

/**
 * Save target order to localStorage.
 */
export function saveTargetOrder(order: TargetId[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // localStorage unavailable, silently fail
  }
}
