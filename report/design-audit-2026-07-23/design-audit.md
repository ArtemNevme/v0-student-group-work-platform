# StudySinc — Design Audit Report

**Date:** 2026-07-23  
**Production URL:** https://studysinc.click  
**Git commit:** `8193bab` (current `master`)  
**Design contract:** `DESIGN.md` («Тихий инструмент с характером»)  
**Audit tools:** Vercel `agent-browser` (public pages) + Playwright smoke (authenticated pages)

---

## 1. Executive Summary

The product is functionally live and the security/RLS migration (`042`) has been applied successfully. However, the UI still reads as generic AI-generated/shadcn-template rather than the intended calm-professional tool. The single biggest blocker is that **the design system tokens are not actually driving the components**: hardcoded blues, purples, yellows, reds, and gradients are still present across almost every screen. The dark theme is also effectively broken on most pages because components bypass the CSS variables.

**Verdict:** we need a token-level pass, not a "new landing page".

---

## 2. Methodology

- **Vercel `agent-browser`** was used to capture public pages in both light and dark browser color schemes, plus desktop and mobile viewports.
  - Commands used:
    ```bash
    # Desktop public pages
    agent-browser --screenshot-dir report/design-audit-2026-07-23/more-screenshots set viewport 1280 720
    agent-browser open https://studysinc.click
    agent-browser screenshot --full landing-desktop.png
    agent-browser open https://studysinc.click/auth/login
    agent-browser screenshot --full login-desktop.png
    agent-browser open https://studysinc.click/auth/signup
    agent-browser screenshot --full signup-desktop.png
    agent-browser open https://studysinc.click/terms
    agent-browser screenshot --full terms-desktop.png
    agent-browser open https://studysinc.click/privacy
    agent-browser screenshot --full privacy-desktop.png

    # Mobile public pages
    agent-browser set viewport 390 844
    agent-browser open https://studysinc.click
    agent-browser screenshot --full landing-mobile.png
    agent-browser open https://studysinc.click/auth/login
    agent-browser screenshot --full login-mobile.png
    agent-browser open https://studysinc.click/auth/signup
    agent-browser screenshot --full signup-mobile.png

    # Auth smoke test
    agent-browser open https://studysinc.click/auth/login
    agent-browser fill 'input[type="email"]' 'maximtaz2@gmail.com'
    agent-browser fill 'input[type="password"]' 'App101112!'
    agent-browser click 'button[type="submit"]'
    agent-browser screenshot --full login-result.png
    ```
- **Authenticated pages** (dashboard, groups, subjects, calendar, notifications) were captured via Playwright after local login.
- All screenshots were compared against `DESIGN.md` rules: single amber accent, no gradients, no rainbow accents, no people illustrations, no hover-lift, paper-like neutrals, dark theme as first-class citizen, mono numbers for gamification.

---

## 3. Screenshots Captured

### Initial audit set

| Page | Light | Dark | Notes |
|------|-------|------|-------|
| Landing | `landing-light.png` | `landing-dark.png` | Dark capture identical to light — site does not respect `prefers-color-scheme` and has no public toggle. |
| Login | `login-light.png` | `login-dark.png` | Same problem. |
| Dashboard | `dashboard-light.png` | `dashboard-dark.png` | Authenticated; dark toggle exists but produces almost no change because of hardcoded colors. |
| Groups | `groups-light.png` | — | Authenticated. |
| Subjects | `subjects-light.png` | — | Authenticated. |
| Calendar | `calendar-light.png` | — | Authenticated. |
| Notifications | `notifications-light.png` | — | Authenticated; layout appears broken. |

### Extended public-page set (agent-browser)

| Page | Desktop | Mobile | Notes |
|------|---------|--------|-------|
| Landing | `more-screenshots/landing-desktop.png` | `more-screenshots/landing-mobile.png` | Same violations as initial capture. |
| Login | `more-screenshots/login-desktop.png` | `more-screenshots/login-mobile.png` | Mobile form is still blue/white. |
| Signup | `more-screenshots/signup-desktop.png` | `more-screenshots/signup-mobile.png` | **Page is empty/broken** (screenshots only ~6 KB). |
| Terms | `more-screenshots/terms-desktop.png` | — | Plain text page; no major design issues. |
| Privacy | `more-screenshots/privacy-desktop.png` | — | Plain text page; no major design issues. |
| Login result | `more-screenshots/login-result.png` | — | Email login failed; stayed on login page. |

---

## 4. Findings by Page

### 4.1 Landing Page

**Violations:**
- **Gradient hero** — blue→purple gradient background (`DESIGN.md` §7: gradients forbidden).
- **Gradient logo** — `StudySinc` wordmark is gradient-colored.
- **Primary CTAs are blue** — `Get Started` and `Start Your Free Project` should be amber `--accent` with `--on-accent` text.
- **Rainbow icons in "How It Works"** — purple, blue, orange, green circles instead of monochrome/amber.
- **People illustration** in the hero mockup — `DESIGN.md` forbids illustrations of people/robots/hands.
- **Blue CTA footer** — large gradient block at the bottom.
- **Feature cards** use blue/purple/green/orange icon backgrounds (rainbow accents).
- Testimonials section has colored avatar initials (generic).
- Mobile version preserves all the same violations.

**Required changes:**
- Replace hero with `--bg` surface + subtle `--surface` card or plain layout.
- Make logo and all primary CTAs amber (`--accent` / `--on-accent`).
- Convert all feature icons to monochrome (`--fg` on `--surface-2`) or a single amber icon set.
- Remove illustration; replace with a calm product screenshot, abstract pattern, or text-only composition.
- Footer CTA becomes a plain `--surface` card with amber primary button.

### 4.2 Login / Auth Pages

**Violations:**
- **Background is light blue** (`bg-blue-50`/`slate-50`-style), not the paper `--bg` from `globals.css`.
- **Primary `Sign in` button is blue** — should be amber.
- **Link `Sign up` is blue** — should be `--accent-fg` or `--fg` with underline.
- Dark-mode capture is **identical** to light mode — no dark theme on auth at all.
- Mobile version identical issues.

**Additional issue:** `/auth/signup` renders an empty/broken page (only ~6 KB screenshots). This blocks new user registration.

**Auth smoke test:** email/password login with provided credentials stayed on the login page without redirect, confirming login is currently failing via email.

**Required changes:**
- Use `bg-background` (`--bg`) and `text-foreground` (`--fg`).
- Primary button → `bg-primary text-primary-foreground` (mapped to amber).
- Add `dark` class support to the auth layout so the page flips when the system requests it.
- Fix or implement `/auth/signup`.
- Investigate email login failure.

### 4.3 Dashboard

**Violations:**
- **Hero banner** — blue→purple gradient with white text; `DESIGN.md` forbids gradients and any background that is not `--surface`/`--bg`.
- **Gamification chips** (`12`, `7`, `2450 XP`) sit on a translucent gradient pill; should be amber soft badges (`--accent-soft` / `--accent-fg`) with `.font-num`.
- **`Connect Google Classroom` card** — blue icon + blue background; should be neutral surface with amber or neutral icon.
- **Priority task cards** — yellow background, red `Overdue` badge; should be `--surface` cards with neutral/amber deadline status.
- **Calendar widget** — selected day is blue (`--primary` still points to blue in some components, not amber).
- **Blue FAB `+`** — should be amber `--accent`.
- **`View All` link** — blue; should be `--accent-fg` or `--muted`.
- **Subjects empty state** — blue `Connect Google Classroom` button; should be amber.
- **Dark mode does not change** the hero, cards, or buttons.

**Required changes:**
- Redesign hero without gradient; use `--surface` card + amber stat badges (`.font-num`).
- Remove colored backgrounds from task cards; use neutral cards + amber/neutral deadline text.
- Recolor Google Classroom card, FAB, and links to amber/neutral.
- Fix calendar widget selection color.

### 4.4 Groups

**Violations:**
- **Blue `Create Team` button** — should be amber.
- **Group avatar tile is blue** — should be neutral `--surface-2` with `--fg` initials, or a subtle amber if this is the user's own group.
- **Crown icon** — yellow emoji-like icon; should be monochrome or removed (leader is indicated by `#1` position or a subtle badge).

### 4.5 Subjects

**Violations:**
- **Empty-state icon is blue** on a blue-tinted circle — should be `--accent-fg` or neutral.
- **Blue `Connect Google Classroom` button** — should be amber.
- **Blue FAB `+`** — should be amber.

### 4.6 Calendar

**Violations:**
- **Event chips are blue** — should be neutral `--surface-2` with `--fg` text, or amber for the user's own events.
- **Category legend is a rainbow** — Project/Homework/Exam/Presentation/Lab/Other each has a dedicated bright color. This is the strongest violation of the one-accent rule.
- **Selected day** — blue border/background; should be amber.

**Required changes:**
- Calendar categories should be differentiated by icon/label, not color. If a single status marker is needed, use one amber accent for "my events" and neutral for the rest.
- Selected day uses `--accent`/`--accent-fg`.
- Event chips use `--surface-2` background + `--fg` text.

### 4.7 Notifications

**Violations:**
- **Page has no layout/header** — the screenshot shows only a raw card with `Notifications` heading, no navigation shell. This is a layout bug, not a design-token bug.
- Empty state is plain but acceptable; it needs the app layout wrapper (header + sidebar if any).

### 4.8 Terms / Privacy

- Plain text pages; no major design-system violations.
- Could be improved with better typography and narrower line measure, but not critical for the MVP redesign.

---

## 5. Design-System Violations Summary

| # | Violation | Severity | Occurrence count |
|---|-----------|----------|------------------|
| 1 | Blue/purple primary buttons instead of amber | **Critical** | 10+ |
| 2 | Gradient backgrounds (hero, logo, CTA) | **Critical** | 4+ |
| 3 | Rainbow accent icons (features, categories) | **Critical** | 6+ |
| 4 | Dark theme is broken / ignored | **Critical** | 2 public pages + dashboard |
| 5 | Backgrounds are hardcoded light-blue instead of `--bg` | **High** | login, landing |
| 6 | Task cards with colored backgrounds | **High** | dashboard, tasks list |
| 7 | Calendar rainbow category legend | **High** | calendar page |
| 8 | People illustration on landing | **Medium** | landing hero |
| 9 | Yellow crown / emoji-style icon | **Medium** | groups card |
| 10 | Notifications page lacks app layout | **Medium** | notifications page |
| 11 | Gamification numbers not consistently `.font-num` | **Low** | dashboard hero |
| 12 | `/auth/signup` page is broken/empty | **Critical** | auth flow |
| 13 | Email login currently fails | **Critical** | auth flow |

---

## 6. Root Cause

The `globals.css` tokens exist, but many components still use Tailwind utility classes with hardcoded colors (`bg-blue-600`, `bg-indigo-600`, `text-blue-600`, `bg-gradient-to-r`, `bg-yellow-50`, `bg-red-50`, `bg-green-50`, etc.) or shadcn defaults that were not remapped to the StudySinc palette. The `Button` component likely has a hardcoded primary variant or the shadcn variable mapping is incomplete.

Also, `next-themes` is configured, but some top-level layouts (auth, landing) do not apply `dark:` class properly or use explicit `bg-*` utilities that override the CSS variables.

Auth flow is currently broken: Google OAuth returns `redirect_uri_mismatch` (per user screenshot), and email login with the provided test account does not redirect, so new registrations and non-Google logins are blocked.

---

## 7. Recommended Action Plan

### Phase 0 — Unblock auth (critical, before any UI work)
- Fix `/auth/signup` empty page.
- Fix email login or document the correct credentials/flow.
- Fix Google OAuth `redirect_uri_mismatch` in Vercel/Google Cloud Console.

### Phase 1 — Foundation (1–2 days)
- Fix `components/ui/button.tsx` so `variant="default"` uses `bg-primary text-primary-foreground` (which maps to amber via `globals.css`).
- Fix `components/ui/badge.tsx` and remove any hardcoded color variants.
- Verify `globals.css` shadcn mapping: `--primary` → `--accent`, `--primary-foreground` → `--on-accent`, `--destructive` → `--danger`.
- Audit and remove any `bg-gradient-*`, `from-*`, `to-*` classes from the codebase.
- Ensure every top-level page wrapper uses `bg-background text-foreground` and respects `.dark`.

### Phase 2 — Dashboard (2–3 days)
- Redesign hero without gradient; use `--surface` card + amber stat badges (`.font-num`).
- Remove colored backgrounds from task cards; use neutral cards + amber/neutral deadline text.
- Recolor Google Classroom card, FAB, and links to amber/neutral.
- Fix calendar widget selection color.

### Phase 3 — Landing (2 days)
- Replace hero with plain paper layout + amber CTA.
- Remove people illustration.
- Convert feature icons to monochrome/amber.
- Remove gradient CTA footer.

### Phase 4 — Groups / Subjects / Calendar / Notifications (2–3 days)
- Recolor group cards, avatars, create buttons.
- Fix subject empty-state colors and FAB.
- Recalendar calendar events and legend to one-accent system.
- Fix notifications layout wrapper.

### Phase 5 — Verification
- Run `npm run lint && tsc --noEmit && npm run build`.
- Capture light + dark screenshots of every page with Vercel `agent-browser` (or Playwright) and verify no hardcoded colors remain.
- Deploy and re-audit.

---

## 8. Notes on `agent-browser` Usage

`agent-browser` successfully captured full-page screenshots of public pages at multiple viewports. One limitation discovered: the site does **not** respond to the browser's `prefers-color-scheme` preference on public pages, so dark-mode screenshots were identical to light-mode screenshots. This is itself a bug and confirms that the public pages do not respect the design contract's dark-theme requirement. For authenticated pages, the in-app theme toggle exists but the dark result is also broken because components bypass the tokens.

The auth smoke test failed: email login with the provided credentials stayed on the login page, and `/auth/signup` renders an empty page. These block any authenticated screenshot automation until fixed.

---

## 9. Appendix: Useful Commands for Re-audit

```bash
# Public pages
agent-browser open https://studysinc.click && agent-browser screenshot
agent-browser open https://studysinc.click/auth/login && agent-browser screenshot
agent-browser open https://studysinc.click/auth/signup && agent-browser screenshot
agent-browser open https://studysinc.click/terms && agent-browser screenshot
agent-browser open https://studysinc.click/privacy && agent-browser screenshot

# Mobile
agent-browser set viewport 390 844
agent-browser open https://studysinc.click && agent-browser screenshot

# Authenticated pages (after login is fixed)
agent-browser open https://studysinc.click/dashboard && agent-browser screenshot
agent-browser open https://studysinc.click/groups && agent-browser screenshot
agent-browser open https://studysinc.click/calendar && agent-browser screenshot
agent-browser open https://studysinc.click/notifications && agent-browser screenshot
```

---

**Prepared by:** Kimi Code CLI  
**Files:** see this directory and `more-screenshots/` for all screenshots referenced above.
