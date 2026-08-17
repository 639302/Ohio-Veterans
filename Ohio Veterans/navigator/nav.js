// Ohio Veterans — Navigator
// Header account-menu disclosure, shared across all three pages. Renders
// Profile/Light Mode/Dark Mode/Sign out (logged in) or Login/Create an
// Account/Light Mode/Dark Mode (logged out) from auth.js's mocked,
// instant-toggle session state and theme.js's persisted mode.

import { isLoggedIn, logIn, logOut } from './auth.js';
import { isDarkMode, setDarkMode } from './theme.js';
import { getUserGroup, setUserGroup } from './user-group.js';

const trigger = document.getElementById('nav-account-button');
const menu = document.getElementById('account-menu');
const avatar = document.getElementById('account-avatar');

if (trigger && menu) {
  function renderAvatar() {
    if (!avatar) return;
    const loggedIn = isLoggedIn();
    avatar.classList.toggle('account-avatar--guest', !loggedIn);
    avatar.innerHTML = loggedIn ? 'JD' : '<mms-icon name="user" size="xl"></mms-icon>';
  }

  function addAction(label, icon, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'account-menu__item';
    button.innerHTML = icon
      ? `<mms-icon name="${icon}" size="sm"></mms-icon><span>${label}</span>`
      : `<span>${label}</span>`;
    button.addEventListener('click', () => {
      action();
      renderAvatar();
      closeMenu();
      trigger.focus();
    });
    menu.appendChild(button);
  }

  function addDivider() {
    const hr = document.createElement('hr');
    hr.className = 'account-menu__divider';
    menu.appendChild(hr);
  }

  function addThemeRow(label, icon, dark) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'account-menu__item';
    if (isDarkMode() === dark) button.classList.add('account-menu__item--active');
    button.innerHTML = `<mms-icon name="${icon}" size="sm"></mms-icon><span>${label}</span>`;
    button.addEventListener('click', () => {
      setDarkMode(dark);
      renderMenuItems();
    });
    menu.appendChild(button);
  }

  function addLabel(text) {
    const label = document.createElement('p');
    label.className = 'account-menu__label';
    label.textContent = text;
    menu.appendChild(label);
  }

  function addUserGroupRow(label, icon, group) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'account-menu__item';
    if (getUserGroup() === group) button.classList.add('account-menu__item--active');
    button.innerHTML = `<mms-icon name="${icon}" size="sm"></mms-icon><span>${label}</span>`;
    button.addEventListener('click', () => {
      setUserGroup(group);
      renderMenuItems();
    });
    menu.appendChild(button);
  }

  function renderMenuItems() {
    menu.innerHTML = '';
    if (isLoggedIn()) {
      addAction('Profile', 'user-circle', () => {});
      addDivider();
      addThemeRow('Light Mode', 'sun', false);
      addThemeRow('Dark Mode', 'moon', true);
      addDivider();
      addAction('Sign out', 'sign-out', logOut);
    } else {
      addAction('Login', null, logIn);
      addAction('Create an Account', null, logIn);
      addDivider();
      addThemeRow('Light Mode', 'sun', false);
      addThemeRow('Dark Mode', 'moon', true);
    }
    addDivider();
    addLabel('Testing: view as');
    addUserGroupRow('Existing user', 'user-check', 'existing');
    addUserGroupRow('New user', 'user-plus', 'new');
    addUserGroupRow('Admin', 'user-gear', 'admin');
  }

  renderAvatar();

  function openMenu() {
    renderMenuItems();
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeydown);
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleKeydown);
  }

  function handleOutsideClick(event) {
    if (trigger.contains(event.target) || menu.contains(event.target)) return;
    closeMenu();
  }

  function handleKeydown(event) {
    if (event.key !== 'Escape') return;
    closeMenu();
    trigger.focus();
  }

  trigger.addEventListener('click', () => {
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });
}

const menuToggle = document.getElementById('nav-menu-toggle');
const collapsible = document.getElementById('nav-collapsible');

if (menuToggle && collapsible) {
  function openMobileMenu() {
    collapsible.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('left-icon', 'x');
    document.addEventListener('click', handleMobileOutsideClick);
    document.addEventListener('keydown', handleMobileKeydown);
  }

  function closeMobileMenu() {
    collapsible.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('left-icon', 'list');
    document.removeEventListener('click', handleMobileOutsideClick);
    document.removeEventListener('keydown', handleMobileKeydown);
  }

  function handleMobileOutsideClick(event) {
    if (menuToggle.contains(event.target) || collapsible.contains(event.target)) return;
    closeMobileMenu();
  }

  function handleMobileKeydown(event) {
    if (event.key !== 'Escape') return;
    closeMobileMenu();
    menuToggle.focus();
  }

  menuToggle.addEventListener('click', () => {
    if (collapsible.classList.contains('is-open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

function normalizeNavPath(pathname) {
  let path = pathname.replace(/\/index\.html?$/, '/').replace(/\.html?$/, '');
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path;
}

const currentPath = normalizeNavPath(window.location.pathname);
document.querySelectorAll('.nav-header__nav a').forEach((link) => {
  if (normalizeNavPath(new URL(link.href, window.location.href).pathname) !== currentPath) return;
  link.setAttribute('aria-current', 'page');
});

const govBannerToggle = document.getElementById('gov-banner-toggle');
const govBannerPanel = document.getElementById('gov-banner-panel');

if (govBannerToggle && govBannerPanel) {
  govBannerToggle.addEventListener('click', () => {
    const expanded = govBannerToggle.getAttribute('aria-expanded') === 'true';
    govBannerPanel.hidden = expanded;
    govBannerToggle.setAttribute('aria-expanded', String(!expanded));
  });
}
