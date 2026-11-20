// roadmap-view.js — the platinum roadmap view.
// Renders the roadmap header (difficulty, hours, playthroughs and the
// missable count from roadmap.json) and the stage grid: every stage
// with its number, title, time estimate, goal note and a chip for each
// of its trophies, coloured by grade, with the Chapter 1 missable
// stage outlined in red. Chips always carry the official trophy names:
// the roadmap is the planning document for the whole run, while the
// spoiler shield governs the checklist and guides views. Also answers
// which stage a trophy belongs to, for the detail panel's roadmap line.

import { stageTrophies } from './trophy-catalog.js';
import { esc } from './tracker-view.js';

export function stageOfTrophy(catalog, trophyId) {
  const stages = catalog.roadmap.stages;
  for (let i = 0; i < stages.length; i++) {
    if (stages[i].trophies.includes(trophyId)) return { ...stages[i], number: i + 1 };
  }
  return null;
}

export function renderRoadmap(roadmapEl, catalog, store) {
  const { roadmap } = catalog;
  const head = `<div class="roadmap-head">
      <h2>${esc(roadmap.roadmapTitle)}</h2>
      <span class="rm-stat">Difficulty <b>${esc(roadmap.overview.difficulty)}</b></span>
      <span class="rm-stat">Time <b>${esc(roadmap.overview.hours)}</b></span>
      <span class="rm-stat">Playthroughs <b>${roadmap.overview.playthroughs}</b></span>
      <span class="rm-stat">Missable <b>${roadmap.overview.missables}</b></span>
      <span class="rm-stat">${esc(roadmap.overview.note)}</span>
    </div>`;
  const cards = roadmap.stages.map((stage, i) => {
    const chips = stageTrophies(stage, catalog.byId).map((t) => {
      const earned = store.isEarned(t.id);
      return `<span class="stage-chip"><span class="dot gem-${t.grade}"></span>${esc(t.name)}${t.missable ? ' <span class="mini-miss">MISSABLE</span>' : ''}${earned ? ' ✓' : ''}</span>`;
    }).join('');
    return `<section class="stage-card${stage.missable ? ' stage-missable' : ''}">
      <div class="stage-top">
        <span class="stage-num">${i + 1}</span>
        <h3>${esc(stage.title)}</h3>
        <span class="stage-hours">${esc(stage.hours)}</span>
      </div>
      <p class="stage-goal">${esc(stage.goal)}</p>
      <div class="stage-trophies">${chips}</div>
    </section>`;
  }).join('');
  roadmapEl.innerHTML = head + `<div class="roadmap-grid">${cards}</div>`;
}
