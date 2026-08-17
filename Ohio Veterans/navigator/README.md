# The Navigator — Prototype

A veteran-facing landing + conversational-intake-stepper + pathway-result
prototype, built for Ohio Department of Veterans Services' (ODVS) RFP
response. Covers RFP requirement pillar 1 (Intelligent Navigation &
Customer Journey Engine) at prototype fidelity, and partially pillar 4
(Matching/Recommendation, via a hardcoded rules table in `pathway-logic.js`).

## Running this demo

This is a static site with no build step, but it depends on
`@mms/design-system` (a Lit web component library) which uses bare ES
module specifiers (`import ... from 'lit'`). Browsers can't resolve those
without an import map, and **import-mapped ES modules must be served over
HTTP — they will not load over a `file://` URL.**

From the repo root (`/Users/JenniferMHadley2/Git`), run a local static
server and open the Navigator through it:

```sh
cd "/Users/JenniferMHadley2/Git"
npx serve
# or: python3 -m http.server
```

Then open `http://localhost:<port>/Ohio Veterans/navigator/` (the
**directory URL, with the trailing slash** — some static servers, including
`serve`, redirect an explicit `.../navigator/index.html` request to
`.../navigator` *without* a trailing slash, which breaks every relative
asset path on the page).

Do not double-click `index.html` in Finder / open it as a `file://` URL —
the design system's components will fail to load.

## Screens

- `index.html` — landing screen (free-text intake + 6 category quick-starts)
- `intake.html` — single-question stepper (7 base questions + 1 conditional)
- `result.html` — simulated loading transition + 6-card pathway result

State (answers, current question index, seeded intent) is kept in
`sessionStorage` so it survives the full-page navigations between these
three files, and is scoped to one browser tab/session.

## Design system usage

All interactive controls default to `@mms/design-system` components
(`mms-button`, `mms-radio`, `mms-checkbox` / `mms-checkbox-group`,
`mms-link`, `mms-icon`), themed via the package's own official
`uss-oh-dvs.css` / `uss-oh-dvs-dark.css` theme (a `[data-theme="uss-oh-dvs"]`
sheet built from the real Ohio Brand Guide — Buckeye Blue primary, Earth
Brown secondary, Cardinal Red accent), loaded directly from
`node_modules/@mms/design-system/dist/themes/` alongside its
`dist/styles/tokens-primitives.css` dependency. Components that don't exist in
the installed package version (card, select, text-field, progress
indicator, radio-group) are custom-built from `tokens.css` — see
`styles.css` and the plan's Component → Token Mapping table for the full
breakdown of which UI element uses which approach.

## Intentionally out of scope for this demo

- Detailed destination pages (CVSO case detail, GI Bill application,
  employer profile pages, etc.) — every card's "View details" link is a
  labeled stub, not a broken link.
- The ODVS-side performance dashboard (RFP pillar 6) and multi-channel /
  hybrid-search architecture (pillar 5).
- The RFP's referenced "10-stage veteran journey model" (pillar 3) — this
  isn't defined anywhere in the materials provided to build this demo,
  and is flagged here as an open question for ODVS to clarify rather than
  something this prototype attempts to model.
- Kiosk idle-timeout/reset-to-landing and a bumped-touch-target kiosk mode.
- Real MOS/rating-code-level translation — `pathway-logic.js` gives one
  canned paragraph per branch, not per specific military occupation code.

## Live-data upgrade paths

- **Military-Friendly Employers** (`employer-data.js`): currently a small
  curated static snapshot. Ohio's real dataset (9,310 employers, 53
  industry sectors) is public and appears CORS-open at
  `maps.ohio.gov/arcgis/rest/services/Hosted/OMJ_Vet_Friendly_Employers__view/FeatureServer/0`
  — swapping in a live `fetch()` there is a realistic, low-effort upgrade.
- **SkillBridge listings** (`skillbridge-data.js`): currently a small
  illustrative sample modeled on real program structure/partners: verify
  against skillbridge.mil before using in a real deployment, and consider
  a live feed if one becomes available.
- **CVSO directory** (`county-data.js`): real office details are
  hardcoded for 5 populous counties only; the rest use a generic
  county-name template plus the statewide ODVS number. A real directory
  API/dataset would replace this file directly.

## Demo hooks

- Append `?forceError=1` to `result.html` to force the error/empty
  fallback state on demand (e.g. `result.html?forceError=1`), useful for
  live-demoing the failure path without needing to actually break
  anything.
