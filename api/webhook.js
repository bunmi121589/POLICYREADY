// POST /api/webhook  — Stripe calls this. This is the RELIABLE fulfillment path:
// even if the buyer closes the tab before the success page loads, this fires and
// emails them their download link. Stripe strongly recommends fulfilling on the
// webhook, not the browser redirect.
//
// Requires the raw request body for signature verification, so body parsing is
// disabled below.
const { stripe, siteUrl } = require("./_lib/stripe");
const { getProduct } = require("./_lib/catalog");

module.exports.config = { api: { bodyParser: false } };

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Optional email delivery. If RESEND_API_KEY is set, we email the buyer their
// download link. If not, we just log — checkout + success-page download still work.
async function emailDownloadLink({ to, title, url }) {
  if (!process.env.RESEND_API_KEY || !to) {
    console.log(`[fulfillment] ${title} purchased by ${to || "unknown"} -> ${url}`);
    return;
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || "PolicyReady <orders@policyready.org>",
      to,
      subject: `Your download: ${title}`,
      html: `<p>Thank you for your purchase.</p>
             <p><strong>${title}</strong></p>
             <p><a href="${url}">Click here to download your editable Word manual</a>.</p>
             <p>If you have any trouble, just reply to this email.</p>`,
    }),
  });
}

module.exports = async function handler(req, res) {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    const buf = await rawBody(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    try {
      const slug = session.metadata && session.metadata.slug;
      const product = getProduct(slug);
      const to = session.customer_details && session.customer_details.email;
      if (product) {
        const url = `${siteUrl(req)}/api/download?session_id=${session.id}`;
        await emailDownloadLink({ to, title: product.title, url });
      }
    } catch (err) {
      console.error("Fulfillment error:", err);
      // Return 200 anyway so Stripe doesn't retry forever; investigate via logs.
    }
  }

  return res.status(200).json({ received: true });
};
