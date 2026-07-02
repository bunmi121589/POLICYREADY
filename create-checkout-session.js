// POST /api/create-checkout-session   body: { slug: "tn-mh" }
// Returns: { url } — the Stripe-hosted checkout page to redirect the buyer to.
const { stripe, siteUrl } = require("./_lib/stripe");
const { getProduct, PRICE_CENTS, CURRENCY } = require("./_lib/catalog");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Vercel parses JSON bodies automatically; guard for string bodies too.
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const slug = body.slug;

    const product = getProduct(slug);
    if (!product) {
      // Reject unknown slugs so no one can invent a checkout for a non-product.
      return res.status(400).json({ error: "Unknown product." });
    }

    const origin = siteUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Omitting payment_method_types lets Stripe show dynamic payment methods
      // (card, Link, wallets) tuned for conversion.
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
      // The manual identity travels with the payment so delivery knows what to send.
      metadata: { slug },
      // Collect an email so we can also email the download (webhook fulfillment).
      customer_creation: "always",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/manuals/${encodeURIComponent(slug)}`, // adjust to your product URL pattern
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return res.status(500).json({ error: "Unable to start checkout. Please try again." });
  }
};
