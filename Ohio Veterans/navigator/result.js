// Ohio Veterans — Navigator
// Pathway Result screen: simulated loading transition, then renders the
// 6 pathway cards from pathway-logic.js. Outbound links use <mms-link>,
// section glyphs use <mms-icon>; card containers stay custom (no DS card).

import { getState, resetState, setIntent } from './state.js';
import { buildPathway, buildRecapBanner } from './pathway-logic.js';
import { CATEGORIES } from './questions.js';
import { getUserGroup } from './user-group.js';

const loadingScreen = document.getElementById('loading-screen');
const errorScreen = document.getElementById('error-screen');
const emptyScreen = document.getElementById('empty-screen');
const emptyCategoryGrid = document.getElementById('empty-category-grid');
const emptyHeading = document.getElementById('empty-heading');
const resultsScreen = document.getElementById('results-screen');
const errorBody = document.getElementById('error-body');
const errorHeading = document.getElementById('error-heading');
const resultsHeading = document.getElementById('results-heading');
const recapBanner = document.getElementById('recap-banner');
const persistentGrid = document.getElementById('persistent-grid');
const tabsWrapper = document.getElementById('result-tabs-wrapper');
const tablistEl = document.getElementById('result-tablist');
const tabpanelsEl = document.getElementById('result-tabpanels');
const retryButton = document.getElementById('retry-button');

const CVSO_FALLBACK_PHONE = '(614) 644-0898';

function cardShell(card, { crisis = false } = {}) {
  const el = document.createElement('section');
  el.className = 'result-card' + (crisis ? ' result-card--crisis' : '');
  el.setAttribute('aria-labelledby', `card-title-${card.key}`);

  const header = document.createElement('div');
  header.className = 'result-card__header';
  const icon = document.createElement('mms-icon');
  icon.setAttribute('name', card.icon);
  icon.setAttribute('size', 'lg');
  const title = document.createElement('h2');
  title.className = 'result-card__title';
  title.id = `card-title-${card.key}`;
  title.textContent = card.title;
  header.append(icon, title);
  el.appendChild(header);

  return el;
}

function renderCvsoCard(card) {
  const el = cardShell(card);
  const p1 = document.createElement('p');
  p1.textContent = card.officeName;
  const p2 = document.createElement('p');
  p2.innerHTML = `<strong>Phone:</strong> ${card.phone}`;
  el.append(p1, p2);
  if (card.address) {
    const p3 = document.createElement('p');
    p3.innerHTML = `<strong>Address:</strong> ${card.address}`;
    el.appendChild(p3);
  }
  if (card.email) {
    const p4 = document.createElement('p');
    const emailLabel = document.createElement('strong');
    emailLabel.textContent = 'Email: ';
    const emailLink = document.createElement('mms-link');
    emailLink.setAttribute('href', `mailto:${card.email}`);
    emailLink.setAttribute('label', card.email);
    p4.append(emailLabel, emailLink);
    el.appendChild(p4);
  }
  if (card.website) {
    const p5 = document.createElement('p');
    const websiteLink = document.createElement('mms-link');
    websiteLink.setAttribute('href', card.website);
    websiteLink.setAttribute('target', '_blank');
    websiteLink.setAttribute('label', 'Visit office website');
    websiteLink.setAttribute('right-icon', 'arrow-square-out');
    p5.appendChild(websiteLink);
    el.appendChild(p5);
  }
  return el;
}

function renderLinkedParagraph(content) {
  const p = document.createElement('p');
  if (typeof content === 'string') {
    p.textContent = content;
  } else {
    const link = document.createElement('mms-link');
    link.setAttribute('href', content.linkHref);
    link.setAttribute('target', '_blank');
    link.setAttribute('label', content.linkLabel);
    link.setAttribute('right-icon', 'arrow-square-out');
    p.append(content.before, link, content.after);
  }
  return p;
}

function renderMentalHealthCard(card) {
  const el = cardShell(card, { crisis: card.variant === 'crisis' });
  const headline = document.createElement('p');
  headline.innerHTML = `<strong>${card.headline}</strong>`;
  el.appendChild(headline);
  el.appendChild(renderLinkedParagraph(card.body));
  if (card.communityCare) el.appendChild(renderLinkedParagraph(card.communityCare));
  return el;
}

function renderEmploymentCard(card) {
  const el = cardShell(card);

  const mosTitle = document.createElement('p');
  mosTitle.className = 'result-card__section-title';
  mosTitle.textContent = 'Military Occupational Specialty to Civilian Translation';
  const mosBody = document.createElement('p');
  mosBody.textContent = card.mosTranslation;
  el.append(mosTitle, mosBody);

  if (card.skillbridge) {
    const title = document.createElement('p');
    title.className = 'result-card__section-title';
    title.textContent = 'SkillBridge Opportunities';
    el.appendChild(title);

    const list = document.createElement('div');
    list.className = 'sub-card-list';
    card.skillbridge.forEach((listing) => {
      const sub = document.createElement('div');
      sub.className = 'sub-card';
      const subTitle = document.createElement('p');
      subTitle.className = 'sub-card__title';
      subTitle.textContent = `${listing.provider} — ${listing.city}, ${listing.state}`;
      const mission = document.createElement('p');
      mission.textContent = listing.mission;
      const meta = document.createElement('p');
      meta.className = 'sub-card__meta';
      meta.textContent = `${listing.duration} · ${listing.deliveryMethod} · ${listing.employerContact}`;
      const applyButton = document.createElement('mms-button');
      applyButton.className = 'sub-card__cta';
      applyButton.setAttribute('label', 'Apply now');
      applyButton.setAttribute('right-icon', 'arrow-square-out');
      applyButton.setAttribute('variant', 'primary');
      applyButton.setAttribute('color-scheme', 'primary');
      applyButton.setAttribute('size', 'md');
      sub.append(subTitle, mission, meta, applyButton);
      list.appendChild(sub);
    });
    el.appendChild(list);
  }

  if (card.jobListings) {
    const title = document.createElement('p');
    title.className = 'result-card__section-title';
    title.textContent = 'Open Job Listings';
    el.appendChild(title);

    const list = document.createElement('div');
    list.className = 'sub-card-list';
    card.jobListings.forEach((job) => {
      const sub = document.createElement('div');
      sub.className = 'sub-card';
      const subTitle = document.createElement('p');
      subTitle.className = 'sub-card__title';
      subTitle.textContent = `${job.title} — ${job.company}`;
      const meta = document.createElement('p');
      meta.className = 'sub-card__meta';
      meta.textContent = `${job.city}, OH · ${job.type}`;
      const applyButton = document.createElement('mms-button');
      applyButton.className = 'sub-card__cta';
      applyButton.setAttribute('label', 'Apply now');
      applyButton.setAttribute('right-icon', 'arrow-square-out');
      applyButton.setAttribute('variant', 'primary');
      applyButton.setAttribute('color-scheme', 'primary');
      applyButton.setAttribute('size', 'md');
      sub.append(subTitle, meta, applyButton);
      list.appendChild(sub);
    });
    el.appendChild(list);

    if (card.jobSearchLink) {
      const link = document.createElement('mms-link');
      link.setAttribute('href', card.jobSearchLink.href);
      link.setAttribute('target', '_blank');
      link.setAttribute('label', card.jobSearchLink.label);
      link.setAttribute('right-icon', 'arrow-square-out');
      el.appendChild(link);
    }
  }

  if (card.employers) {
    const title = document.createElement('p');
    title.className = 'result-card__section-title';
    title.textContent = 'Military-Friendly Employers Near You';
    el.appendChild(title);

    const list = document.createElement('div');
    list.className = 'sub-card-list';
    card.employers.forEach((employer) => {
      const sub = document.createElement('div');
      sub.className = 'sub-card';
      const subTitle = document.createElement('p');
      subTitle.className = 'sub-card__title';
      subTitle.textContent = employer.company;
      const meta = document.createElement('p');
      meta.className = 'sub-card__meta';
      meta.textContent = employer.address
        ? `${employer.address} · ${employer.industrySector}`
        : `${employer.city}, OH · ${employer.industrySector}`;
      sub.append(subTitle, meta);
      list.appendChild(sub);
    });
    el.appendChild(list);

    const seeAll = document.createElement('mms-link');
    seeAll.setAttribute('href', 'https://ohiomeansjobs.ohio.gov/');
    seeAll.setAttribute('target', '_blank');
    seeAll.setAttribute('label', 'See all 9,310 military-friendly employers on OhioMeansJobs');
    seeAll.setAttribute('right-icon', 'arrow-square-out');
    el.appendChild(seeAll);
  }

  return el;
}

function renderGiBillCard(card) {
  const el = cardShell(card);
  card.body.forEach((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    el.appendChild(p);
  });
  if (card.cta) el.appendChild(renderLinkedParagraph(card.cta));
  return el;
}

function renderLinkList(links) {
  const list = document.createElement('div');
  list.className = 'result-card__link-list';
  links.forEach(({ label, href }) => {
    const link = document.createElement('mms-link');
    link.setAttribute('href', href);
    link.setAttribute('target', '_blank');
    link.setAttribute('label', label);
    link.setAttribute('right-icon', 'arrow-square-out');
    list.appendChild(link);
  });
  return list;
}

function renderHousingCard(card) {
  const el = cardShell(card);

  el.appendChild(renderLinkedParagraph(card.base.eligibilityCta));

  const baseBody = document.createElement('p');
  baseBody.textContent = card.base.body;
  el.appendChild(baseBody);

  el.appendChild(renderLinkList(card.base.links));

  if (card.ovh) {
    const title = document.createElement('p');
    title.className = 'result-card__section-title';
    title.textContent = 'Ohio Veterans Homes';
    el.appendChild(title);

    const ovhBody = document.createElement('p');
    ovhBody.textContent = card.ovh.body;
    el.appendChild(ovhBody);

    const list = document.createElement('div');
    list.className = 'sub-card-list';
    card.ovh.facilities.forEach((facility) => {
      const sub = document.createElement('div');
      sub.className = 'sub-card';
      const subTitle = document.createElement('p');
      subTitle.className = 'sub-card__title';
      subTitle.textContent = `${facility.name} (est. ${facility.established})`;
      const note = document.createElement('p');
      note.className = 'sub-card__meta';
      note.textContent = facility.note;
      sub.append(subTitle, note);
      list.appendChild(sub);
    });
    el.appendChild(list);

    const contact = document.createElement('p');
    contact.className = 'sub-card__meta';
    contact.textContent = card.ovh.contact;
    el.appendChild(contact);

    const detailsLink = document.createElement('mms-link');
    detailsLink.setAttribute('href', card.ovh.detailsHref);
    detailsLink.setAttribute('target', '_blank');
    detailsLink.setAttribute('label', 'Determining eligibility for Ohio Veterans Homes');
    detailsLink.setAttribute('right-icon', 'arrow-square-out');
    el.appendChild(detailsLink);
  }

  const fragment = document.createDocumentFragment();
  fragment.append(el, renderHomeLoanCard(card.homeLoanCard));
  return fragment;
}

function renderHomeLoanCard(card) {
  const el = cardShell(card);
  card.sections.forEach((section) => {
    const subhead = document.createElement('p');
    subhead.className = 'result-card__section-title';
    subhead.textContent = section.subhead;
    el.appendChild(subhead);
    section.paragraphs.forEach((paragraph) => {
      el.appendChild(renderLinkedParagraph(paragraph));
    });
    if (section.links) el.appendChild(renderLinkList(section.links));
  });
  return el;
}

function renderNextStepsCard(card) {
  const el = cardShell(card);
  const urgency = document.createElement('p');
  urgency.textContent = card.urgencyNote;
  const contact = document.createElement('p');
  contact.textContent = card.contactNote;
  const ref = document.createElement('p');
  ref.innerHTML = `<strong>Reference number:</strong> <span style="font-family: var(--font-family-tabular, monospace);">${card.referenceNumber}</span>`;
  el.append(urgency, contact, ref);
  return el;
}

function renderBenefitsCard(card) {
  const el = cardShell(card);
  const body = document.createElement('p');
  body.textContent = card.body;
  el.appendChild(body);
  el.appendChild(renderLinkList(card.links));
  return el;
}

function renderFamilyCard(card) {
  const el = cardShell(card);
  const body = document.createElement('p');
  body.textContent = card.body;
  el.appendChild(body);
  el.appendChild(renderLinkList(card.links));
  return el;
}

const RENDERERS = {
  cvso: renderCvsoCard,
  'mental-health': renderMentalHealthCard,
  employment: renderEmploymentCard,
  'gi-bill': renderGiBillCard,
  housing: renderHousingCard,
  'next-steps': renderNextStepsCard,
  benefits: renderBenefitsCard,
  family: renderFamilyCard,
};

function activateTab(index) {
  const tabButtons = Array.from(tablistEl.querySelectorAll('[role="tab"]'));
  const panels = Array.from(tabpanelsEl.querySelectorAll('[role="tabpanel"]'));
  tabButtons.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected) tab.focus();
  });
  panels.forEach((panel, i) => {
    panel.hidden = i !== index;
  });
}

function handleTablistKeydown(event) {
  const tabButtons = Array.from(tablistEl.querySelectorAll('[role="tab"]'));
  const currentIndex = tabButtons.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
  let nextIndex = null;

  if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabButtons.length;
  else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
  else if (event.key === 'Home') nextIndex = 0;
  else if (event.key === 'End') nextIndex = tabButtons.length - 1;
  else return;

  event.preventDefault();
  activateTab(nextIndex);
}

function renderTabs(tabs) {
  tablistEl.innerHTML = '';
  tabpanelsEl.innerHTML = '';

  if (tabs.length === 0) {
    tabsWrapper.hidden = true;
    return;
  }
  tabsWrapper.hidden = false;

  tabs.forEach((card, index) => {
    const selected = index === 0;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'result-tab';
    tab.id = `result-tab-${card.key}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(selected));
    tab.setAttribute('aria-controls', `result-tabpanel-${card.key}`);
    tab.tabIndex = selected ? 0 : -1;
    tab.textContent = card.title;
    tab.addEventListener('click', () => activateTab(index));
    tablistEl.appendChild(tab);

    const panel = document.createElement('div');
    panel.className = 'result-tabpanel';
    panel.id = `result-tabpanel-${card.key}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `result-tab-${card.key}`);
    panel.hidden = !selected;
    const renderer = RENDERERS[card.key];
    if (renderer) panel.appendChild(renderer(card));
    tabpanelsEl.appendChild(panel);
  });

  tablistEl.addEventListener('keydown', handleTablistKeydown);
}

function showError() {
  loadingScreen.hidden = true;
  errorScreen.hidden = false;
  errorBody.textContent = `Please try again, or contact your County Veterans Service Office at ${CVSO_FALLBACK_PHONE}.`;
  errorHeading.focus();
}

function renderCategoryCards() {
  CATEGORIES.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tap-card';
    button.setAttribute('role', 'listitem');
    button.setAttribute('aria-label', `${category.label}: ${category.description}`);

    const icon = document.createElement('mms-icon');
    icon.setAttribute('name', category.icon);
    icon.setAttribute('size', 'lg');

    const title = document.createElement('span');
    title.className = 'tap-card__title';
    title.textContent = category.label;

    const description = document.createElement('span');
    description.className = 'tap-card__description';
    description.textContent = category.description;

    button.append(icon, title, description);
    button.addEventListener('click', () => {
      resetState();
      setIntent(category.value);
      window.location.href = 'intake.html';
    });

    emptyCategoryGrid.appendChild(button);
  });
}

function showEmptyState() {
  loadingScreen.hidden = true;
  emptyScreen.hidden = false;
  renderCategoryCards();
  emptyHeading.focus();
}

function showResults(answers) {
  loadingScreen.hidden = true;
  resultsScreen.hidden = false;
  recapBanner.textContent = buildRecapBanner(answers);
  const { persistent, tabs } = buildPathway(answers);
  persistent.forEach((card) => {
    const renderer = RENDERERS[card.key];
    if (renderer) persistentGrid.appendChild(renderer(card));
  });
  renderTabs(tabs);
  resultsHeading.focus();
}

retryButton.addEventListener('click', () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('forceError');
  window.location.href = url.toString();
});

const forceError = new URLSearchParams(window.location.search).has('forceError');
if (new URLSearchParams(window.location.search).has('reset')) {
  resetState();
}
const { answers } = getState();
// "New user" is a non-destructive preview: always show the empty state
// without touching any answers already collected this session, so
// switching back to "Existing user" reveals them again.
const previewAsNewUser = getUserGroup() === 'new';

if (!forceError && (previewAsNewUser || Object.keys(answers).length === 0)) {
  showEmptyState();
} else {
  window.setTimeout(() => {
    if (forceError) {
      showError();
      return;
    }
    showResults(answers);
  }, 1700);
}
