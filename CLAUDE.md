# mauifiresurvey - repo rules

**Retrofitted by `/init-client --retrofit` on 2026-08-21 from what was on disk.** Every line below
is either DETECTED or explicitly UNKNOWN. Nothing here was inferred and then stated as fact. Correct
it the first time you work in this repo.

## Stack
Single-file static HTML/CSS/JS. No framework.

## Deploy target
**Netlify project `mauifiresurvey`, live at `https://mauifirepulse.com`**

## Does a push publish?
**YES. A push to this repo publishes.** It carries a Netlify git webhook
(`https://api.netlify.com/hooks/github`), so pushing builds and deploys the live site.
Build and verify BEFORE you push.

Settled 2026-08-21 by `gh api repos/<owner>/<repo>/hooks` across all 48 retrofitted repos,
plus a check for a deploying GitHub Action. Control: `publicsafetyfactshawaii`, which is
documented as auto-deploying, returned the Netlify hook, so the test detects git-linkage
rather than silently returning empty.

## Remote
`git@github.com:tannermosher2015-debug/mauifiresurvey.git`, branch `main`.

## Verify path
`shot.ps1` desktop + mobile, **both reviewed**, plus `impeccable detect` on the
built HTML. Every edit gets both shots before a deploy, including one-character ones.

## Landmines
<Empty. Add each one the day it bites, with the date.>
