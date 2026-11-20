// platinum-app.js — application boot and the header progress dashboard.
// Loads the trophy catalog, creates the progress store, wires the
// header (earned count, percent, progress bar, per-grade counts and the
// Export / Import buttons), the spoiler-shield toggle and the three
// view tabs (Tracker, Guides, Roadmap), and keeps every view in sync
// whenever progress changes in the store.

import { loadCatalog, GRADE_ORDER, GRADE_LABEL, GRADE_TOTALS } from './trophy-catalog.js';
import { createProgressStore, downloadProgress } from './progress-store.js';
import { createTrackerView } from './tracker-view.js';
import { renderDetail, renderGuides } from './guide-panel.js';
import { renderRoadmap, stageOfTrophy } from './roadmap-view.js';

const $ = (id) => document.getElementById(id);

async function boot() {
  const catalog = await loadCatalog();
  const store = createProgressStore();

  const listEl = $('trophy-list');
  const panelEl = $('detail-panel');
  const guidesEl = $('view-guides');
  const roadmapEl = $('view-roadmap');

  function renderHeader() {
    const total = catalog.trophies.length;
    const done = store.earnedCount();
    $('progress-count').textContent = `${done} of ${total}`;
    $('progress-label').textContent = `trophies earned — ${Math.round((done / total) * 100)}% of the platinum run`;
    $('progress-fill').style.width = `${(done / total) * 100}%`;
    $('grade-counts').innerHTML = GRADE_ORDER.map((grade) => {
      const got = catalog.trophies.filter((t) => t.grade === grade && store.isEarned(t.id)).length;
      return `<span class="grade-chip">${GRADE_LABEL[grade]} <b>${got} / ${GRADE_TOTALS[grade]}</b></span>`;
    }).join('') + '<span class="grade-chip">Hidden <b>28</b></span><span class="grade-chip">Missable <b>1</b></span>';
  }

  const tracker = createTrackerView({
    listEl,
    catalog,
    store,
    onSelect(id) {
      const trophy = catalog.byId.get(id);
      if (trophy) renderDetail(panelEl, trophy, store, stageOfTrophy(catalog, id));
    },
  });
  tracker.bindToolbar({
    searchEl: $('search-input'),
    chipsEl: $('kind-chips'),
    gradeEl: $('grade-filter'),
    stateEl: $('state-filter'),
  });

  function renderAll() {
    renderHeader();
    tracker.render();
    const selected = catalog.byId.get(tracker.selectedId);
    if (selected) renderDetail(panelEl, selected, store, stageOfTrophy(catalog, selected.id));
    renderGuides(guidesEl, catalog, store);
    renderRoadmap(roadmapEl, catalog, store);
  }
  store.subscribe(renderAll);

  // Header actions: export downloads the earned set; import restores it.
  $('btn-export').addEventListener('click', () => downloadProgress(store));
  const importFile = $('import-file');
  $('btn-import').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    if (!file) return;
    try { store.importJson(await file.text()); } catch { /* ignore a bad file */ }
    importFile.value = '';
  });

  // Spoiler shield toggle.
  const spoilerToggle = $('spoiler-toggle');
  spoilerToggle.checked = store.spoilerOn();
  spoilerToggle.addEventListener('change', () => store.setSpoiler(spoilerToggle.checked));

  // View tabs.
  const views = { tracker: $('view-tracker'), guides: guidesEl, roadmap: roadmapEl };
  document.querySelectorAll('[data-view]').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-view]').forEach((t) => t.classList.toggle('active', t === tab));
      for (const [name, el] of Object.entries(views)) el.hidden = name !== tab.dataset.view;
    });
  });

  renderAll();
}

boot().catch((err) => {
  document.getElementById('trophy-list').innerHTML =
    `<div class="list-empty">Failed to load trophy data: ${err.message}</div>`;
});
