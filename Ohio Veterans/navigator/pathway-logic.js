// Ohio Veterans — Navigator
// Pure rules-table function mapping intake answers -> the 6 Pathway
// Result cards. Stands in for the RFP's real Matching/Recommendation
// engine (pillar 4) at demo fidelity — auditable, hardcoded branches,
// not real ranking/eligibility/proximity logic.

import { getCvsoInfo } from './county-data.js';
import { getSkillbridgeListings } from './skillbridge-data.js';
import { getEmployerListings, registerIndustryBuckets } from './employer-data.js';
import { getJobListings } from './job-listings-data.js';
import { INDUSTRY_BUCKETS } from './questions.js';

const JOB_SEARCH_URL = 'https://jobs.ohiomeansjobs.applygovt.com/Search.aspx?pg=1&sid=68&rad=20&rad_units=miles';

function buildJobSearchLink() {
  return { label: 'Search more jobs at OhioMeansJobs', href: JOB_SEARCH_URL };
}

registerIndustryBuckets(INDUSTRY_BUCKETS);

const MOS_TRANSLATION_BY_BRANCH = {
  army: 'Army training and Military Occupational Specialty experience translate directly into skills employers value — leadership under pressure, logistics, equipment maintenance, and systems operation. Many Army roles map closely to civilian careers in operations, logistics, and technical trades.',
  navy: 'Navy rating experience builds deep technical and systems expertise — from nuclear and mechanical systems to logistics and IT — that transfers well into civilian engineering, maintenance, and technical operations roles.',
  'air-force': 'Air Force Specialty Codes often align closely with civilian aviation, IT, logistics, and engineering roles. Technical training and certifications earned in service frequently carry over directly into civilian licensing requirements.',
  'marine-corps': 'Marine Corps Military Occupational Specialty training emphasizes discipline, small-unit leadership, and adaptability — qualities that translate into supervisory, security, logistics, and operations roles across nearly every civilian industry.',
  'coast-guard': 'Coast Guard experience in maritime operations, law enforcement, and technical systems maintenance translates well into civilian roles in logistics, public safety, and skilled trades.',
  'space-force': 'Space Force technical training in cyber, intelligence, and space systems operations aligns closely with fast-growing civilian technology and aerospace careers.',
  'national-guard': 'National Guard training, whether combat-arms or support-role, builds transferable skills in logistics, leadership, and technical trades that Ohio employers actively recruit for.',
  reserve: 'Reserve component training and civilian-world experience combine well — many Reserve members already have a head start translating military skills into a civilian career track.',
  'not-sure': "Whatever your background, your service built transferable skills in leadership, discipline, and problem-solving. Your County Veterans Service Office can help translate your specific experience into civilian career language.",
};

function buildMosTranslation(branch) {
  return MOS_TRANSLATION_BY_BRANCH[branch] || MOS_TRANSLATION_BY_BRANCH['not-sure'];
}

function buildCvsoCard(answers) {
  const info = getCvsoInfo(answers.county);
  return {
    key: 'cvso',
    title: 'County Veterans Service Office Match',
    icon: 'map-pin',
    officeName: info.officeName,
    phone: info.phone,
    address: info.address,
    email: info.email,
    website: info.website,
  };
}

function buildMentalHealthCard(answers) {
  const wantsMentalHealth = (answers.goals || []).includes('mental-health');
  if (!wantsMentalHealth) return null;
  return {
    key: 'mental-health',
    title: 'Mental Health',
    icon: 'heart',
    variant: 'crisis',
    headline: 'You are not alone — help is available right now.',
    body: {
      before: 'The Veterans Crisis Line is free, confidential, and available 24/7. Call 988 then press 1, text 838255 or start a ',
      linkLabel: 'live chat',
      linkHref: 'https://www.veteranscrisisline.net/get-help-now/chat/',
      after: ' today.',
    },
    communityCare: {
      before: "If you'd like to see a counselor, but don't want to go to the VA, we can help you find a ",
      linkLabel: 'community based behavioral counselor',
      linkHref: 'https://starproviders.org/find-support/',
      after: ' with training in military culture.',
    },
  };
}

function buildEmploymentCard(answers) {
  const wantsEmployment = (answers.goals || []).includes('employment');
  if (!wantsEmployment) return null;
  const mosTranslation = buildMosTranslation(answers.branch);

  let skillbridge = null;
  if (wantsEmployment && answers.status === 'currently-serving') {
    const listings = getSkillbridgeListings({ industries: answers.industries });
    if (listings.length) skillbridge = listings;
  }

  let jobListings = null;
  if (wantsEmployment) {
    const listings = getJobListings({ county: answers.county, industries: answers.industries, limit: 6 });
    if (listings.length) jobListings = listings;
  }
  const jobSearchLink = wantsEmployment ? buildJobSearchLink() : null;

  let employers = null;
  if (wantsEmployment) {
    const listings = getEmployerListings({ county: answers.county, industries: answers.industries, limit: 5 });
    if (listings.length) employers = listings;
  }

  return {
    key: 'employment',
    title: 'Employment',
    icon: 'briefcase',
    mosTranslation,
    skillbridge,
    jobListings,
    jobSearchLink,
    employers,
  };
}

function buildGiBillCard(answers) {
  // Goal value "education" intentionally maps to card key "gi-bill" (pre-existing naming).
  if (!(answers.goals || []).includes('education')) return null;
  return {
    key: 'gi-bill',
    title: 'GI Bill Eligibility',
    icon: 'graduation-cap',
    body: [
      "The Ohio GI Promise seeks to make Ohio the most veteran-friendly state in the country for higher education. To encourage veterans from across the country to bring their families, leadership, motivation, and maturity to Ohio's colleges and universities, the State of Ohio's executive order creating the Ohio GI Promise outlines criteria that lets qualified veterans and their dependents, from anywhere in the country, skip the standard 12-month residency requirement and attend Ohio's public colleges and universities at in-state tuition rates.",
    ],
    cta: {
      before: 'Your County Veterans Service Office can help confirm whether you or your family qualify and walk you through applying. Learn more about the ',
      linkLabel: 'Ohio GI Promise',
      linkHref: 'https://highered.ohio.gov/initiatives/campus-initiatives/education-for-veterans/ohio-gi-promise',
      after: ' and some frequently asked questions.',
    },
  };
}

function buildHousingCard(answers) {
  const triggered = (answers.goals || []).includes('housing');
  if (!triggered) return null;

  const showOvh = answers.status === 'veteran' || answers.status === 'family';

  return {
    key: 'housing',
    title: 'Housing Support',
    icon: 'house',
    base: {
      body: 'If you are facing housing instability, help is available. The National Call Center for Homeless Veterans (877-424-3838) connects you with VA and community resources, including the Health Care for Homeless Veterans program.',
      eligibilityCta: {
        before: 'Determine your eligibility and apply for free to one of the ',
        linkLabel: 'Ohio Veterans Homes',
        linkHref: 'https://dvs.ohio.gov/veterans-homes/determining-eligibility',
        after: '.',
      },
      links: [
        { label: 'VA homeless resources', href: 'https://www.va.gov/homeless/' },
        { label: 'National Coalition for Homeless Veterans', href: 'https://nchv.org/' },
      ],
    },
    ovh: showOvh
      ? {
          body: 'If you or your veteran family member may need long-term nursing or assisted-living care, Ohio operates two state veterans homes that may be worth exploring.',
          facilities: [
            { name: 'Ohio Veterans Home – Sandusky', established: 1888, note: 'Long-term nursing, memory care, and domiciliary care.' },
            { name: 'Ohio Veterans Home – Georgetown', established: 2003, note: 'Skilled nursing care.' },
          ],
          contact: '(888) 387-6446 · ohiovet@dvs.ohio.gov',
          detailsHref: 'https://dvs.ohio.gov/',
        }
      : null,
    homeLoanCard: {
      key: 'housing-home-loans',
      title: 'Home Loan Support',
      icon: 'bank',
      sections: [
        {
          subhead: 'Federal Home Loan Programs',
          paragraphs: [
            {
              before: 'Eligible vets receive ',
              linkLabel: 'guaranteed loans',
              linkHref: 'https://www.benefits.va.gov/homeloans/',
              after: ' to purchase, repair, or refinance a home.',
            },
            {
              before: 'Housing for Wounded, Injured, and Ill and Surviving Spouses is available. ',
              linkLabel: 'Learn more and apply today',
              linkHref: 'https://www.usace.army.mil/Missions/Real-Estate/HAP/How-to-Apply/',
              after: '',
            },
          ],
        },
        {
          subhead: 'Ohio Home Loan Programs',
          paragraphs: [
            "The Ohio Housing Finance Agency offers all benefits of their first time home buyer program to Ohio's heroes at an interest rate approximately 1/4% lower than the going interest rate.",
          ],
          links: [
            { label: 'Learn about eligibility', href: 'https://dam.assets.ohio.gov/image/upload/v1780516560/dvs.ohio.gov/benefits/ohio-heroes-fillable.pdf' },
            { label: 'Learn more about the program', href: 'https://dam.assets.ohio.gov/image/upload/v1780584772/dvs.ohio.gov/benefits/homebuyerguide.pdf' },
          ],
        },
      ],
    },
  };
}

function buildBenefitsCard(answers) {
  if (!(answers.goals || []).includes('benefits')) return null;
  return {
    key: 'benefits',
    title: 'Benefits & Claims',
    icon: 'file-text',
    body: 'Your County Veterans Service Office can help you file, track, and appeal VA disability and other benefit claims at no cost — no paperwork fees, no middleman.',
    links: [
      { label: 'Confirm eligibility', href: 'https://www.va.gov/disability/eligibility/' },
      { label: 'File for a disability claim online', href: 'https://www.va.gov/disability/file-disability-claim-form-21-526ez/introduction' },
      { label: 'Check your claim status', href: 'https://www.va.gov/claim-or-appeal-status/' },
      { label: 'Survivor benefits', href: 'https://www.va.gov/family-and-caregiver-benefits/survivor-compensation/dependency-indemnity-compensation/' },
    ],
  };
}

function buildFamilyCard(answers) {
  if (!(answers.goals || []).includes('family')) return null;
  return {
    key: 'family',
    title: 'Caregiver Support',
    icon: 'users',
    body: 'Family members and caregivers can also get help through your County Veterans Service Office, including caregiver support resources and benefits information for dependents.',
    links: [
      { label: 'VA Caregiver Support Program', href: 'https://www.caregiver.va.gov/' },
      { label: 'Central Ohio Caregiver Support', href: 'https://www.va.gov/central-ohio-health-care/health-services/caregiver-support/' },
      { label: 'Chillicothe Caregiver Support', href: 'https://www.va.gov/chillicothe-health-care/health-services/caregiver-support/' },
      { label: 'Cincinnati Caregiver Support', href: 'https://www.va.gov/cincinnati-health-care/health-services/caregiver-support/' },
      { label: 'Dayton Caregiver Support', href: 'https://www.va.gov/dayton-health-care/health-services/caregiver-support/' },
      { label: 'NorthEast Ohio Caregiver Support', href: 'https://www.va.gov/northeast-ohio-health-care/health-services/caregiver-support/' },
    ],
  };
}

const URGENCY_COPY = {
  'right-away': "We know this is urgent. We're prioritizing a quick connection for you.",
  'next-few-weeks': "We'll make sure you're connected within the next few weeks.",
  researching: "Take your time — everything here will be ready when you're ready.",
};

const CONTACT_COPY = {
  phone: (info) => `We'll have your County Veterans Service Office call you${info ? ` at ${info}` : ''}.`,
  text: (info) => `We'll send next steps by text${info ? ` to ${info}` : ''}.`,
  email: (info) => `We'll send next steps by email${info ? ` to ${info}` : ''}.`,
  'in-person': () => "We'll set up a time for you to visit your County Veterans Service Office in person.",
};

function buildNextStepsCard(answers) {
  const refNumber = buildReferenceNumber(answers);
  const contactCopy = CONTACT_COPY[answers.contact] || CONTACT_COPY.phone;
  return {
    key: 'next-steps',
    title: 'Next Steps',
    icon: 'arrow-right',
    urgencyNote: URGENCY_COPY[answers.urgency] || URGENCY_COPY.researching,
    contactNote: contactCopy(answers['contact-info']),
    referenceNumber: refNumber,
  };
}

// Deterministic, demo-only fabricated reference number (not a real
// case/ticket ID) — purely so the Next Steps card has something to point to.
function buildReferenceNumber(answers) {
  const seed = [answers.branch, answers.status, answers.county, answers.urgency]
    .filter(Boolean)
    .join('-');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 900000;
  }
  return `NAV-${String(hash + 100000).slice(0, 6)}`;
}

// Maps each Q5 goal value to the builder for its tab content.
const GOAL_CARD_BUILDERS = {
  benefits: buildBenefitsCard,
  employment: buildEmploymentCard,
  education: buildGiBillCard,
  'mental-health': buildMentalHealthCard,
  housing: buildHousingCard,
  family: buildFamilyCard,
};

// Returns { persistent, tabs }:
//   persistent - cards shown above the tab strip regardless of goal
//                selection (County Veterans Service Office Match, Next Steps) — never duplicated per tab.
//   tabs       - one card per selected Q5 goal, in selection order, plus:
//                  - a situationally-triggered Housing card appended if not
//                    already present from goal selection,
//                  - Employment pulled to the front last, so it always wins.
//                Selecting "Mental Health" as a goal always shows the
//                crisis-variant card (988 line) — there is no separate
//                situational crisis trigger.
export function buildPathway(answers) {
  const persistent = [buildCvsoCard(answers), buildNextStepsCard(answers)].filter(Boolean);

  const goals = answers.goals || [];
  const tabs = goals.map((goal) => GOAL_CARD_BUILDERS[goal]?.(answers)).filter(Boolean);

  if (!tabs.some((card) => card.key === 'housing')) {
    const housingCard = buildHousingCard(answers);
    if (housingCard) tabs.push(housingCard);
  }

  const employmentIndex = tabs.findIndex((card) => card.key === 'employment');
  if (employmentIndex > 0) {
    const [employmentCard] = tabs.splice(employmentIndex, 1);
    tabs.unshift(employmentCard);
  }

  return { persistent, tabs };
}

export function buildRecapBanner(answers) {
  const branchLabel = answers.branch && answers.branch !== 'not-sure' ? ` ${capitalize(answers.branch)}` : '';
  const countyLabel = answers.county && answers.county !== 'not-in-ohio' ? `${answers.county} County` : 'Ohio';
  const goalLabel = (answers.goals || [])[0] ? goalDisplayLabel(answers.goals[0]) : 'your goals';
  return `Based on your${branchLabel} service in ${countyLabel}, here's what we found for ${goalLabel}.`;
}

function capitalize(value) {
  return value
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const GOAL_DISPLAY_LABELS = {
  benefits: 'Benefits & Claims',
  employment: 'Employment and Training',
  education: 'Education Benefits',
  'mental-health': 'Mental Health and Crisis Support',
  housing: 'Housing and Financial Support',
  family: 'Family and Caregiver Support',
};

function goalDisplayLabel(goal) {
  return GOAL_DISPLAY_LABELS[goal] || goal;
}
