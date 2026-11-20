// Checklist state for the Leonida trophy tracker.
//
// Owns the set of earned trophy ids: it loads it from localStorage, saves it
// on every change, and converts it to and from the JSON file the Export and
// Import buttons trade in. Nothing here touches the DOM except the download
// helper, which clicks a throwaway anchor.

const STORAGE_KEY = 'leonida-trophy-tracker-v1';
const EXPORT_FORMAT = 'leonida-trophy-progress';

export function loadEarnedIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    return new Set((ids ?? []).filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveEarnedIds(earnedIds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedIds]));
}

// Flips one trophy's earned state and persists the result.
// Returns true when the trophy is earned after the flip.
export function toggleEarnedId(earnedIds, id) {
  if (earnedIds.has(id)) earnedIds.delete(id);
  else earnedIds.add(id);
  saveEarnedIds(earnedIds);
  return earnedIds.has(id);
}

export function countEarnedTotal(trophies, earnedIds) {
  return trophies.filter((t) => earnedIds.has(t.id)).length;
}

// Earned/total counts for each grade present in the list, in display order.
export function countEarnedByGrade(trophies, earnedIds) {
  const order = ['platinum', 'gold', 'silver', 'bronze'];
  return order.map((grade) => {
    const inGrade = trophies.filter((t) => t.grade === grade);
    return {
      grade,
      earned: inGrade.filter((t) => earnedIds.has(t.id)).length,
      total: inGrade.length,
    };
  }).filter((row) => row.total > 0);
}

export function buildProgressExport(earnedIds) {
  return {
    format: EXPORT_FORMAT,
    version: 1,
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earnedIds].sort((a, b) => a - b),
  };
}

// Accepts this tracker's export object, a bare array of ids, or an array of
// trophy names (the shape the original starter used). Throws on anything else
// so the caller can tell the player the file was not a progress file.
export function parseProgressImport(text, trophies) {
  const parsed = JSON.parse(text);
  const raw = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(raw)) throw new Error('No earned list in file');
  const ids = new Set();
  for (const entry of raw) {
    if (Number.isInteger(entry)) {
      if (trophies.some((t) => t.id === entry)) ids.add(entry);
    } else if (typeof entry === 'string') {
      const byName = trophies.find((t) => t.name === entry);
      if (byName) ids.add(byName.id);
    }
  }
  return ids;
}

export function downloadProgressFile(earnedIds) {
  const blob = new Blob([JSON.stringify(buildProgressExport(earnedIds), null, 2)], { type: 'application/json' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'gta6-trophy-progress.json';
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}
