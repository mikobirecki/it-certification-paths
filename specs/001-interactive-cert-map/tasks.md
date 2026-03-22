---

description: "Task list for interactive Azure certification path map MVP"
---

# Tasks: Interactive Certification Path Map

**Input**: Design documents from `/specs/001-interactive-cert-map/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Test tasks are included because the specification and constitution require test-first delivery for core logic and user flows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., `US1`, `US2`, `US3`)
- All tasks include exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare test/build foundation for MVP implementation.

- [ ] T001 Add test and coverage scripts in `package.json`
- [ ] T002 Create Vitest configuration in `vitest.config.ts`
- [ ] T003 Create React Testing Library setup in `tests/setup.ts`
- [ ] T004 Create test folder structure placeholders in `tests/unit/.gitkeep`, `tests/integration/.gitkeep`, and `tests/contract/.gitkeep`
- [ ] T041 [P] Configure global coverage threshold >=80% in `vitest.config.ts`
- [ ] T042 Add CI workflow in `.github/workflows/ci.yml` that runs lint, tests with coverage gate, and Lighthouse CI on every PR with fail-on-threshold breach

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared domain and validation logic required by all user stories.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [ ] T005 Extend domain models for certifications and recommendations in `src/types.ts`
- [ ] T006 Define catalog schema and validation helpers in `src/data/catalog-schema.ts`
- [ ] T007 [P] Add contract tests for catalog validation rules in `tests/contract/catalog-validation.contract.test.ts`
- [ ] T008 [P] Add contract tests for recommendation engine behavior in `tests/contract/recommendation.contract.test.ts`
- [ ] T009 Implement curated catalog validation engine in `src/utils/catalogValidation.ts`
- [ ] T010 Implement dependency shortest-path utility in `src/utils/pathFinding.ts`
- [ ] T011 Implement deterministic recommendation engine in `src/utils/recommendation.ts`
- [ ] T012 Implement local browser persistence utility in `src/utils/persistence.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Przegląd mapy certyfikacji (Priority: P1) 🎯 MVP

**Goal**: Deliver poster-like interactive map with certification details.

**Independent Test**: Open app, view graph grouped by certification level, click any certification, and verify detail panel shows complete metadata without using recommendation flow.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add integration test for map level grouping in `tests/integration/map-levels.test.tsx`
- [ ] T014 [P] [US1] Add integration test for certification detail panel in `tests/integration/cert-details.test.tsx`
- [ ] T046 [P] [US1] Add desktop/mobile viewport integration tests in `tests/integration/app-responsive.test.tsx`

### Implementation for User Story 1

- [ ] T015 [P] [US1] Populate Azure certification catalog data in `src/data/certifications.ts`
- [ ] T016 [P] [US1] Populate Azure role profiles in `src/data/roleProfiles.ts`
- [ ] T017 [US1] Update graph construction for level lanes and dependencies in `src/graph/buildFlow.ts`
- [ ] T018 [US1] Implement interactive graph rendering component in `src/components/GraphView.tsx`
- [ ] T019 [US1] Implement certification detail panel component in `src/components/NodeDetailsPanel.tsx`
- [ ] T020 [US1] Integrate graph and detail panel in `src/App.tsx`
- [ ] T045 [US1] Implement responsive desktop/mobile layout behavior in `src/App.tsx` and `src/index.css`

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Inteligentna rekomendacja co dalej (Priority: P2)

**Goal**: Deliver shortest-path recommendation flow for selected role and owned certifications.

**Independent Test**: Select role and owned certifications, generate recommendation, and verify primary path is valid shortest path with optional alternatives and clear reasoning.

### Tests for User Story 2

- [ ] T021 [P] [US2] Add unit tests for shortest-path behavior in `tests/unit/shortest-path.test.ts`
- [ ] T022 [P] [US2] Add unit tests for recommendation ranking/tie-breakers in `tests/unit/recommendation.test.ts`
- [ ] T023 [P] [US2] Add integration test for end-to-end recommendation flow in `tests/integration/recommendation-flow.test.tsx`

### Implementation for User Story 2

- [ ] T024 [US2] Implement recommendation input/output panel in `src/components/RecommendationPanel.tsx`
- [ ] T025 [US2] Connect recommendation engine to UI interactions in `src/App.tsx`
- [ ] T026 [US2] Add recommendation reasoning and metadata formatting in `src/utils/recommendation.ts`
- [ ] T027 [US2] Display alternative valid paths in `src/components/RecommendationPanel.tsx`
- [ ] T028 [US2] Handle unreachable-target and invalid-input states with user-friendly actionable messages (next steps, retry/reset actions) in `src/components/RecommendationPanel.tsx`
- [ ] T051 [P] [US2] Add integration tests for actionable error messaging and recovery actions in `tests/integration/recommendation-errors.test.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Filtrowanie i porównywanie widoków (Priority: P3)

**Goal**: Deliver synchronized map/table filtering with persistent local state.

**Independent Test**: Apply role/level/provider/area filters, switch between map and table, confirm identical filtered set, refresh page, and confirm restored state.

### Tests for User Story 3

- [ ] T029 [P] [US3] Add integration test for map-table synchronization in `tests/integration/map-table-sync.test.tsx`
- [ ] T030 [P] [US3] Add integration test for filter reset behavior in `tests/integration/filter-reset.test.tsx`

### Implementation for User Story 3

- [ ] T031 [US3] Implement role/level/provider/area controls in `src/components/FilterPanel.tsx`
- [ ] T032 [US3] Implement table filtering logic in `src/components/TableView.tsx`
- [ ] T033 [US3] Synchronize shared filter state across views in `src/App.tsx`
- [ ] T034 [US3] Persist and restore user state in `src/utils/persistence.ts`
- [ ] T035 [US3] Initialize app state restoration on startup in `src/main.tsx`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, performance, accessibility, and data-governance checks.

- [ ] T036 [P] Add accessibility labels and keyboard support in `src/components/GraphView.tsx`
- [ ] T037 [P] Optimize rendering and memoized selectors in `src/App.tsx`
- [ ] T038 Add curated data review checklist report in `docs/data-review-2026-03-22.md`
- [ ] T039 [P] Add cycle/regression tests for catalog validation in `tests/unit/catalogValidation.test.ts`
- [ ] T040 Run quickstart validation and update execution notes in `specs/001-interactive-cert-map/quickstart.md`
- [ ] T043 [P] Configure Lighthouse CI thresholds (Performance >= 90) and document budget in `lighthouserc.json` and `README.md`
- [ ] T044 Add performance regression test for 100+ certifications in `tests/unit/performance-interactions.test.ts`
- [ ] T047 Add KPI validation procedure for SC-001 and SC-004 in `specs/001-interactive-cert-map/quickstart.md`
- [ ] T048 Document KPI validation results in `specs/001-interactive-cert-map/validation-report.md`
- [ ] T049 Add explicit loading states for async recommendation/data operations in `src/components/RecommendationPanel.tsx` and `src/App.tsx`
- [ ] T050 [P] Add integration test for loading-state visibility and transition in `tests/integration/loading-states.test.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 — blocks all stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2 and can reuse US1 UI shell.
- **Phase 5 (US3)**: Depends on Phase 2 and integrates with US1/US2 state.
- **Phase 6 (Polish)**: Depends on selected stories being complete.

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational.
- **US2 (P2)**: Independent after Foundational; integrates with shared catalog and recommendation utilities.
- **US3 (P3)**: Independent after Foundational; integrates with map/table and persistence.

### Within Each User Story

- Tests first and failing before implementation.
- Data/model updates before UI wiring.
- Core implementation before integration polish.

---

## Parallel Execution Examples

### User Story 1

```bash
Task: "T013 [US1] integration test in tests/integration/map-levels.test.tsx"
Task: "T014 [US1] integration test in tests/integration/cert-details.test.tsx"
Task: "T015 [US1] catalog data in src/data/certifications.ts"
Task: "T016 [US1] role profiles in src/data/roleProfiles.ts"
```

### User Story 2

```bash
Task: "T021 [US2] unit tests in tests/unit/shortest-path.test.ts"
Task: "T022 [US2] unit tests in tests/unit/recommendation.test.ts"
Task: "T023 [US2] integration test in tests/integration/recommendation-flow.test.tsx"
```

### User Story 3

```bash
Task: "T029 [US3] integration test in tests/integration/map-table-sync.test.tsx"
Task: "T030 [US3] integration test in tests/integration/filter-reset.test.tsx"
Task: "T031 [US3] filter controls in src/components/FilterPanel.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate map + detail flow independently.
4. Demo MVP baseline.

### Incremental Delivery

1. Ship US1 (interactive map baseline).
2. Add US2 (recommendation value layer).
3. Add US3 (advanced filtering and persistence).
4. Finish Phase 6 quality/performance/data governance checks.

### Parallel Team Strategy

1. One developer handles foundational recommendation/data utilities.
2. One developer handles map/detail UI (US1).
3. One developer handles recommendation panel and filter synchronization (US2/US3) after foundational completion.

---

## Notes

- `[P]` tasks target separate files and minimal coupling.
- User story labels maintain traceability from `spec.md` to implementation.
- All tasks include explicit file paths and are immediately executable by an LLM agent.
