(function () {
  const KEY = "razzaq-cart";

  const btn = document.getElementById("add-to-cart-btn");
  if (!btn) return;

  const img = btn.getAttribute("data-img") || "";
  const name = btn.getAttribute("data-name") || "";
  const priceText = btn.getAttribute("data-price-text") || "";
  const price = Number(btn.getAttribute("data-price")) || 0;

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

  btn.addEventListener("click", function () {
    const cart = readCart();
    const existing = cart.find(function (item) {
      return item.name === name;
    });
    const base = { name, priceText, price, img };
    if (existing) existing.qty += 1;
    else cart.push({ ...base, qty: 1 });
    writeCart(cart);
    btn.textContent = "Added to bag";
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = "Add to cart";
      btn.disabled = false;
    }, 1600);
  });
})();
