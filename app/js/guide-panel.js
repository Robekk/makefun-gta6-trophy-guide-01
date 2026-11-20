// guide-panel.js — the per-trophy guide displays.
// renderDetail fills the side panel beside the checklist: grade gem and
// tags, the official name and description, the MISSABLE warning banner,
// the own-words guide, its source citations as followable links, the
// roadmap stage it belongs to and the earned toggle. renderGuides
// builds the Guides view: a missable alert banner, then every trophy's
// full guide stacked as a card with its citations visible — the view
// that proves each guide names its sources.

import { GRADE_LABEL, KIND_LABEL } from './trophy-catalog.js';
import { displayName, displayDescription, isMasked } from './spoiler-shield.js';
import { esc } from './tracker-view.js';

export function sourceLinksHtml(trophy) {
  return trophy.sources
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`)
    .join('<br>');
}

function tagsHtml(t) {
  return [
    `<span class="tag tag-grade-${t.grade}">${GRADE_LABEL[t.grade]}</span>`,
    `<span class="tag">${esc(KIND_LABEL[t.kind] ?? t.kind)}</span>`,
    t.hidden ? '<span class="tag">Hidden on PSN</span>' : '<span class="tag">Visible on PSN</span>',
    t.count ? `<span class="count-pill">PSN tracks × ${t.count}</span>` : '',
    t.missable ? '<span class="badge-missable">MISSABLE</span>' : '',
  ].join('');
}

export function renderDetail(panelEl, trophy, store, stage) {
  const masked = isMasked(trophy, store);
  const earned = store.isEarned(trophy.id);
  panelEl.innerHTML = `
    <div class="detail-grade"><span class="gem gem-${trophy.grade}"></span>${tagsHtml(trophy)}</div>
    <h2>${esc(displayName(trophy, store))}</h2>
    <p class="detail-desc">“${esc(displayDescription(trophy, store))}”</p>
    ${trophy.missable ? `<div class="missable-banner"><b>MISSABLE — Chapter 1 only.</b> The first meditation spot, Lucia's balcony at Jason's house, is gone when Chapter 1 ends. Do it before you move on.</div>` : ''}
    <h3>Guide</h3>
    <p class="detail-guide">${masked ? 'Guide hidden by the spoiler shield until this trophy is earned.' : esc(trophy.guide)}</p>
    <h3>Sources</h3>
    <p class="detail-sources">${sourceLinksHtml(trophy)}</p>
    ${stage ? `<p class="meta-line">Roadmap: Stage ${stage.number} — ${esc(stage.title)}</p>` : ''}
    <div class="detail-actions">
      <button class="btn btn-primary" id="detail-toggle">${earned ? 'Earned ✓ — tap to undo' : 'Mark as earned'}</button>
    </div>`;
  panelEl.querySelector('#detail-toggle').addEventListener('click', () => store.toggle(trophy.id));
}

export function renderGuides(guidesEl, catalog, store) {
  const alert = `<div class="guides-alert"><b>1 MISSABLE TROPHY:</b> Positive Mental Attitude — the first meditation, on the balcony at Jason's house during Chapter 1, is gone after Chapter 1 ends. Every guide below is written for this tracker and names its sources.</div>`;
  const cards = catalog.trophies.map((t) => {
    const masked = isMasked(t, store);
    return `<article class="guide-card" data-guide-id="${t.id}">
      <h3>${esc(displayName(t, store))}</h3>
      <div class="detail-grade">${tagsHtml(t)}</div>
      <p class="guide-desc">“${esc(displayDescription(t, store))}”</p>
      ${t.missable ? `<div class="missable-banner"><b>MISSABLE — Chapter 1 only:</b> gone after Chapter 1 ends. See the guide below.</div>` : ''}
      <p class="guide-text">${masked ? 'Guide hidden by the spoiler shield until earned.' : esc(t.guide)}</p>
      <p class="guide-sources">Sources: ${sourceLinksHtml(t)}</p>
    </article>`;
  }).join('');
  guidesEl.innerHTML = alert + cards;
}
