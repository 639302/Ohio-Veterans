// Ohio Veterans — Navigator
// Mocked, session-scoped auth state for the header account menu. Instant
// toggle, no real form/credentials/backend — a demo stand-in only.

const STORAGE_KEY = 'navigator-auth-v1';

export function isLoggedIn() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).loggedIn === true : false;
  } catch {
    return false;
  }
}

export function logIn() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ loggedIn: true }));
}

export function logOut() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ loggedIn: false }));
}
