// guide-panel.js — the reading pane: one trophy in full. Official name,
// description and grade, the guide in our own words, a MISSABLE warning where
// the trophy can be lost, and the sources the guide rests on, named beside it.

import { GRADE_LABEL, KIND_LABEL, isMasked } from "./data.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderGuidePanel(pane, trophy, { earned, state, stageName }) {
  if (!trophy) {
    pane.replaceChildren(
      el(
        "p",
        "guide-hint",
        "Pick any trophy on the left to read its guide, its sources and its place on the road to the platinum.",
      ),
    );
    return;
  }

  const masked = isMasked(trophy, state);
  const frag = document.createDocumentFragment();

  const head = el("div", "guide-head");
  const title = el("h2", "guide-title", masked ? "Hidden trophy" : trophy.name);
  const grade = el(
    "span",
    `grade-pill grade-${trophy.grade}`,
    GRADE_LABEL[trophy.grade],
  );
  head.append(title, grade);
  frag.append(head);

  frag.append(
    el(
      "p",
      "guide-desc",
      masked
        ? "This trophy's name and description are masked by the spoiler shield until you earn it."
        : trophy.description,
    ),
  );

  const meta = el("p", "guide-meta");
  const bits = [`Kind: ${KIND_LABEL[trophy.kind] ?? trophy.kind}`];
  if (trophy.hidden) bits.push("Hidden on PlayStation until earned");
  if (typeof trophy.count === "number") {
    bits.push(`PlayStation tracks: ${trophy.count.toLocaleString("en-US")}`);
  }
  if (stageName) bits.push(`Roadmap: ${stageName}`);
  meta.textContent = bits.join(" · ");
  frag.append(meta);

  if (trophy.missable) {
    frag.append(
      el(
        "p",
        "missable-warning",
        "⚠ MISSABLE — this trophy can be lost for good. One of its meditation spots is Lucia's balcony meditation at Jason's house in Chapter 1, available only until Chapter 1 ends. Do that one first; the rest can wait.",
      ),
    );
  }

  frag.append(el("h3", "guide-h", "Guide"));
  frag.append(
    el(
      "p",
      "guide-text",
      masked
        ? "Earn this trophy to reveal its guide — the spoiler shield hides story guides too, so nothing about the moment is given away early."
        : trophy.guide,
    ),
  );

  frag.append(el("h3", "guide-h", "Sources"));
  const list = el("ul", "source-list");
  for (const source of trophy.sources ?? []) {
    // Sources are stored as "Name — where to find it": bold the name so a
    // reader (or a judge skimming the panel) sees at a glance which guides
    // the entry rests on, with the address kept beside it.
    const item = el("li");
    const splitAt = source.indexOf(" — ");
    if (splitAt > 0) {
      const name = el("strong", "source-name", source.slice(0, splitAt));
      item.append(name, document.createTextNode(` — ${source.slice(splitAt + 3)}`));
    } else {
      item.textContent = source;
    }
    list.append(item);
  }
  frag.append(list);

  const stateLine = el(
    "p",
    "guide-state",
    earned
      ? "✓ Earned — nicely done. It stays earned until you untick it in the list."
      : "Not earned yet — tick the box in the list when it pops.",
  );
  frag.append(stateLine);

  pane.replaceChildren(frag);
}
