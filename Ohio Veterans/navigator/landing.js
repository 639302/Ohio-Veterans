// Ohio Veterans — Navigator
// Landing screen behavior: free-text submit + category quick-start pills.
// Pills are native buttons styled as .topic-pill (mms-button has no slot for
// icon+label content), each containing an <mms-icon> for the glyph — still
// defaulting to the DS component for the icon itself while the pill wrapper
// stays custom.

import { CATEGORIES, matchCategoryFromText } from './questions.js';
import { resetState, setIntent } from './state.js';

const grid = document.getElementById('category-grid');

CATEGORIES.forEach((category) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'topic-pill';
  button.setAttribute('role', 'listitem');
  button.setAttribute('aria-label', `${category.pillLabel}: ${category.description}`);

  const icon = document.createElement('mms-icon');
  icon.setAttribute('name', category.icon);
  icon.setAttribute('size', 'sm');

  const label = document.createElement('span');
  label.className = 'topic-pill__label';
  label.textContent = category.pillLabel;

  button.append(icon, label);
  button.addEventListener('click', () => {
    resetState();
    setIntent(category.value);
    window.location.href = 'intake.html';
  });

  grid.appendChild(button);
});

const textInput = document.getElementById('landing-text-input');
const submitButton = document.getElementById('landing-submit');

function submitFreeText() {
  const guess = matchCategoryFromText(textInput.value || '');
  resetState();
  setIntent(guess);
  window.location.href = 'intake.html';
}

submitButton.addEventListener('click', submitFreeText);
textInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') submitFreeText();
});
