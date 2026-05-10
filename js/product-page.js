(function () {
  var params = new URLSearchParams(window.location.search);
  var slug = params.get('slug');
  var p = slug && window.RAZZAQ_getProductBySlug ? window.RAZZAQ_getProductBySlug(slug) : null;

  var miss = document.getElementById('product-missing');
  var wrap = document.getElementById('product-content');
  if (!p) {
    if (miss) miss.hidden = false;
    document.title = 'Product not found | Razzaq Luxe';
    return;
  }

  if (miss) miss.hidden = true;
  if (wrap) wrap.hidden = false;

  document.title = p.name + ' | Razzaq Luxe';

  var img = document.getElementById('pd-img');
  if (img) {
    img.src = p.img;
    img.alt = p.name;
  }
  var t = document.getElementById('pd-title');
  if (t) t.textContent = p.name;
  var d = document.getElementById('pd-desc');
  if (d) d.textContent = p.description || '';
  var pr = document.getElementById('pd-price');
  if (pr) pr.textContent = p.price;

  var btn = document.getElementById('add-to-cart-btn');
  if (btn) {
    btn.setAttribute('data-slug', p.slug);
    btn.setAttribute('data-name', p.name);
    btn.setAttribute('data-price-text', p.price);
    btn.setAttribute('data-img', p.img);
    var num = Number(String(p.price).replace(/[^\d]/g, '')) || 0;
    btn.setAttribute('data-price', String(num));
  }

  var KEY = 'razzaq-cart';

  function readCart() {
    try {
      var parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
  }

  if (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-name') || '';
      var priceText = btn.getAttribute('data-price-text') || '';
      var price = Number(btn.getAttribute('data-price')) || 0;
      var imgUrl = btn.getAttribute('data-img') || '';
      var pslug = btn.getAttribute('data-slug') || '';

      var cart = readCart();
      var existing = cart.find(function (item) {
        return item.name === name;
      });
      var base = { slug: pslug, name: name, priceText: priceText, price: price, img: imgUrl };
      if (existing) existing.qty += 1;
      else cart.push(Object.assign({}, base, { qty: 1 }));
      writeCart(cart);

      btn.textContent = 'Added to bag';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = 'Add to cart';
        btn.disabled = false;
      }, 1600);
    });
  }
})();
