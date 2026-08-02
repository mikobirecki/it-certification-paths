# Spec-Kit workflow for certPaths

## When to use

Use this workflow for any substantial certPaths feature (e.g., new certification map experiences, recommendation/dependency guidance, catalog changes).

## Required artifacts

Create the following in a dedicated feature branch:

1. `spec.md` — Feature specification.
2. `plan.md` — Implementation plan.
3. `research.md` — Research notes and decisions.
4. `data-model.md` — Data-model documentation.
5. `contracts/` — Contract definitions (e.g., recommendation contract, catalog-validation contract).
6. `tasks.md` — Executable tasks organized by phases and user stories.

## Task organization

- Break work into phases (e.g., setup, foundation, UI, integration, validation).
- Organize tasks by user stories when applicable.
- Aim for roughly 40 executable, checkable tasks for a medium-sized feature.

## Branch naming

Use an indexed short slug: `001-interactive-cert-map`.

## Example flow

1. Draft `spec.md` and `research.md`.
2. Agree on `data-model.md` and `contracts/`.
3. Generate `plan.md` and `tasks.md`.
4. Implement tasks phase by phase.
5. Run contract tests (`tests/contract/`) and the Lighthouse CI gate before merging.
