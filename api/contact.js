// POST /api/contact — receives the Contact Us form and emails it to the team.
// Uses Resend if RESEND_API_KEY is set. If it isn't, the message is logged and
// the form is told email isn't configured yet (the page then shows the direct
// mailto fallback), so nothing errors ugly for the visitor.
const TO = "hello@policyready.org";
const FROM = process.env.FROM_EMAIL || "PolicyReady Contact <contact@policyready.org>";

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method-not-allowed" });
  try {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }
    body = body || {};

    const name = (body.name || "").toString().slice(0, 200);
    const email = (body.email || "").toString().slice(0, 200).trim();
    const subject = (body.subject || "Message").toString().slice(0, 200);
    const message = (body.message || "").toString().slice(0, 5000);
    const optIn = !!body.optIn;

    // Honeypot: real users never fill this hidden field. Silently accept + drop.
    if (body.company) return res.status(200).json({ ok: true });

    if (!email || !message) return res.status(400).json({ ok: false, error: "missing-fields" });

    if (!process.env.RESEND_API_KEY) {
      console.log("[contact] (email not configured) ", { name, email, subject, optIn, message });
      return res.status(503).json({ ok: false, error: "email-not-configured" });
    }

    const html =
      "<h2>New contact message</h2>" +
      "<p><strong>Name:</strong> " + escapeHtml(name || "(not given)") + "</p>" +
      "<p><strong>Email:</strong> " + escapeHtml(email) + "</p>" +
      "<p><strong>About:</strong> " + escapeHtml(subject) + "</p>" +
      "<p><strong>Wants updates:</strong> " + (optIn ? "Yes" : "No") + "</p>" +
      "<p><strong>Message:</strong></p><p>" + escapeHtml(message).replace(/\n/g, "<br>") + "</p>";

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: TO,
        reply_to: email,
        subject: "New contact: " + subject + " \u2014 " + (name || email),
        html: html,
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("[contact] resend error:", t);
      return res.status(502).json({ ok: false, error: "send-failed" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[contact] error:", err);
    return res.status(500).json({ ok: false, error: "server-error" });
  }
};
