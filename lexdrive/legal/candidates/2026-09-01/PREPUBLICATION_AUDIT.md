# Lex Drive — 2026-09-01 remote legal package pre-publication audit

Status: **CANDIDATE / DO NOT PUBLISH TO PRODUCTION YET**

- Bundle version: `2026.09.01-production.1`
- Minimum app build: `210`
- Minimum app version: `1.12.0`
- Effective from: `2026-09-01`
- Package kind: `full`
- Runtime format: `jsonEnvelopeV1`
- Source roots: `LegalCorpus/`, `OffenceCatalog/`, `EnforcementTariffs/`
- JSON files: `15`
- Deterministic package SHA-256: `4b9729e0ed78ab2506bc8d40bbe4fd36031f6a626c8bfbc077727e550446aae4`

## Confirmed legal checks
- 372/1990 Zb. from 2026-09-01: § 22(1)(i)(3) adds the >=10% threshold; § 22(2)(d)(3) is 800–1300 EUR + ban 6–36 months; § 22(3)(b)(3) is 500–1000 EUR; § 22(4) mandatory block rule is narrowed to h(1), h(2), l.
- 8/2009 Z. z. amendment 131/2026: § 40 inserts a new subsection 4 and renumbers the former subsections 4–14 to 5–15; Build 210 temporal identity migration covers published references used by Lex Drive.
- 9/2009 Z. z. from 2026-09-01 contains § 31c, § 31d and § 41h; Annex 9 is not treated as changed by 219/2026 in the scoped Build 210 audit.

## Confirmed remaining architecture blocker
`Section22SanctionCatalog.swift` still carries the current 2026-09-01 user-facing sanction matrix in executable Swift. The values are correct for this transition, but a future amendment of § 22 sanction ranges cannot be changed by a remote JSON package without another app build.

Therefore this candidate can be used to validate the remote pipeline, but the architecture must not yet be declared universally GitHub-only for future amendments.

## Signing boundary
Build 210 trusts key ID `lexdrive-production-2026-01`. The private signing key remains off-repository and must never be committed to GitHub.
