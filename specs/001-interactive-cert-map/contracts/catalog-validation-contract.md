# Contract: Curated Catalog Validation

## Purpose
Define mandatory checks before accepting manual certification catalog updates.

## Input Artifacts

- Certification catalog dataset (certifications)
- Role profile dataset (roles)
- Dependency dataset (edges)

## Required Validation Checks

1. Schema Completeness
   - All required fields present for each certification.
   - Field types and enum values valid.

2. Identity Integrity
   - Unique `id` and `code` across certifications.
   - Unique `id` across roles and dependencies.

3. Referential Integrity
   - Every dependency endpoint references existing certifications.
   - Every role certification reference exists in catalog.

4. Graph Integrity
   - No self-loop dependencies.
   - No cycles in `required` dependency graph.

5. Scope Integrity
   - All records are provider `azure` for MVP.
   - Role list includes all currently tracked Azure roles in catalog.

6. Recommendation Readiness
   - Each role has at least one reachable path under dependency rules.
   - Difficulty and study-hour data exist for recommendation transparency.

## Output

Validation result object:
- `status`: `pass` | `fail`
- `errors`: array of blocking issues
- `warnings`: array of non-blocking issues
- `summary`: counts by check category

## Acceptance Rule

- Catalog update is publishable only if `status = pass` and `errors` is empty.
- Any failing update MUST be fixed before merge.
