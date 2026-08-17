// @mms/design-system's mms-icon lazy-loads its SVG registry via a bare
// `import('../../icons/icon-svgs.json')` with no `{ with: { type: 'json' } }`
// assertion. Browsers reject that as a JS module fetch against a
// application/json response (strict MIME checking), which only works when
// a bundler inlines the JSON at build time. This project has no bundler, so
// the import map below redirects that resolved URL to this shim, which
// fetches the same file as data instead of as a module and re-exports it
// as the default export the component expects.
const res = await fetch(new URL('../../node_modules/@mms/design-system/dist/icons/icon-svgs.json', import.meta.url));
const data = await res.json();
export default data;
