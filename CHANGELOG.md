# 📋 Changelog — College Connect Update

> **Date:** May 14, 2026  
> **Scope:** Security hardening, visual polish, accessibility, mobile responsiveness, and performance optimization.

---

## 📁 Files Modified

| File | Type | Changes |
|:-----|:-----|:--------|
| `backend/models/User.js` | Backend | Added `name` field to schema |
| `backend/routes/auth.js` | Backend | Rate limiting + accept `name` in registration |
| `backend/package.json` | Backend | New dependency: `express-rate-limit` |
| `style.css` | Frontend | Animated gradient, contrast fixes, glow effects, mobile touch targets |
| `script.js` | Frontend | Focus trapping for modal accessibility |
| `index.html` | Frontend | Updated OG image references (`.png` → `.jpg`) |
| `OG.jpg` | Asset | New compressed OG image (replaces 6MB PNG) |
| `OG_original.png` | Asset | Backup of original OG image |

---

## 🔒 Phase 1: Security & Backend Fixes

### 1. User Registration — `name` Field Support

**Problem:** The registration form collects the user's full name, but the backend silently discarded it. The `name` was never stored in MongoDB.

**Files changed:**
- `backend/models/User.js`
- `backend/routes/auth.js`

**What was done:**

`backend/models/User.js` — Added `name` field to the Mongoose schema:
```diff
 const UserSchema = new mongoose.Schema({
+    name: {
+        type: String,
+        required: true
+    },
     email: {
         type: String,
         required: true,
         unique: true
     },
```

`backend/routes/auth.js` — Updated the register route to destructure and store `name`:
```diff
- router.post('/register', async (req, res) => {
-     const { email, password, branch, year } = req.body;
+ router.post('/register', registerLimiter, async (req, res) => {
+     const { name, email, password, branch, year } = req.body;
      ...
-     user = new User({ email, password, branch, year, role: 'student' });
+     user = new User({ name, email, password, branch, year, role: 'student' });
```

> **Note:** The frontend (`script.js` line 303) was already sending `name` in the registration payload — no frontend change needed.

---

### 2. Rate Limiting on Auth Endpoints

**Problem:** No rate limiting existed on `/login` and `/register`, leaving the application vulnerable to brute-force attacks.

**Files changed:**
- `backend/routes/auth.js`
- `backend/package.json` (new dependency)

**What was done:**

Installed `express-rate-limit`:
```bash
npm install express-rate-limit
```

Added two rate limiters in `backend/routes/auth.js`:

```javascript
const rateLimit = require('express-rate-limit');

// Login: 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { msg: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Register: 5 attempts per 15 minutes per IP
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { msg: 'Too many registration attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});
```

Applied to routes:
```diff
- router.post('/register', async (req, res) => {
+ router.post('/register', registerLimiter, async (req, res) => {

- router.post('/login', async (req, res) => {
+ router.post('/login', loginLimiter, async (req, res) => {
```

---

## 🎨 Phase 3: Visual Design & Accessibility

### 3. Animated Gradient Background on Auth Page

**Problem:** The auth page used a static `login-background.jpg`. An animated gradient provides a more premium, modern feel.

**File changed:** `style.css`

**What was done:**

Added a `@keyframes gradientShift` animation and applied it to `.auth-container::before`:

```css
@keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.auth-container::before {
    content: '';
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(
        -45deg,
        hsl(220, 60%, 12%),
        hsl(240, 50%, 18%),
        hsl(200, 70%, 14%),
        hsl(260, 55%, 16%)
    );
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
    z-index: -1;
}
```

> The dashboard pages still use the original `login-background.jpg` — only the auth/login screen gets the animated gradient.

---

### 4. Glowing Card Accent Effects

**File changed:** `style.css`

**What was done:**

Added a subtle glow on card hover:

```diff
 .card {
     ...
     animation: fadeInUp 0.5s var(--transition-smooth) both;
+    transition: border-color var(--transition-smooth), box-shadow var(--transition-smooth);
 }

+.card:hover {
+    border-color: rgba(255, 255, 255, 0.18);
+    box-shadow: var(--shadow-card), 0 0 20px rgba(92, 143, 255, 0.08);
+}
```

---

### 5. WCAG AA Contrast Ratio Improvements

**Problem:** Several text elements had low opacity values that failed WCAG AA contrast ratio requirements against the dark backgrounds.

**File changed:** `style.css`

**What was done:**

| CSS Selector | Property | Before | After |
|:-------------|:---------|:-------|:------|
| `.auth-header p` | `color` opacity | `0.7` | `0.8` |
| `.form-group label` | `color` opacity | `0.85` | `0.92` |
| `.notification-meta` | `color` opacity | `0.5` | `0.65` |
| `.notification-content` | `color` opacity | `0.7` | `0.78` |

---

### 6. Focus Trapping in Modals (Accessibility)

**Problem:** When a modal was open (notification detail or forgot password), pressing `Tab` could move focus to elements behind the modal — breaking keyboard navigation for screen reader users.

**File changed:** `script.js`

**What was done:**

Added two utility functions:

```javascript
// Traps Tab/Shift+Tab focus within a modal
function trapFocus(modal) {
    previouslyFocusedElement = document.activeElement;
    const focusableElements = modal.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), ...'
    );
    // Wraps focus: last → first on Tab, first → last on Shift+Tab
    modal.addEventListener('keydown', handler);
    firstFocusable.focus();
}

// Releases focus trap and restores previous focus
function releaseFocus(modal) {
    modal.removeEventListener('keydown', handler);
    previouslyFocusedElement.focus();
}
```

Integrated into modal functions:
```diff
 function openNotificationModal(note) {
     ...
-    notificationModal.focus();
+    trapFocus(notificationModal);
 }

 function closeNotificationModal() {
     ...
+    releaseFocus(notificationModal);
 }

 function showForgotPassword() {
     ...
-    document.getElementById('resetEmail').focus();
+    trapFocus(forgotPasswordModal);
 }

 function closeModal() {
     ...
+    releaseFocus(forgotPasswordModal);
 }
```

---

## 📱 Phase 4: Mobile Responsiveness

### 7. Larger Touch Targets for Mobile

**Problem:** Form inputs, buttons, and checkboxes were too small for comfortable finger tapping on mobile devices. WCAG recommends a minimum 44×44px touch target.

**File changed:** `style.css`

**What was done:**

Added rules inside `@media (max-width: 768px)`:

```css
/* Prevents iOS auto-zoom on input focus */
.form-control {
    padding: 15px 16px;
    font-size: 16px;
    min-height: 48px;
}

.notification-item {
    padding: 18px 16px;
    min-height: 56px;
}

.filter-btn {
    padding: 10px 16px;
    min-height: 44px;  /* WCAG minimum */
}

.btn {
    min-height: 48px;
    padding: 14px 24px;
}

.task-checkbox {
    width: 24px;
    height: 24px;
}
```

---

## 🚀 Phase 5: Performance

### 8. OG Image Compression

**Problem:** `OG.png` was **6.3 MB** — extremely large for an Open Graph image that social platforms fetch when sharing links.

**What was done:**
- Resized from **2816×1536** → **1200×655** (standard OG size)
- Converted from PNG to JPEG at 80% quality
- Result: **96 KB** (98.5% reduction)

| | Before | After |
|:--|:-------|:------|
| **File** | `OG.png` | `OG.jpg` |
| **Size** | 6,316 KB (6.3 MB) | 96 KB |
| **Dimensions** | 2816 × 1536 | 1200 × 655 |
| **Format** | PNG | JPEG (quality 80) |

**File changed:** `index.html`

Updated meta tag references:
```diff
- <meta property="og:image" content="https://virajj12.github.io/College-Connect/OG.png" />
+ <meta property="og:image" content="https://virajj12.github.io/College-Connect/OG.jpg" />

- <meta name="twitter:image" content="https://virajj12.github.io/College-Connect/OG.png">
+ <meta name="twitter:image" content="https://virajj12.github.io/College-Connect/OG.jpg">
```

> The original image is preserved as `OG_original.png` and can be safely deleted.

---

## ✅ Previously Existing Features (No Changes Needed)

The following features from the improvement plan were **already implemented** prior to this update:

| Feature | Location |
|:--------|:---------|
| Toast notification system (replaces `alert()`) | `script.js`, `style.css` |
| HTML escaping / XSS prevention (`escapeHtml()`) | `script.js` |
| Loading spinners on auth buttons | `script.js`, `style.css` |
| Password visibility toggle (eye icon) | `script.js`, `index.html` |
| Animated stat counters on analytics dashboard | `script.js` |
| Google Fonts (Inter) | `style.css` |
| HSL-based CSS custom properties | `style.css` |
| Card entrance animations (`fadeInUp`, `itemSlideIn`) | `style.css` |
| Section fade/slide transitions | `style.css` |
| Skip to content link | `index.html` |
| ARIA labels on forms, nav, and modals | `index.html` |
| Hamburger mobile menu | `index.html`, `style.css`, `script.js` |
| Scrollable heatmap with custom scrollbar | `style.css` |
| `loading="lazy"` on images | `index.html` |
| `<link rel="preconnect">` tags | `index.html` |
| JSON-LD structured data | `index.html` |
| `focus-visible` styles | `style.css` |
| Keyboard shortcuts (Escape to close modals) | `script.js` |

---

## 🧪 How to Verify

1. **Registration name field:** Register a new account → check MongoDB for the `name` field
2. **Rate limiting:** Try logging in 11 times rapidly → expect `429 Too Many Requests`
3. **Animated gradient:** Open the login page → observe the slow-shifting background colors
4. **Focus trapping:** Open a notification modal → press `Tab` repeatedly → focus should cycle within the modal
5. **Contrast:** Inspect notification text in DevTools → verify improved readability
6. **Touch targets:** Open on mobile (or resize to 375px) → inputs and buttons should be easy to tap
7. **OG image:** Check `OG.jpg` file size → should be ~96 KB
