(function () {
  const STORAGE_KEY = "northbeamCheckoutConfirmation";

  const detailEl = document.getElementById("confirmation-detail");
  const emptyEl = document.getElementById("confirmation-empty");
  const emailEl = document.getElementById("confirmation-email-display");
  const refEl = document.getElementById("confirmation-reference");
  const dateEl = document.getElementById("confirmation-date");
  const planEl = document.getElementById("confirmation-plan");
  const subEl = document.getElementById("confirmation-subtotal");
  const discRow = document.getElementById("confirmation-discount-row");
  const discEl = document.getElementById("confirmation-discount");
  const taxEl = document.getElementById("confirmation-tax");
  const totalEl = document.getElementById("confirmation-total");

  function formatMoney(n) {
    return n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  }

  function formatWhen(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "—";
    }
  }

  let data = null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) data = JSON.parse(raw);
  } catch {
    data = null;
  }

  if (!data || typeof data !== "object") {
    if (emptyEl) emptyEl.classList.add("is-visible");
    if (detailEl) detailEl.hidden = true;
    return;
  }

  if (emptyEl) emptyEl.classList.remove("is-visible");
  if (detailEl) detailEl.hidden = false;

  if (emailEl) emailEl.textContent = data.email || "your inbox";
  if (refEl) refEl.textContent = data.reference || "—";
  if (dateEl && data.confirmedAt) {
    dateEl.textContent = "Processed " + formatWhen(data.confirmedAt);
  }
  if (planEl) {
    planEl.textContent =
      data.billing === "yearly" ? "Northbeam Pro — yearly" : "Northbeam Pro — monthly";
  }
  if (subEl) subEl.textContent = formatMoney(Number(data.subDisplay) || 0);
  if (taxEl) taxEl.textContent = formatMoney(Number(data.tax) || 0);
  if (totalEl) totalEl.textContent = formatMoney(Number(data.total) || 0);

  const discount = Number(data.discount) || 0;
  if (discRow && discEl) {
    if (data.billing === "yearly" && discount > 0) {
      discRow.hidden = false;
      discEl.textContent = "− " + formatMoney(discount);
    } else {
      discRow.hidden = true;
    }
  }

  sessionStorage.removeItem(STORAGE_KEY);
})();
