---
name: Deploy build fails on merge conflict markers
description: Recurring deploy-build failure caused by unresolved git conflict markers in client/src/App.tsx
---

# Deploy build fails on leftover git conflict markers

Production deploy builds for this repo have repeatedly failed with an esbuild
parse error `Expected identifier but found "<"` pointing at `client/src/App.tsx`.

**Cause:** unresolved git merge conflict markers (`<<<<<<<`, `=======`,
`>>>>>>>`) left in the `<Switch>` route list of `client/src/App.tsx`. Merges
into this file keep re-introducing them (the route list is a frequent conflict
hotspot — announcements/obituaries/pre-planning vs memorials/social-flyer routes).

**Why:** dev/tsx runtime tolerates a lot, but the production `npm run build`
(vite/esbuild) hard-fails on the markers, so it only surfaces at publish time.

**How to apply:** when a deploy build fails, first run
`grep -n "^<<<<<<<\|^=======$\|^>>>>>>>" client/src/App.tsx` (and repo-wide).
Resolve by keeping all real routes, removing duplicates, then verify with
`npm run build` before re-publishing. All route components are normally already
imported, so just clean up the marker block.
