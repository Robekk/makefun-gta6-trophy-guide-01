// list-view.js — renders the checklist: one row per trophy with its official
// name, description and grade, an earned checkbox, and the badges (hidden,
// missable, kind) that matter at a glance. Masked trophies (spoiler shield)
// show as "Hidden trophy" until earned.

import { GRADE_LABEL, KIND_LABEL, isMasked } from "./data.js";

function badge(text, cls) {
  const span = document.createElement("span");
  span.className = `badge ${cls}`;
  span.textContent = text;
  return span;
}

export function renderTrophyRow(trophy, { earned, masked, selected }) {
  const li = document.createElement("li");
  li.className = "trophy-row";
  li.dataset.id = String(trophy.id);
  if (earned) li.classList.add("is-earned");
  if (selected) li.classList.add("is-selected");
  if (masked) li.classList.add("is-masked");

  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "earned-check";
  check.checked = earned;
  check.dataset.id = String(trophy.id);
  check.setAttribute(
    "aria-label",
    `Mark ${masked ? "hidden trophy" : trophy.name} as earned`,
  );

  const body = document.createElement("div");
  body.className = "row-body";

  const titleLine = document.createElement("p");
  titleLine.className = "row-title";
  const name = document.createElement("span");
  name.className = "row-name";
  name.textContent = masked ? "Hidden trophy" : trophy.name;
  titleLine.append(name);
  const grade = document.createElement("span");
  grade.className = `grade-pill grade-${trophy.grade}`;
  grade.textContent = GRADE_LABEL[trophy.grade];
  titleLine.append(grade);
  body.append(titleLine);

  const desc = document.createElement("p");
  desc.className = "row-desc";
  desc.textContent = masked
    ? "Name and description stay hidden until you earn it — spoiler shield is on."
    : trophy.description;
  body.append(desc);

  const badges = document.createElement("p");
  badges.className = "row-badges";
  if (trophy.missable) badges.append(badge("MISSABLE", "badge-missable"));
  if (trophy.hidden) badges.append(badge("Hidden on PSN", "badge-hidden"));
  badges.append(badge(KIND_LABEL[trophy.kind] ?? trophy.kind, "badge-kind"));
  if (typeof trophy.count === "number") {
    badges.append(badge(`Target: ${trophy.count.toLocaleString("en-US")}`, "badge-count"));
  }
  body.append(badges);

  li.append(check, body);
  return li;
}

export function renderList(listEl, trophies, view) {
  const rows = trophies.map((trophy) =>
    renderTrophyRow(trophy, {
      earned: view.earnedSet.has(trophy.id),
      masked: isMasked(trophy, view.state),
      selected: view.selectedId === trophy.id,
    }),
  );
  listEl.replaceChildren(...rows);
}
