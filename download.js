// api/download.js — PolicyReady.org File Delivery
// Verifies Stripe payment session, then serves the purchased .docx file
// Env vars needed: STRIPE_SECRET_KEY

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).send('Missing session ID');
  }

  try {
    // Retrieve and verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Only deliver if payment is complete
    if (session.payment_status !== 'paid') {
      return res.status(402).send('Payment not completed. Please complete your purchase and try again.');
    }

    // Get the file name from session metadata
    const fileName = session.metadata?.file;

    if (!fileName) {
      console.error('No file metadata on session:', session_id);
      return res.status(500).send('File metadata missing. Please contact support@policyready.org');
    }

    // Build the file path — files live in /downloads/ at the project root
    const filePath = path.join(process.cwd(), 'downloads', fileName);

    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).send('File not found. Please contact support@policyready.org');
    }

    // Serve the file as a download
    const fileBuffer = fs.readFileSync(filePath);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    return res.status(200).send(fileBuffer);

  } catch (err) {
    console.error('Download error:', err.message);

    if (err.type === 'StripeInvalidRequestError') {
      return res.status(400).send('Invalid session ID. Please contact support@policyready.org');
    }

    return res.status(500).send('Something went wrong. Please contact support@policyready.org');
  }
};
