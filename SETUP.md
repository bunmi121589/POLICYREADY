# PolicyReady — Stripe Checkout + Download Delivery: Go-Live Guide

Flat **$200** per manual. No Stripe product needs to be created per manual — the
checkout builds the $200 line item on the fly and remembers which manual was
bought. On payment, the buyer gets an instant download **and** an emailed link.

## What's in this package

```
api/
  _lib/catalog.js              <- the 60 products (slug -> title + file). THE seam with your data.js.
  _lib/stripe.js               <- Stripe client (reads keys from env only)
  create-checkout-session.js   <- POST: starts checkout for a slug
  download.js                  <- GET: verifies payment, streams the .docx
  webhook.js                   <- POST: reliable fulfillment + email
  _files/                      <- the 60 .docx manuals (delivered after payment; NOT public)
public/
  checkout.js                  <- front-end: wires "buy" buttons
  success.html                 <- post-payment page that auto-downloads
package.json                   <- adds the `stripe` dependency
```

Drop `api/` and `public/` into your repo root (merge `public/` into your existing
public/static folder), then follow the steps below.

---

## Step 1 — In Stripe (you do this; ~5 min)

1. Log in at dashboard.stripe.com. Stay in **Test mode** until the whole flow works, then repeat in **Live mode**.
2. Developers -> **API keys**. Copy your **Secret key** (`sk_test_...`). You'll paste it into Vercel in Step 3 — not into any file.
3. Developers -> **Webhooks** -> **Add endpoint**:
   - Endpoint URL: `https://policyready.org/api/webhook`
   - Event to send: **`checkout.session.completed`**
   - Create it, then copy the **Signing secret** (`whsec_...`).

> I can't type your Stripe keys for you — they authorize charges on your account,
> so you paste them directly into Vercel's settings. Everything else is automated.

## Step 2 — (Optional) Email delivery

The success page already downloads the file. To *also* email a link (recommended —
buyers sometimes close the tab), add an email sender:
- Create a free Resend account, verify `policyready.org`, copy the API key (`re_...`).
- You'll add `RESEND_API_KEY` and `FROM_EMAIL` in Step 3.
- Skip this and the webhook still runs; it just logs instead of emailing.

## Step 3 — In Vercel (you do this)

Project -> **Settings -> Environment Variables**. Add:

| Name | Value | Notes |
|------|-------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_...` (then `sk_live_...`) | from Step 1 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | from Step 1 |
| `SITE_URL` | `https://policyready.org` | your live origin |
| `RESEND_API_KEY` | `re_...` | optional (Step 2) |
| `FROM_EMAIL` | `PolicyReady <orders@policyready.org>` | optional |

Add them to **Production** (and Preview if you test there). Redeploy after saving.

## Step 4 — Wire your buy buttons

On each manual's detail page, include the script once and give the button a slug:

```html
<script src="/checkout.js" defer></script>

<button class="buy-btn" data-slug="tn-mh">Buy — $200</button>
```

The `data-slug` must match a key in `api/_lib/catalog.js` (e.g. `tn-mh`, `ca-mh`,
`sc-mh`, `fl-sud`, ...). If your detail pages already know the manual's slug from
`data.js`, output it straight into `data-slug` and you're done.

**The one thing to check:** the slugs in `catalog.js` are my sensible guesses.
Make sure each matches the slug your `data.js` / URLs already use. If they differ,
either rename in `catalog.js` or point `getProduct()` at your `data.js`. That's
the single integration seam — everything else needs no changes.

## Step 5 — Test, then flip to live

1. Deploy. Click a real buy button. On the Stripe page use test card `4242 4242 4242 4242`, any future expiry, any CVC/ZIP.
2. Confirm: you land on `success.html`, the `.docx` downloads, and (if email is set) the link arrives.
3. Check Stripe -> Payments shows $200, and the webhook shows a `200`.
4. Swap the two Stripe values in Vercel for their **live** (`sk_live_`, `whsec_`) versions, redeploy, and do one real $200 purchase to confirm. You're live.

---

## How delivery stays secure
`download.js` re-asks Stripe "is this session actually paid?" on every request
before sending the file, and the `.docx` files live in `api/_files/` (served only
by the function, never as public URLs). No payment, no file.

## Adding future products
Add a line to `catalog.js` (`"slug": { title, file }`), drop the `.docx` in
`api/_files/`, add a button with that `data-slug`. No Stripe changes needed —
still one flat $200.
