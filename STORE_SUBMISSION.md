# Quasar Salon — App Store & Google Play Submission Guide

This guide covers every manual step needed to submit Quasar Salon to the Apple App Store and Google Play Store. Complete all steps in order. Steps marked **[CODE DONE]** are already handled in the codebase; the rest require action in the store consoles.

---

## Before you start

### 1. Deploy the backend

The privacy policy and terms pages must be live at a stable HTTPS URL before submission.

1. Open the Replit project and click **Deploy** (Deployments tab).
2. Once deployed, note the production URL (e.g. `https://quasar-salon-api.replit.app`).
3. Verify both pages load in a browser:
   - `https://YOUR_BACKEND_DEPLOY_URL/privacy-policy`
   - `https://YOUR_BACKEND_DEPLOY_URL/terms`
4. Set `EXPO_PUBLIC_API_BASE_URL=https://YOUR_BACKEND_DEPLOY_URL` as an EAS secret (in Expo Dashboard → Project → Secrets) — `app.config.js` reads this value and injects the correct `privacyPolicyUrl` into both the iOS and Android builds automatically. **[CODE DONE — just set the secret]**

### 2. Build the binaries

```bash
# From the mobile/ directory
eas build --platform ios --profile production
eas build --platform android --profile production
```

The `eas.json` production profile already sets `autoIncrement: true`, `resourceClass: m-medium` for iOS, and `app-bundle` for Android. **[CODE DONE]**

---

## Apple App Store Connect

### App information

| Field | Value |
|---|---|
| Name | Quasar Salon |
| Subtitle (optional) | Premium Salon Booking |
| Bundle ID | `com.quasarsalon.app` |
| Primary language | English |
| Category | **Lifestyle** (set in App Store Connect; also declared via `LSApplicationCategoryType` in `infoPlist` — [CODE DONE]) |
| Secondary category | Health & Fitness (optional) |
| Age rating | **4+** (no objectionable content) |
| Privacy Policy URL | `https://YOUR_BACKEND_DEPLOY_URL/privacy-policy` |
| Support URL | `https://YOUR_BACKEND_DEPLOY_URL` or the salon's website |

### App description (suggested)

```
Quasar Salon — book your next appointment at Mumbai's premier luxury salon.

Browse 100+ services across 15 categories, add multiple treatments to your cart, pick a stylist, and confirm your appointment in seconds. View, reschedule, or cancel your upcoming bookings anytime.

Features:
• Full service menu — hair, skincare, nails, makeup, threading and more
• Real-time stylist availability
• Group bookings — bring friends and book together
• Instant email confirmation
• Sign in with Google, email, or a one-time code
• All payments handled in person at the salon
```

### Keywords (100-character limit)

`salon,booking,hair,beauty,spa,stylist,appointment,luxury,skincare,nails,makeup,Mumbai`

### Screenshots required

| Device | Size |
|---|---|
| iPhone 6.9" (required) | 1320 × 2868 px |
| iPhone 6.5" (required) | 1242 × 2688 px |
| iPad 13" Pro (required) | 2064 × 2752 px |

Tip: Use the Expo web preview or an iPhone simulator to capture these. At minimum, show the Home screen, Category/Service list, Booking flow (date/time/stylist selection), and the My Bookings tab.

### Privacy Nutrition Labels (App Privacy section in App Store Connect)

Answer every question truthfully. Based on the app's actual data collection:

**Data types collected:**

| Data type | Collected? | Linked to identity? | Used for tracking? | Purpose |
|---|---|---|---|---|
| Name | Yes | Yes | No | Account creation, booking display |
| Email address | Yes | Yes | No | Sign-in, booking confirmation emails |
| Phone number | Yes — optional | Yes | No | Salon contact for appointment changes |
| Photos or videos | Yes — optional | Yes | No | Profile photo chosen by user |
| User ID (Firebase UID) | Yes | Yes | No | Authenticate requests, link bookings to account |
| Booking data (service, date, time, stylist) | Yes | Yes | No | Core app functionality — scheduling |
| Crash data / device info | No | — | — | — |
| Location | No | — | — | — |
| Payment info | **No** | — | — | Payments are in person only |

**Purposes for data use:** App Functionality only (account management, booking management, transactional emails)

No analytics SDK is integrated. No data is used for advertising or cross-app tracking.

### Age rating questionnaire

Answer **None / No** to all content questions. The app contains:
- No violence
- No sexual content
- No gambling
- No profanity
- No user-generated content (open to the public)

Result: **4+**

### Review notes (for Apple reviewer)

```
Quasar Salon is a booking app for a physical salon. There are no in-app purchases
or payment screens — all payments are taken in person at the salon.

Test account:
  Email: reviewer@quasarsalon.com
  (Use "Sign in with Email" → request OTP code → enter the 6-digit code)

To test:
1. Sign in with the test email above.
2. Browse services on the Home or Search tab.
3. Add services to cart and tap "Book Appointment".
4. Select a date, time slot, and stylist.
5. Confirm the booking — a confirmation email will be sent.
6. View the booking in My Bookings tab.
```

---

## Google Play Console

### App information

| Field | Value |
|---|---|
| App name | Quasar Salon |
| Short description (80 chars) | Book appointments at Quasar Salon — Mumbai's premier luxury salon |
| Category | **Lifestyle** |
| Tags | Salon, Beauty, Booking, Appointment |
| Privacy Policy URL | `https://YOUR_BACKEND_DEPLOY_URL/privacy-policy` |
| App access | All functionality accessible — no login required to browse |

### Full description

Use the same text as the App Store description above (max 4 000 characters).

### Target audience

1. Go to **Store presence → Main store listing → App content → Target audience and content**.
2. Set **Target age group** to **Adults (18+)**.
3. Save and confirm.

### Content rating questionnaire

1. Go to **Policy → App content → Content rating**.
2. Click **Start questionnaire** → select category **Shopping** (this best fits a booking/commerce app; do not use Utilities or Lifestyle — Google's questionnaire uses broader categories than the store listing).
3. Answer **No** to all violence, sexual content, gambling, and controlled substance questions.
4. Resulting rating: **Everyone (3+)** (or equivalent for your region).

### Data Safety form

Go to **Policy → App content → Data safety** and fill in each section:

**Does your app collect or share any of the required user data types?** Yes

**Data collected and shared:**

| Category | Data type | Collected | Shared | Ephemeral? | Required? | Purpose |
|---|---|---|---|---|---|---|
| Personal info | Name | Yes | No | No | No | Account creation |
| Personal info | Email address | Yes | No | No | Yes | Sign-in, booking emails |
| Personal info | Phone number | Yes | No | No | No (optional) | Salon contact |
| Photos and videos | Photos | Yes | No | No | No (optional) | Profile photo |
| App activity | Booking history (service, date, stylist) | Yes | No | No | Yes | Core booking functionality |
| App info and performance | Crash logs | No | — | — | — | — |
| Financial info | Purchase history | **No** | — | — | — | No payments in app |
| Location | Precise or coarse location | **No** | — | — | — | — |

**Security practices:**

- [x] Data is encrypted in transit (HTTPS/TLS)
- [x] You provide a way for users to request data deletion (Profile → Delete Account)
- [ ] The app follows the Families Policy — **not applicable**

**Can users request data deletion?** Yes — via Profile → Delete Account inside the app.

### Screenshots required

| Type | Minimum |
|---|---|
| Phone screenshots | 2 (recommended: 4–8), PNG/JPEG, 16:9 or 9:16 |
| 7-inch tablet | Optional but recommended |
| 10-inch tablet | Optional |

Minimum phone screenshot size: **1080 × 1920 px**.

### Release track

1. Upload the AAB from `eas build`.
2. Start with **Internal testing** to verify the build installs correctly.
3. Promote to **Closed testing (Alpha)** to gather feedback.
4. Promote to **Production** when ready.

---

## Checklist before submitting

- [ ] Backend deployed and `/privacy-policy` + `/terms` URLs are live
- [ ] `EXPO_PUBLIC_API_BASE_URL` set as an EAS secret pointing to the deployed backend URL
- [ ] `eas build --platform ios --profile production` completed successfully
- [ ] `eas build --platform android --profile production` completed successfully
- [ ] App Store Connect: all fields filled, screenshots uploaded, Nutrition Labels complete
- [ ] App Store Connect: test account credentials added to review notes
- [ ] Google Play Console: target audience set to Adults (18+)
- [ ] Google Play Console: Data Safety form complete and saved
- [ ] Google Play Console: content rating questionnaire complete (Shopping category)
- [ ] Google Play Console: privacy policy URL saved
- [ ] Internal build tested on a real device before promoting to production
