# Donations: how to test with your Fapshi sandbox keys

Everything below runs on your machine with your real keys. The automated checks already done for this build used mocks (127 unit tests, plus browser runs with the payment calls faked), so none of them proves that a real Fapshi sandbox payment or a real Firestore write works. This guide does.

Commands are for Windows PowerShell, from the project folder.

## What the automated checks did and did not cover

| Covered with mocks | Only you can check |
| --- | --- |
| Fapshi client: URL, headers, body, error handling | That your sandbox keys are accepted and return a payment link |
| Donation rules: pending, completed, failed, amount check | That Fapshi's real responses match what the code expects |
| Routes: validation, rate limit, origin check, error codes | Writes to your real Firestore with the service account |
| Donate and thank-you pages in English and French | The real Fapshi payment page and the return to the site |
| Admin table logic, with sample data | The admin table with your real donations |
| `firestore.rules` shape (a text check only) | Whether the published rules allow and deny what they should |

## 1. One-time setup

1. **Service account key.** Firebase console > Project settings > Service accounts > Generate new private key. This is free and does not need the Blaze plan. A JSON file downloads. Git already ignores files named like `*firebase-adminsdk*.json`, but never commit, e-mail or share it.
2. **`.env.local`.** Add these lines, with your own values (names only here, the file `.env.example` shows the layout):
   - `FIREBASE_ADMIN_CLIENT_EMAIL` = the `client_email` from the JSON.
   - `FIREBASE_ADMIN_PRIVATE_KEY` = the `private_key` from the JSON, in double quotes, on ONE line, with the `\n` sequences left as they are.
   - `FAPSHI_ENV=sandbox`
   - `FAPSHI_API_USER` and `FAPSHI_API_KEY` = your Fapshi personal sandbox keys. The key must start with `FAK_TEST_`.
   - `NEXT_PUBLIC_SITE_URL` = the address `npm run dev` prints, for example `http://localhost:3001`. Fapshi sends the donor back to this address.
3. **Restart** `npm run dev` after editing `.env.local` (Next reads it only at start).
4. **Rules.** The donation rules did not change in behaviour (only comments), but make sure the published rules match the file (see `SECURITY-CHECKLIST.md`, section 0), then run its section 4.

If a key is wrong or missing, the donate form shows "Online payments are not available right now" and the terminal where `npm run dev` runs prints the exact reason (which variable, or that a sandbox key does not match `FAPSHI_ENV`).

## 2. Check the server before using the website

Set the address once (use the one `npm run dev` prints), then start a payment directly. 100 XAF is Fapshi's minimum.

    $base = 'http://localhost:3001'
    try {
      Invoke-RestMethod -Method Post -Uri "$base/api/donate/initiate" `
        -ContentType 'application/json' `
        -Body '{"amount":100,"donorName":"Test Donor","donorEmail":"test@example.com","frequency":"one-time","programmeId":"","locale":"en"}'
    } catch { "$($_.Exception.Response.StatusCode.value__) $($_.ErrorDetails.Message)" }

Expected: an object with `donationId` and a `link` that starts with `https://`. Then open Firebase console > Firestore > `donations`: a new document with `status` = `pending` and a `fapshiTransactionId`.

If it fails you get a status code and an error code:

| You see | Meaning | What to do |
| --- | --- | --- |
| `503 payments_not_configured` | A key or variable is missing or does not match | Read the terminal line; fix `.env.local`; restart |
| `502 payment_unavailable` | Fapshi refused or did not answer | Terminal shows `Fapshi error NNN`. 401 or 403: wrong user or key. 400: Fapshi rejected the request, send me the message |
| `500 server_error` | Usually Firestore or the service account | Terminal shows the error. A `PERMISSION_DENIED` or `UNAUTHENTICATED` error means the key belongs to another project. A `DECODER routines` error usually means the private key lost its `\n` sequences or its quotes |
| `400 invalid_input` | The test body is wrong | Check the JSON |
| `429 rate_limited` | 30 payment starts per 10 minutes from one address | Wait. On your own machine every request counts as one address |

Important unknown: Fapshi's documentation I could read does not say whether personal sandbox keys, without a collection service, can create payment links. If Fapshi answers with a message about a missing service or permission, that is the cause, and I need that exact message.

## 3. Test through the website

Use small amounts. Every test creates a real document in your Firestore.

1. **Validation (English).** Open `/en/donate`, press the donate button with nothing filled in: the name and e-mail messages appear and the cursor moves to the name field. Choose "Other amount", type 50: "Enter an amount between 100 and 1,000,000 XAF."
2. **Monthly note.** Choose "Monthly": a note says each gift is a separate payment. Choose "One time": it disappears.
3. **Pay.** Fill the form with 100 or 500 XAF, press the button. The button says "Opening payment..." and you land on a Fapshi page. Approve the payment there. I could not confirm any Fapshi sandbox phone numbers (the lists I found belong to other payment companies and may not work), so use what the Fapshi sandbox page offers or Fapshi's own documentation.
4. **Return.** You come back to `/en/donate/thank-you?d=...`. It says "Checking your payment" and within a few seconds "Your gift went through" with the amount. Firestore: the document is now `completed`. This works without the webhook, because the page asks Fapshi itself.
5. **Failure.** Start another payment and cancel it or let it fail, if the sandbox lets you. The page should end on "The payment did not go through", and the document should be `failed` with a `failureReason`. If you cannot make the sandbox fail, skip this and tell me.
6. **French.** Repeat 1, 3 and 4 at `/fr/donate`. Check the wording, in particular the thank-you page and the error messages: the French was written by me, not a native speaker.
7. **Language switch.** On the thank-you page press FR: the page stays on your donation.
8. **Back button.** On the Fapshi page press back: the donate form must be usable again, not stuck on "Opening payment...".
9. **Phone width.** In the browser developer tools, set the width to 390 and check the donate form: nothing cut off on the right, and the button text wraps.

## 4. Check the admin

Sign in at `/admin` as an editor or administrator and open Donations.

- Your test donations are listed, newest first, with the programme name (or "General fund").
- "Received" adds up only completed donations. "Pending" and "Failed" count the others.
- The filter buttons show the counts and narrow the table.
- A pending donation older than a day says "Probably abandoned".
- A failed donation shows why. If one says "Needs review", Fapshi reported a different amount from the pledge: money may have arrived, so check the Fapshi dashboard.
- Sign in as a contributor: the Donations menu entry is missing, and opening `/admin/donations` shows "Only editors and administrators can see donations."

## 5. Webhook (optional)

Fapshi can call `POST /api/donate/webhook` when a payment changes. It needs a public address, so `localhost` cannot receive it, and I could not confirm whether personal sandbox keys let you set a webhook address. The site works without it, because the thank-you page checks with Fapshi. To try it anyway, put a tunnel in front of your dev server and give Fapshi the tunnel address plus `/api/donate/webhook`. You can also call it yourself, with the id of a payment you started (`fapshiTransactionId` in Firestore):

    try {
      Invoke-RestMethod -Method Post -Uri "$base/api/donate/webhook" `
        -ContentType 'application/json' -Body '{"transId":"PASTE_THE_ID_HERE"}'
    } catch { "$($_.Exception.Response.StatusCode.value__) $($_.ErrorDetails.Message)" }

Expected: `ok : True`, and the document takes the status Fapshi reports. A made-up id gives `502` (Fapshi does not know it), and a body without a `transId` gives `400 invalid_payload`. The route ignores any status written in the body.

## 6. Things that are expected

- **Monthly means one payment.** Nothing charges the donor again. The form and the thank-you page say so.
- **Pending records pile up** when donors close the Fapshi page. They are harmless and labelled "Probably abandoned" after a day.
- **Test donations are real documents.** The admin cannot delete donations (the rules forbid it). Delete your tests in the Firebase console before launch.
- **Only editors and administrators see donor names and e-mails.**

## 7. Before using live keys

1. Live keys from Fapshi and `FAPSHI_ENV=live`. The app refuses a sandbox key in live mode.
2. Set every variable above on your host (Vercel > Settings > Environment Variables, Production and Preview), the private key still on one line with `\n`.
3. `NEXT_PUBLIC_SITE_URL` = your real domain.
4. Give Fapshi your webhook address (`https://your-domain/api/donate/webhook`) if your account allows it.
5. Publish the rules, run `SECURITY-CHECKLIST.md` sections 4 and 5, and delete the test donations.
6. Make a small real donation yourself and watch it move from pending to completed.
7. Decide about monthly giving: today it records intent only.

## If something fails, send me

The terminal lines printed around the failure (with keys removed), the status code and error code from the website or from PowerShell, and the Firestore document fields for that donation (without e-mail addresses).
