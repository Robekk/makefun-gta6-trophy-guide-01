// tracker-view.js — the checklist itself: filter toolbar and trophy rows.
// Renders the kind chips (story, missable, collectibles, activities,
// online), the grade and earned-state selects and the search box, then
// the scrollable trophy list. Each row shows the grade gem, the official
// name and description (masked by the spoiler shield while unearned),
// the kind and grade tags, the PSN target count where PlayStation
// tracks one, a red MISSABLE badge, and the earned checkbox that writes
// through to the progress store.

import { GRADE_LABEL, KIND_LABEL } from './trophy-catalog.js';
import { displayName, displayDescription, isMasked } from './spoiler-shield.js';

export function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function createTrackerView({ listEl, catalog, store, onSelect }) {
  const filters = { kind: 'all', grade: 'all', state: 'all', query: '' };
  let selectedId = 28;

  function matches(t) {
    if (filters.kind === 'missable' && !t.missable) return false;
    if (filters.kind !== 'all' && filters.kind !== 'missable' && t.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.state === 'earned' && !store.isEarned(t.id)) return false;
    if (filters.state === 'unearned' && store.isEarned(t.id)) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const hay = `${t.name} ${t.description} ${t.kind} ${t.grade}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  function rowHtml(t) {
    const earned = store.isEarned(t.id);
    const masked = isMasked(t, store);
    const name = masked
      ? `<span class="masked">••••••••••</span> ${esc(displayName(t, store))}`
      : esc(t.name);
    const tags = [
      `<span class="tag">${esc(KIND_LABEL[t.kind] ?? t.kind)}</span>`,
      `<span class="tag tag-grade-${t.grade}">${GRADE_LABEL[t.grade]}</span>`,
      t.hidden ? '<span class="tag">Hidden</span>' : '',
      t.count ? `<span class="count-pill">× ${t.count}</span>` : '',
      t.missable ? '<span class="badge-missable">MISSABLE</span>' : '',
    ].join('');
    return `<div class="trophy-row${earned ? ' earned' : ''}${t.id === selectedId ? ' selected' : ''}" data-id="${t.id}">
      <button class="earn-box" data-earn="${t.id}" title="Mark earned">${earned ? '✓' : ''}</button>
      <span class="gem gem-${t.grade}"></span>
      <div class="row-main">
        <div class="row-name">${name}</div>
        <div class="row-desc">${esc(displayDescription(t, store))}</div>
      </div>
      <div class="row-tags">${tags}</div>
    </div>`;
  }

  function render() {
    const rows = catalog.trophies.filter(matches);
    listEl.innerHTML = rows.length
      ? rows.map(rowHtml).join('')
      : '<div class="list-empty">No trophies match these filters.</div>';
  }

  listEl.addEventListener('click', (event) => {
    const earnBtn = event.target.closest('[data-earn]');
    if (earnBtn) {
      store.toggle(Number(earnBtn.dataset.earn));
      return;
    }
    const row = event.target.closest('[data-id]');
    if (row) {
      selectedId = Number(row.dataset.id);
      render();
      onSelect(selectedId);
    }
  });

  return {
    filters,
    render,
    get selectedId() { return selectedId; },
    setSelected(id) { selectedId = id; render(); onSelect(id); },
    bindToolbar({ searchEl, chipsEl, gradeEl, stateEl }) {
      searchEl.addEventListener('input', () => { filters.query = searchEl.value.trim(); render(); });
      chipsEl.addEventListener('click', (event) => {
        const chip = event.target.closest('[data-kind]');
        if (!chip) return;
        filters.kind = chip.dataset.kind;
        chipsEl.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
        render();
      });
      gradeEl.addEventListener('change', () => { filters.grade = gradeEl.value; render(); });
      stateEl.addEventListener('change', () => { filters.state = stateEl.value; render(); });
    },
  };
}
