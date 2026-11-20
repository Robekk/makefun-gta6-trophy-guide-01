// roadmap-view.js — renders data/roadmap.json: the seven stages from the
// opening mission to the platinum, each with its time budget, its detail, the
// trophies it covers (with live earned ticks) and the missable flag where a
// stage carries one.

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderRoadmap({ titleEl, summaryEl, listEl }, roadmap, trophiesById, earnedSet) {
  titleEl.textContent = roadmap.title;
  summaryEl.textContent = roadmap.summary;
  const stages = [...roadmap.stages].sort((a, b) => a.n - b.n);
  const items = stages.map((stage) => {
    const li = el("li", "stage-card");
    const head = el("div", "stage-head");
    head.append(
      el("span", "stage-n", `Stage ${stage.n}`),
      el("h3", "stage-name", stage.name),
      el("span", "stage-time", stage.time),
    );
    li.append(head);
    li.append(el("p", "stage-detail", stage.detail));
    if (stage.missable_note) {
      li.append(el("p", "missable-warning", `⚠ ${stage.missable_note}`));
    }
    const chips = el("p", "stage-trophies");
    for (const id of stage.trophies) {
      const trophy = trophiesById.get(id);
      if (!trophy) continue;
      const chip = el(
        "span",
        `stage-chip${earnedSet.has(id) ? " is-earned" : ""}`,
        `${earnedSet.has(id) ? "✓ " : ""}${trophy.name}`,
      );
      chips.append(chip);
    }
    li.append(chips);
    const done = stage.trophies.filter((id) => earnedSet.has(id)).length;
    li.append(
      el("p", "stage-progress", `${done} of ${stage.trophies.length} trophies in this stage earned`),
    );
    return li;
  });
  listEl.replaceChildren(...items);
}

// Which stage a trophy belongs to, for the guide panel's roadmap line.
export function stageNameFor(roadmap, trophyId) {
  const stage = roadmap.stages.find((s) => s.trophies.includes(trophyId));
  return stage ? `Stage ${stage.n} — ${stage.name}` : null;
}
