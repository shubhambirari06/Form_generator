import type { FormState } from '../types';

export const STORAGE_KEY = 'formcraft-state-v1';

export const loadFormState = (): FormState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FormState;
  } catch {
    return null;
  }
};

export const saveFormState = (state: FormState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage limits / availability issues
  }
};
