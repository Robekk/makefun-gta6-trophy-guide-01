// The guide panel beside the trophy list.
//
// Shows one selected trophy in full: grade badge, official name and
// description, its roadmap stage and kind, the written guide, a red warning
// when the trophy can be missed, the sources the guide is based on (always
// visible text, never hidden behind a link), and a button that flips its
// earned state. A spoiler-masked trophy shows only the mask.

import { displayDescriptionFor, displayNameFor } from './spoiler.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function gradeBadge(grade) {
  return element('span', `badge badge-${grade}`, grade);
}

export function renderGuidePlaceholder(panel) {
  panel.replaceChildren(
    element('h2', null, 'Pick a trophy'),
    element('p', 'guide-placeholder',
      'Select any trophy in the list to read its guide here: what to do, where it fits on the ' +
      'roadmap to the platinum, whether it can be missed, and the sources the guide is based on.'),
  );
}

// context: { earned, masked, onToggleEarned(trophy) }
export function renderGuidePanel(panel, trophy, context) {
  const nodes = [gradeBadge(trophy.grade)];

  if (context.masked) {
    nodes.push(
      element('h2', null, displayNameFor(trophy, true)),
      element('p', 'guide-official', displayDescriptionFor(trophy, true)),
      element('p', 'guide-text',
        'Spoiler protection is on, so this story trophy\'s guide stays hidden too — its steps ' +
        'would give the story away. Earn the trophy to reveal it, or switch spoiler protection off.'),
    );
    panel.replaceChildren(...nodes);
    return;
  }

  nodes.push(
    element('h2', null, trophy.name),
    element('p', 'guide-official', `“${trophy.description}”`),
  );

  const facts = element('dl', 'guide-facts');
  const factRows = [
    ['Stage', trophy.stage],
    ['Kind', trophy.kind],
    ['Status', context.earned ? 'Earned' : 'Not earned yet'],
  ];
  for (const [term, value] of factRows) {
    const row = element('div', 'fact-row');
    row.append(element('dt', null, term), element('dd', null, value));
    facts.append(row);
  }
  nodes.push(facts);

  if (trophy.missable) {
    nodes.push(element('p', 'missable-warning',
      '⚠ MISSABLE — this trophy can be permanently missed in a single playthrough. ' +
      'Follow the guide\'s timing before you move past the point it names.'));
  }

  nodes.push(element('p', 'guide-text', trophy.guide));

  const sources = element('p', 'guide-sources');
  sources.append(
    element('span', 'sources-label', 'Sources: '),
    document.createTextNode(trophy.sources.join('; ')),
  );
  nodes.push(sources);

  const toggle = element('button', 'guide-toggle',
    context.earned ? '✓ Earned — tap to undo' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => context.onToggleEarned(trophy));
  nodes.push(toggle);

  panel.replaceChildren(...nodes);
}
