// tracker.js — the app's entry module.
//
// Boots the guide: loads the catalog, restores saved progress, renders
// the checklist and the guide panel, and wires every control — search,
// kind chips, grade and progress filters, the spoiler shield, the view
// tabs, and export/import. All state changes flow through renderAll so
// the list, the panel, the roadmap and the progress header never drift.

import { loadCatalog, trophyMatches, isMasked, KIND_LABELS } from "./catalog.js";
import {
  loadEarned,
  saveEarned,
  loadSettings,
  saveSettings,
  exportProgress,
  parseImportedProgress,
} from "./progress.js";
import { renderGuidePanel, renderRoadmap } from "./panels.js";

const state = {
  trophies: [],
  trophiesByName: new Map(),
  roadmap: null,
  earned: loadEarned(),
  settings: loadSettings(),
  filters: { kind: "all", grade: "all", state: "all", search: "" },
  selectedId: null,
  view: "tracker",
};

const nodes = {};

function grabNodes() {
  for (const id of [
    "earned-count", "progress-fill", "progress-pct",
    "tab-tracker", "tab-roadmap", "tracker-view", "roadmap-view",
    "search", "kind-filters", "grade-filter", "state-filter",
    "spoiler-toggle", "export-btn", "import-file", "result-line",
    "trophy-list", "guide-panel", "roadmap-content",
  ]) {
    nodes[id] = document.getElementById(id);
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveEarned(state.earned);
  renderAll();
}

function selectTrophy(id, switchToTracker) {
  state.selectedId = id;
  if (switchToTracker) setView("tracker");
  renderAll();
}

function setView(view) {
  state.view = view;
  nodes["tracker-view"].hidden = view !== "tracker";
  nodes["roadmap-view"].hidden = view !== "roadmap";
  nodes["tab-tracker"].classList.toggle("active", view === "tracker");
  nodes["tab-roadmap"].classList.toggle("active", view === "roadmap");
}

function renderProgress() {
  const total = state.trophies.length;
  const done = state.trophies.filter((t) => state.earned.has(t.id)).length;
  nodes["earned-count"].textContent = String(done);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  nodes["progress-fill"].style.width = `${pct}%`;
  nodes["progress-pct"].textContent = `${pct}% of the platinum run`;
}

function renderList() {
  const list = nodes["trophy-list"];
  list.replaceChildren();
  const visible = state.trophies.filter((t) => trophyMatches(t, state.filters, state.earned));
  nodes["result-line"].textContent =
    `Showing ${visible.length} of ${state.trophies.length} trophies · ` +
    `${state.earned.size} earned in total · progress saves automatically in this browser`;

  if (visible.length === 0) {
    list.append(el("li", "empty-note", "No trophy matches those filters — loosen the search or pick another kind."));
    return;
  }

  for (const trophy of visible) {
    const masked = isMasked(trophy, state.earned, state.settings);
    const row = el("li", "trophy-row");
    if (state.earned.has(trophy.id)) row.classList.add("earned");
    if (state.selectedId === trophy.id) row.classList.add("selected");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = state.earned.has(trophy.id);
    check.setAttribute("aria-label", `Mark ${trophy.name} as earned`);
    check.addEventListener("click", (event) => event.stopPropagation());
    check.addEventListener("change", () => toggleEarned(trophy.id));
    row.append(check);

    const main = el("div", "trophy-main");
    main.append(el("div", "trophy-name", masked ? "Hidden trophy" : trophy.name));
    main.append(el("div", "trophy-desc", masked
      ? "Masked by the spoiler shield until earned."
      : trophy.description));
    const meta = el("div", "trophy-meta");
    const gradeBadge = el("span", `badge grade-${trophy.grade}`, trophy.grade);
    meta.append(gradeBadge);
    meta.append(el("span", "badge kind", KIND_LABELS[trophy.kind] ?? trophy.kind));
    if (trophy.missable) meta.append(el("span", "badge missable", "Missable"));
    if (trophy.hidden && !masked) meta.append(el("span", "badge hidden-badge", "Hidden"));
    if (masked) meta.append(el("span", "badge masked", "Spoiler shield"));
    main.append(meta);
    row.append(main);

    row.addEventListener("click", () => selectTrophy(trophy.id, false));
    list.append(row);
  }
}

function renderPanel() {
  const trophy = state.trophies.find((t) => t.id === state.selectedId) ?? null;
  renderGuidePanel(nodes["guide-panel"], trophy, {
    earned: trophy ? state.earned.has(trophy.id) : false,
    masked: trophy ? isMasked(trophy, state.earned, state.settings) : false,
    onToggleEarned: toggleEarned,
  });
}

function renderRoadmapView() {
  if (!state.roadmap) return;
  renderRoadmap(nodes["roadmap-content"], state.roadmap, state.trophiesByName, state.earned,
    (id) => selectTrophy(id, true));
}

function renderAll() {
  renderProgress();
  renderList();
  renderPanel();
  renderRoadmapView();
}

function downloadProgress() {
  const blob = new Blob([exportProgress(state.earned)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "leonida-trophy-progress.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function importProgress(file) {
  try {
    const text = await file.text();
    state.earned = parseImportedProgress(text);
    saveEarned(state.earned);
    renderAll();
  } catch {
    nodes["result-line"].textContent =
      "That file could not be read as trophy progress — export a progress file from this app and import that.";
  }
}

function wireControls() {
  nodes["search"].addEventListener("input", () => {
    state.filters.search = nodes["search"].value;
    renderList();
  });
  nodes["kind-filters"].addEventListener("click", (event) => {
    const chip = event.target.closest("[data-kind]");
    if (!chip) return;
    state.filters.kind = chip.dataset.kind;
    for (const node of nodes["kind-filters"].querySelectorAll(".chip")) {
      node.classList.toggle("active", node === chip);
    }
    renderList();
  });
  nodes["grade-filter"].addEventListener("change", () => {
    state.filters.grade = nodes["grade-filter"].value;
    renderList();
  });
  nodes["state-filter"].addEventListener("change", () => {
    state.filters.state = nodes["state-filter"].value;
    renderList();
  });
  nodes["spoiler-toggle"].checked = state.settings.spoilerShield;
  nodes["spoiler-toggle"].addEventListener("change", () => {
    state.settings.spoilerShield = nodes["spoiler-toggle"].checked;
    saveSettings(state.settings);
    renderAll();
  });
  nodes["export-btn"].addEventListener("click", downloadProgress);
  nodes["import-file"].addEventListener("change", () => {
    const file = nodes["import-file"].files[0];
    if (file) importProgress(file);
    nodes["import-file"].value = "";
  });
  nodes["tab-tracker"].addEventListener("click", () => setView("tracker"));
  nodes["tab-roadmap"].addEventListener("click", () => setView("roadmap"));
}

async function boot() {
  grabNodes();
  wireControls();
  try {
    const { trophies, roadmap } = await loadCatalog();
    state.trophies = trophies;
    state.roadmap = roadmap;
    state.trophiesByName = new Map(trophies.map((t) => [t.name, t]));
    state.selectedId = trophies.length > 0 ? trophies[0].id : null;
    renderAll();
  } catch (error) {
    nodes["result-line"].textContent = `The guide's data failed to load (${error.message}).`;
  }
}

boot();
