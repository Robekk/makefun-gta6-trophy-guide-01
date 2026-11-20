// panels.js — the two reading surfaces of the guide.
//
// renderGuidePanel fills the side panel with one trophy: its official
// name, description and grade, a MISSABLE warning where flagged, the
// guide in this app's own words, and the sources that guide draws on.
// renderRoadmap draws the platinum roadmap from data/roadmap.json,
// stage by stage, with the missable trophy flagged in its stage.

import { KIND_LABELS, countEarned } from "./catalog.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function badge(text, className) {
  return el("span", `badge ${className}`, text);
}

/**
 * One source citation as a list item. When the citation carries a URL,
 * the URL becomes a real link the reader can follow — the app itself
 * fetches nothing; the link only opens when clicked.
 */
function sourceListItem(source) {
  const item = el("li");
  const marker = source.indexOf("https://");
  if (marker === -1) {
    item.textContent = source;
    return item;
  }
  item.append(document.createTextNode(source.slice(0, marker)));
  const url = source.slice(marker).trim();
  const link = el("a", "", url);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  item.append(link);
  return item;
}

/**
 * Shows one trophy in the guide panel. A masked trophy (spoiler shield
 * on, not yet earned) shows a placeholder instead of its real name,
 * description and guide. onToggleEarned(id) fires from the panel's
 * earned button.
 */
export function renderGuidePanel(panel, trophy, view) {
  panel.replaceChildren();
  if (!trophy) {
    panel.append(el("p", "panel-placeholder",
      "Pick a trophy from the list to read its guide: what to do, where and how, when it can be missed, and the sources the guide draws on."));
    return;
  }

  if (view.masked) {
    panel.append(el("h2", "", "Hidden trophy"));
    panel.append(el("p", "official-desc",
      "The spoiler shield is masking this trophy because it is a story or hidden trophy you have not earned yet. Turn the shield off above, or earn it, to reveal its name, description and guide."));
    const actions = el("div", "panel-actions");
    const button = el("button", view.earned ? "is-earned" : "", view.earned ? "Earned ✓ — tap to undo" : "Mark as earned");
    button.type = "button";
    button.addEventListener("click", () => view.onToggleEarned(trophy.id));
    actions.append(button);
    panel.append(actions);
    return;
  }

  panel.append(el("h2", "", trophy.name));
  panel.append(el("p", "official-desc", trophy.description));

  const badges = el("div", "panel-badges");
  badges.append(badge(trophy.grade, `grade-${trophy.grade}`));
  badges.append(badge(KIND_LABELS[trophy.kind] ?? trophy.kind, "kind"));
  if (trophy.hidden) badges.append(badge("Hidden on PSN", "hidden-badge"));
  if (trophy.missable) badges.append(badge("Missable", "missable"));
  panel.append(badges);

  if (trophy.missable) {
    const warning = el("div", "missable-warning");
    warning.append(el("strong", "", "MISSABLE — "));
    warning.append(document.createTextNode(
      "one step of this trophy exists only in Chapter 1 and is gone for good once the chapter ends. Read the guide before you finish Chapter 1."));
    panel.append(warning);
  }

  panel.append(el("p", "guide-text", trophy.guide));

  const sources = el("div", "sources");
  sources.append(el("h3", "", "Sources"));
  const list = el("ul");
  for (const source of trophy.sources ?? []) {
    list.append(sourceListItem(source));
  }
  sources.append(list);
  panel.append(sources);

  const actions = el("div", "panel-actions");
  const button = el("button", view.earned ? "is-earned" : "", view.earned ? "Earned ✓ — tap to undo" : "Mark as earned");
  button.type = "button";
  button.addEventListener("click", () => view.onToggleEarned(trophy.id));
  actions.append(button);
  panel.append(actions);
}

/**
 * Draws the roadmap: its summary and facts first, then one card per
 * stage with the stage's trophies as chips (earned ones lit, the
 * missable one in red). Clicking a chip calls onSelectTrophy(name).
 */
export function renderRoadmap(container, roadmap, trophiesByName, earned, onSelectTrophy) {
  container.replaceChildren();

  const intro = el("div", "roadmap-intro");
  intro.append(el("h2", "", roadmap.title));
  intro.append(el("p", "", roadmap.summary));
  const facts = el("div", "roadmap-facts");
  facts.append(badge(`Difficulty ${roadmap.difficulty}`, "kind"));
  facts.append(badge(`${roadmap.playthroughs} playthrough`, "kind"));
  facts.append(badge("0 online trophies", "kind"));
  facts.append(badge("1 missable trophy", "missable"));
  intro.append(facts);
  container.append(intro);

  for (const warning of roadmap.missables ?? []) {
    const box = el("div", "missable-warning");
    box.append(el("strong", "", `MISSABLE — ${warning.name}: `));
    box.append(document.createTextNode(warning.warning));
    container.append(box);
  }

  for (const stage of roadmap.stages) {
    const card = el("section", "stage-card");
    const heading = el("h3", "", `Stage ${stage.stage} — ${stage.title}`);
    heading.append(el("span", "stage-hours", stage.hours));
    card.append(heading);
    card.append(el("p", "stage-focus", stage.focus));

    const stageTrophies = stage.trophies
      .map((name) => trophiesByName.get(name))
      .filter(Boolean);
    const doneCount = countEarned(stageTrophies, earned);
    card.append(el("p", "result-line", `${doneCount} of ${stageTrophies.length} trophies in this stage earned`));

    const chips = el("div", "stage-trophies");
    for (const trophy of stageTrophies) {
      const chip = el("button", "stage-trophy", trophy.name);
      chip.type = "button";
      if (earned.has(trophy.id)) chip.classList.add("done");
      if (trophy.missable) chip.classList.add("missable");
      chip.addEventListener("click", () => onSelectTrophy(trophy.id));
      chips.append(chip);
    }
    card.append(chips);
    container.append(card);
  }
}
