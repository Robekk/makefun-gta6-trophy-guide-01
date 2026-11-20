// The checklist side of Leonida Nights: filter chips, the trophy rows and the progress header.

import { KIND_LABELS, KIND_ORDER, countByGrade, isMasked } from './data.js';

export function trophyMatchesFilters(trophy, state, store) {
  if (state.kind !== 'all' && trophy.kind !== state.kind) return false;
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  if (state.earnedFilter === 'earned' && !store.isEarned(trophy.id)) return false;
  if (state.earnedFilter === 'unearned' && store.isEarned(trophy.id)) return false;
  const query = state.query.trim().toLowerCase();
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

export function renderKindChips(container, trophies, state, onPick) {
  container.replaceChildren();
  const counts = new Map();
  for (const trophy of trophies) counts.set(trophy.kind, (counts.get(trophy.kind) ?? 0) + 1);
  const options = [{ value: 'all', label: 'All kinds', count: trophies.length }];
  for (const kind of KIND_ORDER) {
    if (counts.has(kind)) options.push({ value: kind, label: KIND_LABELS[kind], count: counts.get(kind) });
  }
  const missableCount = trophies.filter((t) => t.missable).length;
  if (missableCount > 0) options.push({ value: 'missable', label: 'Missable', count: missableCount });
  for (const option of options) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (state.kind === option.value ? ' is-active' : '');
    chip.textContent = option.label;
    const count = document.createElement('span');
    count.className = 'chip-count';
    count.textContent = String(option.count);
    chip.append(count);
    chip.addEventListener('click', () => onPick(option.value));
    container.append(chip);
  }
}

function buildRow(trophy, state, store, handlers) {
  const masked = isMasked(trophy, state, store);
  const earned = store.isEarned(trophy.id);
  const row = document.createElement('li');
  row.className =
    'trophy-row' +
    (earned ? ' is-earned' : '') +
    (masked ? ' is-masked' : '') +
    (state.selectedId === trophy.id ? ' is-selected' : '');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'trophy-check';
  checkbox.checked = earned;
  checkbox.setAttribute('aria-label', `Mark ${masked ? 'hidden trophy' : trophy.name} as earned`);
  checkbox.addEventListener('click', (event) => event.stopPropagation());
  checkbox.addEventListener('change', () => handlers.onToggleEarned(trophy.id));

  const dot = document.createElement('span');
  dot.className = `grade-dot grade-${trophy.grade}`;
  dot.title = trophy.grade;

  const main = document.createElement('div');
  main.className = 'trophy-main';
  const name = document.createElement('div');
  name.className = 'trophy-name';
  const nameText = document.createElement('span');
  nameText.textContent = masked ? 'Hidden trophy' : trophy.name;
  name.append(nameText);
  const kindTag = document.createElement('span');
  kindTag.className = 'kind-tag';
  kindTag.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  name.append(kindTag);
  if (trophy.missable) {
    const tag = document.createElement('span');
    tag.className = 'missable-tag';
    tag.textContent = 'Missable';
    name.append(tag);
  }
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = masked ? 'Earn this story trophy to reveal what it is.' : trophy.description;
  main.append(name, desc);

  const grade = document.createElement('span');
  grade.className = 'grade-label';
  grade.textContent = trophy.grade;

  row.append(checkbox, dot, main, grade);
  row.addEventListener('click', () => handlers.onSelect(trophy.id));
  return row;
}

export function renderTrophyList(elements, trophies, state, store, handlers) {
  const visible = trophies.filter((trophy) =>
    state.kind === 'missable'
      ? trophy.missable && trophyMatchesFilters(trophy, { ...state, kind: 'all' }, store)
      : trophyMatchesFilters(trophy, state, store),
  );
  elements.list.replaceChildren();
  for (const trophy of visible) elements.list.append(buildRow(trophy, state, store, handlers));
  elements.emptyState.hidden = visible.length > 0;
  elements.resultCount.textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
  return visible;
}

export function renderProgress(elements, trophies, store) {
  const earnedCount = trophies.filter((t) => store.isEarned(t.id)).length;
  const total = trophies.length;
  const percent = total === 0 ? 0 : Math.round((earnedCount / total) * 100);
  elements.summary.textContent = `${earnedCount} of ${total} earned — ${percent}%`;
  elements.fill.style.width = `${percent}%`;
  elements.fill.parentElement.setAttribute('aria-valuenow', String(earnedCount));
  const totals = countByGrade(trophies);
  const earnedByGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (store.isEarned(trophy.id)) earnedByGrade[trophy.grade] += 1;
  }
  elements.grades.textContent =
    `Platinum ${earnedByGrade.platinum}/${totals.platinum} · Gold ${earnedByGrade.gold}/${totals.gold} · ` +
    `Silver ${earnedByGrade.silver}/${totals.silver} · Bronze ${earnedByGrade.bronze}/${totals.bronze}`;
}
