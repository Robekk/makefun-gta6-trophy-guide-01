// The roadmap view: the ordered stages from the story to the platinum, rendered from data/roadmap.json.

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderRoadmap(elements, roadmap, trophiesById, store, handlers) {
  elements.title.textContent = roadmap.title;
  elements.intro.textContent = roadmap.intro;
  elements.stages.replaceChildren();

  for (const stage of roadmap.stages) {
    const card = el('li', 'stage-card');

    const top = el('div', 'stage-top');
    top.append(el('span', 'stage-num', `Stage ${stage.n}`));
    top.append(el('span', 'stage-title', stage.title));
    top.append(el('span', 'stage-hours', stage.hours));
    card.append(top);

    if ((stage.missableIds ?? []).length > 0) {
      const names = stage.missableIds.map((id) => trophiesById.get(id)?.name ?? `#${id}`).join(', ');
      const warning = el('div', 'missable-warning');
      warning.append(el('strong', '', '⚠ MISSABLE IN THIS STAGE — '), document.createTextNode(names));
      card.append(warning);
    }

    card.append(el('p', 'stage-summary', stage.summary));

    const chips = el('div', 'stage-trophies');
    for (const id of stage.trophyIds) {
      const trophy = trophiesById.get(id);
      if (!trophy) continue;
      const chip = el(
        'button',
        'stage-trophy-chip' + (store.isEarned(id) ? ' is-earned' : ''),
        (store.isEarned(id) ? '✓ ' : '') + trophy.name,
      );
      chip.type = 'button';
      chip.addEventListener('click', () => handlers.onJumpToTrophy(id));
      chips.append(chip);
    }
    card.append(chips);

    if ((stage.tips ?? []).length > 0) {
      const tips = el('ul', 'stage-tips');
      for (const tip of stage.tips) tips.append(el('li', '', tip));
      card.append(tips);
    }

    elements.stages.append(card);
  }
}
