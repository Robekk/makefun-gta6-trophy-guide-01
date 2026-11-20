// Progress store for Leonida Nights: earned trophies and view settings, kept in localStorage.

const STORAGE_KEY = 'leonida-nights-tracker-v1';

const DEFAULT_STATE = {
  earned: [],
  spoilerShield: false,
  kind: 'all',
  grade: 'all',
  earnedFilter: 'all',
  query: '',
  selectedId: null,
  view: 'tracker',
};

function readStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...parsed, earned: Array.isArray(parsed.earned) ? parsed.earned : [] };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function createProgressStore() {
  let state = readStoredState();
  const listeners = new Set();

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode, quota); the tracker keeps working in memory.
    }
  }

  function emit() {
    for (const listener of listeners) listener(state);
  }

  return {
    getState() {
      return state;
    },
    isEarned(id) {
      return state.earned.includes(id);
    },
    toggleEarned(id) {
      const next = new Set(state.earned);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      state = { ...state, earned: [...next].sort((a, b) => a - b) };
      persist();
      emit();
    },
    setEarned(ids) {
      state = { ...state, earned: [...new Set(ids)].sort((a, b) => a - b) };
      persist();
      emit();
    },
    update(patch) {
      state = { ...state, ...patch };
      persist();
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    exportJson() {
      return JSON.stringify(
        {
          app: 'leonida-nights-tracker',
          version: 1,
          exportedAt: new Date().toISOString(),
          earned: [...state.earned].sort((a, b) => a - b),
        },
        null,
        2,
      );
    },
    importJson(text) {
      const parsed = JSON.parse(text);
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('That file does not hold an earned list.');
      return ids.filter((id) => Number.isInteger(id));
    },
  };
}
