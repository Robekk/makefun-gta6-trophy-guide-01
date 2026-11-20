// Leonida Nights — entry point: loads the data, wires the controls, and keeps the
// tracker, guide panel and roadmap in step with the progress store.

import { createProgressStore } from './state.js';
import { loadGuideData } from './data.js';
import { renderKindChips, renderProgress, renderTrophyList } from './list-view.js';
import { renderGuidePanel } from './guide-panel.js';
import { renderRoadmap } from './roadmap-view.js';

const elements = {
  summary: document.getElementById('progress-summary'),
  grades: document.getElementById('progress-grades'),
  fill: document.getElementById('progress-fill'),
  trackerView: document.getElementById('tracker-view'),
  roadmapView: document.getElementById('roadmap-view'),
  trackerTab: document.getElementById('view-tracker-btn'),
  roadmapTab: document.getElementById('view-roadmap-btn'),
  exportBtn: document.getElementById('export-btn'),
  importBtn: document.getElementById('import-btn'),
  importFile: document.getElementById('import-file'),
  search: document.getElementById('search-input'),
  kindFilters: document.getElementById('kind-filters'),
  gradeFilter: document.getElementById('grade-filter'),
  earnedFilter: document.getElementById('earned-filter'),
  spoilerToggle: document.getElementById('spoiler-toggle'),
  list: document.getElementById('trophy-list'),
  resultCount: document.getElementById('result-count'),
  emptyState: document.getElementById('empty-state'),
  guideContent: document.getElementById('guide-content'),
  roadmapTitle: document.getElementById('roadmap-title'),
  roadmapIntro: document.getElementById('roadmap-intro'),
  roadmapStages: document.getElementById('roadmap-stages'),
};

const store = createProgressStore();
let trophies = [];
let roadmap = null;
let trophiesById = new Map();

const handlers = {
  onToggleEarned(id) {
    store.toggleEarned(id);
  },
  onSelect(id) {
    store.update({ selectedId: id });
  },
  onJumpToTrophy(id) {
    store.update({ view: 'tracker', selectedId: id, kind: 'all', grade: 'all', earnedFilter: 'all', query: '' });
    elements.search.value = '';
    elements.gradeFilter.value = 'all';
    elements.earnedFilter.value = 'all';
  },
};

function render() {
  const state = store.getState();
  const isRoadmap = state.view === 'roadmap';
  elements.trackerView.hidden = isRoadmap;
  elements.roadmapView.hidden = !isRoadmap;
  elements.trackerTab.classList.toggle('is-active', !isRoadmap);
  elements.roadmapTab.classList.toggle('is-active', isRoadmap);

  renderProgress({ summary: elements.summary, grades: elements.grades, fill: elements.fill }, trophies, store);
  renderKindChips(elements.kindFilters, trophies, state, (kind) => store.update({ kind }));
  renderTrophyList(
    { list: elements.list, resultCount: elements.resultCount, emptyState: elements.emptyState },
    trophies,
    state,
    store,
    handlers,
  );
  const selected = trophiesById.get(state.selectedId) ?? null;
  renderGuidePanel(elements.guideContent, selected, state, store, handlers);
  if (roadmap) {
    renderRoadmap(
      { title: elements.roadmapTitle, intro: elements.roadmapIntro, stages: elements.roadmapStages },
      roadmap,
      trophiesById,
      store,
      handlers,
    );
  }
}

function bindControls() {
  elements.search.addEventListener('input', () => store.update({ query: elements.search.value }));
  elements.gradeFilter.addEventListener('change', () => store.update({ grade: elements.gradeFilter.value }));
  elements.earnedFilter.addEventListener('change', () => store.update({ earnedFilter: elements.earnedFilter.value }));
  elements.spoilerToggle.addEventListener('change', () => store.update({ spoilerShield: elements.spoilerToggle.checked }));
  elements.trackerTab.addEventListener('click', () => store.update({ view: 'tracker' }));
  elements.roadmapTab.addEventListener('click', () => store.update({ view: 'roadmap' }));

  elements.exportBtn.addEventListener('click', () => {
    const blob = new Blob([store.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leonida-nights-progress.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  elements.importBtn.addEventListener('click', () => elements.importFile.click());
  elements.importFile.addEventListener('change', async () => {
    const file = elements.importFile.files?.[0];
    if (!file) return;
    try {
      const ids = store.importJson(await file.text());
      const valid = ids.filter((id) => trophiesById.has(id));
      store.setEarned(valid);
    } catch {
      window.alert('That file could not be read as a Leonida Nights progress export.');
    } finally {
      elements.importFile.value = '';
    }
  });
}

async function boot() {
  try {
    const data = await loadGuideData();
    trophies = data.trophies;
    roadmap = data.roadmap;
    trophiesById = new Map(trophies.map((t) => [t.id, t]));
  } catch (error) {
    elements.summary.textContent = `Could not load the trophy data (${error.message}). Serve the app/ folder over HTTP and reload.`;
    return;
  }
  const state = store.getState();
  elements.search.value = state.query;
  elements.gradeFilter.value = state.grade;
  elements.earnedFilter.value = state.earnedFilter;
  elements.spoilerToggle.checked = state.spoilerShield;
  if (state.selectedId === null && trophies.length > 0) store.update({ selectedId: 28 });
  bindControls();
  store.subscribe(render);
  render();
}

boot();
