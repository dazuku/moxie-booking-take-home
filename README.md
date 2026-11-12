# Moxie booking flow: take-home

A three-step public booking page for an independent medspa: **Contact → Payment → Confirmation**.

- **Live:** https://moxie-booking-take-home.vercel.app
- **Code:** https://github.com/dazuku/moxie-booking-take-home

## Who this is for and why it matters

**The user** is a patient booking with an independent practice, most often on a phone, from a link the practice shared. They have already chosen their services; now they hand over their details and a card.

**The practice** wants that booking to go through, and to happen. The card is held, not charged, to protect against no-shows and late cancellations. For a solo injector a single no-show is a large share of the day's revenue; for a multi-provider practice the same flow has to work across providers and locations.

**The problem this page solves:** turn "interested" into "booked" with as little friction as possible, while still getting a valid card and an accepted cancellation policy.

**How I would know it works** (metrics I would instrument first):

| Metric | Why |
|---|---|
| Completion rate per step (Contact → Payment → Booked) | Payment is where a card is asked for, so it is where drop-off is most likely |
| Validation errors per field | Shows which field confuses patients (e.g. phone format, expiry) |
| Completion rate on phones vs desktop | Most patients book on a phone |
| Time to complete | Friction proxy |
| Downstream: no-show rate | The business reason for holding a card |

## What I built

- All three screens from the Figma, responsive for phone, tablet and desktop.
- Validation on every field, shown when the patient leaves a field and updated live while they fix it. Pressing Continue / Book lists every problem and moves focus to the first one.
- On **Book appointment** the booking is printed to the console (`Booking submitted: {…}`) and the page switches to the confirmation.
- Unit tests (Vitest + Testing Library) and end-to-end journeys (Playwright) on desktop and on a phone.

### Where I deliberately differ from the Figma, and why

| Change | Why |
|---|---|
| **Services summary from the first screen** (reusing the Services card from the mobile confirmation frame) | The patient chose these services earlier. Asking for their details and a card without showing what it is for, or the total, is a trust gap at the steps where people drop off. |
| **One action on Payment** ("Book appointment"); the desktop frame also had a footer "Continue" | Two buttons for the same action at the highest-friction step is confusing. Mobile already had one. |
| **Back button** on Payment | Without it, a patient who mistyped their email could not fix it, and the confirmation would go nowhere. |
| **Phone order on Payment:** card form first, summary below | The patient lands on the fields; the total is one scroll away. On Contact the summary comes first, so they see what they are booking before typing. |
| **Confirmation names the email** ("sent to jane@example.com") | A typo in the address becomes obvious immediately. |
| **Tablet uses the stacked layout until 1024px** | At 768px the two-column layout squeezed the address into broken lines. |
| Example placeholders ("Jane Doe", "(619) 555-0123") instead of "Input text"; policy copy typo fixed ("will be held") | Clarity. |

## Running it locally

Requires Node.js 20.9 or newer (developed on Node 26).

```bash
npm ci
npm run dev                     # http://localhost:3000 → redirects to /booking/gold-spa
```

Tests:

```bash
npm run test:run                # unit and component tests (Vitest)
npx playwright install chromium # first time only
npm run test:e2e                # end-to-end journeys on desktop and phone (Playwright)
```

## Technical decisions and trade-offs

- **Next.js App Router.** The practice card and services summary are Server Components and ship no JavaScript; only the booking form is a client component. That is a clean boundary to reason about, and a useful talking point for an incremental Pages → App migration, since both routers can live in one app. Trade-off: more concepts than Pages Router, and it differs from Moxie's current code.
- **Tailwind + shadcn/ui (Radix).** Fast to match the Figma, accessible primitives, no styling runtime. Design tokens sampled from the Figma live as CSS variables in `globals.css`, so every component picks them up.
- **react-hook-form + zod.** One schema per step; the schema also normalises data (phone stored as `+16195550123`, card number without spaces).
- **Single URL with the step in client state.** Simplest, and the payment step is not reachable by URL. Trade-off: a refresh restarts the flow, and the browser Back button leaves the page.
- **Both forms stay mounted; the inactive one is hidden.** Going Back to fix an email never wipes the card already typed.
- **Validation on leaving a field.** Side effect found in testing: an error appearing on mouse-down pushed the Book button down and the click was lost. Those controls keep focus on mouse-down, so the click lands. Covered by e2e tests.
- **The whole booking, card number included, is logged,** because the brief asks for the booking data in the console. In production card data would never touch our code or logs: it would go straight to the payment provider and we would only keep a token, the card brand and the last 4 digits.
- **Unknown practice URLs** show the 404 page but return HTTP 200 with `noindex`, a side effect of streaming with Next 16 Cache Components. Acceptable here; with a real API I would revisit.
- **Light theme only.** The design is light-only; a test guards that dark-mode devices still get white inputs.
- **Dependencies pinned** to exact versions (`.npmrc` `save-exact=true`).

## Assumptions

- Services (and in the real flow, date and time) were chosen in earlier steps. I use the two Botox services from the Figma as sample data; there is no date or time to show.
- US patients: US phone numbers and ZIP codes.
- One practice (Gold Spa), served from a local data file standing in for an API.
- The confirmation email is sent by the backend; this page only says where it went.
- The cancellation fee comes from the practice's data ($50 here), not hard-coded in the copy.

## Out of scope, and why

- **Real payments, an API and persistence**: the brief asks for a console log.
- **Date and time selection**: part of earlier steps in the real flow.
- **Analytics**: listed under metrics above; it would be the first follow-up.
- **Per-step URLs**: the next step if we want browser Back to move between steps.
- **Dark mode, other countries, other languages**: not in the design or the brief.

## Scope change: "Can we add an SMS opt-in checkbox to Contact Information?"

**First, questions for the PM**, because the answers change what we build:

1. **What will we send?** Appointment reminders (transactional) or marketing? Reminders may already be covered by the "automated transactional messages" note on the payment screen; marketing needs explicit consent, separate from booking.
2. **Who sends them?** The practice with its own tools, or through Moxie's messaging? If Moxie sends them, the platform must honour the consent it collects: consent stored on the patient (not the booking), STOP handled across every location, transactional and marketing tracked separately, and carrier registration for business texting.
3. **Who signs off the consent wording?** (Legal / compliance; this is a TCPA question.)
4. **Must it ship in this release?**

**What I would change in this implementation:**

- `smsOptIn` in the contact schema: **unchecked by default and optional**; booking never depends on it.
- A checkbox under Phone with the disclosure (what we send, how often, "Msg & data rates may apply", "Reply STOP to opt out").
- The booking stores proof of consent, not just `true`: `{ optedIn, consentVersion, consentedAt }`.
- Whether the checkbox appears and its wording come from the **practice's settings**, with a compliant default from Moxie. A practice that only sends reminders should not ask for marketing consent it will never use.
- Reuse what exists: the phone is already stored in the format SMS providers need, and the checkbox (with the lost-click fix) can become a shared consent component.
- Tests first: unchecked by default, booking works without it, consent record in the logged booking.
- Estimate: ~1–2 hours for the form, plus legal copy. The platform side, if Moxie sends the texts, is a separate project with its own owner.

**How it differs by practice size:**

| | Small (solo injector) | Medium (multi-provider, front desk) | Large (multi-location) |
|---|---|---|---|
| Main need | Reminders with zero setup and compliant defaults | Two-way replies to the front desk, templates, consent visible to staff | Consent shared across locations, audit trail, campaigns and segmentation |
| Metric | No-show and rebooking rate | Front-desk time saved, no-shows | Consent coverage, opt-out rate per campaign |

**How I would handle it:** reply quickly and positively, ask the questions above, and give the cost openly. If it is not needed for launch, ship the current scope on time and do it as the next PR; if it is, say what moves. Loop in design (no checkbox in the Figma), legal and the backend owner, and write the decision in the ticket. I would not ship the checkbox on its own if nothing downstream can honour the consent: collecting a "yes" we cannot respect is a compliance risk, not a quick win.

## How I used AI

I built this with **Claude Code** (Anthropic's coding agent, in the terminal) as a pair programmer, in small reviewed slices: page shell, contact step, payment step, confirmation, README.

- **I made the decisions; the AI laid out options.** For example: App Router vs Pages Router and MUI vs Tailwind (I asked for a pros-and-cons comparison before choosing), a single URL, one action on Payment, required policy checkbox, no minimum length on the name, showing the services summary from the first screen and its phone layout (after asking for a preview), and how to fix the lost-click bug.
- **The AI did the legwork:** scaffolding, reading the Next 16 docs bundled with the package, sampling colours from the Figma exports, writing tests before code, and checking every slice in a real browser with Playwright screenshots on phone, tablet and desktop.
- **Where it got things wrong, and how that was caught:**
  - It dropped shadcn's dark-mode setting when rewriting the theme, which turned inputs grey on dark-mode devices. I noticed it; we added a regression test, then fixed it.
  - A refactor made Continue and Back share one `<button>`, so Back submitted the contact form again. An existing e2e test caught it.
  - Zod skips cross-field checks when another field fails, which would have hidden the CVV error. A unit test written for that case caught it.
- I reviewed each slice before committing, and I can walk through any line.

## What I would do next

In priority order. Where there is more than one way to do it, I list the options; the choice depends on what the platform already has.

1. **Measure before changing more.** Track an event per step and per validation error, split by device, so the metrics above exist. This also tells us whether my changes to the Figma (summary from the first screen, one action on Payment) help or hurt; they are good candidates for an A/B test.

2. **Connect with the payment provider.** Card data should never touch our code; we keep a token, the brand and the last 4 digits. Options:
   - Card fields embedded from the provider: keeps this design, smallest compliance scope.
   - The provider's hosted checkout page: least work, least control over the experience.
   - Digital wallets: fewest taps on a phone.

   Product question to settle first: "hold the card" can mean saving it for a later charge or authorising an amount now (which expires after a few days). That changes what the policy text must say.

3. **Don't lose progress on a refresh, a closed tab or the browser Back button.** Options, which can be combined:
   - **Browser session storage:** survives a refresh in the same tab and goes away when it closes. Simple; never store card data there.
   - **State in the URL**, as Moxie's booking flow already does with its `payload` parameter: survives a refresh, can be shared, and makes browser Back work per step. Only non-personal state (services, date, step) belongs there, because URLs end up in history and logs.
   - **A draft booking saved on the server after the Contact step:** the patient can resume from another device via a link, the slot can be held while they pay, and the practice can follow up on unfinished bookings (within the patient's messaging consent).
   - Whichever we choose, a guard so Payment can't be opened without a valid Contact step.

4. **Recognise returning patients.** Many treatments repeat every few months. Recognising a known email or phone could pre-fill details and offer the card on file, turning a repeat booking into a couple of taps.

5. **Complete the summary and the confirmation** once the earlier steps exist: date, time, provider and location in the summary, and "add to calendar" on the confirmation.

6. **Let patients change their booking after confirming**, without calling the practice or booking again. A patient who can't easily reschedule is more likely to simply not show up, and every change made online is a call the front desk doesn't take. I'd measure self-service changes, calls to the practice about bookings, and no-shows. Two kinds of change, treated differently:
   - **Details that don't affect the appointment** (full name, phone, visit reason): editable at any time. The practice sees the update, and an updated visit reason helps the provider prepare. A new phone number needs its messaging consent confirmed again; a new email should be verified before confirmations go there.
   - **Changes to the appointment itself** (date, time, services): a reschedule or cancel flow that applies the practice's cancellation window and fee, and tells the patient clearly if a fee applies before they confirm.

   Ways to give access, from cheapest to most complete:
   - **On the confirmation screen, right after booking:** "Not your email? Fix it". Catches typos while the patient is still there.
   - **A secure link in the confirmation message:** no account or password needed; the link only opens that booking.
   - **A patient portal:** all bookings in one place; worth it once patients book repeatedly.

7. **Per-practice settings for small and large practices:** cancellation window and fee, which fields are required, and the consent wording, with sensible defaults so a solo practice doesn't have to configure anything.

8. **Quality guards:** automated accessibility checks in the test suite, and a performance budget for phones on slow connections.

9. **The SMS opt-in**, once the questions above are answered.
