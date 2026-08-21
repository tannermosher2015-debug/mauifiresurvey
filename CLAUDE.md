# mauifiresurvey - repo rules

**Retrofitted by `/init-client --retrofit` on 2026-08-21 from what was on disk.** Every line below
is either DETECTED or explicitly UNKNOWN. Nothing here was inferred and then stated as fact. Correct
it the first time you work in this repo.

## Stack
Single-file static HTML/CSS/JS. No framework.

## Deploy target
**Netlify** (`netlify.toml` present on disk).

## Does a push publish?
**UNCONFIRMED.** Netlify Git deploy publishes on push; a CLI/drop deploy does not.
Which one this site uses was NOT determined from the repo. Check the Netlify site
settings before pushing, and replace this line with YES or NO.

## Remote
`git@github.com:tannermosher2015-debug/mauifiresurvey.git`, branch `main`.

## Verify path
`shot.ps1` desktop + mobile, **both reviewed**, plus `impeccable detect` on the
built HTML. Every edit gets both shots before a deploy, including one-character ones.

## Landmines
<Empty. Add each one the day it bites, with the date.>
