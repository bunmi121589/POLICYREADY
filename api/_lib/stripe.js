// stripe.js — shared Stripe client and small helpers.
// Keys are read from environment variables ONLY. Never hard-code keys here.
const Stripe = require("stripe");

// No apiVersion pinned — Stripe uses your account's default version.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// SITE_URL is your public site origin, e.g. https://www.policyready.org
function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = { stripe, siteUrl };
