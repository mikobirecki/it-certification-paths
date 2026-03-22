# Research: Interactive Certification Path Map

## Decision 1: Recommendation Strategy

- Decision: Use shortest valid path as the primary recommendation (minimum number of certification steps).
- Rationale: This is deterministic, transparent to users, and aligns with clarified MVP scope.
- Alternatives considered:
  - Weighted ranking by role fit and difficulty gradient (deferred to post-MVP).
  - Expert-authored static paths only (insufficient flexibility for all Azure roles).

## Decision 2: Data Source and Update Model

- Decision: Keep curated certification catalog in-repo with mandatory verification checklist before publishing updates.
- Rationale: Provides high trust, stable behavior, and easy review/versioning without introducing ingestion complexity.
- Alternatives considered:
  - Automatic sync from official feeds (high operational and parsing risk in MVP).
  - Semi-automated import pipeline (good future option, unnecessary for initial release).

## Decision 3: Persistence Model

- Decision: Persist user context locally in browser (selected role, selected certifications, active filters).
- Rationale: Improves continuity with minimal complexity and no account/auth requirements.
- Alternatives considered:
  - No persistence (poorer UX on refresh/revisit).
  - Cloud persistence with user accounts (out of MVP scope).

## Decision 4: Scope of Domain Coverage

- Decision: Azure-only provider in MVP, but include all Azure roles from the current certification catalog.
- Rationale: Keeps domain coherent while still delivering broad utility.
- Alternatives considered:
  - Multi-provider MVP (scope and data quality risk).
  - Small subset of roles (limits usefulness and recommendation breadth).

## Decision 5: Graph Interaction and Performance

- Decision: Keep poster-like graph as primary view and table as synchronized secondary view; optimize selectors and rendering for 100+ nodes.
- Rationale: Supports both discovery and detailed comparison while meeting responsiveness goals.
- Alternatives considered:
  - Table-only interface (lower visual understanding of dependencies).
  - Graph-only interface (weaker scanning/filtering for dense datasets).

## Decision 6: Validation Strategy for Curated Catalog

- Decision: Add contract-level validation for schema completeness and dependency integrity (no missing refs, no cycles in required dependencies).
- Rationale: Reduces risk of broken recommendations and graph rendering errors after manual data updates.
- Alternatives considered:
  - Visual/manual checks only (error-prone).
  - Runtime-only validation (defers failures to user-facing execution).

## Open Items Resolved from Technical Context

- Testing stack: Vitest + React Testing Library.
- Contracts format: Markdown interface contracts under `contracts/` for recommendation and catalog validation behavior.
- Non-functional handling: Explicitly tied to constitution gates and measurable targets in spec.
