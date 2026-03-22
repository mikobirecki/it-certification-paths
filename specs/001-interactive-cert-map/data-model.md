# Data Model: Interactive Certification Path Map

## Entity: Certification

- Description: Atomic certification item displayed in map and table.
- Fields:
  - `id` (string, required, unique)
  - `code` (string, required, unique, e.g., AZ-104)
  - `name` (string, required)
  - `provider` (enum, required, MVP fixed to `azure`)
  - `level` (enum, required: `foundational` | `associate` | `expert` | `specialty`)
  - `area` (string, required, e.g., Security, AI, Data)
  - `targetRoles` (array<RoleId>, required, min 1)
  - `estimatedStudyHours` (number, required, > 0)
  - `difficulty` (integer, required, range 1..5)
  - `status` (enum, required: `active` | `retired`)
  - `lastVerifiedAt` (date string, required)

Validation rules:
- `id` and `code` must be globally unique.
- `provider` must be `azure` in MVP.
- `targetRoles` must reference existing RoleProfile records.
- `estimatedStudyHours` and `difficulty` required for recommendation transparency.

## Entity: CertificationDependency

- Description: Directed relation between certifications.
- Fields:
  - `id` (string, required, unique)
  - `fromCertificationId` (Certification.id, required)
  - `toCertificationId` (Certification.id, required)
  - `type` (enum, required: `required` | `recommended`)
  - `note` (string, optional)

Validation rules:
- Both referenced certifications must exist.
- Self-reference is forbidden (`from` != `to`).
- Duplicate edge (`from`, `to`, `type`) is forbidden.
- `required` subgraph must be acyclic.

## Entity: RoleProfile

- Description: Canonical Azure role used as recommendation target.
- Fields:
  - `id` (string, required, unique)
  - `name` (string, required, unique)
  - `description` (string, optional)
  - `primaryCertificationIds` (array<Certification.id>, required)
  - `secondaryCertificationIds` (array<Certification.id>, optional)

Validation rules:
- At least one primary certification is required.
- Referenced certification IDs must exist.

## Entity: RecommendationRequest

- Description: Input payload for recommendation generation.
- Fields:
  - `targetRoleId` (RoleProfile.id, required)
  - `ownedCertificationIds` (array<Certification.id>, required, can be empty)
  - `experienceLevel` (enum, optional: `beginner` | `intermediate` | `advanced`)

Validation rules:
- Unknown certifications in `ownedCertificationIds` are rejected.
- `targetRoleId` must exist.

## Entity: RecommendationPath

- Description: Recommendation output for selected role and user state.
- Fields:
  - `targetRoleId` (RoleProfile.id, required)
  - `primaryPath` (array<PathStep>, required)
  - `alternativePaths` (array<array<PathStep>>, optional)
  - `generatedAt` (date string, required)

`PathStep` fields:
- `certificationId` (Certification.id, required)
- `order` (integer, required, starts at 1)
- `reason` (string, required)
- `estimatedStudyHours` (number, required)

Validation rules:
- `primaryPath` must satisfy all `required` dependencies.
- `primaryPath` must be minimal by step count among valid paths.
- `alternativePaths` must be valid and different from primary.

## Entity: UserLocalState

- Description: Locally persisted browser state.
- Fields:
  - `targetRoleId` (RoleProfile.id, optional)
  - `ownedCertificationIds` (array<Certification.id>, default empty)
  - `activeFilters` (object with role/level/area/status values)
  - `viewMode` (enum: `graph` | `table`)
  - `savedAt` (date string)

Validation rules:
- Invalid or stale values are ignored with fallback to defaults.

## Relationships

- RoleProfile 1..* -> Certification (role includes many certifications)
- Certification 1..* -> CertificationDependency (as source)
- RecommendationRequest -> RoleProfile + Certification
- RecommendationPath -> Certification (ordered steps)
- UserLocalState mirrors current RecommendationRequest + UI filter context

## State Transitions

- Certification status: `active` -> `retired` (no reverse in MVP).
- User view mode: `graph` <-> `table`.
- Recommendation lifecycle: `requested` -> `computed` -> `displayed`.
