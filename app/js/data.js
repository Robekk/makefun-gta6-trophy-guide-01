// data.js — loads the two JSON documents the guide is built from. Both are
// files of this app (data/trophies.json, data/roadmap.json); nothing is ever
// fetched from the network beyond this app's own folder.

export async function loadGuideData() {
  const [trophyDoc, roadmapDoc] = await Promise.all([
    fetch("data/trophies.json").then((r) => {
      if (!r.ok) throw new Error(`trophies.json: HTTP ${r.status}`);
      return r.json();
    }),
    fetch("data/roadmap.json").then((r) => {
      if (!r.ok) throw new Error(`roadmap.json: HTTP ${r.status}`);
      return r.json();
    }),
  ]);
  const trophies = Array.isArray(trophyDoc) ? trophyDoc : trophyDoc.trophies;
  if (!Array.isArray(trophies)) throw new Error("trophies.json: no trophies array");
  return { trophies, roadmap: roadmapDoc };
}

// The filters the toolbar can express, in one place so the list, the meta
// line and the tests all agree on what "matches" means.
export function trophyMatches(trophy, filters, earnedSet) {
  if (filters.kind === "missable") {
    if (!trophy.missable) return false;
  } else if (filters.kind !== "all" && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.grade !== "all" && trophy.grade !== filters.grade) return false;
  const earned = earnedSet.has(trophy.id);
  if (filters.state === "earned" && !earned) return false;
  if (filters.state === "unearned" && earned) return false;
  if (filters.query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(filters.query)) return false;
  }
  return true;
}

// Spoiler rule: with the shield on, a trophy PlayStation hides (or a story
// trophy) stays masked until the player has earned it.
export function isMasked(trophy, state) {
  if (!state.spoilerShield) return false;
  if (state.earned.includes(trophy.id)) return false;
  return trophy.hidden === true || trophy.kind === "story";
}

export const GRADE_LABEL = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

export const KIND_LABEL = {
  story: "Story",
  collectibles: "Collectibles",
  activities: "Activities",
  online: "Online",
};
