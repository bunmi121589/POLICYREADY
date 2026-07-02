// stripe.js — shared Stripe client and small helpers.
// Keys are read from environment variables ONLY. Never hard-code keys here.
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28", // pin the API version; matches Stripe Node SDK v17
});

// SITE_URL is your public site origin, e.g. https://policyready.org
// Used to build success/cancel URLs. Falls back to the request origin if unset.
function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = { stripe, siteUrl };
