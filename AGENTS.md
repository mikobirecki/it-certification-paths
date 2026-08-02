# certPaths — Agent Context

## Project overview

certPaths is an interactive IT-certification map. The long-term goal is an **Azure certification-poster-like experience** that shows certification paths, dependencies, and personalized recommendations about **what to take and when**.

## Core goals

- Keep certification catalog data accurate and up to date.
- Visualize certification paths and prerequisite relationships.
- Provide recommendation/dependency guidance tailored to the user.
- Use Spec-Kit workflows for planning and implementation.

## Tech stack & conventions

- **Frontend/Build:** React, TypeScript, Vite.
- **Dependencies:** ReactFlow (`@xyflow/react`) for the certification graph.
- **CI:** Azure Static Web Apps GitHub Actions workflow.
- **Domain model:** `src/types.ts`.
- **Catalog data:** `src/data/certifications.json`.
- **Data import:** `src/utils/parseData.ts`.
- **Graph builder:** `src/graph/buildFlow.ts`.
- **UI components:** `src/components/` (`App.tsx`, `CertNode.tsx`, `CertQuiz.tsx`, `TableView.tsx`, etc.).
- **Microsoft exam sync helper:** `scripts/fetch-ms-exams.ts`.

## Planning workflow

Use the Spec-Kit workflow defined in `.windsurf/skills/spec-kit-workflow.md` for any substantial feature. Typical artifacts:

- `spec.md`
- `plan.md`
- `research.md`
- `data-model.md`
- `contracts/` (e.g., recommendation, catalog-validation)
- `tasks.md` with executable tasks organized by phases and user stories

## Feature branches

Name feature branches by index and short slug, e.g. `001-interactive-cert-map`.
