// api/checkout.js — PolicyReady.org Stripe Checkout
// Creates a Stripe Checkout session for the requested product slug
// Env vars needed: STRIPE_SECRET_KEY

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ─── PRODUCT CATALOG ───────────────────────────────────────────────────────
// Replace price_REPLACE_ME with your actual Stripe Price IDs.
// Create each product in your Stripe dashboard at $150 one-time, then paste IDs here.
// File names must match exactly what you uploaded to the /downloads/ directory.

const PRODUCTS = {
  'co-individual': {
    name: 'Colorado — Policy & Procedure Manual for Host Home Provider',
    priceId: 'price_REPLACE_CO_IND',
    file: 'CO_Individual_Provider_JC_FINAL.docx',
  },
  'co-agency': {
    name: 'Colorado — Policy & Procedure Manual for Host Home Provider Agency',
    priceId: 'price_REPLACE_CO_AGY',
    file: 'CO_Agency_PASA_JC_FINAL.docx',
  },
  'az-individual': {
    name: 'Arizona — Policy & Procedure Manual for Developmental Home Provider',
    priceId: 'price_REPLACE_AZ_IND',
    file: 'AZ_Individual_Provider_JC_FINAL.docx',
  },
  'az-agency': {
    name: 'Arizona — Policy & Procedure Manual for Developmental Home Provider Agency',
    priceId: 'price_REPLACE_AZ_AGY',
    file: 'AZ_Agency_QualifiedVendor_JC_FINAL.docx',
  },
  'fl-individual': {
    name: 'Florida — Policy & Procedure Manual for Foster Care Facility Operator',
    priceId: 'price_REPLACE_FL_IND',
    file: 'FL_Individual_Operator_JC_FINAL.docx',
  },
  'fl-agency': {
    name: 'Florida — Policy & Procedure Manual for Foster Care Facility Agency',
    priceId: 'price_REPLACE_FL_AGY',
    file: 'FL_Agency_LicensedProvider_JC_FINAL.docx',
  },
  'tx-individual': {
    name: 'Texas — Policy & Procedure Manual for Host Home/Companion Care Provider',
    priceId: 'price_REPLACE_TX_IND',
    file: 'TX_Individual_HH_CC_Provider_JC_FINAL.docx',
  },
  'tx-agency': {
    name: 'Texas — Policy & Procedure Manual for HCS Program Provider',
    priceId: 'price_REPLACE_TX_AGY',
    file: 'TX_Program_Provider_JC_FINAL.docx',
  },
  'nm-individual': {
    name: 'New Mexico — Policy & Procedure Manual for Family Living Provider',
    priceId: 'price_REPLACE_NM_IND',
    file: 'NM_Individual_FamilyLiving_Provider_JC_FINAL.docx',
  },
  'nm-agency': {
    name: 'New Mexico — Policy & Procedure Manual for DDW Family Living Provider Agency',
    priceId: 'price_REPLACE_NM_AGY',
    file: 'NM_Provider_Agency_JC_FINAL.docx',
  },
  'ga-individual': {
    name: 'Georgia — Policy & Procedure Manual for Host Home/Life-Sharing Provider',
    priceId: 'price_REPLACE_GA_IND',
    file: 'GA_Individual_HostHome_Provider_JC_FINAL.docx',
  },
  'ga-agency': {
    name: 'Georgia — Policy & Procedure Manual for CRA Provider Agency',
    priceId: 'price_REPLACE_GA_AGY',
    file: 'GA_Agency_CRA_Provider_JC_FINAL.docx',
  },
  'ca-individual': {
    name: 'California — Policy & Procedure Manual for Family Home Provider (FHA)',
    priceId: 'price_REPLACE_CA_IND',
    file: 'CA_Individual_FamilyHome_Provider_JC_FINAL.docx',
  },
  'ca-agency': {
    name: 'California — Policy & Procedure Manual for Family Home Agency (FHA)',
    priceId: 'price_REPLACE_CA_AGY',
    file: 'CA_FamilyHomeAgency_JC_FINAL.docx',
  },
  'oh-individual': {
    name: 'Ohio — Policy & Procedure Manual for Shared Living Independent Provider',
    priceId: 'price_REPLACE_OH_IND',
    file: 'OH_Individual_SharedLiving_Provider_JC_FINAL.docx',
  },
  'oh-agency': {
    name: 'Ohio — Policy & Procedure Manual for Shared Living Agency Provider',
    priceId: 'price_REPLACE_OH_AGY',
    file: 'OH_Agency_SharedLiving_Provider_JC_FINAL.docx',
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.body;

  if (!slug || !PRODUCTS[slug]) {
    return res.status(400).json({ error: 'Invalid product' });
  }

  const product = PRODUCTS[slug];
  const origin = req.headers.origin || `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: product.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        slug,
        file: product.file,
      },
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop.html`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
