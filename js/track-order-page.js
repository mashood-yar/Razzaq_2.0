/**
 * Track order — timeline + products UI; Supabase lookup when configured.
 */
(function () {
  var STEPS = [
    {
      label: 'Order Placed',
      icon: function () {
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h6"/></svg>';
      },
    },
    {
      label: 'Accepted',
      icon: function () {
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>';
      },
    },
    {
      label: 'In Progress',
      icon: function () {
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/></svg>';
      },
    },
    {
      label: 'On the Way',
      icon: function () {
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
      },
    },
    {
      label: 'Delivered',
      icon: function () {
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>';
      },
    },
  ];

  function statusToCompletedCount(statusRaw) {
    var s = (statusRaw || '').toLowerCase();
    if (s.includes('deliver')) return 5;
    if (s.includes('way') || s.includes('transit') || s.includes('ship') || s.includes('courier')) return 4;
    if (s.includes('progress') || s.includes('process') || s.includes('pack')) return 3;
    if (s.includes('accept')) return 2;
    if (s.includes('place') || s.includes('pending')) return 1;
    return 2;
  }

  function railFillPercent(completedCount) {
    var n = Math.min(5, Math.max(0, completedCount));
    if (n <= 1) return 0;
    return ((n - 1) / (STEPS.length - 1)) * 100;
  }

  function demoTimestamps() {
    return [
      '20 Apr 2026, 11:00 AM',
      '20 Apr 2026, 11:15 AM',
      'Expected 21 Apr 2026',
      'Expected 22–23 Apr 2026',
      'Expected 24 Apr 2026',
    ];
  }

  function renderTimeline(completedCount, times) {
    var pct = railFillPercent(completedCount);
    var iconsHtml = STEPS.map(function (st) {
      return '<div class="track-timeline__icon">' + st.icon() + '</div>';
    }).join('');

    var dotsHtml = STEPS.map(function (_, i) {
      var done = i < completedCount;
      var cls = done ? 'track-dot track-dot--done' : 'track-dot';
      var inner = done
        ? '<span class="track-dot__inner"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>'
        : '<span class="track-dot__inner"></span>';
      return '<div class="' + cls + '">' + inner + '</div>';
    }).join('');

    var colsHtml = STEPS.map(function (st, i) {
      return (
        '<div class="track-col">' +
        '<span class="track-col__label">' +
        st.label +
        '</span>' +
        '<p class="track-col__meta">' +
        (times[i] || '—') +
        '</p>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="track-timeline">' +
      '<div class="track-timeline__icons">' +
      iconsHtml +
      '</div>' +
      '<div class="track-timeline__rail">' +
      '<div class="track-timeline__rail-fill" style="width:' +
      pct +
      '%"></div>' +
      '</div>' +
      '<div class="track-timeline__dots">' +
      dotsHtml +
      '</div>' +
      '<div class="track-columns">' +
      colsHtml +
      '</div>' +
      '</div>'
    );
  }

  function demoProducts() {
    return [
      {
        name: 'Royal Oud Elixir',
        meta: 'Size : 50 ml | 1 Qty',
        img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=160&q=80',
      },
      {
        name: 'Amber Silk',
        meta: 'Size : 100 ml | 2 Qty',
        img: 'https://images.unsplash.com/photo-1595425970387-f44e38e74f04?auto=format&fit=crop&w=160&q=80',
      },
      {
        name: 'Noir Musk',
        meta: 'Size : 30 ml | 1 Qty',
        img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=160&q=80',
      },
    ];
  }

  function renderProducts(items) {
    return items
      .map(function (it) {
        return (
          '<div class="track-product-row">' +
          '<img src="' +
          it.img +
          '" alt="" width="72" height="72" loading="lazy">' +
          '<div class="track-product-row__body">' +
          '<p class="track-product-row__name">' +
          it.name +
          '</p>' +
          '<p class="track-product-row__meta">' +
          it.meta +
          '</p>' +
          '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('track-form');
    var mountTimeline = document.getElementById('track-timeline-mount');
    var mountProducts = document.getElementById('track-products-mount');
    var refDisplay = document.getElementById('track-order-ref-display');
    var box = document.getElementById('track-result');
    var afterEl = document.getElementById('track-aftership');
    var hintEl = document.getElementById('track-hint');

    if (!form || !mountTimeline || !mountProducts || !box) return;

    try {
      var params = new URLSearchParams(window.location.search);
      var prefOrder = params.get('order');
      var numEl = document.getElementById('track-order-num');
      if (prefOrder && numEl && !numEl.value) {
        numEl.value = prefOrder;
      }
    } catch (err) {}

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var email = document.getElementById('track-email')?.value.trim() || '';
      var ref = document.getElementById('track-order-num')?.value.trim() || '';

      box.hidden = false;
      var prodSec0 = document.getElementById('track-products-section');
      if (prodSec0) prodSec0.hidden = false;
      if (hintEl) hintEl.hidden = true;
      if (afterEl) {
        afterEl.hidden = true;
        afterEl.textContent = '';
      }

      if (refDisplay) refDisplay.textContent = '#' + (ref || '—');

      var times = demoTimestamps();
      var completed = 2;
      var products = demoProducts();

      var sb = await window.RAZZAQ_getSupabase();
      if (!sb) {
        if (refDisplay) refDisplay.textContent = '#' + (ref || 'RZ-2026-DEMO');
        mountTimeline.innerHTML = renderTimeline(completed, times);
        mountProducts.innerHTML =
          '<div class="track-products-box">' + renderProducts(products) + '</div>';
        if (hintEl) {
          hintEl.hidden = false;
          hintEl.textContent =
            'Demo preview — connect Supabase in js/config.js for live order data from your store.';
        }
        box.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      var row = await window.RAZZAQ_lookupOrder(ref, email);
      if (!row) {
        if (refDisplay) refDisplay.textContent = '#' + ref;
        mountTimeline.innerHTML =
          '<p class="track-meta-note">No order found for this email and order number.</p>';
        mountProducts.innerHTML = '';
        var prodSec = document.getElementById('track-products-section');
        if (prodSec) prodSec.hidden = true;
        if (hintEl) {
          hintEl.hidden = false;
          hintEl.innerHTML =
            'Double-check your details or <a href="contact.html">contact us</a> for help.';
        }
        box.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      completed = statusToCompletedCount(row.status);
      if (refDisplay) refDisplay.textContent = '#' + (row.order_ref || ref);

      var placed =
        row.created_at &&
        (function () {
          try {
            return new Date(row.created_at).toLocaleString();
          } catch (err) {
            return '';
          }
        })();
      times[0] = placed || times[0];

      mountTimeline.innerHTML = renderTimeline(completed, times);

      var extraParts = [];
      if (row.total_pkr != null) extraParts.push('Total PKR ' + row.total_pkr);
      if (row.carrier_tracking) extraParts.push('Tracking: ' + row.carrier_tracking);

      var items = demoProducts();
      if (row.items && Array.isArray(row.items) && row.items.length) {
        items = row.items.map(function (it) {
          return {
            name: it.name || 'Item',
            meta: (it.variant || '—') + ' | ' + (it.qty || 1) + ' Qty',
            img: it.image_url || demoProducts()[0].img,
          };
        });
      }
      mountProducts.innerHTML = '<div class="track-products-box">' + renderProducts(items) + '</div>';

      if (extraParts.length && hintEl) {
        hintEl.hidden = false;
        hintEl.textContent = extraParts.join(' · ');
      }

      if (row.carrier_tracking && window.RAZZAQ_fetchAftershipStatus) {
        var tag = await window.RAZZAQ_fetchAftershipStatus(row.carrier_tracking);
        if (tag && afterEl) {
          afterEl.textContent = 'Carrier status (AfterShip): ' + tag;
          afterEl.hidden = false;
        }
      }

      box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
