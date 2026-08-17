// Ohio Veterans — Navigator
// Curated static sample of DoD SkillBridge program listings.
// SkillBridge (skillbridge.mil) partners with real companies to offer
// unit-commander-approved internships during a service member's final
// 180 days of active duty. This demo snapshots a small illustrative
// sample rather than live-fetching skillbridge.mil — details are
// representative of real program structure/partners but should be
// re-verified against skillbridge.mil before any real-world use.
// Gated (see pathway-logic.js) to show only when status = 'currently-serving'.

export const SKILLBRIDGE_LISTINGS = [
  {
    provider: 'Amazon',
    mission: 'Operations & logistics management track for transitioning service members.',
    city: 'Columbus',
    state: 'OH',
    duration: '12–16 weeks',
    employerContact: 'militaryprogram@amazon.com',
    deliveryMethod: 'In-person',
    industryBuckets: ['manufacturing-logistics', 'skilled-trades'],
  },
  {
    provider: 'Lockheed Martin',
    mission: 'Systems engineering and program management rotational internship.',
    city: 'Dayton',
    state: 'OH',
    duration: '16 weeks',
    employerContact: 'militaryrelations@lmco.com',
    deliveryMethod: 'Hybrid',
    industryBuckets: ['energy-engineering-aerospace', 'technology-it'],
  },
  {
    provider: 'CDW',
    mission: 'IT infrastructure and cybersecurity apprenticeship for exiting service members.',
    city: 'Cincinnati',
    state: 'OH',
    duration: '12 weeks',
    employerContact: 'veterans@cdw.com',
    deliveryMethod: 'Remote',
    industryBuckets: ['technology-it'],
  },
  {
    provider: 'Cleveland Clinic',
    mission: 'Healthcare administration and clinical support pathway.',
    city: 'Cleveland',
    state: 'OH',
    duration: '20 weeks',
    employerContact: 'militaryhiring@ccf.org',
    deliveryMethod: 'In-person',
    industryBuckets: ['healthcare'],
  },
  {
    provider: 'JPMorgan Chase',
    mission: 'Financial services rotational program for transitioning military.',
    city: 'Columbus',
    state: 'OH',
    duration: '12 weeks',
    employerContact: 'military.veterans@jpmchase.com',
    deliveryMethod: 'In-person',
    industryBuckets: ['business-finance-legal'],
  },
  {
    provider: 'Honda Development & Manufacturing of America',
    mission: 'Advanced manufacturing and production management track.',
    city: 'Marysville',
    state: 'OH',
    duration: '14 weeks',
    employerContact: 'careers@ham.honda.com',
    deliveryMethod: 'In-person',
    industryBuckets: ['manufacturing-logistics', 'energy-engineering-aerospace'],
  },
];

export function getSkillbridgeListings({ industries } = {}) {
  const set = new Set(industries || []);
  if (set.size === 0 || set.has('not-sure')) return SKILLBRIDGE_LISTINGS;
  return SKILLBRIDGE_LISTINGS.filter((listing) =>
    listing.industryBuckets.some((bucket) => set.has(bucket))
  );
}
