(function () {
  const form = document.getElementById("saas-checkout-form");
  if (!form) return;

  const monthlyRadio = document.getElementById("plan-monthly");
  const yearlyRadio = document.getElementById("plan-yearly");
  const subEl = document.getElementById("summary-subtotal");
  const discountRow = document.getElementById("summary-discount-row");
  const discountEl = document.getElementById("summary-discount");
  const taxEl = document.getElementById("summary-tax");
  const totalEl = document.getElementById("summary-total");
  const cycleNote = document.getElementById("summary-cycle");
  const payBtn = document.getElementById("btn-pay-submit");

  const MONTHLY = 49;
  const YEARLY = 468;
  const TAX_RATE = 0.08;
  const STORAGE_KEY = "northbeamCheckoutConfirmation";

  function formatMoney(n) {
    return n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  }

  function computeTotals() {
    const yearly = yearlyRadio.checked;
    let subDisplay;
    let discount;
    let taxable;

    if (yearly) {
      subDisplay = MONTHLY * 12;
      discount = subDisplay - YEARLY;
      taxable = YEARLY;
    } else {
      subDisplay = MONTHLY;
      discount = 0;
      taxable = MONTHLY;
    }

    const tax = Math.round(taxable * TAX_RATE * 100) / 100;
    const total = taxable + tax;

    return { yearly, subDisplay, discount, taxable, tax, total };
  }

  function updateTotals() {
    const t = computeTotals();

    subEl.textContent = formatMoney(t.subDisplay);
    if (t.yearly && t.discount > 0) {
      discountRow.hidden = false;
      discountEl.textContent = "− " + formatMoney(t.discount);
    } else {
      discountRow.hidden = true;
    }
    taxEl.textContent = formatMoney(t.tax);
    totalEl.textContent = formatMoney(t.total);
    cycleNote.textContent = t.yearly
      ? "Billed annually. Renews automatically unless cancelled."
      : "Billed monthly. Cancel anytime before your next invoice.";
    if (payBtn && !payBtn.disabled) {
      payBtn.textContent = "Pay " + formatMoney(t.total);
    }
  }

  monthlyRadio.addEventListener("change", updateTotals);
  yearlyRadio.addEventListener("change", updateTotals);

  updateTotals();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const emailEl = document.getElementById("email");
    const email = emailEl ? emailEl.value.trim() : "";
    const t = computeTotals();
    const reference = "NB-2026-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          email: email || "—",
          billing: t.yearly ? "yearly" : "monthly",
          subDisplay: t.subDisplay,
          discount: t.discount,
          tax: t.tax,
          total: t.total,
          reference,
          confirmedAt: new Date().toISOString(),
        })
      );
    } catch {
      /* ignore quota / private mode */
    }

    if (payBtn) {
      payBtn.disabled = true;
      payBtn.textContent = "Redirecting…";
    }

    window.location.href = "payment-confirmation.html";
  });
})();
