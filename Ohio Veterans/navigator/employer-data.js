// Ohio Veterans — Navigator
// Curated static snapshot of Ohio's real Military-Friendly Employers
// dataset (OhioMeansJobs / ArcGIS, 9,310 employers, 53 industry_sector
// values — live at maps.ohio.gov/arcgis/rest/services/Hosted/
// OMJ_Vet_Friendly_Employers__view/FeatureServer/0). This demo snapshots
// a small static sample covering the 9 curated industry buckets across
// the 5 counties already special-cased in county-data.js, for kiosk/
// offline reliability rather than a live fetch (see plan Risks/Assumptions
// for the live-fetch upgrade path).

export const EMPLOYER_LISTINGS = [
  { company: 'Kokosing Construction Company', city: 'Columbus', county: 'Franklin', industrySector: 'Construction', address: '6235 Westerville Rd, Westerville, OH 43081' },
  { company: 'Turner Construction Company', city: 'Cincinnati', county: 'Hamilton', industrySector: 'Construction' },

  { company: 'Amazon Fulfillment', city: 'Columbus', county: 'Franklin', industrySector: 'Transportation and Warehousing', address: '4200 Gateway Blvd, Etna, OH 43062' },
  { company: 'Procter & Gamble', city: 'Cincinnati', county: 'Hamilton', industrySector: 'Manufacturing', address: 'One P&G Plaza, Cincinnati, OH 45202' },
  { company: 'Goodyear Tire & Rubber Company', city: 'Akron', county: 'Summit', industrySector: 'Manufacturing', address: '200 Innovation Way, Akron, OH 44316' },

  { company: 'Cleveland Clinic', city: 'Cleveland', county: 'Cuyahoga', industrySector: 'Health Care and Social Assistance', address: '9500 Euclid Ave, Cleveland, OH 44195' },
  { company: 'OhioHealth', city: 'Columbus', county: 'Franklin', industrySector: 'Health Care and Social Assistance', address: '3430 OhioHealth Pkwy, Columbus, OH 43202' },
  { company: 'Premier Health', city: 'Dayton', county: 'Montgomery', industrySector: 'Health Care and Social Assistance', address: '110 N Main St, Dayton, OH 45402' },

  { company: 'CDW', city: 'Cincinnati', county: 'Hamilton', industrySector: 'Information' },
  { company: 'Progressive Insurance', city: 'Cleveland', county: 'Cuyahoga', industrySector: 'Information', address: '6300 Wilson Mills Rd, Mayfield Village, OH 44143' },
  { company: 'CareSource', city: 'Dayton', county: 'Montgomery', industrySector: 'Professional, Scientific, and Technical Services', address: '230 N Main St, Dayton, OH 45402' },

  { company: 'Ohio Department of Public Safety', city: 'Columbus', county: 'Franklin', industrySector: 'Public Administration', address: '1970 W Broad St, Columbus, OH 43223' },
  { company: 'Summit County Sheriff’s Office', city: 'Akron', county: 'Summit', industrySector: 'Public Administration', address: '205 E Crosier St, Akron, OH 44311' },

  { company: 'JPMorgan Chase', city: 'Columbus', county: 'Franklin', industrySector: 'Finance and Insurance', address: '1111 Polaris Pkwy, Columbus, OH 43240' },
  { company: 'KeyBank', city: 'Cleveland', county: 'Cuyahoga', industrySector: 'Finance and Insurance', address: '127 Public Square, Cleveland, OH 44114' },
  { company: 'Fifth Third Bank', city: 'Cincinnati', county: 'Hamilton', industrySector: 'Finance and Insurance', address: '38 Fountain Square Plaza, Cincinnati, OH 45202' },

  { company: 'Columbus City Schools', city: 'Columbus', county: 'Franklin', industrySector: 'Educational Services', address: '270 E State St, Columbus, OH 43215' },
  { company: 'University of Cincinnati', city: 'Cincinnati', county: 'Hamilton', industrySector: 'Educational Services', address: '2600 Clifton Ave, Cincinnati, OH 45221' },

  { company: 'Honda Development & Manufacturing of America', city: 'Marysville', county: 'Union', industrySector: 'Manufacturing', address: '24000 Honda Pkwy, Marysville, OH 43040' },
  { company: 'AEP Ohio', city: 'Columbus', county: 'Franklin', industrySector: 'Utilities', address: '1 Riverside Plaza, Columbus, OH 43215' },
  { company: 'GE Aviation', city: 'Cincinnati', county: 'Hamilton', industrySector: 'Manufacturing', address: '1 Neumann Way, Cincinnati, OH 45215' },

  { company: 'Kroger', city: 'Cincinnati', county: 'Hamilton', industrySector: 'Retail Trade', address: '1014 Vine St, Cincinnati, OH 45202' },
  { company: 'Cedar Point', city: 'Sandusky', county: 'Erie', industrySector: 'Accommodation and Food Services', address: '1 Cedar Point Dr, Sandusky, OH 44870' },
  { company: 'Cracker Barrel Old Country Store', city: 'Columbus', county: 'Franklin', industrySector: 'Accommodation and Food Services' },
];

export function getEmployerListings({ county, industries, limit = 5 } = {}) {
  const industrySet = new Set(industries || []);
  const sectorAllowlist = industrySet.size && !industrySet.has('not-sure')
    ? new Set(
        Array.from(industrySet).flatMap((bucketValue) => {
          const bucket = INDUSTRY_BUCKET_LOOKUP[bucketValue];
          return bucket ? bucket.sectors : [];
        })
      )
    : null;

  let results = EMPLOYER_LISTINGS;

  if (sectorAllowlist) {
    results = results.filter((e) => sectorAllowlist.has(e.industrySector));
  }

  if (county && county !== 'not-in-ohio') {
    // No real geocoding/distance data in this dataset — same-county matches
    // are treated as "closest" and sorted first, rest fill remaining slots.
    results = [...results].sort((a, b) => (b.county === county) - (a.county === county));
  }

  return results.slice(0, limit);
}

// Populated by result-rendering code that imports INDUSTRY_BUCKETS from
// questions.js — kept here as a lazily-assigned lookup to avoid a circular
// import between questions.js and employer-data.js.
export const INDUSTRY_BUCKET_LOOKUP = {};

export function registerIndustryBuckets(buckets) {
  buckets.forEach((bucket) => {
    INDUSTRY_BUCKET_LOOKUP[bucket.value] = bucket;
  });
}
