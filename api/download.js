// GET /api/download?session_id=cs_...
// Verifies the Checkout Session was actually PAID, then streams the purchased
// .docx as an attachment. This is what the success page calls. Because it
// re-checks payment status with Stripe on every request, the file is never
// reachable without a completed purchase.
const fs = require("fs");
const path = require("path");
const { stripe } = require("./_lib/stripe");
const { getProduct } = require("./_lib/catalog");

// Purchased files live OUTSIDE any public folder, bundled with the function.
const FILES_DIR = path.join(__dirname, "_files");

module.exports = async function handler(req, res) {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.status(400).send("Missing session_id.");

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid") {
      return res.status(402).send("Payment not completed for this session.");
    }

    const slug = session.metadata && session.metadata.slug;
    const product = getProduct(slug);
    if (!product) return res.status(404).send("Product not found for this purchase.");

    const filePath = path.join(FILES_DIR, product.file);
    if (!fs.existsSync(filePath)) {
      console.error("Missing file on server:", product.file);
      return res.status(500).send("File temporarily unavailable. We have emailed your copy; please contact support if it does not arrive.");
    }

    const data = fs.readFileSync(filePath);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${product.file}"`);
    res.setHeader("Content-Length", data.length);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(data);
  } catch (err) {
    console.error("download error:", err);
    return res.status(500).send("Unable to prepare your download. Please contact support.");
  }
};
