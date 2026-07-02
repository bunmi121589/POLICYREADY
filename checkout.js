// checkout.js — drop this on any page with a buy button.
// Give your button:  <button class="buy-btn" data-slug="tn-mh">Buy — $200</button>
// (the data-slug must match a slug in api/_lib/catalog.js / your data.js)

(function () {
  async function startCheckout(slug, btn) {
    if (!slug) return;
    const original = btn ? btn.textContent : null;
    if (btn) { btn.disabled = true; btn.textContent = "Redirecting to secure checkout…"; }
    try {
      const resp = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await resp.json();
      if (data && data.url) {
        window.location.href = data.url; // Stripe-hosted checkout
      } else {
        throw new Error(data && data.error ? data.error : "Checkout failed");
      }
    } catch (err) {
      alert("Sorry — we couldn't start checkout. Please try again.");
      if (btn && original !== null) { btn.disabled = false; btn.textContent = original; }
    }
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".buy-btn");
    if (!btn) return;
    e.preventDefault();
    startCheckout(btn.getAttribute("data-slug"), btn);
  });
})();
