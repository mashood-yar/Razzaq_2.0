(function () {
  const ORDER_KEY = "razzaqOrderConfirmation";

  const detailEl = document.getElementById("order-detail");
  const emptyEl = document.getElementById("order-empty");

  const refEl = document.getElementById("order-ref");
  const dateEl = document.getElementById("order-date");
  const emailEl = document.getElementById("order-email");
  const shipEl = document.getElementById("order-ship-block");
  const itemsEl = document.getElementById("order-items");
  const subEl = document.getElementById("order-subtotal");
  const shipValEl = document.getElementById("order-shipping-val");
  const totalEl = document.getElementById("order-grand-total");

  function formatRs(n) {
    return "Rs." + Number(n).toLocaleString("en-PK");
  }

  function formatWhen(iso) {
    try {
      return new Date(iso).toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "—";
    }
  }

  let data = null;
  try {
    const raw = sessionStorage.getItem(ORDER_KEY);
    if (raw) data = JSON.parse(raw);
  } catch {
    data = null;
  }

  if (!data || !data.orderId) {
    if (emptyEl) emptyEl.hidden = false;
    if (detailEl) detailEl.hidden = true;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (detailEl) {
    detailEl.hidden = false;
    detailEl.removeAttribute("hidden");
  }

  if (refEl) refEl.textContent = data.orderId;
  if (dateEl) dateEl.textContent = formatWhen(data.placedAt);
  if (emailEl) emailEl.textContent = data.email || "—";

  if (shipEl) {
    shipEl.innerHTML =
      "<strong>" +
      escapeHtml(data.name || "") +
      "</strong><br>" +
      escapeHtml(data.address || "") +
      "<br>" +
      escapeHtml(data.city || "") +
      (data.phone ? "<br>Tel: " + escapeHtml(data.phone) : "");
  }

  if (itemsEl && Array.isArray(data.items)) {
    itemsEl.innerHTML = data.items
      .map(function (item) {
        const line = item.price * item.qty;
        return (
          '<div class="order-line">' +
          '<img src="' +
          encodeURI(item.img) +
          '" alt="" width="48" height="48" loading="lazy">' +
          '<div><strong>' +
          escapeHtml(item.name) +
          "</strong><br><span>" +
          item.qty +
          " × " +
          escapeHtml(item.priceText) +
          "</span></div>" +
          "<strong>" +
          formatRs(line) +
          "</strong></div>"
        );
      })
      .join("");
  }

  if (subEl) subEl.textContent = formatRs(data.subtotal);
  const discRow = document.getElementById("order-discount-row");
  const discValEl = document.getElementById("order-discount-val");
  const disc = Number(data.discount) || 0;
  if (discRow && discValEl) {
    if (disc > 0) {
      discRow.hidden = false;
      discValEl.textContent = "−" + formatRs(disc);
    } else {
      discRow.hidden = true;
    }
  }
  if (shipValEl) shipValEl.textContent = formatRs(data.shipping);
  if (totalEl) totalEl.textContent = formatRs(data.total);

  try {
    sessionStorage.removeItem(ORDER_KEY);
  } catch {
    /* ignore */
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }
})();
