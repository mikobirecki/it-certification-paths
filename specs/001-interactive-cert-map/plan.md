# Implementation Plan: Interactive Certification Path Map

**Branch**: `001-interactive-cert-map` | **Date**: 2026-03-22 | **Spec**: `/Users/mbirecki/CascadeProjects/certPaths/specs/001-interactive-cert-map/spec.md`
**Input**: Feature specification from `/specs/001-interactive-cert-map/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build an interactive Azure certification path map (poster-style graph + table view)
with recommendation logic that suggests the shortest valid next-certification path
for any Azure role. MVP uses curated local data, enforces dependency correctness,
supports responsive UX, and stores user state locally in browser.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18  
**Primary Dependencies**: React, React DOM, Vite, `@xyflow/react`  
**Storage**: Local structured data files (certification catalog), browser local storage (user state)  
**Testing**: Vitest + React Testing Library + contract/data validation tests  
**Target Platform**: Modern desktop and mobile web browsers  
**Project Type**: Single-page web application  
**Performance Goals**: Interactive operations perceived as instant; fluid rendering for 100+ certification nodes  
**Constraints**: Azure-only provider in MVP, all Azure roles supported, curated data updates with mandatory verification checklist  
**Scale/Scope**: 100+ certifications and dependency edges; full Azure role coverage in recommendation inputs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Gate 1 - Code Quality & Maintainability**: PASS
  - Plan enforces typed domain model, explicit validation rules, and modular separation
    of data, graph, recommendation, and UI layers.
- **Gate 2 - Testing Standards**: PASS
  - Plan includes unit tests for path/recommendation logic, integration tests for
    map/table/filter flows, and data contract validation for curated catalog updates.
- **Gate 3 - UX Consistency**: PASS
  - Plan includes consistent interaction patterns across map and table, responsive
    behavior, explicit empty/loading/error states, and accessibility checks.
- **Gate 4 - Performance Requirements**: PASS
  - Plan includes bounded graph rendering strategy, memoized selectors, and
    target of smooth interactions for 100+ nodes.

Post-Phase-1 Re-check: PASS (design artifacts include explicit contracts, data model
constraints, and testable acceptance-aligned workflows).

## Project Structure

### Documentation (this feature)

```text
specs/001-interactive-cert-map/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── recommendation-contract.md
│   └── catalog-validation-contract.md
└── tasks.md
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── components/
│   ├── GraphView.tsx
│   ├── TableView.tsx
│   ├── FilterPanel.tsx
│   ├── RecommendationPanel.tsx
│   └── NodeDetailsPanel.tsx
├── data/
│   ├── certifications.ts
│   ├── roleProfiles.ts
│   └── catalog-schema.ts
├── graph/
│   └── buildFlow.ts
├── utils/
│   ├── recommendation.ts
│   ├── pathFinding.ts
│   ├── catalogValidation.ts
│   └── persistence.ts
├── types.ts
└── App.tsx

tests/
├── contract/
│   ├── recommendation.contract.test.ts
│   └── catalog-validation.contract.test.ts
├── integration/
│   ├── map-table-sync.test.tsx
│   └── recommendation-flow.test.tsx
└── unit/
    ├── shortest-path.test.ts
    ├── recommendation.test.ts
    └── catalogValidation.test.ts
```

**Structure Decision**: Single-project React + TypeScript web app structure at repo
root, extended with explicit data/recommendation/validation modules and dedicated
contract tests for recommendation and curated catalog integrity.

## Complexity Tracking

No constitution violations identified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
