# Certification catalog update workflow

Use this workflow when updating `src/data/certifications.json` with new, retired, or changed vendor certifications.

## When to use

- Monthly/quarterly certification data refreshes.
- Vendor announcements of new exams, retirements, or content refreshes.
- Fixing schema/role mismatches discovered during validation.

## Steps

1. **Read current state**
   - Inspect `src/data/certifications.json` and `src/types.ts`.
   - Note existing vendors, levels, `RoleTrack` values, and invalid role usage.

2. **Research vendor changes**
   - Search official sources for: AWS, Microsoft, GCP, HashiCorp, Red Hat, Kubernetes/CNCF, GitHub.
   - Look for:
     - Exam retirements and replacement exams.
     - New certifications and beta availability.
     - Content/guide updates (refresh `lastUpdate`).
     - Pricing or validity-period changes.

3. **Propose changes**
   - Mark retired certs with `retiring: true` and `retirementDate`.
   - Add new certs at the end of the `certs` array with all required fields and valid `roles`.
   - Add or update `recommended`/`required` links in the `links` array.
   - Update `lastUpdate` for refreshed exams.
   - Add `renewalAvailable`/`renewalPrice` where applicable.

4. **Validate**
   - Ensure every value in `roles` exists in `RoleTrack` from `src/types.ts`.
   - Ensure every `link.sourceId` and `link.targetId` points to an existing cert.
   - Run:
     ```bash
     npx tsc --noEmit
     npm run build
     ```

5. **Update UI timestamp**
   - Set the "Last updated" date in `src/components/AboutSection.tsx`.

6. **Commit and deploy**
   - Prefer a pull request rather than pushing directly to `main`.
   - After merge, monitor `Azure Static Web Apps CI/CD (PROD)` in GitHub Actions.

## What to avoid

- Do not bypass branch protection by force-pushing to `main`.
- Do not add new `RoleTrack` values without updating `src/types.ts`.
- Do not leave link targets pointing to non-existent cert IDs.
