# Progress Tracker

> **Last Updated:** October 2026  
> **Methodology:** Spec-Driven Development (SDD)

## 🎯 Current Goal
Build out QRVibe as the **In-Store Digital Front-Desk & Google Review Engine for Indian Storefronts** (Salons & Spas, Cafes & QSRs, Healthcare Clinics) backed by edge dynamic routing, DPDP privacy, and physical countertop hardware.

## ✅ Completed (Architecture & Features)
- **Strategic Specs Finalized:**
  - Repositioned from generic "QR generator" to In-Store Front-Desk & Review Engine in `Context/Project_overview.md`.
  - Defined P0 Beachhead Verticals: Salons/Spas & Boutique Cafes/QSRs; P1: Dental Clinics & Academies.
  - Specified "Warm Professional" brand identity & "Scan with Phone Camera (Not GPay)" in `Context/Ui_Context.md`.
  - Specified dedicated countertop acrylic standees & mirror tags (Side B / UPI payment QRs and 2-sided standees strictly avoided to eliminate scanner confusion and payment liabilities).
  - Demoted forced dine-in WhatsApp order taking in favor of visual browsing, high-res photos, Veg/Non-Veg filters, and "Call Waiter / Ask for Bill".
- **Backend & Core Engine:**
  - Decoupled `app.js`, `index.js`, and `worker.js`.
  - Implemented MongoDB-backed Mutex Job Locks (`JobLock.js`).
  - Built Audited 3-Tier Geolocation & Placement Engine (`Verified GPS > Physical QR Placement Metadata > Coarse IP` with single-flight dedup, tap-to-consent DPDP interstitial, single-use telemetry tokens, fast-204 responses, and in-app webview skip).
  - Replaced raw IPs and raw GPS coordinates with DPDP-compliant SHA-256 session hashing and city/region-only storage.
  - Deployed Pre-Aggregated Materialized Views (`DailyScanStats`).
  - Added Reverse Geocoding (BigDataCloud in production, Nominatim dev-only).
  - Fixed Dashboard infinite remount crash (`PrivateRoute.jsx` & `DashboardOverview.jsx`) and synchronized `Sidebar.jsx` plan & active QR counts.
  - Fixed Menu & Hosted QR (`MENU`, `VCARD`, `PDF`, `SOCIAL`, `MEDIA`) blank page bug on target/test links.
  - Completely removed WhatsApp Cart ordering from Digital Menus (`MenuForm.jsx`, `MenuViewPage.jsx`, templates, and `qrValidator.js`) to eliminate dine-in ordering friction in favor of a pure Visual Menu / Rate Card & Reputation Shield experience.
  - Built & hardened "AI Photo-to-Menu" in Step 2 of QR Creator (`backend/services/MenuAiService.js`, `MenuImportModal.jsx`, `MenuForm.jsx`, Gemini Flash multimodal OCR with allergen-safe descriptions and Unsplash dish fallback catalog).
  - Abstracted Menu Dishes & Dropdown Card UI in Step 2 of QR Creator (`frontend/src/pages/create/forms/MenuForm.jsx`, `frontend/src/components/MenuTemplates/MenuImportModal.jsx`): Replaced giant vertical scroll with a collapsible Dropdown Card right below Restaurant Details, abstracted dishes into compact expandable rows with inline editors, global expand/abstract controls, and smooth auto-scroll on AI import.
  - Implemented Architecture D: Smart Adaptive Redirect + Zero-Prompt Micro-Bridge + Atomic Telemetry Reconciliation (`redirectController.js`, `Geolocation.js`, 100% test pass on 45 tests).
  - Built & deployed In-Menu **AI Google Review Booster & 1-to-3 Star Private Shield** (`ReviewFunnel.jsx`, `MenuViewPage.jsx`, `MenuForm.jsx`): Includes persistent floating bottom pill ("⭐ Loved our food? Tap to leave a 10s Google Review"), interactive 5-star rating modal, dynamic 3-draft AI review generator tailored to menu dishes with 1-tap clipboard copy & Google Maps review launcher, and private WhatsApp complaint shield with custom resolution offers.
  - Added **Google Review Link to 3-Step Registration Onboarding** (`RegisterPage.jsx`, `User.js`, `userController.js`, `DashboardOverview.jsx`, `authSlice.js`): Captured directly in Step 2 of the first-time setup wizard, persisted to user profile, and synchronized with the storefront dashboard.
  - Implemented **Storefront-First Launch & Progressive Disclosure**:
    - Backend: `workspaceMode` enum (`'storefront'`, `'marketing'`, default `'storefront'`) on `User.js` model, serialized in `sendTokens` and `getMe`. All new users launch directly into Storefront Mode.
    - Routing Hot Path: Storefront / MENU QR scans bypass micro-bridge latency and external BigDataCloud reverse geocoding lookups, delivering sub-50ms instant 302 redirects while anonymously tracking device, time-of-day, and unique visitors via DPDP salted hashing.
    - Navigation: Sidebar defaults to the 5 essential storefront items (`/dashboard`, `/qrcodes`, `/create`, `/billing`, `/account`) and hides campaign bloat (Folders, Analytics, Alerts, Privacy); plan card displays "Table QR codes used".
    - Overview: DashboardOverview dynamically hides marketing-specific cards (Print Safety Score with UTM checks, Team Seats) and surfaces localized table vocabulary.
    - QR Creation: `TypeSelection.jsx` filters down to storefront essentials (Menu, vCard, Website URL) while preserving marketing types for later toggling.
    - Zero-Friction Onboarding: Disabled modal prompt on signup; merchants land straight on the focused Storefront dashboard. Switcher remains available in Settings (`AccountPage.jsx`).
  - **Operational & Feature Scope Discipline:**
    - Excluded "Call Waiter / Ask for Bill" from the active menu UI to eliminate diner wait-time frustration in restaurants without dedicated POS/buzzers.
    - Pruned enterprise CSV/PDF analytics exports from the roadmap to protect velocity.
  - **Vertical Chameleon Skinning (Salon P0 Beachhead vs. Cafe)**:
    - **Backend Schema & Inheritance:** Added `businessCategory` enum (`'salon'`, `'cafe'`, default `null` on new user signup for onboarding trigger, with runtime fallback defaulting to `'salon'` for P0 beachhead focus) on `User.js` model and `QRCode.metadata`.
    - **Multimodal OCR Branching & Beauty Catalog:** Branched `buildExtractionPrompt` in `MenuAiService.js` to extract beauty-specific properties (`duration`, `brandUsed`, `targetGender`) from salon rate cards, and created `backend/data/serviceImageCatalog.js` to automatically pair hair/skin/nail/bridal services with high-resolution Unsplash CDN imagery.
    - **Centralized Vocabulary Dictionary:** Created `frontend/src/config/vocabulary.js` exporting `VOCABULARY` and `getVocabulary(category)`, driving dynamic terms (`Service Rate Card & Lookbook` vs `Digital Menu`, `Service` vs `Dish`, transformation photos, client tags, and `mirror standees used` vs `table standees used`).
    - **Storefront Noise Elimination:** Completely hid Print Safety Score (UTM check), Team Seats, Folders, Alerts, and Browser/OS charts in Storefront mode. Replaced with clean standee quotas, peak scan hours, and top services.
    - **Onboarding Questionnaire & Switcher:** Built `BusinessCategoryModal.jsx` (1-step questionnaire modal on first login) and responsive vertical switcher card in Settings (`AccountPage.jsx`).
    - **QR Creator Chameleon Skinning:** `TypeSelection.jsx` prioritizes Rate Card/Menu first in storefront mode. `MenuForm.jsx` and `MenuImportModal.jsx` dynamically adapt copy, upload prompts, and inline editor fields for salon services.
    - **Public Rate Card & Lookbook:** Upgraded public template suite (`BasicTemplates.jsx`, `ImmersiveTemplate.jsx`, `LighthouseTemplate.jsx`) with Client Filter tabs (`All`, `For Her`, `For Him`, `Unisex`) with inclusive matching, beauty badges (`⏱️ duration`, `🧴 brandUsed`), and floating WhatsApp appointment booking CTA (`wa.me`) in `MenuViewPage.jsx`.
    - **Salon Review Booster & Private Shield:** Adapted `ReviewFunnel.jsx` to dynamically generate beauty-specific 5-star review drafts (styling, facials, hygiene, precision) and salon complaint tags for private owner WhatsApp resolution.
    - **Verification & Builds:** 100% test pass (68/68 automated tests) and Vite production build passed with 0 errors on branch `product`.
- **Storefront Pivot & Deprecated Generic Platform Clean-Up:**
  - Fully pivoted from generic horizontal QR code generator (PDF, VCARD, SOCIAL, MEDIA, URL, campaign folders, privacy ledgers) exclusively to **In-Store AI Review Funnel & Digital Lookbook / Menu for Salons & Spas and Cafes & Bakeries**.
  - **Cleanly Removed Deprecated Files & Routes:**
    - Non-menu public view pages deleted: `PDFViewPage.jsx`, `VCardViewPage.jsx`, `SocialViewPage.jsx`, `MediaViewPage.jsx`.
    - Deprecated generic QR creator forms & wizard deleted: `frontend/src/pages/create/forms/*`, `frontend/src/pages/create/steps/*`, `CreateQRPage.jsx`.
    - Deprecated marketing & compliance pages deleted: `FoldersPage.jsx`, `PrivacyDataPage.jsx`, `AnalyticsPage.jsx`.
    - Deprecated backend models and routes deleted: `Folder.js`, `folderRoutes.js`, `folderController.js`, `ConsentRecord.js`.
    - Unmounted `/api/folders` from `backend/app.js` and removed references in `QRCode.js` and `userController.js`.
    - Cleaned up navigation and routes in `App.jsx` and `QRCodesList.jsx`.
  - **Protected & Kept Core Storefront Assets:**
    - Storefront Lookbook & Menu engine: `MenuViewPage.jsx`, `frontend/src/components/MenuTemplates/*`, `ReviewFunnel.jsx`, `MenuAiService.js`, `serviceImageCatalog.js`.
    - Storefront Dashboard: `DashboardOverview.jsx`, `StorefrontDashboard.css`, `Sidebar.jsx` (simplified 5 storefront links).
    - Standee & redirect engine: `StandeeKit.js`, `standeeController.js`, `redirectController.js`, `Geolocation.js`, `DailyScanStats.js`, `FeedbackEvent.js`, `telemetryRoutes.js`, `seedStandees.js`.
    - Core Auth & User models: `User.js`, `authController.js`, `userController.js`, `authSlice.js`, `LoginPage.jsx`, `RegisterPage.jsx`.
  - **Verification:**
    - 131/131 backend tests pass (`node --test backend/tests/*.test.js`).
    - Vite production build succeeds with 0 errors (`npm run build --prefix frontend`).
- **AI Rate Card Vision Reader & Unsplash Service Image Catalog Integration:**
  - Connected `readRateCard(file)` in `DashboardOverview.jsx` directly to `parseMenuPhotos` (`POST /api/qrcodes/parse-menu-photo`), feeding Gemini Multimodal Vision with `businessCategory: storefront.type` and `autoFillPhotos: true`.
  - Created client-side `frontend/src/utils/imageCatalog.js` providing curated Unsplash CDN URLs across Hair (Keratin, Balayage, Cuts), Skin (HydraFacial, Glow, Peels), Bridal, Nails & Lashes, Grooming, and Spa, plus Cafe & Clinic staples.
  - Automatically enriches default services (`DEF`) and existing `localStorage` data with matching Unsplash imagery.
  - Rendered rich photo cards in Tab 1 (Lookbook & Offers), Service Editor modal (with 1-tap "✨ Match best Unsplash photo"), Rate Card OCR staging drawer, and the Guest Preview drawer.
  - Replaced mock demo disclaimer with dynamic AI extraction status and thumbnail previews for each parsed item.
- **Menu Templates & Review Funnel Optimization:**
  - **Single-Screen Viewport Registration & Onboarding (`RegisterPage.jsx` & `index.css`):**
    - Compacted registration layout to fit completely within standard desktop/laptop viewports without irrelevant scrolling:
      1. Tuned `.reg-grid` padding from `44px 28px 96px` down to `18px 28px 24px` and set `align-items: center`.
      2. Scaled display headline (`.reg-h1`) from `clamp(42px, 5.8vw, 76px)` down to a crisp, elegant `clamp(26px, 2.2vw, 34px)`.
      3. Optimized form elements: reduced input height to `40px`, reduced field row/group vertical margins from `24px` to `10px`, reduced Google button height to `40px`, and tightened divider margins to `10px`.
      4. Proportionately scaled live standee & mobile preview stage (`.stage`) from `580px` down to `440px` with matching micro-copy and badge scaling.
      5. Streamlined top navigation (`.reg-nav`) padding to `10px 28px`.
      6. Verified 0 vertical scrollbars (`hasScrollbar: false`, `scrollHeight == viewportHeight`) across both sign-in and registration modes with 100% Vite production build success.
  - **Editorial Brand Design System & Landing Page Overhaul:**
    - Implemented official 60-30-10 palette: Primary (60%) Rich Cream / Alabaster (`#FBF9F6`), Secondary (30%) Deep Espresso Brown (`#2B1E19`), Accent (10%) Warm Honey Yellow (`#E5A93C`).
    - Standardized three-tier typography: Headings in `Instrument Serif`, Body & UI in `Instrument Sans`, Eyebrows & micro-labels in `IBM Plex Mono`.
    - Fully updated `LandingPage.jsx` into the editorial storefront & review engine presentation with the dedicated countertop standee and mirror tag preview, mobile review mockup, and zero-reprint guarantee.
    - Upgraded `RegisterPage.jsx` to the unified editorial 2-phase registration and 3-step first-time storefront onboarding flow with live stage preview synchronization and Google OAuth.
    - Synchronized tokens across `Context/Ui_Context.md`, `design-tokens.json`, `index.html`, and `frontend/src/index.css`.
  - **Storefront Dashboard Reshaping & Chameleon Pulse (`DashboardOverview.jsx`):** Refactored Storefront Dashboard with Impeccable standards and 4 senior product principles:
    1. Rendered 2/3 **"🌟 Active Lookbook & Rate Card Items"** directly from primary MENU QR categories (no fake per-service scan numbers) with live thumbnails, duration, brand, and pricing tags.
    2. Real, honest review metrics (Google reviews and WhatsApp shield defusal counts) with proactive connection/test prompts when 0.
    3. Replaced developer jargon with reassuring `🟢 Print-Safe Guarantee: Active` badge and a 4-step **"Front-Desk Setup Checklist"** with progress tracking.
    4. Smart Countertop Essentials Action Bar linking directly to primary Rate Card QR, with graceful zero-state fallback to `[+ Create Your First Rate Card]`.
    5. Clean mechanical validation: 0 warnings on `impeccable detect` and 100% Vite production build success.
  - **New Storefront Dashboard & Setup Wizard Live Implementation (`StorefrontDashboard.css`, `DashboardOverview.jsx`):**
    - Faithfully converted the entire new design from `qrvibe_storefront_dashboard_setup_wizard.html` into a fully responsive React implementation without excluding any feature or tab.
    - **4 Primary Tabs:**
      1. **Tab 0: Overview (ROI Pulse):** 3 core scan/review pulse metrics with live counter animation, Front-Desk hero status with Kit ID pill, 4 quick action triggers, top staff mini-leaderboard with animated bars, and live scannable QR card preview.
      2. **Tab 1: Lookbook & Rate Card / Visual Menu / Treatments:** Chameleon-tailored rate card, top offer banner with live preview & toggle switch, AI OCR snap rate card upload bar with laser animation, dynamic category pills + inline "+ New category" creator, and complete interactive service list with inline price editor, "onwards" checkbox, Signature switch, Availability switch, and "Edit details" modal button.
      3. **Tab 2: Reviews & Feedback:** Staff leaderboard with remove button & add staff input, WhatsApp leaderboard deep-link, high-ticket service chips manager, Private 1-3★ WhatsApp Shield configuration & preview bubble, and verified Google Maps Place ID connection with inline helper.
      4. **Tab 3: Standee & Studio:** 4x6 counter standee preview card with live scannable 29x29 QR matrix and center monogram/logo, physical Kit ID display & interactive pairing binder (`BOX-01`), 4x6 printable PDF export (`window.open` + auto-print), WhatsApp mirror tag order link, studio identity inputs, logo upload, 3 Chameleon vertical switchers (`Salon & Spa`, `Cafe & Bakery`, `Clinic & Aesthetics`), 3 themes (`Espresso & Gold`, `Obsidian & Silver`, `Forest & Champagne`), and 7-day walk-in trial mode simulator with warning banner & upgrade triggers.
    - **Modals & Drawers:**
      1. First-time 3-step setup wizard overlay (`#wizard`) for identity, Google review link, initial staff, paper rate card scan, and kit ID pairing.
      2. Manual Add / Edit Service modal (`#svcModal`).
      3. AI OCR rate card staging drawer (`#ocrModal`) with item removal and direct import.
      4. 7-day walk-in trial upgrade modal (`#upgradeModal`) with annual pass activation and UPI payment link.
      5. Interactive Guest Phone Simulator drawer (`#guestDrawer`) with live 5-star Google review funnel (with AI review draft generator & staff review increment) and 1-3★ Private WhatsApp Shield intercept.
    - Re-routed `/dashboard` directly under `PrivateRoute` in `App.jsx` to avoid duplicate outer sidebar collision, and redirected `LoginPage.jsx` directly to `/dashboard`.
    - Verified 100% Vite production build success with 0 errors.
  - **Impeccable System Initialization (`PRODUCT.md`, `.impeccable/config.json`):** Captured durable product truth, Dual Chameleon architecture, anti-hostageware commitments, and confirmed code-first workflow defaults in `PRODUCT.md` per Impeccable schema 1.
  - **Fixed Step 2 QR Creator & Chameleon Scope Crash (`MenuForm.jsx`, `MenuImportModal.jsx`, `ReviewFunnel.jsx`, `MenuViewPage.jsx`):** Resolved uncaught `ReferenceError: businessCategory is not defined` and `ReferenceError: v is not defined` when loading Step 2 of the QR creation wizard. Properly bound Redux `user?.businessCategory` state with fallback to `'cafe'`, wired vertical vocabulary `v = getVocabulary(businessCategory)`, and corrected `dishList` reference to `itemList` in `ReviewFunnel.jsx`. Verified live in browser with Playwright MCP automation.
  - **L'Ambroisie Immersive Layout Overhaul (`ImmersiveTemplate.jsx`):** Removed intrusive dish detail drawer popup, fake sommelier/calories/narrative mockups, and confusing chevron buttons. Upgraded typography with Google Fonts (`Playfair Display`, `Plus Jakarta Sans`), streamlined dish cards with baseline title/price alignment and full-width descriptions, added cross-category search, and expanded bottom clearance (`pb-28 sm:pb-32`).
  - **Mobile-Responsive Review Badge (`ReviewFunnel.jsx` & Templates):** Eliminated broken multi-line text wrapping by adding `whitespace-nowrap` and responsive label scaling (compact `Leave a 10s Review` on narrow screens `<390px` and full label on larger screens). Increased bottom padding across all templates (`ImmersiveTemplate`, `LighthouseTemplate`, `BasicTemplates`) to ensure zero content overlap.
  - **Editorial Authentication & Registration Suite (`LoginPage.jsx`, `RegisterPage.jsx`):**
    - Executed dual-agent Impeccable Critique on `RegisterPage.jsx` (A: `cff2b5e0-dc69-433c-b1e8-638f3abc83ff` · B: `a7aae7bb-4273-4aec-94e0-3502edbd3670`), persisting snapshot to `.impeccable/critique/2026-11-01T18-25-39Z__frontend-src-pages-registerpage-jsx.md`.
    - Completely separated authentication routes: removed the internal `isLoginMode` state toggle from `RegisterPage.jsx`, dedicating `RegisterPage.jsx` purely to storefront creation and the 3-step setup with direct `<Link to="/login">`.
    - Built `LoginPage.jsx` to strictly reuse `RegisterPage.jsx` exact components and classes (`.nav.reg-nav`, `.reg-grid.w`, `.form-card`, `.btn-google`, `.or-divider`, `.field-row`, `.stage.dk`, `.stand`, `.phone`, `.stage-foot`) with zero standalone or unique components.
    - Implemented P0 accessibility hardening: wrapped category and plan choice groups in `role="radiogroup"`, adding `role="radio"`, `aria-checked`, `tabIndex={0}`, and Space/Enter keyboard listeners.
    - Resolved P1 form blocker: conditionally skipped shipping address requirement on "Starter Digital Only" plan.
    - Embedded the mandatory Center Category Brand Icon rule in preview standees and the 100% Anti-Hostageware Guarantee badge.
    - Verified 100% Vite production build success with 0 errors.
  - **Full Mobile Responsiveness Overhaul across Entire Web App (`StorefrontDashboard.css`, `DashboardOverview.jsx`, `LoginPage.jsx`, `LandingPage.jsx`, `Sidebar.jsx`, `DashboardLayout.jsx`):**
    - **`LoginPage.jsx` Mobile Optimization:** Replaced cramped 2-column side-by-side inputs with clean full-width stacked fields, set 16px font-size to prevent iOS Safari auto-zoom, ensured 44px min touch height on all inputs and buttons, and hid the desktop `.preview-col` on small screens (< 1024px) to present a distraction-free, focused sign-in card.
    - **`DashboardOverview.jsx` & `StorefrontDashboard.css`:** Added a fixed mobile top navigation bar (`.sf-mobile-bar`, 56px with blur backdrop) featuring store identity, live pulse indicator, and a quick-action drawer. Redesigned bottom `.side` navigation bar with 44px touch targets, gold active accents, and `env(safe-area-inset-bottom)` support. Refactored ROI metrics into a glanceable 3-column mobile row and action buttons into a smooth horizontal touch rail.
    - **`Sidebar.jsx` & `DashboardLayout.jsx`:** Harmonized legacy indigo/slate palette to the official Warm Editorial palette (Rich Cream `#FBF9F6`, Deep Espresso `#2B1E19`, Warm Honey `#E5A93C`) with mobile dark backdrop overlay and tap-to-dismiss.
    - **`LandingPage.jsx` Navigation:** Refactored mobile header links so `Log In` / `Dashboard` remains prominently accessible as a pill button on small screens without being hidden by `.l { display: none }`.
    - **Global CSS Input Standardization:** Set `.reg-input` font-size to 16px and min-height to 44px on screens <= 920px in `index.css`.
    - **Live Storefront Scan Telemetry Wired (`DashboardOverview.jsx`):**
      - Connected real scan metrics into the primary Storefront overview stat card, eliminating hardcoded `342` and static subtext.
      - Wired `Promise.allSettled` calls to `/api/analytics/dashboard?days=30` and `/api/qrcodes/myqrs` via `api` client on component mount.
      - Dynamically displays real 30-day scans (or cumulative QR scans fallback), percentage delta vs previous 30 days (`↗ +X%` / `↘ -X%`), and unique visitors count with graceful loading states (`—`).
      - Verified 100% Vite production build success with 0 errors.
    - **Google Review Redirect & Private WhatsApp Shield Telemetry Engine (`FeedbackEvent.js`, `telemetryController.js`, `analyticsController.js`, `ReviewFunnel.jsx`, `DashboardOverview.jsx`):**
      - Built and deployed dedicated `FeedbackEvent` MongoDB model capturing event type (`google_redirect` vs `private_feedback`), rating (1–5), staff mentions, dish/service chips, review draft copy, issue tags, and device types.
      - Updated `QRCode` and `DailyScanStats` schemas with atomic `$inc` counters for `google_redirects`, `private_feedback`, and `staff_reviews`.
      - Mounted public telemetry endpoints at `POST /api/telemetry/feedback` and `POST /r/:shortId/feedback`.
      - Wired `ReviewFunnel.jsx` to automatically dispatch telemetry pings whenever a dining guest taps "1-Tap Copy & Open Google Reviews" or "Message Owner on WhatsApp".
      - Connected dashboard ROI cards in `DashboardOverview.jsx`, replacing hardcoded `28` and `3` with real dynamic totals from `/api/analytics/dashboard?days=30` and synchronizing the Phone Simulator and staff leaderboard.
      - 100% test pass on new test suite (`backend/tests/FeedbackTelemetry.test.js`, 50/50 overall passing tests) and 100% Vite production build pass.
    - **Verification:** 100% Vite production build passed with 0 errors.
  - **Physical Standee Kit & Walk-In QR Activation Engine (`StandeeKit.js`, `standeeController.js`, `standeeRoutes.js`, `redirectController.js`, `StandeeActivationPage.jsx`, `DashboardOverview.jsx`, `seedStandees.js`):**
    - **Walk-In Sales Rep & Owner Experience:** Built complete hardware-to-digital activation flow enabling a sales rep or merchant to walk into a salon, register an account in 10s, activate a pre-printed physical acrylic standee (via `BOX-01` or unambiguous 6-char kit code), and push their salon rate card (via Gemini AI photo OCR or starter lookbook) and Google review booster directly into that QR code with zero reprinting.
    - **StandeeKit Schema & Batch Generator (`StandeeKit.js`, `standeeGenerator.js`):** Dedicated MongoDB schema linking `kit_code`, `short_id`, `batch_id`, and `status: ['unclaimed', 'activated', 'disabled']`. Unambiguous 32-character alphabet (`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`) excluding glyphs `0`, `O`, `1`, `I` to prevent print misreads.
    - **Sub-50ms Hot-Path Redirect Interceptor (`redirectController.js`, `QRCode.js`):** Intercepts unactivated standee QR scans (`qr.isActivated === false`) immediately after finding the QR, routing scanners to `${env.FRONTEND_URL}/activate/:code` in < 20ms without triggering geocoding, telemetry, or bot detection overhead. Allows pre-printed unactivated standees to exist in the database without requiring a merchant `user_id` until claimed.
    - **Atomic Activation API (`standeeController.js`, `standeeRoutes.js`):** Public debounced kit verification (`GET /api/standees/verify/:code`) and atomic claiming (`POST /api/standees/activate`) using `{ status: 'unclaimed' }` to prevent double-claim collisions with explicit `409 Conflict` rejection. Populates lookbook metadata (`businessCategory: 'salon'`, `title`, `categories`, `googleReviewUrl`, `shieldPhone`, `resolutionOffer`, `enableReviewBooster: true`) and placement labels.
    - **Dedicated Mobile-First Activation Page (`StandeeActivationPage.jsx`, `App.jsx`):** Editorial-themed walk-in activation UI on `/activate` and `/activate/:code` supporting kit code verification, 10-second inline registration/login, station chip selector (`Reception Counter`, `Mirror 1`, `Mirror 2`, `Hair Wash Station`), paper rate card photo capture with Gemini OCR, salon starter lookbook, Google Review link, WhatsApp complaint shield, and high-fidelity celebration screen with scannable QR card preview and anti-UPI microcopy (`📷 Open Phone Camera to Scan (Not GPay)`).
    - **Dashboard Tab 3 & Overview Real Standee Integration (`DashboardOverview.jsx`):** Replaced static mock state with live backend standee management (`api.get('/standees/my-standees')`). Tab 0 displays active kit code/station badge or unlinked callouts. Tab 3 ("Standee & Studio") renders active primary 4×6″ preview card, multi-standee station cards with live scan counts, expandable inline kit linking drawer, and 4×6″ printable PDF canvas generation with real scannable QR matrix.
    - **Manufacturing Batch Seeder CLI (`seedStandees.js`):** CLI tool supporting `--count`, `--batch`, `--export-csv`, and `--dry-run` to bulk generate batches of unactivated standee kits and QRs with formatted CSV exports for acrylic print vendors.
    - **Full Test Verification:** 121/121 backend unit tests passing (including 42 new unit tests across `StandeeKit.test.js`, `StandeeActivation.test.js`, `UnactivatedStandeeRedirect.test.js`, and `StandeeSeedScript.test.js`) and 100% Vite production build success with 0 errors.
  - **In-Salon Pitch & Walk-In Readiness (Voucher Funnel, 4x6 Standee, Demo Salon):**
    - **Post-Review ₹200 WhatsApp Privilege Pass Screen (`ReviewFunnel.jsx`):** Added a 1-step celebratory bottom-sheet following Google Maps review submission displaying a gold-embossed "₹200 Privilege Pass (Code: VIBE200)" valid for 60 days on treatments. Features a 1-tap "Tap to Save ₹200 Voucher on WhatsApp" CTA deep-linked to the salon owner's WhatsApp, automatically capturing client phone numbers and driving guaranteed repeat visits.
    - **High-Converting 4x6 Printable Standee Canvas (`DashboardOverview.jsx`, `StandeeActivationPage.jsx`):** Upgraded 4x6 printable standee generator with the scissors center icon inside the scannable QR matrix, the pitch hook *"Scan for Today's In-Chair Offers & Unlock ₹200 Off Your Next Visit"*, 5-star review hook, and anti-UPI microcopy *"📷 Open Phone Camera to Scan (Not GPay)"*. Accessible via 1-click in Dashboard Tab 3 and on the Standee Activation celebration screen.
    - **Pre-Seeded Demo Salon Live in MongoDB Atlas (`seedDemoSalon.js`, `DemoSalonSeed.test.js`):** Built and executed idempotent seed script populating `Aura Hair & Spa, Indore` with short redirect ID `aura-salon` and kit code `BOX-01` in MongoDB Atlas. Loaded with 8 top services (Keratin, HydraFacial, Global Hair Colour, O3+ Facial, Men's Fade, etc.) across 4 categories and 3 stylists (Riya, Rahul, Pooja).
    - **Short URL Routing & Multi-Domain Support (`App.jsx`, `redirectRoutes.js`):** Routed `/s/:shortId` and `/menu/:shortId` directly to `MenuViewPage.jsx`, enabling zero-friction live demonstrations at `qrvibe.in/s/aura-salon`. Added `backend/Procfile` for Railway/Render container execution.
    - **Clean Committed Tree:** Locked in all 15 previously untracked files and 21 modified files on branch `product` with 100% clean working tree and 124 passing unit tests.

  - **Storefront Dashboard Exact Specification Alignment (`DashboardOverview.jsx`, `StorefrontDashboard.css`, `frontend/src/utils/qrcode.js`):**
    - Faithfully implemented the exact design, typography, layout, sheets, modals, and Chameleon vertical capabilities from the user's provided specification (`qv.html`):
      1. **Tab 0: Overview:** Live Front-Desk hero banner with Kit ID status and quick actions, 3 ROI counters with cubic-ease animated count-up (`roiScans`, `roiGoogle`, `roiFeedback`), Quick Action strip (`+ Pin festive offer`, `+ Add new service`, `+ Add stylist name`), and Top 3 staff ranked leaderboard with animated progress bars.
      2. **Tab 1: Lookbook & Rate Card:** Dynamic vertical header (`v.t2`), pinned festive offer banner with live preview card and toggle switch, Paper rate card photo snap box with simulated OCR staging sheet, category filter pills with `+ New category` sheet, and services grid with in-place price/onwards/availability editing and full service editor modal.
      3. **Tab 2: Reviews & Feedback:** Staff leaderboard with WhatsApp report deep-link and add-staff input, service chips manager with 6-chip guardrail, private feedback line with owner WhatsApp and preview bubble, and verified Google Maps connection with Place ID validator.
      4. **Tab 3: Standee & Studio:** Single-sided acrylic countertop hardware preview card with scannable Level-H QR code and center monogram/logo, Kit ID pairing (`BOX-01`), 4x6 printable standee PDF canvas generator with `@page { size: 4in 6in; margin: 0; }` and automatic print trigger, studio identity form with logo uploader, 3-theme switcher (Warm Cream & Espresso, Obsidian, Forest), 7-day walk-in trial vs annual pass view toggle, and Monday 9 AM WhatsApp digest switch.
      5. **Interactive Sheets & Modals:** Add/Edit Service sheet, New Category sheet, Rate Card Staging sheet with editable rows, Upgrade to Annual Pass sheet with UPI link (`upi://pay?...`) and WhatsApp confirmation, Guest Preview Phone Simulator drawer with interactive 5-star rating, staff/service chips, auto-drafting review text, and private WhatsApp feedback fallback, plus 3-step First-Time Setup Wizard (`.wz`).

  - **Frontend Architecture Cleanup & Directory Standardization (Branch `product`):**
    - Executed a complete folder structure refactoring of `frontend/src` to align 100% with modern React/Vite standards and the Storefront In-Store Digital Front-Desk app:
      1. **Separated Pages from Components:** Moved `DashboardOverview.jsx` and `QRCodesList.jsx` into `frontend/src/pages/`, making `pages/` the single source of truth for all application routes (`DashboardOverview`, `LandingPage`, `LoginPage`, `RegisterPage`, `MenuViewPage`, `StandeeActivationPage`, `BillingPage`, `AccountPage`, `QRDetailPage`, `QRCodesList`).
      2. **Code Splitting & Lazy Loading:** Lazy-loaded all route views with `React.lazy()` in `App.jsx`, reducing initial index bundle size from 486 kB to 309 kB and isolating page styles into scoped CSS chunks.
      3. **Standardized UI Directory:** Renamed `components/UI` to lowercase `components/ui/` (cross-platform Linux/Windows casing consistency) and updated `@/components/ui/` imports across `AccountPage.jsx` and `BillingPage.jsx`.
      4. **Dedicated Styles Directory:** Created `frontend/src/styles/` and moved `StorefrontDashboard.css` into it.
      5. **Deleted Dead Assets & Components:** Removed dead `QRCard.jsx`, unused `BusinessCategoryModal.jsx`, and empty `App.css`.
      6. **Verified Production Build:** `npm run build` in `frontend` succeeded in 7.73s with **0 errors**.
      6. **Scoped Styles & Client QR Engine:** Extracted self-contained `qrcode` generator into `frontend/src/utils/qrcode.js` for 100% offline scannable Level-H QR matrix rendering with center circular monogram/logo. Scoped all dashboard CSS strictly under `.sf-dash` in `StorefrontDashboard.css`.
      7. **Build & Quality:** 100% Vite production build success with 0 errors (`✓ built in 13.04s`).
  - **Full Codebase Security Audit & Remediation (SEC-01 to SEC-12):**
    - Fixed **SEC-01 (SSRF in Link Health Monitor)**: Added `isBlockedHostOrIp` in `healthMonitor.js` blocking cloud metadata (`169.254.169.254`, `metadata.google.internal`), loopback (`127.0.0.1`, `::1`), private RFC1918 subnets (`10.x`, `172.16.x`, `192.168.x`), and non-HTTP schemes with redirect inspection.
    - Fixed **SEC-02 (Unauthenticated Public Uploads)**: Added `protect` auth middleware and `ALLOWED_MIME_TYPES` filter (JPEG, PNG, WEBP, GIF, PDF) with Multer error handling in `uploadFile.js`.
    - Fixed **SEC-03 (Stored XSS in Redirect Micro-Bridge & GPS Interstitial)**: Sanitized redirect URLs in `redirectController.js`, disallowing `javascript:`, `data:`, `vbscript:`, escaped `<noscript>` meta tags, and encoded inline scripts using `JSON.stringify(...).replace(/</g, '\\u003c')`.
    - Fixed **SEC-04 (Mass Assignment in `updateQR`)**: Replaced raw `req.body` with a strict whitelist (`target_url`, `title`, `customization`, `placement`, `folder_id`, `utm`, `gpsLocationEnabled`, `metadata`) in `qrController.js`, and added `.refine()` against `javascript:`/`data:` in `qrValidator.js`.
    - Fixed **SEC-05 (Webhook HMAC Timing Attacks & Non-Deterministic JSON)**: In `app.js`, preserved raw body buffers via `express.json({ verify: ... })`. In `webhookController.js` and `razorpayController.js`, replaced `!==` with `crypto.timingSafeEqual` and length checks, and computed HMAC using raw body buffers.
    - Fixed **SEC-06 (Bcrypt Work Factor)**: Increased password hashing rounds in `User.js` from 5 to 12.
    - Fixed **SEC-07 (`JWT_SECRET` in `/debug-ip`)**: Disabled `/debug-ip` unconditionally when `env.NODE_ENV === 'production'` in `app.js`.
    - Fixed **SEC-08 (Refresh Token Revocation)**: Added `tokenVersion` counter to `User.js`, signed into refresh tokens, verified on `/api/users/refresh`, and incremented on password change and logout in `userController.js`.
    - Fixed **SEC-09 (Google OAuth Erasure Challenge)**: In `userController.js`, required explicit `confirmDelete === 'DELETE'` confirmation before purging accounts for OAuth users.
    - Fixed **SEC-10 (ReDoS in Analytics Search)**: Escaped regex metacharacters in `analyticsController.js` before executing MongoDB `$regex` queries.
    - Fixed **SEC-11 (Edge IP Header Trust & Single Source of Config)**: Standardized on `env.NODE_ENV` across `Geolocation.js`, `ReverseGeocode.js`, `healthMonitor.js`, and `QRCode.js`.
    - Fixed **SEC-12 (Multer Memory Bounds on Menu Uploads)**: Reduced `menuPhotoUpload` memory limits to 5MB and 4 files in `qrRoutes.js`.
    - Built comprehensive security regression test suite (`SecurityRemediation.test.js`) with 100% pass rate (68/68 total passing tests).
  - **Full Mobile Responsiveness & Navigation Architecture Overhaul (`LandingPage.jsx`, `DashboardOverview.jsx`, `StorefrontDashboard.css`):**
    - **Landing Page Navigation Drawer (`LandingPage.jsx`):** Added a responsive hamburger menu toggle (`Menu` / `X` from `lucide-react`) and slide-in drawer on mobile viewports (< 860px). Surfaces full navigation ("How it works", "Who it is for", "Pricing"), authentication ("Log In to Storefront", "Start 7-Day Free Trial"), and WhatsApp standee inquiries with anti-hostageware pledge and DPDP note. Body scroll lock on drawer open.
    - **Dashboard Sticky Mobile Top Bar (`DashboardOverview.jsx`, `StorefrontDashboard.css`):** Added sticky `.sf-mobile-bar` (56px, blur backdrop) with store name, live green status pulse, trial days remaining pill, and account profile action button.
    - **Mobile Account & Profile Sheet (`DashboardOverview.jsx`):** Built dedicated bottom sheet modal for mobile access to storefront identity, user account email, trial status with 1-tap "Upgrade to Annual Pass" action, "Re-open setup wizard", "Open guest preview simulator", "View live public storefront page", and "Sign out".
    - **Bottom Nav Bar & Safe Area Padding (`StorefrontDashboard.css`):** Configured bottom navigation `.sf-dash .side` with `padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px))` and main workspace with `calc(88px + env(safe-area-inset-bottom, 0px))` bottom padding to eliminate button clipping across modern mobile viewports (e.g. iPhone home bar).
    - **Setup Wizard Mobile Hardening (`StorefrontDashboard.css`):** Made `.sf-dash .wz` padding responsive (12px/10px on small screens), `.wzc` max-height 92vh with 18px padding, and `.acts` action buttons full-width stacked on screens < 480px for thumb-friendly navigation.
    - **Full Production Build & Browser Verification:** 100% Vite production build success (`✓ built in 1m 1s`), automated mobile testing passed at 390×844 px across Landing Page, Dashboard, Account Sheet, Setup Wizard, and all 4 bottom tabs with zero layout overflows or clipping.

## ⏳ In Progress
- Field testing & walk-in validation of salon onboarding and review booster flow.

## 🔜 Next Up
1. **Finalize Pricing & Billing Architecture** (evaluate Annual Prepaid bundle vs Monthly UPI AutoPay).
2. Wire Monday Morning WhatsApp Push Digest cron.

## ❓ Open Decisions / Questions
1. **Pricing Decision (Pending User Finalization):** What exact price point and tier structure should we lock in for the India and International tracks? (Under active evaluation).
