// spoiler-shield.js — the spoiler setting's masking rules.
// While the shield is on, a trophy PlayStation marks hidden keeps its
// name and official description masked until the player earns it, so
// story beats, mission names and secret set pieces are never given
// away by the tracker. Earned trophies and non-hidden trophies always
// show in full. Every view asks this module before printing a name.

export const MASKED_NAME = 'Hidden Trophy';
export const MASKED_DESCRIPTION = 'Hidden on PlayStation until earned — turn the spoiler shield off to peek.';

export function isMasked(trophy, store) {
  return store.spoilerOn() && trophy.hidden && !store.isEarned(trophy.id);
}

export function displayName(trophy, store) {
  return isMasked(trophy, store) ? MASKED_NAME : trophy.name;
}

export function displayDescription(trophy, store) {
  return isMasked(trophy, store) ? MASKED_DESCRIPTION : trophy.description;
}
