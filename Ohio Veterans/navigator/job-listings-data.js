// Ohio Veterans — Navigator
// Curated static sample of Ohio job postings, standing in for real listings
// from OhioMeansJobs' job search (jobs.ohiomeansjobs.applygovt.com). That
// site is server-rendered ASP.NET with no JSON API and no CORS headers, so
// a live client-side fetch from this static, no-backend site isn't
// possible — same constraint already documented for the SkillBridge and
// Military-Friendly Employer sections (skillbridge-data.js,
// employer-data.js), solved the same way here: a small curated sample,
// tagged to the same 9 industry buckets used at Q5b, plus a real "view all"
// link out to the live search results (built in pathway-logic.js). Company/
// city/county values reused from employer-data.js where they overlap, for
// internal consistency between the two sections.

export const JOB_LISTINGS = [
  { title: 'Electrician', company: 'Kokosing Construction Company', city: 'Columbus', county: 'Franklin', industry: 'skilled-trades', type: 'Full-Time' },
  { title: 'Union Plumber Apprentice', company: 'Turner Construction Company', city: 'Cincinnati', county: 'Hamilton', industry: 'skilled-trades', type: 'Apprenticeship' },

  { title: 'Warehouse Associate', company: 'Amazon Fulfillment', city: 'Columbus', county: 'Franklin', industry: 'manufacturing-logistics', type: 'Full-Time' },
  { title: 'Production Line Technician', company: 'Procter & Gamble', city: 'Cincinnati', county: 'Hamilton', industry: 'manufacturing-logistics', type: 'Full-Time' },

  { title: 'Registered Nurse', company: 'Cleveland Clinic', city: 'Cleveland', county: 'Cuyahoga', industry: 'healthcare', type: 'Full-Time' },
  { title: 'Medical Assistant', company: 'OhioHealth', city: 'Columbus', county: 'Franklin', industry: 'healthcare', type: 'Full-Time' },

  { title: 'IT Support Specialist', company: 'CDW', city: 'Cincinnati', county: 'Hamilton', industry: 'technology-it', type: 'Full-Time' },
  { title: 'Software Developer', company: 'Progressive Insurance', city: 'Cleveland', county: 'Cuyahoga', industry: 'technology-it', type: 'Full-Time' },

  { title: 'Public Safety Dispatcher', company: 'Ohio Department of Public Safety', city: 'Columbus', county: 'Franklin', industry: 'government-security', type: 'Full-Time' },
  { title: 'Corrections Officer', company: 'Summit County Sheriff’s Office', city: 'Akron', county: 'Summit', industry: 'government-security', type: 'Full-Time' },

  { title: 'Loan Officer', company: 'JPMorgan Chase', city: 'Columbus', county: 'Franklin', industry: 'business-finance-legal', type: 'Full-Time' },
  { title: 'Financial Analyst', company: 'KeyBank', city: 'Cleveland', county: 'Cuyahoga', industry: 'business-finance-legal', type: 'Full-Time' },

  { title: 'Instructional Aide', company: 'Columbus City Schools', city: 'Columbus', county: 'Franklin', industry: 'education-nonprofit', type: 'Full-Time' },
  { title: 'Program Coordinator', company: 'University of Cincinnati', city: 'Cincinnati', county: 'Hamilton', industry: 'education-nonprofit', type: 'Part-Time' },

  { title: 'Field Engineer', company: 'AEP Ohio', city: 'Columbus', county: 'Franklin', industry: 'energy-engineering-aerospace', type: 'Full-Time' },
  { title: 'Aircraft Mechanic', company: 'GE Aviation', city: 'Cincinnati', county: 'Hamilton', industry: 'energy-engineering-aerospace', type: 'Full-Time' },

  { title: 'Store Associate', company: 'Kroger', city: 'Cincinnati', county: 'Hamilton', industry: 'retail-hospitality-food', type: 'Part-Time' },
  { title: 'Guest Services Team Member', company: 'Cedar Point', city: 'Sandusky', county: 'Erie', industry: 'retail-hospitality-food', type: 'Full-Time' },
];

export function getJobListings({ county, industries, limit = 6 } = {}) {
  const industrySet = new Set(industries || []);
  const filterActive = industrySet.size > 0 && !industrySet.has('not-sure');

  let results = JOB_LISTINGS;

  if (filterActive) {
    results = results.filter((job) => industrySet.has(job.industry));
  }

  if (county && county !== 'not-in-ohio') {
    const inCounty = results.filter((job) => job.county === county);
    // Prefer in-county matches, but still show statewide results if too few.
    results = inCounty.length >= 3 ? inCounty : results;
  }

  return results.slice(0, limit);
}
