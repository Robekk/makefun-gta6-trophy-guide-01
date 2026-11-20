// Leonida Trophy Guide — entry point.
//
// Loads the trophy list and the roadmap, owns the page's shared state (earned
// ids, filters, spoiler setting, selection, current view) and wires the
// controls declared in index.html to the modules under js/: tracker.js holds
// the checklist state, filters.js the list filtering, spoiler.js the story
// masking, guide-panel.js the per-trophy guide, roadmap.js the roadmap view.

import {
  countEarnedByGrade,
  countEarnedTotal,
  downloadProgressFile,
  loadEarnedIds,
  parseProgressImport,
  saveEarnedIds,
  toggleEarnedId,
} from './js/tracker.js';
import { createFilterState, trophyMatchesFilters, wireChipGroup } from './js/filters.js';
import { displayDescriptionFor, displayNameFor, isSpoilerMasked } from './js/spoiler.js';
import { gradeBadge, renderGuidePanel, renderGuidePlaceholder } from './js/guide-panel.js';
import { renderRoadmap } from './js/roadmap.js';

const trophiesDoc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = trophiesDoc.trophies;

const earnedIds = loadEarnedIds();
const filterState = createFilterState();
let spoilersHidden = document.getElementById('spoiler-toggle').checked;
let selectedId = null;
let currentView = 'tracker';

const listEl = document.getElementById('trophy-list');
const panelEl = document.getElementById('guide-panel');
const resultCountEl = document.getElementById('result-count');

function selectedTrophy() {
  return trophies.find((t) => t.id === selectedId) ?? null;
}

function renderProgress() {
  const earned = countEarnedTotal(trophies, earnedIds);
  const percent = Math.round((earned / trophies.length) * 100);
  document.getElementById('progress-fill').style.width = `${percent}%`;
  document.getElementById('progress-text').textContent =
    `${earned} of ${trophies.length} trophies earned — ${percent}% of the road to platinum`;
  const counts = document.getElementById('grade-counts');
  counts.replaceChildren(...countEarnedByGrade(trophies, earnedIds).map((row) => {
    const item = document.createElement('li');
    const dot = document.createElement('span');
    dot.className = `dot dot-${row.grade}`;
    dot.textContent = '●';
    item.append(dot, document.createTextNode(
      `${row.grade[0].toUpperCase()}${row.grade.slice(1)}: ${row.earned}/${row.total}`));
    return item;
  }));
}

function buildTrophyListItem(trophy) {
  const earned = earnedIds.has(trophy.id);
  const masked = isSpoilerMasked(trophy, earnedIds, spoilersHidden);

  const item = document.createElement('li');
  item.className = 'trophy-item' + (earned ? ' is-earned' : '') + (trophy.id === selectedId ? ' is-selected' : '');
  item.dataset.grade = trophy.grade;

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${displayNameFor(trophy, masked)} as earned`);
  box.addEventListener('change', () => {
    toggleEarnedId(earnedIds, trophy.id);
    renderAll();
  });

  const main = document.createElement('div');
  main.className = 'trophy-main';
  const nameLine = document.createElement('div');
  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = displayNameFor(trophy, masked);
  nameLine.append(name, gradeBadge(trophy.grade));
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = displayDescriptionFor(trophy, masked);
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const kind = document.createElement('span');
  kind.textContent = trophy.kind;
  const stage = document.createElement('span');
  stage.textContent = trophy.stage;
  meta.append(kind, stage);
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'missable-flag';
    flag.textContent = '⚠ MISSABLE';
    meta.append(flag);
  }
  main.append(nameLine, desc, meta);

  item.append(box, main);
  item.addEventListener('click', () => selectTrophy(trophy.id));
  return item;
}

function renderList() {
  const visible = trophies.filter((t) => trophyMatchesFilters(t, filterState, earnedIds));
  resultCountEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
  if (!visible.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No trophies match these filters. The full PS5 list has no online trophies, ' +
      'so the Online filter honestly comes up empty.';
    listEl.replaceChildren(empty);
    return;
  }
  listEl.replaceChildren(...visible.map(buildTrophyListItem));
}

function renderPanel() {
  const trophy = selectedTrophy();
  if (!trophy) {
    renderGuidePlaceholder(panelEl);
    return;
  }
  renderGuidePanel(panelEl, trophy, {
    earned: earnedIds.has(trophy.id),
    masked: isSpoilerMasked(trophy, earnedIds, spoilersHidden),
    onToggleEarned: (t) => {
      toggleEarnedId(earnedIds, t.id);
      renderAll();
    },
  });
}

function renderRoadmapView() {
  renderRoadmap(document.getElementById('roadmap-stages'), roadmapDoc, trophies, {
    earnedIds,
    spoilersHidden,
    onSelectTrophy: (trophy) => {
      selectTrophy(trophy.id);
      switchView('tracker');
    },
  });
}

function renderAll() {
  renderProgress();
  renderList();
  renderPanel();
  renderRoadmapView();
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderPanel();
}

function switchView(view) {
  currentView = view;
  document.getElementById('view-tracker').hidden = view !== 'tracker';
  document.getElementById('view-roadmap').hidden = view !== 'roadmap';
  document.getElementById('tab-tracker').classList.toggle('is-active', view === 'tracker');
  document.getElementById('tab-roadmap').classList.toggle('is-active', view === 'roadmap');
}

/* ---------- controls ---------- */

document.getElementById('tab-tracker').addEventListener('click', () => switchView('tracker'));
document.getElementById('tab-roadmap').addEventListener('click', () => switchView('roadmap'));

document.getElementById('search').addEventListener('input', (event) => {
  filterState.query = event.target.value.trim().toLowerCase();
  renderList();
});

wireChipGroup(document.getElementById('kind-chips'), (value) => {
  filterState.kind = value;
  renderList();
});
wireChipGroup(document.getElementById('grade-chips'), (value) => {
  filterState.grade = value;
  renderList();
});
wireChipGroup(document.getElementById('status-chips'), (value) => {
  filterState.status = value;
  renderList();
});

document.getElementById('spoiler-toggle').addEventListener('change', (event) => {
  spoilersHidden = event.target.checked;
  renderAll();
});

document.getElementById('export-btn').addEventListener('click', () => downloadProgressFile(earnedIds));

document.getElementById('import-input').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  try {
    const imported = parseProgressImport(await file.text(), trophies);
    earnedIds.clear();
    for (const id of imported) earnedIds.add(id);
    saveEarnedIds(earnedIds);
    renderAll();
  } catch {
    resultCountEl.textContent = 'That file could not be read as trophy progress — import a file this guide exported.';
  }
});

renderAll();
