// The platinum roadmap view.
//
// Renders app/data/roadmap.json's stages in their stored order. Each stage
// shows its summary, its sources, a per-stage progress bar, and the trophies
// whose `stage` field names it — with their earned state and a warning
// marker on the missable ones. Clicking a trophy hands it to the caller,
// which opens it in the tracker view's guide panel.

import { displayNameFor, isSpoilerMasked } from './spoiler.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// context: { earnedIds, spoilersHidden, onSelectTrophy(trophy) }
export function renderRoadmap(container, roadmap, trophies, context) {
  const sections = [];

  for (const stage of roadmap.stages) {
    const inStage = trophies.filter((t) => t.stage === stage.name);
    const earnedInStage = inStage.filter((t) => context.earnedIds.has(t.id)).length;

    const section = element('section', 'roadmap-stage card');

    const head = element('div', 'roadmap-stage-head');
    head.append(
      element('h2', null, stage.name),
      element('span', 'stage-progress', `${earnedInStage} of ${inStage.length} earned`),
    );
    section.append(head);

    const bar = element('div', 'stage-bar');
    const fill = element('div', 'stage-bar-fill');
    fill.style.width = inStage.length ? `${(earnedInStage / inStage.length) * 100}%` : '0%';
    bar.append(fill);
    section.append(bar);

    section.append(element('p', 'stage-summary', stage.summary));
    if (Array.isArray(stage.sources) && stage.sources.length) {
      section.append(element('p', 'stage-sources', `Sources: ${stage.sources.join('; ')}`));
    }

    const list = element('ul', 'stage-trophies');
    for (const trophy of inStage) {
      const earned = context.earnedIds.has(trophy.id);
      const masked = isSpoilerMasked(trophy, context.earnedIds, context.spoilersHidden);
      const row = element('li', `stage-trophy${earned ? ' is-earned' : ''}`);
      row.append(
        element('span', 'state', earned ? '✓' : '○'),
        element('span', 'stage-trophy-name', displayNameFor(trophy, masked)),
      );
      if (trophy.missable) row.append(element('span', 'missable-flag', '⚠ MISSABLE'));
      row.addEventListener('click', () => context.onSelectTrophy(trophy));
      list.append(row);
    }
    section.append(list);
    sections.push(section);
  }

  container.replaceChildren(...sections);
}
