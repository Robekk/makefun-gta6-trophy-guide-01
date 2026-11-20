// main.js — boots the tracker: loads the guide data, wires the toolbar
// (search, kind chips, grade and state filters, spoiler shield, export and
// import), and keeps the checklist, the guide panel, the header progress and
// the roadmap in step with the saved state.

import { loadGuideData, trophyMatches, GRADE_LABEL } from "./data.js";
import {
  loadState,
  saveState,
  toggleEarned,
  isEarned,
  exportText,
  importText,
} from "./state.js";
import { renderList } from "./list-view.js";
import { renderGuidePanel } from "./guide-panel.js";
import { renderRoadmap, stageNameFor } from "./roadmap-view.js";

const $ = (id) => document.getElementById(id);

const filters = { kind: "all", grade: "all", state: "all", query: "" };
let data = null;
let state = loadState();
let selectedId = null;
let view = "tracker";

function earnedSet() {
  return new Set(state.earned);
}

function visibleTrophies() {
  return data.trophies.filter((t) => trophyMatches(t, filters, earnedSet()));
}

function refreshProgress() {
  const total = data.trophies.length;
  const done = state.earned.length;
  $("earnedCount").textContent = String(done);
  $("earnedPct").textContent = `${Math.round((done / total) * 100)}%`;
  $("progressFill").style.width = `${(done / total) * 100}%`;
  const missable = data.trophies.find((t) => t.missable);
  $("missableState").textContent = isEarned(state, missable.id)
    ? "the missable one is safe ✓"
    : "missable still open — do the Chapter 1 meditation";
  const per = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const perTotal = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of data.trophies) {
    perTotal[t.grade] += 1;
    if (isEarned(state, t.id)) per[t.grade] += 1;
  }
  $("gradeLine").textContent = ["platinum", "gold", "silver", "bronze"]
    .map((g) => `${GRADE_LABEL[g]} ${per[g]}/${perTotal[g]}`)
    .join(" · ");
}

function refreshList() {
  const visible = visibleTrophies();
  renderList($("trophyList"), visible, {
    earnedSet: earnedSet(),
    state,
    selectedId,
  });
  $("emptyNote").hidden = visible.length > 0;
  $("listMeta").textContent =
    `Showing ${visible.length} of ${data.trophies.length} trophies` +
    (filters.kind === "online"
      ? " — GTA VI's official list has no online trophies; all 55 are offline."
      : "");
}

function refreshPanel() {
  const trophy = data.trophies.find((t) => t.id === selectedId) ?? null;
  renderGuidePanel($("guidePane"), trophy, {
    earned: trophy ? isEarned(state, trophy.id) : false,
    state,
    stageName: trophy ? stageNameFor(data.roadmap, trophy.id) : null,
  });
}

function refreshRoadmap() {
  renderRoadmap(
    { titleEl: $("roadmapTitle"), summaryEl: $("roadmapSummary"), listEl: $("stageList") },
    data.roadmap,
    new Map(data.trophies.map((t) => [t.id, t])),
    earnedSet(),
  );
}

function refreshAll() {
  refreshProgress();
  refreshList();
  refreshPanel();
  if (view === "roadmap") refreshRoadmap();
}

function setView(next) {
  view = next;
  $("trackerView").hidden = next !== "tracker";
  $("roadmapView").hidden = next !== "roadmap";
  $("viewTrackerBtn").classList.toggle("active", next === "tracker");
  $("viewRoadmapBtn").classList.toggle("active", next === "roadmap");
  if (next === "roadmap") refreshRoadmap();
}

function wireControls() {
  $("searchInput").addEventListener("input", (event) => {
    filters.query = event.target.value.trim().toLowerCase();
    refreshList();
  });
  $("kindChips").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-kind]");
    if (!chip) return;
    filters.kind = chip.dataset.kind;
    for (const c of $("kindChips").querySelectorAll(".chip")) {
      c.classList.toggle("active", c === chip);
    }
    refreshList();
  });
  $("gradeSelect").addEventListener("change", (event) => {
    filters.grade = event.target.value;
    refreshList();
  });
  $("stateSelect").addEventListener("change", (event) => {
    filters.state = event.target.value;
    refreshList();
  });
  $("spoilerToggle").addEventListener("change", (event) => {
    state.spoilerShield = event.target.checked;
    saveState(state);
    refreshAll();
  });
  $("viewTrackerBtn").addEventListener("click", () => setView("tracker"));
  $("viewRoadmapBtn").addEventListener("click", () => setView("roadmap"));

  $("trophyList").addEventListener("change", (event) => {
    const box = event.target.closest(".earned-check");
    if (!box) return;
    toggleEarned(state, Number(box.dataset.id));
    saveState(state);
    refreshAll();
  });
  $("trophyList").addEventListener("click", (event) => {
    if (event.target.closest(".earned-check")) return;
    const row = event.target.closest(".trophy-row");
    if (!row) return;
    selectedId = Number(row.dataset.id);
    refreshList();
    refreshPanel();
  });

  $("exportBtn").addEventListener("click", () => {
    const blob = new Blob([exportText(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leonida-nights-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  });
  $("importFile").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const next = importText(await file.text());
    if (!next) return;
    state = next;
    $("spoilerToggle").checked = state.spoilerShield;
    saveState(state);
    refreshAll();
  });
}

async function boot() {
  try {
    data = await loadGuideData();
  } catch (err) {
    $("listMeta").textContent = `Could not load the guide data: ${err.message}`;
    return;
  }
  $("spoilerToggle").checked = state.spoilerShield;
  const missable = data.trophies.find((t) => t.missable);
  selectedId = missable ? missable.id : data.trophies[0].id;
  wireControls();
  refreshAll();
}

boot();
