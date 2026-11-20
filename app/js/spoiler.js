// Spoiler protection for story trophies.
//
// While the setting is on, a story trophy the player has not earned yet is
// masked everywhere it appears: the list, the roadmap and the guide panel
// show a placeholder instead of its name, its official description and its
// guide. Earning the trophy (or switching the setting off) reveals it.

export const MASKED_NAME = 'Hidden trophy';
export const MASKED_DESCRIPTION = 'A story trophy, hidden by spoiler protection until it is earned.';

export function isSpoilerMasked(trophy, earnedIds, spoilersHidden) {
  return spoilersHidden && trophy.kind === 'story' && !earnedIds.has(trophy.id);
}

export function displayNameFor(trophy, masked) {
  return masked ? MASKED_NAME : trophy.name;
}

export function displayDescriptionFor(trophy, masked) {
  return masked ? MASKED_DESCRIPTION : trophy.description;
}
