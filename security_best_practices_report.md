# Security Best Practices Report

## Executive Summary

I reviewed the `memory-hub` codebase (Next.js + React + Supabase) for common web security issues and found **4 findings**:

- **1 Critical**: vulnerable `next` version with published advisories.
- **1 Medium**: RLS policy gap in `notes` update path (cross-tenant reference integrity risk).
- **2 Low**: missing baseline security headers/CSP in app code, and host-derived redirect origin in share-target route (deployment-dependent risk).

No hardcoded secrets were found in tracked files, and `.env.local` is ignored by git.

## Critical Findings

### [SBP-001] Vulnerable Next.js version in production dependency
- Rule ID: `NEXT-SUPPLY-001`
- Severity: **Critical**
- Location: `package.json:12`
- Evidence:
  - `"next": "14.2.4"`
  - `npm audit --omit=dev` reports multiple advisories for this range, including critical advisory `GHSA-f82v-jwr5-mffw`.
- Impact:
  - The app may be exposed to known Next.js vulnerabilities (authorization bypass, cache poisoning, DoS classes), depending on runtime/deployment feature usage.
- Fix:
  - Upgrade to at least `next@14.2.35` (audit-proposed patched version) and rebuild lockfile.
- Mitigation:
  - Add dependency security checks in CI (`npm audit`, Dependabot/GitHub security alerts).
- False positive notes:
  - Some advisories are feature-dependent, but the dependency is within vulnerable ranges and should be patched regardless.

## Medium Findings

### [SBP-002] Notes RLS update policy does not enforce folder ownership invariant
- Rule ID: `DB-RLS-001`
- Severity: **Medium**
- Location: `supabase/migrations/001_init.sql:79`
- Evidence:
  - Update policy for notes checks only `auth.uid() = user_id`:
    - `using (auth.uid() = user_id)`
    - `with check (auth.uid() = user_id)`
  - Insert policy correctly enforces folder ownership via `exists (...)` check (`supabase/migrations/001_init.sql:66`).
- Impact:
  - An authenticated user who learns another tenant's `folders.id` can repoint their own note's `folder_id` to that foreign folder. This is a cross-tenant data integrity issue and can create side effects (for example, cascade deletes if that folder is removed).
- Fix:
  - Strengthen the `notes_update_own` `with check` to also require folder ownership, mirroring insert policy logic.
- Mitigation:
  - Add a DB constraint or trigger to enforce `notes.user_id` matches `folders.user_id` for all writes.
- False positive notes:
  - Exploitability depends on obtaining another folder UUID, but policy-level tenant boundaries should not depend on identifier secrecy.

## Low Findings

### [SBP-003] Missing baseline security headers/CSP in app configuration
- Rule ID: `NEXT-HEADERS-001`
- Severity: **Low**
- Location: `next.config.js:2`
- Evidence:
  - `next.config.js` only sets `compiler.styledComponents` and does not define security headers.
  - No CSP configuration is visible in app code (`app/layout.tsx:60`).
- Impact:
  - Reduces defense-in-depth against XSS/clickjacking/content-type sniffing risks.
- Fix:
  - Add baseline headers (`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` or CSP `frame-ancestors`) via Next headers config or edge platform.
- Mitigation:
  - Start with CSP report-only mode and iterate.
- False positive notes:
  - These may be set at CDN/reverse-proxy level; verify runtime response headers.

### [SBP-004] Share-target redirect uses request-derived origin
- Rule ID: `NEXT-HOST-001`
- Severity: **Low**
- Location: `app/share-target/route.ts:11`, `app/share-target/route.ts:25`
- Evidence:
  - Redirect URL is built with `new URL(APP_HOME_PATH, request.url)`.
- Impact:
  - In self-hosted/misconfigured proxy setups that trust attacker-controlled `Host`/forwarded headers, this can enable host-header based redirect poisoning patterns.
- Fix:
  - Build absolute redirects from a canonical allowlisted origin (for example `APP_ORIGIN` env var), or validate trusted host before constructing redirect URLs.
- Mitigation:
  - Enforce strict host validation at reverse proxy / platform ingress.
- False positive notes:
  - Many managed platforms normalize/validate host headers, reducing practical risk.

## Checked and Not Found

- No `dangerouslySetInnerHTML`, `eval`, `new Function`, `child_process`, or raw SQL usage in app code.
- No committed `.env.local`; `.gitignore` excludes `.env.local`.

## Recommended Remediation Order

1. Upgrade `next` dependency and regenerate lockfile.
2. Patch `notes_update_own` RLS policy and deploy migration.
3. Add baseline security headers/CSP and validate in production responses.
4. Harden share-target redirect origin handling for self-hosted scenarios.
