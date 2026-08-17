// Ohio Veterans — Navigator
// Testing-only control (in the account menu) for previewing "Your Pathway"
// as a different user group. Session-scoped, mirrors auth.js/theme.js's
// storage pattern. "admin" has no defined behavior yet — selecting it is a
// no-op until those requirements exist.

const KEY = 'navigator-user-group-v1';

export function getUserGroup() {
  return sessionStorage.getItem(KEY) || 'existing';
}

export function setUserGroup(group) {
  sessionStorage.setItem(KEY, group);
}
