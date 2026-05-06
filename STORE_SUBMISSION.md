# Quasar Salon — App Store & Google Play Submission Guide

This guide covers every manual step needed to submit Quasar Salon to the Apple App Store and Google Play Store. Complete all steps in order. Steps marked **[CODE DONE]** are already handled in the codebase; the rest require action in the store consoles.

---

## Before you start

### 1. Deploy the backend

The privacy policy and terms pages must be live at a stable HTTPS URL before submission.

1. Open the Replit project and click **Deploy** (Deployments tab).
2. Once deployed, note the production URL (e.g. `https://quasar-salon-backend.replit.app`).
3. Verify both pages load in a browser:
   - `https://YOUR_BACKEND_DEPLOY_URL/privacy-policy`
   - `https://YOUR_BACKEND_DEPLOY_URL/terms`
4. Replace `YOUR_BACKEND_DEPLOY_URL` in `mobile/app.json` (both `ios.privacyPolicyUrl` and `android.privacyPolicyUrl`) with the real URL, then rebuild.

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
| Category | **Lifestyle** |
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

| Data type | Collected? | Linked to identity? | Used for tracking? |
|---|---|---|---|
| Name | Yes | Yes | No |
| Email address | Yes | Yes | No |
| Phone number | Yes (optional) | Yes | No |
| Photos or videos | Yes (optional profile photo) | Yes | No |
| User ID | Yes | Yes | No |
| Crash data | No | — | — |
| Coarse location | No | — | — |
| Payment info | **No** | — | — |

**Purposes for data use:** App Functionality, Analytics (crash/reliability only)

No data is used for third-party advertising or tracking.

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

### Content rating questionnaire

1. Go to **Policy → App content → Content rating**.
2. Click **Start questionnaire** → select category **Utilities**.
3. Answer **No** to all violence, sexual content, and controlled substance questions.
4. Resulting rating: **Everyone (3+)**.

### Data Safety form

Go to **Policy → App content → Data safety** and fill in each section:

**Does your app collect or share any of the required user data types?** Yes

**Data collected and shared:**

| Category | Data type | Collected | Shared | Ephemeral? | Required? | Purpose |
|---|---|---|---|---|---|---|
| Personal info | Name | Yes | No | No | No (optional) | App functionality |
| Personal info | Email address | Yes | No | No | Yes | App functionality, Account management |
| Personal info | Phone number | Yes | No | No | No (optional) | App functionality |
| Photos and videos | Photos | Yes | No | No | No (optional) | App functionality |
| App activity | App interactions | Yes | No | No | Yes | App functionality |
| App info and performance | Crash logs | No | — | — | — | — |
| Financial info | Purchase history | **No** | — | — | — | — |
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
- [ ] `YOUR_BACKEND_DEPLOY_URL` replaced in `mobile/app.json`
- [ ] `eas build --platform ios --profile production` completed successfully
- [ ] `eas build --platform android --profile production` completed successfully
- [ ] App Store Connect: all fields filled, screenshots uploaded, Nutrition Labels complete
- [ ] App Store Connect: test account credentials added to review notes
- [ ] Google Play Console: Data Safety form complete and saved
- [ ] Google Play Console: content rating questionnaire complete
- [ ] Google Play Console: privacy policy URL saved
- [ ] Internal build tested on a real device before promoting to production
