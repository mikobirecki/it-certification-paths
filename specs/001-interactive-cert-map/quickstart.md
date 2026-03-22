# Quickstart: Interactive Certification Path Map

## Goal
Implement and validate MVP for Azure certification map and recommendation flow.

## Prerequisites

- Node.js 18+
- npm installed
- Repository dependencies installed

## 1. Run Application

```bash
npm install
npm run dev
```

Open local app URL provided by Vite.

## 2. Core MVP Validation Flow

1. Open map view and verify certifications are grouped by level.
2. Click a certification and verify detail panel data.
3. Set filters (role, level, area) and verify map + table are synchronized.
4. Choose target Azure role and owned certifications.
5. Generate recommendation and verify shortest valid path is returned.
6. Refresh browser and confirm local state is restored.

## 3. Catalog Update Workflow (Manual + Verified)

1. Update curated catalog files in `src/data/`.
2. Run catalog validation checks.
3. Confirm no dependency cycles and no missing references.
4. Re-run recommendation contract tests.
5. Verify at least one role end-to-end scenario in UI.

## 4. Suggested Test Commands

```bash
npm run lint
npm run build
npm test
```

If `npm test` is not yet wired in scripts, run test runner directly after setup.

## 5. Today’s Data Review Task

- Compare current Azure certification catalog with project data.
- Add newly introduced certifications.
- Mark retired certifications as `retired` instead of deleting history.
- Re-check role mappings and dependency edges after updates.

## 6. Definition of Done for MVP Slice

- Map and table views are both functional and consistent.
- Recommendation returns deterministic shortest valid path.
- Local browser persistence works for filters/role/owned certificates.
- Catalog validation contract passes.
- Lint/build checks pass.
