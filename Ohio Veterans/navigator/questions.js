// Ohio Veterans — Navigator
// Question data for the intake stepper, plus the shared 6-category list
// used by both the landing screen and Q5.

export const CATEGORIES = [
  {
    value: 'benefits',
    label: 'Benefits & Claims',
    pillLabel: 'Benefits',
    tabLabel: 'Benefits & Claims',
    description: 'Get help with VA claims and paperwork.',
    icon: 'file-text',
  },
  {
    value: 'employment',
    label: 'Employment and Training',
    pillLabel: 'Employment',
    tabLabel: 'Employment',
    description: 'Find a job or learn new skills.',
    icon: 'briefcase',
  },
  {
    value: 'education',
    label: 'Education Benefits',
    pillLabel: 'GI Bill',
    tabLabel: 'GI Bill Eligibility',
    description: 'Use the GI Bill for school or training.',
    icon: 'graduation-cap',
  },
  {
    value: 'mental-health',
    label: 'Mental Health and Crisis Support',
    pillLabel: 'Mental Health',
    tabLabel: 'Mental Health',
    description: 'Talk to someone or get connected to care.',
    icon: 'heart',
  },
  {
    value: 'housing',
    label: 'Housing and Financial Support',
    pillLabel: 'Housing',
    tabLabel: 'Housing Support',
    description: 'Get help with housing or money.',
    icon: 'house',
  },
  {
    value: 'family',
    label: 'Family and Caregiver Support',
    pillLabel: 'Caregiver Support',
    tabLabel: 'Caregiver Support',
    description: 'Resources for your family or caregiver.',
    icon: 'users',
  },
];

// Trivial keyword pattern-matching against the free-text landing input.
// A cosmetic stand-in for real NLU — sets a best-guess initial category,
// still fully editable at Q5.
export const CATEGORY_KEYWORDS = {
  benefits: ['claim', 'benefit', 'paperwork', 'disability', 'compensation', 'va claim'],
  employment: ['job', 'work', 'employ', 'career', 'hire', 'resume', 'training', 'skillbridge'],
  education: ['school', 'gi bill', 'college', 'degree', 'tuition', 'education', 'training program'],
  'mental-health': ['mental', 'crisis', 'stress', 'depress', 'anxiety', 'counsel', 'suicide', 'ptsd'],
  housing: ['housing', 'home', 'rent', 'money', 'financial', 'evict', 'homeless', 'shelter'],
  family: ['family', 'spouse', 'caregiver', 'kids', 'children', 'dependent'],
};

export function matchCategoryFromText(text) {
  const normalized = text.toLowerCase();
  for (const [value, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => normalized.includes(kw))) return value;
  }
  return null;
}

// Generic keyword matcher for chat free-text answers. Cosmetic stand-in for
// real NLU, same spirit as matchCategoryFromText above but reusable across
// every question's option set. Returns every option whose `keywords` (or
// label) appear as a substring of `text`, in option-declaration order.
export function matchOptionsFromText(options, text) {
  const normalized = text.toLowerCase();
  return options
    .filter((option) => {
      const keywords = option.keywords || [option.label.toLowerCase()];
      return keywords.some((kw) => normalized.includes(kw.toLowerCase()));
    })
    .map((option) => option.value);
}

export const BRANCHES = [
  { value: 'army', label: 'Army', keywords: ['army', 'soldier'] },
  { value: 'navy', label: 'Navy', keywords: ['navy', 'sailor'] },
  { value: 'air-force', label: 'Air Force', keywords: ['air force', 'airman'] },
  { value: 'marine-corps', label: 'Marine Corps', keywords: ['marine', 'marines', 'usmc'] },
  { value: 'coast-guard', label: 'Coast Guard', keywords: ['coast guard', 'uscg'] },
  { value: 'space-force', label: 'Space Force', keywords: ['space force', 'guardian'] },
  { value: 'national-guard', label: 'National Guard', keywords: ['national guard'] },
  { value: 'reserve', label: 'Reserve', keywords: ['reserve', 'reservist'] },
  { value: 'not-sure', label: 'Not sure', keywords: ['not sure', "don't know", 'unsure'] },
];

export const STATUSES = [
  {
    value: 'currently-serving',
    label: 'Currently serving',
    keywords: ['currently serving', 'active duty', 'still serving', 'still in'],
  },
  { value: 'veteran', label: 'Veteran', keywords: ['veteran', 'separated', 'discharged', 'retired'] },
  {
    value: 'guard-reserve',
    label: 'National Guard or Reserve',
    keywords: ['national guard', 'reserve', 'reservist'],
  },
  {
    value: 'family',
    label: 'Family member or caregiver',
    keywords: ['family', 'spouse', 'caregiver', 'wife', 'husband', 'parent', 'child'],
  },
];

export const INDUSTRY_BUCKETS = [
  {
    value: 'skilled-trades',
    label: 'Skilled Trades & Construction',
    sectors: ['Construction', 'Utilities', 'Skilled Trades'],
    keywords: ['construction', 'trade', 'electrician', 'plumber', 'skilled trades'],
  },
  {
    value: 'manufacturing-logistics',
    label: 'Manufacturing & Logistics',
    sectors: ['Manufacturing', 'Transportation and Warehousing', 'Wholesale Trade'],
    keywords: ['manufacturing', 'warehouse', 'logistics', 'factory'],
  },
  {
    value: 'healthcare',
    label: 'Healthcare',
    sectors: ['Health Care and Social Assistance'],
    keywords: ['healthcare', 'health care', 'nurse', 'hospital'],
  },
  {
    value: 'technology-it',
    label: 'Technology & IT',
    sectors: ['Information', 'Professional, Scientific, and Technical Services'],
    keywords: ['tech', 'it ', 'computer', 'software', 'coding', 'information technology'],
  },
  {
    value: 'government-security',
    label: 'Government, Security & Public Safety',
    sectors: ['Public Administration', 'Administrative and Support Services'],
    keywords: ['government', 'security', 'police', 'public safety'],
  },
  {
    value: 'business-finance-legal',
    label: 'Business, Finance & Legal',
    sectors: ['Finance and Insurance', 'Professional, Scientific, and Technical Services', 'Real Estate and Rental and Leasing'],
    keywords: ['business', 'finance', 'legal', 'accounting', 'bank'],
  },
  {
    value: 'education-nonprofit',
    label: 'Education & Nonprofit',
    sectors: ['Educational Services', 'Other Services (except Public Administration)'],
    keywords: ['education', 'teacher', 'nonprofit', 'school'],
  },
  {
    value: 'energy-engineering-aerospace',
    label: 'Energy, Engineering & Aerospace',
    sectors: ['Mining, Quarrying, and Oil and Gas Extraction', 'Manufacturing', 'Utilities'],
    keywords: ['energy', 'engineering', 'aerospace', 'oil', 'gas'],
  },
  {
    value: 'retail-hospitality-food',
    label: 'Retail, Hospitality & Food Service',
    sectors: ['Retail Trade', 'Accommodation and Food Services'],
    keywords: ['retail', 'hospitality', 'restaurant', 'food service'],
  },
];

export const URGENCY_OPTIONS = [
  { value: 'right-away', label: 'Right away', keywords: ['right away', 'asap', 'urgent', 'immediately', 'now'] },
  { value: 'next-few-weeks', label: 'Next few weeks', keywords: ['few weeks', 'soon', 'couple weeks'] },
  {
    value: 'researching',
    label: 'Just researching',
    keywords: ['just researching', 'just looking', 'no rush', 'not urgent'],
  },
];

export const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone', keywords: ['phone', 'call me', 'call'] },
  { value: 'text', label: 'Text', keywords: ['text'] },
  { value: 'email', label: 'Email', keywords: ['email'] },
  { value: 'in-person', label: 'In person at my County Veterans Service Office', keywords: ['in person', 'visit', 'office'] },
];

// Ordered question definitions consumed by intake.html.
// type: 'single' -> mms-radio, hand-managed radiogroup, auto-advances
// type: 'multi'  -> mms-checkbox-group, requires explicit Next
// type: 'select' -> native <select>, auto-advances is false (Next required)
// type: 'text'   -> free-text-only answer (no chips), submitted verbatim via
//                   the chat input row; `prompt`/`placeholder` may be a
//                   function of `answers` for contact-method-aware copy
export const QUESTIONS = [
  {
    id: 'branch',
    type: 'single',
    prompt: 'Which branch did you serve in?',
    options: BRANCHES,
  },
  {
    id: 'status',
    type: 'single',
    prompt: 'Which of these best describes you right now?',
    options: STATUSES,
  },
  {
    id: 'county',
    type: 'select',
    prompt: 'What Ohio county do you live in (or plan to live in)?',
    // options populated from county-data.js at render time
  },
  {
    id: 'goals',
    type: 'multi',
    prompt: 'What do you want help with? Choose all that apply.',
    options: CATEGORIES.map(({ value, tabLabel }) => ({ value, label: tabLabel, keywords: CATEGORY_KEYWORDS[value] })),
    seedFromIntent: true,
    crisisValue: 'mental-health',
    crisisNotice: 'If you are in crisis, the Veterans Crisis Line is available 24/7: call 988, then press 1.',
  },
  {
    id: 'industries',
    type: 'multi',
    prompt: 'What field of work interests you? Choose all that apply.',
    options: [
      ...INDUSTRY_BUCKETS.map(({ value, label, keywords }) => ({ value, label, keywords })),
      { value: 'not-sure', label: 'Not sure yet', keywords: ['not sure', 'no idea', "don't know"] },
    ],
    conditional: (answers) => (answers.goals || []).includes('employment'),
  },
  {
    id: 'urgency',
    type: 'single',
    prompt: 'How soon do you need help?',
    options: URGENCY_OPTIONS,
  },
  {
    id: 'contact',
    type: 'single',
    prompt: 'How should we follow up with you?',
    options: CONTACT_METHODS,
  },
  {
    id: 'contact-info',
    type: 'text',
    prompt: (answers) => (answers.contact === 'email'
      ? "What's the best email address to reach you at?"
      : "What's the best phone number to reach you at?"),
    placeholder: (answers) => (answers.contact === 'email' ? 'name@email.com' : '(614) 555-0123'),
    conditional: (answers) => ['phone', 'text', 'email'].includes(answers.contact),
  },
];
