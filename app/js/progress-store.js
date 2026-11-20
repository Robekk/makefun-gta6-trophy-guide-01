// progress-store.js — the tracker's saved progress.
// Persists the earned-trophy set and the spoiler setting in localStorage
// so progress survives reloads with the network off. Also implements
// export (download the earned set as a JSON file) and import (read such
// a file back and restore the set), plus tiny pub/sub so the header,
// list and panels re-render whenever progress changes.

const EARNED_KEY = 'vicepalms.earned.v1';
const SPOILER_KEY = 'vicepalms.spoiler.v1';

function readIds() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

export function createProgressStore() {
  let earned = readIds();
  let spoilerOn = localStorage.getItem(SPOILER_KEY) !== 'off';
  const listeners = new Set();

  function emit() {
    for (const fn of listeners) fn();
  }
  function persist() {
    localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  }

  return {
    isEarned: (id) => earned.has(id),
    earnedIds: () => [...earned],
    earnedCount: () => earned.size,
    toggle(id) {
      if (earned.has(id)) earned.delete(id); else earned.add(id);
      persist(); emit();
    },
    setEarned(ids) {
      earned = new Set(ids.filter((n) => Number.isInteger(n)));
      persist(); emit();
    },
    spoilerOn: () => spoilerOn,
    setSpoiler(on) {
      spoilerOn = Boolean(on);
      localStorage.setItem(SPOILER_KEY, spoilerOn ? 'on' : 'off');
      emit();
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    exportJson() {
      return JSON.stringify({ app: 'vice-palms-tracker', earned: [...earned].sort((a, b) => a - b) }, null, 2);
    },
    importJson(text) {
      const data = JSON.parse(text);
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('no earned list in file');
      this.setEarned(ids);
    },
  };
}

export function downloadProgress(store) {
  const blob = new Blob([store.exportJson()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
