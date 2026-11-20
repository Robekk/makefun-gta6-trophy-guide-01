// state.js — the tracker's memory: which trophies are earned, and the spoiler
// setting. Everything lives under one localStorage key so export/import is a
// single small JSON document.

export const STORAGE_KEY = "leonida-nights-tracker-v1";

const defaultState = () => ({ earned: [], spoilerShield: false });

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const earned = Array.isArray(parsed.earned)
      ? parsed.earned.filter((n) => Number.isInteger(n))
      : [];
    return { earned, spoilerShield: parsed.spoilerShield === true };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, quota). The tracker still
    // works for the session; progress simply will not persist.
  }
}

export function toggleEarned(state, id) {
  const at = state.earned.indexOf(id);
  if (at === -1) state.earned.push(id);
  else state.earned.splice(at, 1);
  return state;
}

export function isEarned(state, id) {
  return state.earned.includes(id);
}

// A portable snapshot of progress, small enough to paste into a message.
export function exportText(state) {
  return JSON.stringify(
    {
      app: "leonida-nights-tracker",
      version: 1,
      earned: [...state.earned].sort((a, b) => a - b),
      spoilerShield: state.spoilerShield,
    },
    null,
    2,
  );
}

// Accepts the object exportText produces (or any object with an "earned"
// array of trophy ids) and returns a fresh state, or null when unusable.
export function importText(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.earned)) return null;
    const earned = [...new Set(parsed.earned.filter((n) => Number.isInteger(n)))];
    return { earned, spoilerShield: parsed.spoilerShield === true };
  } catch {
    return null;
  }
}
