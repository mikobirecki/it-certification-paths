# Contract: Recommendation Engine

## Purpose
Define deterministic behavior for generating certification recommendations.

## Input

- `targetRoleId`: string (required)
- `ownedCertificationIds`: string[] (required, may be empty)
- `experienceLevel`: `beginner` | `intermediate` | `advanced` (optional)

## Output

- `primaryPath`: ordered list of certification steps
- `alternativePaths`: optional list of additional valid paths
- `meta`:
  - `isReachable`: boolean
  - `missingRequiredCount`: number
  - `generatedAt`: ISO timestamp

## Behavioral Rules

1. Primary path MUST be a valid path to the selected role certifications.
2. Validity requires satisfying all `required` dependencies.
3. Primary path MUST be shortest by step count among valid candidates.
4. Already owned certifications MUST be excluded from new steps.
5. If multiple shortest paths exist, deterministic tie-breaker MUST apply:
   - lower average difficulty first,
   - then lower total estimated study hours,
   - then lexical sort by certification code.
6. Alternative paths MAY be returned if they are valid and distinct.
7. If target is unreachable with current catalog, response MUST include explanation.

## Error Conditions

- Unknown `targetRoleId` -> validation error
- Unknown certification in `ownedCertificationIds` -> validation error
- Corrupt dependency graph (cycle in required edges) -> contract failure

## Testable Contract Assertions

- Same input produces same output ordering.
- Output never contains duplicate certification IDs.
- Output never includes already owned certifications as required new steps.
- Every step in output references existing active certification records.
