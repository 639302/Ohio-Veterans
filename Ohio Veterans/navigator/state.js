// Ohio Veterans — Navigator
// Session-scoped state shared across index.html -> intake.html -> result.html.
// Since this is a plain multi-page static site (no SPA/router), state is
// persisted to sessionStorage so it survives full page navigations within
// one browser tab/session, and is cleared on kiosk reset / Retry.

import { QUESTIONS } from './questions.js';

const STORAGE_KEY = 'navigator-state-v1';

function defaultState() {
  return {
    intent: null, // best-guess category from landing (keyword match or card tap)
    answers: {}, // { [questionId]: string | string[] }
    currentIndex: 0, // index into getVisibleQuestions()
  };
}

export function getState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function setIntent(intent) {
  const state = getState();
  state.intent = intent;
  // Seed Q5 (goals) with the landing intent, still fully editable.
  if (intent && !state.answers.goals) {
    state.answers.goals = [intent];
  }
  saveState(state);
}

export function setAnswer(questionId, value) {
  const state = getState();
  state.answers[questionId] = value;
  saveState(state);
}

// Returns the subset of QUESTIONS that apply given current answers
// (i.e. filters out Q5b unless its conditional passes).
export function getVisibleQuestions(answers) {
  return QUESTIONS.filter((q) => !q.conditional || q.conditional(answers));
}

export function getCurrentQuestion() {
  const state = getState();
  const visible = getVisibleQuestions(state.answers);
  return visible[state.currentIndex] || null;
}

export function getProgress() {
  const state = getState();
  const visible = getVisibleQuestions(state.answers);
  return { current: state.currentIndex + 1, total: visible.length };
}

// Advances to the next visible question. Returns false (and leaves state
// untouched) when already on the last question, so callers know to
// transition to result.html instead.
export function goToNext() {
  const state = getState();
  const visible = getVisibleQuestions(state.answers);
  if (state.currentIndex >= visible.length - 1) return false;
  state.currentIndex += 1;
  saveState(state);
  return true;
}

// Steps back one visible question. Returns false when already on the
// first question (caller should return to index.html instead).
export function goToPrevious() {
  const state = getState();
  if (state.currentIndex <= 0) return false;
  state.currentIndex -= 1;
  saveState(state);
  return true;
}

export function isLastQuestion() {
  const state = getState();
  const visible = getVisibleQuestions(state.answers);
  return state.currentIndex >= visible.length - 1;
}
