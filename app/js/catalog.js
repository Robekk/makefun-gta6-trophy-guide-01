// catalog.js — loads the guide's data and answers questions about it.
//
// The trophy list and the roadmap are plain JSON files beside the app;
// loading them is the only fetch the app ever makes, and both targets
// are files of the app itself. Everything else here is pure logic the
// tracker view filters and masks with.

export const KIND_LABELS = {
  story: "Story",
  collectibles: "Collectibles",
  activities: "Activities",
  online: "Online",
};

export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

/** Fetches data/trophies.json and data/roadmap.json from the app root. */
export async function loadCatalog() {
  const [trophyResponse, roadmapResponse] = await Promise.all([
    fetch("data/trophies.json"),
    fetch("data/roadmap.json"),
  ]);
  if (!trophyResponse.ok) throw new Error("data/trophies.json did not load");
  if (!roadmapResponse.ok) throw new Error("data/roadmap.json did not load");
  const trophyData = await trophyResponse.json();
  const roadmap = await roadmapResponse.json();
  const trophies = Array.isArray(trophyData) ? trophyData : trophyData.trophies;
  return { trophies, roadmap };
}

/**
 * Does a trophy pass the toolbar's filters? The kind filter's
 * "missable" option is special: it selects the flagged trophies,
 * whichever kind they carry.
 */
export function trophyMatches(trophy, filters, earned) {
  if (filters.kind === "missable") {
    if (!trophy.missable) return false;
  } else if (filters.kind !== "all" && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.grade !== "all" && trophy.grade !== filters.grade) return false;
  if (filters.state === "earned" && !earned.has(trophy.id)) return false;
  if (filters.state === "unearned" && earned.has(trophy.id)) return false;
  const query = filters.search.trim().toLowerCase();
  if (query) {
    const haystack = `${trophy.name} ${trophy.description}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

/**
 * The spoiler shield masks a trophy's name and description until it is
 * earned, when the trophy is a story trophy or one PlayStation hides.
 */
export function isMasked(trophy, earned, settings) {
  if (!settings.spoilerShield) return false;
  if (earned.has(trophy.id)) return false;
  return trophy.hidden === true || trophy.kind === "story";
}

/** Earned count inside any subset of the list (a roadmap stage, say). */
export function countEarned(trophies, earned) {
  let total = 0;
  for (const trophy of trophies) {
    if (earned.has(trophy.id)) total += 1;
  }
  return total;
}
