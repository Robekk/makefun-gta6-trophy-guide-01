// List filtering: the kind / grade / status chip groups and the name search.
//
// The filter state is a plain object; trophyMatchesFilters is the single
// predicate the list render uses, and wireChipGroup keeps a row of chip
// buttons in sync with one field of that state.

export function createFilterState() {
  return { kind: 'all', grade: 'all', status: 'all', query: '' };
}

// kind 'missable' is special: missable is a flag on the trophy, not a kind,
// so that chip matches on the flag. kind 'online' matches kind 'online'
// trophies (the PS5 list has none, so it honestly shows an empty list).
export function trophyMatchesFilters(trophy, state, earnedIds) {
  if (state.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (state.kind !== 'all' && trophy.kind !== state.kind) {
    return false;
  }
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  const earned = earnedIds.has(trophy.id);
  if (state.status === 'earned' && !earned) return false;
  if (state.status === 'open' && earned) return false;
  if (state.query && !trophy.name.toLowerCase().includes(state.query)) return false;
  return true;
}

// Wires one chip group: clicking a chip makes it the active one and reports
// its data-value through onChange.
export function wireChipGroup(container, onChange) {
  container.addEventListener('click', (event) => {
    const chip = event.target.closest('button[data-value]');
    if (!chip || !container.contains(chip)) return;
    for (const other of container.querySelectorAll('.chip')) other.classList.remove('is-active');
    chip.classList.add('is-active');
    onChange(chip.dataset.value);
  });
}
