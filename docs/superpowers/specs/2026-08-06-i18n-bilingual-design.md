# Bilingual (VI/EN) Support — Design Spec

**Date:** 2026-08-06
**Status:** Implemented (all 3 phases)

## Problem

The app presents an EN/VI language switcher but has no working bilingual system.

Current state:

- **index.html** — switcher exists, but `translations` covers only ~18 keys and only 5 elements carry `data-i18n`. No persistence: `window.onload` hard-resets to `setLanguage('en')`, discarding any choice. `setLanguage` overwrites the button `class` with stale Tailwind classes that no longer match the current `ios-segmented` CSS, visually breaking the control on every click.
- **voucher.html** — separate `translations` object and separate `setLanguage`. Persists to `localStorage['tlc_language']`, defaults to `vi`, but only 4 elements (the mobile tab labels) carry `data-i18n`.
- **All 9 other pages** — no switcher, no translations, hardcoded Vietnamese.
- **Backend (.gs)** — no i18n. Error messages, email templates, and status strings are Vietnamese literals.
- `<html lang>` is inconsistent: `en` on 2 files, `vi` on 10, absent on 1.

Net effect: the app is Vietnamese-only with a non-functional English toggle.

## Goals

Full bilingual coverage (Option B) across all 11 HTML pages plus backend emails and error messages, delivered in reviewable phases.

## Non-Goals

- Migrating status values or sheet column names to language-neutral codes.
- Any change to Google Sheet data shape or existing rows.
- Adding a build step, bundler, or i18n framework.
- Translating code comments or log output.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Page scope | All 11 HTML pages | Complete coverage |
| Status labels | Display-only mapping | Vietnamese status strings are used in live comparisons; translating them would break approval logic |
| Default language | Detect from browser, fall back to `vi` | `navigator.language` starting with `vi` → `vi`, else `en` |
| Switchers | Only on the 6 nav-bearing pages | The 5 nav-less pages are one-shot screens; auto-detect only, no invented header UI |
| Backend scope | Emails + error messages only | Status values and sheet names stay untouched — no migration risk |
| Sequencing | Phased: infra → pages → backend | Each phase ships working and independently reviewable |
| Translation source | Claude translates; glossary for ambiguous domain terms | Standard VN-accounting terminology |

## Architecture

One new root file, `i18n.js`, loaded by all 11 pages via `<script src="i18n.js"></script>` before each page's inline script. This mirrors the existing `tlcg_companies_embed.js` pattern — no build step, works on both Netlify and Vercel (both serve the flat root).

### Public API

| Function | Purpose |
|---|---|
| `TLCI18n.getLang()` | Current language; resolves default on first call |
| `TLCI18n.setLanguage(lang)` | Set, persist, re-render, sync switcher buttons |
| `TLCI18n.t(key, fallback)` | Key lookup; returns fallback or the key if missing |
| `TLCI18n.tStatus(vnStatus)` | Display-only status mapping |
| `TLCI18n.apply(root)` | Walk `data-i18n*` attributes and paint text |
| `TLCI18n.onChange(fn)` | Register a callback for re-render after language change |

`window.setLanguage` is exported as an alias because existing inline `onclick="setLanguage('en')"` handlers call it directly. Local `setLanguage` and `translations` definitions in index.html and voucher.html are deleted so exactly one implementation exists.

### Language resolution

`localStorage['tlc_language']` → `navigator.language` (`vi*` → `vi`, else `en`) → `vi`.

Reusing the existing `tlc_language` key preserves any choice already made in voucher.html.

### Translation attributes

- `data-i18n` → `textContent`
- `data-i18n-placeholder` → `placeholder`
- `data-i18n-title` → `title`
- `data-i18n-aria` → `aria-label`
- `data-i18n-html` → `innerHTML` (only where markup is genuinely required)

Default is `textContent`, not `innerHTML` — index.html currently uses `innerHTML` for plain text, a needless injection surface.

Every language change also sets `document.documentElement.lang`.

## Critical Risk: Comparison Strings

The highest-danger failure mode is translating a Vietnamese string used in a **comparison** rather than for display.

Known comparison sites that MUST NOT change:

- `voucher.html:7631`, `voucher.html:6451-6453` — status filter logic
- `TLCG_P2P_BACKEND.gs` — `p.status !== 'Rejected' && p.status !== 'Từ chối'`
- `amRecord.status !== 'Đã nghiệm thu'`
- `SUPPLIERS_SHEET_NAME: 'Nhà cung cấp'` and all sheet/column name constants

Mitigation: `tStatus()` is applied **only** at DOM-render sites. Every status edit is verified as a render, not a comparison, before being made. Unknown status returns unchanged, so nothing can silently blank out.

## Phases

### Phase 1 — Infrastructure

Build `i18n.js`; wire all 11 pages; add `ios-segmented` CSS + switcher to the 4 nav pages that lack it (contract, acceptance_minutes, payment_request, purchase_request); fix the index `className` bug via `classList.toggle('active', ...)`; remove the `setLanguage('en')` hard-reset; unify storage key; fix all `<html lang>` attributes.

The index login-sheet switcher has no `id` attributes (unlike the toolbar one), so active state is driven by a `data-lang` attribute selector, keeping both switchers in sync.

### Phase 2 — Page bodies

Largest first, one commit per page: voucher (828 VN lines) → purchase_request (477) → payment_request (196) → acceptance_minutes (185) → index (120) → approve/reject set → contract.

### Phase 3 — Backend

Emails and error messages accept a `lang` parameter passed from the frontend. Status comparisons, sheet names, and column headers are untouched.

## Error Handling

- Missing key → returns fallback or the key; never `undefined`, never blank.
- Missing `translations[lang]` → falls back to the `vi` table.
- `localStorage` wrapped in `try/catch` (Safari private mode throws on write); failure degrades to in-memory only.
- `i18n.js` failing to load → pages render their static Vietnamese HTML unchanged, since every tagged element keeps its Vietnamese text inline as natural fallback.

## Testing

No test framework exists in this repo, so verification is a manual per-page checklist:

1. Load fresh with no localStorage → correct detected language.
2. Switch to EN → chrome flips; segmented control still renders correctly (regression guard for the className bug).
3. Reload → choice persisted.
4. **Voucher status filters return correct rows in both languages** — the single most important regression check.
5. Backend: approval/rejection flows still succeed (status comparisons intact).

## Rollback

Each phase is a separate commit. Reverting any phase leaves the app in a working state, because untranslated pages simply render their inline Vietnamese.


---

## Implementation Notes (as built)

Two decisions changed during implementation, both for correctness:

**1. Emails are not localised by the caller's language.** The spec said emails
would take a `lang` param from the frontend. In implementation this proved
wrong: emails go to *approvers*, not the submitter, and the backend has no
per-recipient language preference. Honouring the submitter's `lang` would send
a Vietnamese approver an English email — worse than the status quo. Email
templates therefore stay Vietnamese; `msgBilingual_()` is available where both
languages are wanted on one line. Only API response messages follow `lang`.

**2. `lang` is stamped centrally, not at each call site.** Rather than editing
~25 fetch calls, `i18n.js` wraps `fetch` once and adds `lang` to recognised
action payloads, covering both JSON bodies and the FormData `data` field used
by uploads. It installs at script load rather than DOMContentLoaded so pre-DOM
requests carry it, and passes through untouched anything it does not recognise
(non-JSON, malformed JSON, arrays, payloads without an action, existing `lang`).

### Final verification

| Check | Result |
|---|---|
| Inline JS parses, all 11 pages | pass |
| `i18n.js` + 3 backends parse | pass |
| Every `data-i18n*` / `t()` key resolves (501 keys) | 0 missing |
| EN/VI page tables symmetric | 0 asymmetric |
| Comparison strings vs original `43c1476` (16 files) | 0 changed |
| `value=` attributes vs original (11 pages) | 0 changed |
| Sheet names + status writes vs original (3 backends) | 0 changed |
| `data-reason` values in reject_voucher | 0 changed |
| End-to-end: detect → switch → persist → reload | pass |

### Coverage

| Page | Keys |
|---|---|
| purchase_request | 135 |
| voucher | 93 |
| payment_request | 77 |
| acceptance_minutes | 68 |
| index | 47 |
| contract | 23 |
| approve_payment_request | 17 |
| reject_payment_request | 14 |
| reject_voucher | 12 |
| approve_voucher | 10 |
| create_password_hash | 5 |

Backend message sites converted: 14 (P2P), 33 (CASH), 7 (CORE).

### Known limitation

Translation covers page chrome, form labels, table headers, buttons, modals,
status display, and API error messages. Dynamic strings built inside JS
handlers (toast text composed at call sites, some validation messages) remain
Vietnamese. They surface in EN mode as Vietnamese text and can be migrated
incrementally with the same `TLCI18n.t()` call — the infrastructure is in place.
