// Data loading for Leonida Nights: the trophy list and the roadmap, both plain files under app/data/.

export async function loadGuideData() {
  const [trophyResponse, roadmapResponse] = await Promise.all([
    fetch('data/trophies.json'),
    fetch('data/roadmap.json'),
  ]);
  if (!trophyResponse.ok) throw new Error(`trophies.json answered ${trophyResponse.status}`);
  if (!roadmapResponse.ok) throw new Error(`roadmap.json answered ${roadmapResponse.status}`);
  const trophyDoc = await trophyResponse.json();
  const roadmap = await roadmapResponse.json();
  const trophies = Array.isArray(trophyDoc) ? trophyDoc : trophyDoc.trophies;
  return { trophies, roadmap };
}

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export const KIND_ORDER = ['story', 'collectibles', 'activities', 'online'];

// A story trophy is spoiler-sensitive: with the shield on, its name and description stay
// masked until it is earned. The platinum is the list's capstone, not a spoiler, so it is exempt.
export function isSpoilerSensitive(trophy) {
  return trophy.kind === 'story' && trophy.grade !== 'platinum';
}

export function isMasked(trophy, state, store) {
  return state.spoilerShield && isSpoilerSensitive(trophy) && !store.isEarned(trophy.id);
}

export function countByGrade(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (counts[trophy.grade] !== undefined) counts[trophy.grade] += 1;
  }
  return counts;
}
