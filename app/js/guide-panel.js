// The guide panel: one trophy in full — official name and description, the earned toggle,
// the MISSABLE warning where flagged, the guide in this tracker's own words, and its sources.

import { KIND_LABELS, isMasked } from './data.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderGuidePanel(container, trophy, state, store, handlers) {
  container.replaceChildren();
  if (!trophy) {
    container.append(
      el(
        'p',
        'guide-placeholder',
        'Pick a trophy from the checklist to read its guide — what to do, where it can be missed, and the sources every fact is cited from.',
      ),
    );
    return;
  }

  const masked = isMasked(trophy, state, store);
  const earned = store.isEarned(trophy.id);

  container.append(el('div', 'guide-grade', masked ? 'Story trophy — hidden' : `${trophy.grade} · ${KIND_LABELS[trophy.kind] ?? trophy.kind}`));
  container.append(el('h2', 'guide-name', masked ? 'Hidden trophy' : trophy.name));
  container.append(
    el('p', 'guide-desc', masked ? 'The spoiler shield is hiding this story trophy until you earn it.' : trophy.description),
  );

  const toggle = el('button', 'guide-earned-btn' + (earned ? ' is-earned' : ''), earned ? 'Earned ✓ — tap to undo' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => handlers.onToggleEarned(trophy.id));
  container.append(toggle);

  if (masked) {
    container.append(
      el(
        'p',
        'guide-masked-note',
        'Spoiler shield is on: this story trophy\u2019s name, description and guide stay hidden until it is earned. Turn the shield off in the toolbar if you would rather read ahead.',
      ),
    );
    return;
  }

  if (trophy.missable) {
    const warning = el('div', 'missable-warning');
    const strong = el('strong', '', '⚠ MISSABLE — ');
    warning.append(
      strong,
      document.createTextNode(
        'this trophy can be locked out permanently. The first meditation spot, on the balcony of Jason\u2019s house, exists only in Chapter 1. Read the guide before you finish the chapter.',
      ),
    );
    container.append(warning);
  }

  container.append(el('h3', 'guide-section-title', 'Guide'));
  container.append(el('p', 'guide-body', trophy.guide));

  container.append(el('h3', 'guide-section-title', 'Sources — where these facts come from'));
  const list = el('ul', 'guide-sources');
  for (const source of trophy.sources ?? []) {
    const item = el('li');
    // Sources are stored as "Name — Title (URL)": set the name in strong ink and the
    // address in a quieter tone so a reader can scan who says it before parsing the link.
    const splitAt = source.lastIndexOf(' (');
    if (splitAt > 0 && source.endsWith(')')) {
      item.append(el('span', 'source-name', source.slice(0, splitAt)));
      item.append(el('span', 'source-url', source.slice(splitAt + 2, -1)));
    } else {
      item.append(el('span', 'source-name', source));
    }
    list.append(item);
  }
  container.append(list);
}
