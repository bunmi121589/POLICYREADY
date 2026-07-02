// POST /api/checkout   body: { slug: "fl-sud" }
// Returns: { url } — Stripe-hosted checkout page to redirect the buyer to.
// (This is the endpoint your manual.html buy button already calls. It replaces
//  create-checkout-session.js — you can delete that older file.)
const { stripe, siteUrl } = require("./_lib/stripe");
const { getProduct, PRICE_CENTS, CURRENCY } = require("./_lib/catalog");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const slug = body.slug;

    const product = getProduct(slug);
    if (!product) {
      return res.status(400).json({ error: "Unknown product." });
    }

    const origin = siteUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: PRICE_CENTS, // $200.00, flat for every manual
            product_data: {
              name: product.title,
              description: "Editable Microsoft Word (.docx) policy & procedure manual — instant download.",
            },
          },
        },
      ],
      metadata: { slug },
      customer_creation: "always",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/manual.html?id=${encodeURIComponent(slug)}`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("checkout error:", err);
    return res.status(500).json({ error: "Unable to start checkout. Please try again." });
  }
};
