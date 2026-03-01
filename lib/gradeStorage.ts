// Shared utilities for persisting sim completion to localStorage

const STORAGE_KEY = 'bsc-completed';

export interface SimResult {
  completed: boolean;
  grade: string;
}

export function saveCompletion(path: string, grade: string): void {
  try {
    const prev: Record<string, SimResult> = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    prev[path] = { completed: true, grade };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
  }
}

export function loadCompletions(): Record<string, SimResult> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}
