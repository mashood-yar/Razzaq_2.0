(function () {
  const KEY = "razzaq-cart";
  const ORDER_KEY = "razzaqOrderConfirmation";
  const SHIPPING_PKR = 200;

  /** @type {Record<string, { type: 'pct' | 'fixed'; value: number }>} */
  const DISCOUNT_CODES = {
    LUXE10: { type: "pct", value: 10 },
    WELCOME500: { type: "fixed", value: 500 },
  };

  let currentStep = 1;
  let appliedCodeKey = "";

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
  }

  function formatRs(n) {
    return "Rs." + Number(n).toLocaleString("en-PK");
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function cartLineSum(cart) {
    let sub = 0;
    cart.forEach(function (item) {
      sub += item.price * item.qty;
    });
    return sub;
  }

  function discountPkrFor(subtotal) {
    if (!appliedCodeKey) return 0;
    const rule = DISCOUNT_CODES[appliedCodeKey];
    if (!rule) return 0;
    if (rule.type === "pct") return Math.round((subtotal * rule.value) / 100);
    return Math.min(rule.value, subtotal);
  }

  function computeTotals(cart) {
    const sub = cartLineSum(cart);
    const disc = discountPkrFor(sub);
    const grand = Math.max(0, sub - disc + SHIPPING_PKR);
    return { sub, disc, shipping: SHIPPING_PKR, grand };
  }

  function bindCartInteractions(itemsEl) {
    itemsEl.addEventListener("click", function (e) {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;

      const minus = t.closest("[data-qty-minus]");
      const plus = t.closest("[data-qty-plus]");
      const remove = t.closest("[data-remove-idx]");
      if (!minus && !plus && !remove) return;

      let cart = readCart();
      if (!cart.length) return;

      if (remove) {
        const idx = Number(remove.getAttribute("data-remove-idx"));
        cart = cart.filter(function (_, j) {
          return j !== idx;
        });
        writeCart(cart);
        renderPage();
        return;
      }

      const btn = minus || plus;
      const idx = Number(btn && btn.getAttribute("data-idx"));
      if (Number.isNaN(idx) || idx < 0 || idx >= cart.length) return;

      if (minus) {
        cart[idx].qty = Math.max(1, cart[idx].qty - 1);
      } else if (plus) {
        cart[idx].qty += 1;
      }
      writeCart(cart);
      renderPage();
    });
  }

  function renderCartLines(itemsEl, cart) {
    if (!itemsEl) return;
    itemsEl.innerHTML = cart
      .map(function (item, idx) {
        const line = item.price * item.qty;
        return (
          '<div class="checkout-line co-cart-line">' +
          '<img src="' +
          encodeURI(item.img) +
          '" alt="" width="56" height="56" loading="lazy">' +
          '<div class="co-cart-line__body">' +
          '<div class="co-cart-line__row">' +
          '<div class="checkout-line__meta">' +
          "<strong>" +
          escapeHtml(item.name) +
          "</strong>" +
          "<span>" +
          escapeHtml(item.priceText) +
          "</span>" +
          "</div>" +
          '<div class="co-cart-line__controls">' +
          '<div class="co-qty" role="group" aria-label="Quantity for ' +
          escapeHtml(item.name) +
          '">' +
          '<button type="button" data-qty-minus data-idx="' +
          idx +
          '" aria-label="Decrease quantity">−</button>' +
          "<span>" +
          item.qty +
          "</span>" +
          '<button type="button" data-qty-plus data-idx="' +
          idx +
          '" aria-label="Increase quantity">+</button>' +
          "</div>" +
          '<button type="button" class="co-line-remove" data-remove-idx="' +
          idx +
          '" aria-label="Remove item">×</button>' +
          "</div>" +
          "</div>" +
          '<div class="checkout-line__price">' +
          formatRs(line) +
          "</div>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function updateTotalsDom(cart) {
    const { sub, disc, shipping, grand } = computeTotals(cart);
    const subEl = document.getElementById("checkout-subtotal");
    const shipEl = document.getElementById("checkout-shipping");
    const totalEl = document.getElementById("checkout-total");
    const discRow = document.getElementById("checkout-discount-row");
    const discEl = document.getElementById("checkout-discount");

    if (subEl) subEl.textContent = formatRs(sub);
    if (shipEl) shipEl.textContent = formatRs(shipping);
    if (totalEl) totalEl.textContent = formatRs(grand);
    if (discRow && discEl) {
      if (disc > 0) {
        discRow.hidden = false;
        discEl.textContent = "−" + formatRs(disc);
      } else {
        discRow.hidden = true;
      }
    }
  }

  function renderPage() {
    const cart = readCart();
    const emptyEl = document.getElementById("checkout-empty");
    const flowEl = document.getElementById("checkout-flow");

    if (!cart.length) {
      if (emptyEl) emptyEl.hidden = false;
      if (flowEl) flowEl.hidden = true;
      currentStep = 1;
      setStep(1);
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    if (flowEl) flowEl.hidden = false;

    const itemsEl = document.getElementById("checkout-items");
    renderCartLines(itemsEl, cart);
    updateTotalsDom(cart);

    if (itemsEl && !itemsEl.dataset.bound) {
      bindCartInteractions(itemsEl);
      itemsEl.dataset.bound = "1";
    }
  }

  function setStep(step) {
    currentStep = Math.max(1, Math.min(3, step));

    for (var s = 1; s <= 3; s++) {
      const panel = document.getElementById("step-panel-" + s);
      const label = document.getElementById("step-label-" + s);
      if (panel) panel.hidden = s !== currentStep;
      if (label) {
        label.classList.remove("is-active", "is-done");
        if (s === currentStep) label.classList.add("is-active");
        else if (s < currentStep) label.classList.add("is-done");
      }
    }

    const backBtn = document.getElementById("checkout-back");
    const nextBtn = document.getElementById("checkout-next");
    const submitBtn = document.getElementById("checkout-submit");

    if (backBtn) backBtn.hidden = currentStep === 1;
    if (nextBtn) nextBtn.hidden = currentStep === 3;
    if (submitBtn) submitBtn.hidden = currentStep !== 3;
  }

  function validateStep1() {
    const ids = ["ship-name", "ship-phone", "ship-email", "ship-address", "ship-state"];
    for (var i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (el && !el.checkValidity()) {
        el.reportValidity();
        return false;
      }
    }
    return true;
  }

  function activePaymentMode() {
    const pm = document.getElementById("pay-method");
    return pm && pm.value === "card" ? "card" : "cod";
  }

  function validateStep2() {
    if (activePaymentMode() !== "card") return true;
    const fields = ["card-num", "card-exp", "card-cvv", "card-name"];
    for (var i = 0; i < fields.length; i++) {
      const el = document.getElementById(fields[i]);
      if (!el) continue;
      const v = el.value.trim();
      if (!v) {
        el.focus();
        return false;
      }
    }
    return true;
  }

  function fillReview() {
    const shipBlock = document.getElementById("review-shipping");
    const payBlock = document.getElementById("review-payment");
    const name = document.getElementById("ship-name")?.value.trim() || "";
    const email = document.getElementById("ship-email")?.value.trim() || "";
    const phone = document.getElementById("ship-phone")?.value.trim() || "";
    const address = document.getElementById("ship-address")?.value.trim() || "";
    const postal = document.getElementById("ship-postal")?.value.trim() || "";
    const state = document.getElementById("ship-state")?.value.trim() || "";
    const note = document.getElementById("ship-note")?.value.trim() || "";

    if (shipBlock) {
      var addrLines =
        escapeHtml(address) +
        (postal || state
          ? "<br>" +
            escapeHtml([state, postal].filter(Boolean).join(", "))
          : "");
      shipBlock.innerHTML =
        "<dt>Contact</dt><dd>" +
        escapeHtml(name) +
        "<br>" +
        escapeHtml(email) +
        "<br>" +
        escapeHtml(phone) +
        "</dd><dt>Delivery address</dt><dd>" +
        addrLines +
        "</dd>" +
        (note ? "<dt>Note</dt><dd>" + escapeHtml(note) + "</dd>" : "");
    }

    if (payBlock) {
      if (activePaymentMode() === "cod") {
        payBlock.innerHTML =
          "<dt>Payment</dt><dd>Cash on delivery — pay when your order arrives.</dd>";
      } else {
        const raw = document.getElementById("card-num")?.value.replace(/\s+/g, "") || "";
        const last4 = raw.slice(-4) || "••••";
        const holder = document.getElementById("card-name")?.value.trim() || "";
        payBlock.innerHTML =
          "<dt>Payment</dt><dd>Card ending <strong>" +
          escapeHtml(last4) +
          "</strong>" +
          (holder ? "<br>" + escapeHtml(holder) : "") +
          "<br><span style=\"font-size:12px;color:#6b7280\">Demo card — no charge processed.</span></dd>";
      }
    }
  }

  function wirePaymentTabs() {
    const tabs = document.querySelectorAll(".co-pay-tab");
    const codPanel = document.getElementById("pay-cod");
    const cardPanel = document.getElementById("pay-card");
    const payMethod = document.getElementById("pay-method");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        const panelId = tab.getAttribute("data-pay-panel");
        tabs.forEach(function (t) {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });
        if (codPanel) codPanel.hidden = panelId !== "pay-cod";
        if (cardPanel) cardPanel.hidden = panelId !== "pay-card";
        if (payMethod) payMethod.value = panelId === "pay-card" ? "card" : "cod";
      });
    });
  }

  function wireDiscount() {
    const applyBtn = document.getElementById("discount-apply");
    const input = document.getElementById("discount-code");
    const msg = document.getElementById("discount-msg");

    function flash(text, ok) {
      if (msg) {
        msg.textContent = text;
        msg.style.color = ok ? "rgba(15, 164, 175, 0.95)" : "rgba(248, 113, 113, 0.95)";
      }
    }

    if (applyBtn)
      applyBtn.addEventListener("click", function () {
        const raw = (input && input.value.trim()) || "";
        const key = raw.toUpperCase();
        if (!key) {
          appliedCodeKey = "";
          flash("Code cleared.", true);
          renderPage();
          return;
        }
        if (!DISCOUNT_CODES[key]) {
          flash("Invalid or expired code.", false);
          return;
        }
        appliedCodeKey = key;
        flash("Discount applied.", true);
        renderPage();
      });
  }

  function wireNav() {
    const nextBtn = document.getElementById("checkout-next");
    const backBtn = document.getElementById("checkout-back");

    if (nextBtn)
      nextBtn.addEventListener("click", function () {
        if (currentStep === 1) {
          if (!validateStep1()) return;
          setStep(2);
          return;
        }
        if (currentStep === 2) {
          if (!validateStep2()) return;
          fillReview();
          setStep(3);
        }
      });

    if (backBtn)
      backBtn.addEventListener("click", function () {
        setStep(currentStep - 1);
      });
  }

  function buildCityField() {
    const postal = document.getElementById("ship-postal")?.value.trim() || "";
    const state = document.getElementById("ship-state")?.value.trim() || "";
    const parts = [state, postal].filter(Boolean);
    return parts.join(", ");
  }

  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", async function (e) {
      if (currentStep !== 3) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const cart = readCart();
      if (!cart.length) return;

      const { sub, disc, shipping, grand } = computeTotals(cart);

      const name = document.getElementById("ship-name")?.value.trim() || "";
      const email = document.getElementById("ship-email")?.value.trim() || "";
      const phone = document.getElementById("ship-phone")?.value.trim() || "";
      const address = document.getElementById("ship-address")?.value.trim() || "";
      const postal = document.getElementById("ship-postal")?.value.trim() || "";
      const state = document.getElementById("ship-state")?.value.trim() || "";
      const note = document.getElementById("ship-note")?.value.trim() || "";
      const city = buildCityField();

      const orderId =
        "RZ-" +
        new Date().getFullYear() +
        "-" +
        Math.random().toString(36).slice(2, 10).toUpperCase();

      const payload = {
        orderId,
        placedAt: new Date().toISOString(),
        email,
        name,
        phone,
        address,
        city,
        postal: postal || undefined,
        state: state || undefined,
        note: note || undefined,
        paymentMethod: activePaymentMode(),
        items: cart.map(function (item) {
          return {
            slug: item.slug || null,
            name: item.name,
            qty: item.qty,
            priceText: item.priceText,
            price: item.price,
            img: item.img,
          };
        }),
        subtotal: sub,
        discount: disc,
        shipping,
        total: grand,
      };

      try {
        sessionStorage.setItem(ORDER_KEY, JSON.stringify(payload));
      } catch {
        /* ignore */
      }

      if (typeof window.RAZZAQ_syncOrderRemote === "function") {
        try {
          await window.RAZZAQ_syncOrderRemote(payload);
        } catch (err) {
          console.warn("Remote order sync", err);
        }
      }

      localStorage.removeItem(KEY);
      window.location.href = "order-confirmation.html";
    });
  }

  wirePaymentTabs();
  wireDiscount();
  wireNav();
  setStep(1);
  renderPage();
})();
