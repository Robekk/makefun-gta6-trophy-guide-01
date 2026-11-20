// trophy-catalog.js — loads and indexes the trophy data files.
// Fetches data/trophies.json (the 55 official PS5 trophies with grades,
// kinds, hidden and missable flags, PSN counts, own-words guides and
// per-trophy source citations) and data/roadmap.json (the platinum
// roadmap stages). Exposes grade metadata, kind labels and lookups by
// id so every other module renders from one shared catalog.

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
export const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
export const GRADE_TOTALS = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
export const KIND_LABEL = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export async function loadCatalog() {
  const [trophyRes, roadmapRes] = await Promise.all([
    fetch('data/trophies.json'),
    fetch('data/roadmap.json'),
  ]);
  if (!trophyRes.ok) throw new Error('trophies.json failed to load');
  if (!roadmapRes.ok) throw new Error('roadmap.json failed to load');
  const trophyData = await trophyRes.json();
  const roadmapData = await roadmapRes.json();
  const trophies = trophyData.trophies.slice().sort((a, b) => a.id - b.id);
  const byId = new Map(trophies.map((t) => [t.id, t]));
  return { trophies, byId, roadmap: roadmapData };
}

export function trophiesByGrade(trophies, grade) {
  return trophies.filter((t) => t.grade === grade);
}

export function trophiesByKind(trophies, kind) {
  if (kind === 'missable') return trophies.filter((t) => t.missable);
  return trophies.filter((t) => t.kind === kind);
}

export function stageTrophies(stage, byId) {
  return stage.trophies.map((id) => byId.get(id)).filter(Boolean);
}
