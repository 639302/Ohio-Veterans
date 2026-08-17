// Ohio Veterans — Navigator
// Chat-transcript intake: each question is an agent message, each answer a
// user message. Same question set/order/gating as the original stepper
// (state.js and questions.js are unchanged) — only the presentation is
// conversational. Every question is completable by tap/chip alone (kiosk
// path) or by typed free text, matched via questions.js/county-data.js's
// keyword matchers.

import { matchOptionsFromText } from './questions.js';
import { COUNTY_SELECT_OPTIONS, matchCountyFromText } from './county-data.js';
import {
  getState,
  getCurrentQuestion,
  getProgress,
  setAnswer,
  goToNext,
  goToPrevious,
  isLastQuestion,
} from './state.js';

const transcript = document.getElementById('chat-transcript');
const quickReplies = document.getElementById('chat-quick-replies');
const textInput = document.getElementById('chat-text-input');
const sendButton = document.getElementById('chat-send-button');
const progressLabel = document.getElementById('progress-label');
const progressTrack = document.getElementById('progress-track');
const progressFill = document.getElementById('progress-fill');
const backButton = document.getElementById('back-button');

// Working state for the question currently on screen; reset each turn.
let currentSelection = new Set();
let currentAgentNode = null;
let currentCrisisNode = null;

// One entry per already-answered question, so Back can rewind exactly one
// turn: remove that turn's user/crisis messages, restore its agent message
// as "current" again, and re-render its chips with the prior answer.
const turnStack = [];

function readExistingAnswer(questionId) {
  return getState().answers[questionId];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scrollTranscriptToBottom() {
  transcript.scrollTop = transcript.scrollHeight;
}

function updateProgress() {
  const { current, total } = getProgress();
  progressLabel.textContent = `Question ${current} of ${total}`;
  progressTrack.setAttribute('aria-valuenow', String(current));
  progressTrack.setAttribute('aria-valuemin', '1');
  progressTrack.setAttribute('aria-valuemax', String(total));
  progressFill.style.width = `${(current / total) * 100}%`;
}

function appendAgentMessage(text) {
  const message = document.createElement('div');
  message.className = 'chat-message chat-message--agent';

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  const icon = document.createElement('mms-icon');
  icon.setAttribute('name', 'robot');
  icon.setAttribute('size', 'sm');
  avatar.appendChild(icon);

  const bubble = document.createElement('div');
  bubble.className = 'chat-message__bubble';
  const author = document.createElement('span');
  author.className = 'chat-message__author';
  author.textContent = 'The Navigator';
  const body = document.createElement('span');
  body.textContent = text;
  bubble.append(author, body);

  message.append(avatar, bubble);
  transcript.appendChild(message);
  scrollTranscriptToBottom();
  return message;
}

function appendUserMessage(text) {
  const message = document.createElement('div');
  message.className = 'chat-message chat-message--user';
  const bubble = document.createElement('div');
  bubble.className = 'chat-message__bubble';
  bubble.textContent = text;
  message.appendChild(bubble);
  transcript.appendChild(message);
  scrollTranscriptToBottom();
  return message;
}

function appendCrisisMessage(text) {
  const message = document.createElement('div');
  message.className = 'chat-message chat-message--system';
  message.setAttribute('role', 'alert');

  const bubble = document.createElement('div');
  bubble.className = 'chat-message__bubble';
  const icon = document.createElement('mms-icon');
  icon.setAttribute('name', 'warning');
  icon.setAttribute('size', 'md');
  const body = document.createElement('span');
  body.textContent = text;
  bubble.append(icon, body);

  message.appendChild(bubble);
  transcript.appendChild(message);
  scrollTranscriptToBottom();
  return message;
}

function appendTypingIndicator() {
  const message = document.createElement('div');
  message.className = 'chat-message chat-message--agent';

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  const icon = document.createElement('mms-icon');
  icon.setAttribute('name', 'robot');
  icon.setAttribute('size', 'sm');
  avatar.appendChild(icon);

  const bubble = document.createElement('div');
  bubble.className = 'chat-typing-indicator';
  bubble.append(
    document.createElement('span'),
    document.createElement('span'),
    document.createElement('span'),
  );

  message.append(avatar, bubble);
  transcript.appendChild(message);
  scrollTranscriptToBottom();
  return message;
}

function toggleCrisisMessage(question, show) {
  if (show && !currentCrisisNode) {
    currentCrisisNode = appendCrisisMessage(question.crisisNotice);
  } else if (!show && currentCrisisNode) {
    currentCrisisNode.remove();
    currentCrisisNode = null;
  }
}

// A chip is a pill wrapper around one mms-radio/mms-checkbox (pointer-events:
// none on the control) so the whole chip is the tap target — same pattern as
// the landing/original stepper's .tap-card wrapper. Clicking the shadow-DOM
// control itself retargets event.target to the control's host, so only
// clicks landing on the chip's own padding need forwarding.
function forwardChipClickToControl(chip, control) {
  chip.addEventListener('click', (event) => {
    if (event.target !== chip) return;
    control.shadowRoot?.querySelector('input')?.click();
  });
}

function clearQuickReplies() {
  quickReplies.innerHTML = '';
  currentSelection = new Set();
}

function updateContinueButton() {
  const continueButton = document.getElementById('continue-button');
  if (!continueButton) return;
  continueButton.style.display = currentSelection.size > 0 ? '' : 'none';
}

function renderSingleChips(question, existingValue) {
  question.options.forEach((option) => {
    const chip = document.createElement('div');
    chip.className = 'chat-chip';
    if (option.value === existingValue) chip.classList.add('is-selected');

    const radio = document.createElement('mms-radio');
    radio.className = 'chat-chip__control';
    radio.setAttribute('label', option.label);
    radio.setAttribute('value', option.value);
    radio.setAttribute('color-scheme', 'primary');
    if (option.value === existingValue) radio.setAttribute('selected', '');

    radio.addEventListener('change', (event) => {
      if (!event.detail.selected) return;
      submitAnswer(question, option.value, option.label);
    });

    const label = document.createElement('span');
    label.className = 'chat-chip__label';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = option.label;

    chip.append(radio, label);
    forwardChipClickToControl(chip, radio);
    quickReplies.appendChild(chip);
  });
}

function renderMultiChips(question, existingValues) {
  currentSelection = new Set(existingValues || []);

  question.options.forEach((option) => {
    const chip = document.createElement('div');
    chip.className = 'chat-chip';
    if (currentSelection.has(option.value)) chip.classList.add('is-selected');

    const checkbox = document.createElement('mms-checkbox');
    checkbox.className = 'chat-chip__control';
    checkbox.setAttribute('label', option.label);
    checkbox.setAttribute('checked-value', option.value);
    checkbox.setAttribute('color-scheme', 'primary');
    if (currentSelection.has(option.value)) checkbox.setAttribute('checked', '');

    checkbox.addEventListener('change', (event) => {
      const { checked, value } = event.detail;
      chip.classList.toggle('is-selected', checked);
      if (checked) currentSelection.add(value);
      else currentSelection.delete(value);

      if (question.crisisValue) {
        toggleCrisisMessage(question, currentSelection.has(question.crisisValue));
      }
      updateContinueButton();
    });

    const label = document.createElement('span');
    label.className = 'chat-chip__label';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = option.label;

    chip.append(checkbox, label);
    forwardChipClickToControl(chip, checkbox);
    quickReplies.appendChild(chip);
  });

  const continueButton = document.createElement('mms-button');
  continueButton.id = 'continue-button';
  continueButton.setAttribute('label', 'Continue');
  continueButton.setAttribute('variant', 'primary');
  continueButton.setAttribute('color-scheme', 'primary');
  continueButton.setAttribute('size', 'md');
  continueButton.addEventListener('click', () => {
    if (currentSelection.size === 0) return;
    const labels = question.options
      .filter((option) => currentSelection.has(option.value))
      .map((option) => option.label);
    submitAnswer(question, Array.from(currentSelection), labels.join(', '));
  });
  quickReplies.appendChild(continueButton);
  updateContinueButton();

  if (question.crisisValue) {
    toggleCrisisMessage(question, currentSelection.has(question.crisisValue));
  }
}

function renderCountyChips(question, existingValue) {
  const select = document.createElement('mms-select');
  select.placeholder = 'Select a county…';
  select.size = 'lg';
  select.options = COUNTY_SELECT_OPTIONS;
  if (existingValue) select.value = existingValue;

  select.addEventListener('change', (event) => {
    const value = event.detail?.value ?? select.value;
    if (!value) return;
    const label = COUNTY_SELECT_OPTIONS.find((option) => option.value === value)?.label || value;
    submitAnswer(question, value, label);
  });

  quickReplies.appendChild(select);
}

const DEFAULT_TEXT_INPUT_PLACEHOLDER = 'Type your answer, or tap an option above';

function resolveQuestionField(question, field) {
  const value = question[field];
  return typeof value === 'function' ? value(getState().answers) : value;
}

function renderChipsFor(question, existingAnswer) {
  clearQuickReplies();
  if (question.type === 'single') {
    renderSingleChips(question, existingAnswer);
  } else if (question.type === 'multi') {
    renderMultiChips(question, existingAnswer);
  } else if (question.type === 'select') {
    renderCountyChips(question, existingAnswer);
  }
  textInput.placeholder = question.type === 'text'
    ? resolveQuestionField(question, 'placeholder') || DEFAULT_TEXT_INPUT_PLACEHOLDER
    : DEFAULT_TEXT_INPUT_PLACEHOLDER;
  textInput.value = question.type === 'text' && existingAnswer ? existingAnswer : '';
  textInput.focus();
}

function beginTurn(question) {
  currentAgentNode = appendAgentMessage(resolveQuestionField(question, 'prompt'));
  currentCrisisNode = null;
  renderChipsFor(question, readExistingAnswer(question.id));
}

function submitAnswer(question, value, displayText) {
  setAnswer(question.id, value);
  const userNode = appendUserMessage(displayText);
  turnStack.push({
    questionId: question.id,
    agentNode: currentAgentNode,
    userNode,
    crisisNode: currentCrisisNode,
  });
  currentAgentNode = null;
  currentCrisisNode = null;
  clearQuickReplies();
  advance();
}

async function advance() {
  if (isLastQuestion()) {
    appendAgentMessage("Got it — let's put together your pathway…");
    await wait(900);
    window.location.href = 'result.html';
    return;
  }

  const typing = appendTypingIndicator();
  goToNext();
  await wait(500);
  typing.remove();

  const question = getCurrentQuestion();
  beginTurn(question);
  updateProgress();
}

function handleTextSubmit() {
  const text = textInput.value.trim();
  if (!text) return;
  const question = getCurrentQuestion();
  if (!question) return;

  if (question.type === 'text') {
    submitAnswer(question, text, text);
    return;
  }

  if (question.type === 'select') {
    const match = matchCountyFromText(text);
    if (!match) {
      appendUserMessage(text);
      appendAgentMessage("I didn't catch a county in that — you can also pick one from the list above.");
      textInput.value = '';
      return;
    }
    submitAnswer(question, match, text);
    return;
  }

  const matches = matchOptionsFromText(question.options, text);
  if (matches.length === 0) {
    appendUserMessage(text);
    appendAgentMessage("I didn't quite catch that — you can also tap an option above.");
    textInput.value = '';
    return;
  }

  if (question.type === 'single') {
    submitAnswer(question, matches[0], text);
    return;
  }

  // Multi-select: typing implies confirmation, so merge into any existing
  // tap selections and submit immediately (no separate Continue tap needed).
  matches.forEach((value) => currentSelection.add(value));
  if (question.crisisValue && currentSelection.has(question.crisisValue)) {
    toggleCrisisMessage(question, true);
  }
  submitAnswer(question, Array.from(currentSelection), text);
}

backButton.addEventListener('click', () => {
  if (turnStack.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  currentAgentNode?.remove();
  const lastTurn = turnStack.pop();
  lastTurn.userNode?.remove();
  lastTurn.crisisNode?.remove();
  currentAgentNode = lastTurn.agentNode;
  currentCrisisNode = null;

  goToPrevious();
  const question = getCurrentQuestion();
  renderChipsFor(question, readExistingAnswer(question.id));
  updateProgress();
});

sendButton.addEventListener('click', () => handleTextSubmit());
textInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  handleTextSubmit();
});

function start() {
  const question = getCurrentQuestion();
  if (!question) {
    window.location.href = 'result.html';
    return;
  }
  beginTurn(question);
  updateProgress();
}

start();
