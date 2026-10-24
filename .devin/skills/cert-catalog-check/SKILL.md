---
name: cert-catalog-check
description: Monthly certification catalog refresh — detect new, retiring and retired certs across all vendors, update src/data/certifications.json and open a PR
argument-hint: "[vendor filter, e.g. Microsoft AWS]"
triggers:
  - user
  - model
allowed-tools:
  - read
  - grep
  - glob
permissions:
  allow:
    - Exec(npm run check:catalog)
    - Exec(npx tsc -b)
    - Exec(npm run build)
    - Exec(git status)
    - Exec(git diff)
    - Exec(git log)
---

# Certification catalog check (monthly)

Goal: keep `src/data/certifications.json` accurate — find **new** certs, **retiring** certs (announced date in the future) and **retired** certs (date passed), plus exam-version changes, renamed certs and dead URLs. If the user passed a vendor filter, limit the research to those vendors.

## 0. Prepare

1. `git status` must be clean. Create a branch `NNN-catalog-refresh-<mon>-<yyyy>` (next free index — check `git branch -a`).
2. Read `src/types.ts` (allowed `Vendor`, `Level`, `RoleTrack` values) and skim `src/data/certifications.json` for the per-vendor conventions (`domain`, `levelDisplay`, `officialResources`, link ids `l-<source>-<target>`).

## 1. Automated baseline

Run `npm run check:catalog` (writes `scripts/catalog-report.json`, prints a markdown summary). Read both. It covers:

- Validation errors (exit code 1) — fix these first.
- Retired / retiring within 90 days.
- Microsoft Learn Catalog API diff: catalog certs whose URL slug isn't in the API (renamed slug **or** retired) and API certs not in the catalog (new candidates). The API `exams` list is incomplete — treat "new exam candidates" as hints only.
- Microsoft study guides: "will retire on …" notices that the catalog is missing.
- URL health: 404s and redirects to listing pages usually mean a retired cert or a moved page. 429 = rate limiting, not a broken page.

## 2. Vendor research (official sources first)

For each vendor, check the official pages below for new certs, betas, retirements and exam-version changes since the last refresh (see `git log -- src/data/certifications.json` for the last refresh date). Confirm every fact on an official page before using it; third-party blogs are only leads.

| Vendor | Where to look |
|---|---|
| Microsoft / GitHub | Report section 3–4; cert page `learn.microsoft.com/en-us/credentials/certifications/<slug>/` (shows "Retirement date" and the exam code); study guide `…/resources/study-guides/<exam>` |
| AWS | `aws.amazon.com/certification/` and the monthly "Certification updates" posts on `aws.amazon.com/blogs/training-and-certification/`; exam guides on `docs.aws.amazon.com/aws-certification/` (exam codes) |
| GCP | `cloud.google.com/learn/certification` (full role list) and individual cert pages |
| HashiCorp | `developer.hashicorp.com/certifications` and announcements at `hashicorp-certifications.zendesk.com` (retirements) |
| Kubernetes / CNCF | `cncf.io/training/certification/`, `training.linuxfoundation.org/certification/…` (new exams, beta/GA status) |
| Red Hat | `redhat.com/en/services/certifications` (5 tracks × 5 levels; per-track RHCE/RHCA — keep `domain` = track and `rhLevel` 1–5 in sync), `redhat.com/en/services/training/all-courses-exams`, Red Hat blog for program changes |
| Anthropic | `pearsonvue.com/us/en/anthropic.html` (exam list and content-update dates) and the exam pages on `anthropic-partners.skilljar.com` (price); Claude Partner Network only |

Scope: technical IT certs that fit the existing tracks. Skip MOS, Dynamics-only (MB-*) and pure business/leadership certs unless the user asks; list skipped candidates in the summary.

## 3. Propose the change list, then apply

Write a short change list grouped by vendor (edit / new / retiring / retired / skipped) with the official source URL per item, and show it to the user before editing. Then apply:

- **Retiring / retired**: set `retiring: true` + `retirementDate: "YYYY-MM-DD"` (last day the exam can be taken). Never delete retired certs — the UI derives the "Retired" badge from a past `retirementDate` (`src/utils/retirement.ts`) and the quiz skips them.
- **Exam version change** (e.g. SAP-C02 → SAP-C03): keep the cert; update `exam` once the new version is live, and before that append the transition dates to `description`.
- **Renames / new slugs**: update `title`, `url` and matching `officialResources` URLs.
- **New certs**: append to `certs` with valid `roles`, `level`, vendor-consistent `domain`/`levelDisplay`, price, validity, prerequisites, `officialResources`; mark betas with "(beta)" in the title. Add `required`/`recommended` links in `links` for real prerequisites and natural next steps.
- **Equivalents**: when adding or retiring a cert, update `src/data/equivalents.json`. Add new certs to their cross-vendor group, and when a cert is retired, add its successor to the group.
- Update the "Last updated" month in `src/components/AboutSection.tsx`.

## 4. Verify

1. `npm run check:catalog` — validation clean; remaining unmatched/URL issues are either explained or listed for the user.
2. `npx tsc -b` and `npm run build` succeed.
3. Optionally `npm run dev` and spot-check new nodes in the graph and the table view.

## 5. Deliver

Commit on the feature branch and open a PR (never push to `main`). The PR body lists the changes per vendor with source links, skipped candidates, and open questions (e.g. unconfirmed dates). After merge, watch the `Azure Static Web Apps CI/CD` workflow.

## Don'ts

- Don't invent exam codes, dates or prices — leave the field out or use "TBA" and flag it.
- Don't add new `RoleTrack`/`Level`/`Vendor` values without updating `src/types.ts`.
- Don't leave links pointing to non-existent cert ids (the check script catches this).
