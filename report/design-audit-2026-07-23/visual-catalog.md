# StudySinc — Visual Catalog (Current UI)

Screenshots captured 2026-07-23 from production `https://studysinc.click`.  
Public pages via Vercel `agent-browser`; authenticated pages via Playwright smoke test.

---

## Public Pages (Desktop)

### 01 — Landing Page (desktop, 1440×900)

![Landing desktop](visual-catalog/01-landing-desktop.png)

---

### 02 — Login Page (desktop, 1440×900)

![Login desktop](visual-catalog/02-login-desktop.png)

---

### 03 — Signup Page (desktop, 1440×900) — currently empty/broken

![Signup desktop](visual-catalog/03-signup-desktop.png)

---

### 04 — Terms of Service (desktop, 1440×900)

![Terms desktop](visual-catalog/04-terms-desktop.png)

---

### 05 — Privacy Policy (desktop, 1440×900)

![Privacy desktop](visual-catalog/05-privacy-desktop.png)

---

### 06 — Dashboard (unauthenticated, redirects to login)

![Dashboard unauth](visual-catalog/06-dashboard-unauth.png)

---

## Public Pages (Mobile)

### 07 — Landing Page (mobile, 390×844)

![Landing mobile](visual-catalog/07-landing-mobile.png)

---

### 08 — Login Page (mobile, 390×844)

![Login mobile](visual-catalog/08-login-mobile.png)

---

### 09 — Signup Page (mobile, 390×844) — currently empty/broken

![Signup mobile](visual-catalog/09-signup-mobile.png)

---

## Authenticated Internal Pages (Playwright captures)

### 14 — Dashboard (authenticated, light theme)

![Dashboard authenticated light](visual-catalog/14-dashboard-authenticated-light.png)

---

### 15 — Dashboard (authenticated, dark theme) — visually identical to light due to hardcoded colors

![Dashboard authenticated dark](visual-catalog/15-dashboard-authenticated-dark.png)

---

### 16 — Groups / Study Teams (authenticated, light theme)

![Groups authenticated](visual-catalog/16-groups-authenticated.png)

---

### 17 — Subjects (authenticated, light theme)

![Subjects authenticated](visual-catalog/17-subjects-authenticated.png)

---

### 18 — Calendar (authenticated, light theme)

![Calendar authenticated](visual-catalog/18-calendar-authenticated.png)

---

### 19 — Notifications (authenticated, light theme) — layout shell missing

![Notifications authenticated](visual-catalog/19-notifications-authenticated.png)

---

## Notes

- Pages `10–13` (Tasks, Groups, Calendar, Notifications unauthenticated) all redirect to `/auth/login` and therefore look identical to screenshot `06`.
- Dark-mode screenshots of public pages are not included because the site does not respond to `prefers-color-scheme` and has no public theme toggle.
