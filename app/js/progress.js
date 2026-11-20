// progress.js — the tracker's memory.
//
// Earned trophies and the spoiler-shield setting live in localStorage
// under versioned keys, so the checklist survives reloads and nothing
// ever leaves the browser. Export and import move the same earned set
// in and out as a small JSON document.

const EARNED_KEY = "leonida-trophy-guide/earned/v1";
const SETTINGS_KEY = "leonida-trophy-guide/settings/v1";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** The set of earned trophy ids (numbers), empty when nothing is saved. */
export function loadEarned() {
  const list = readJson(EARNED_KEY, []);
  return new Set(Array.isArray(list) ? list.filter(Number.isInteger) : []);
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

/** Settings: currently just the spoiler shield on/off. */
export function loadSettings() {
  const saved = readJson(SETTINGS_KEY, {});
  return { spoilerShield: Boolean(saved && saved.spoilerShield) };
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ spoilerShield: Boolean(settings.spoilerShield) }));
}

/** The export document for an earned set, as pretty JSON text. */
export function exportProgress(earned) {
  return JSON.stringify(
    {
      app: "leonida-trophy-guide",
      version: 1,
      exportedFrom: "GTA VI trophy tracker",
      earned: [...earned].sort((a, b) => a - b),
    },
    null,
    2,
  );
}

/**
 * Reads an earned set back from exported text. Accepts the export
 * document or a bare array of ids; throws on anything else.
 */
export function parseImportedProgress(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(list)) {
    throw new Error("that file does not hold an earned list");
  }
  return new Set(list.filter(Number.isInteger));
}
