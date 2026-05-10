/**
 * Account hub: Personal Information vs My Orders panels + hash routing.
 */
(function () {
  var personal = document.getElementById('account-panel-personal');
  var orders = document.getElementById('account-panel-orders');
  if (!personal || !orders) return;

  function setTab(tab) {
    var isPersonal = tab === 'personal';
    personal.hidden = !isPersonal;
    orders.hidden = isPersonal;

    document.querySelectorAll('[data-account-tab]').forEach(function (a) {
      var key = a.getAttribute('data-account-tab');
      var match = key === tab;
      a.classList.toggle('is-active', match);
      if (match) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  function syncFromHash() {
    var h = (location.hash || '').replace(/^#/, '');
    if (h === 'my-orders') {
      setTab('orders');
      return;
    }
    setTab('personal');
    if (h === 'manage-address') {
      requestAnimationFrame(function () {
        var el = document.getElementById('manage-address');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  document.querySelectorAll('a[data-account-tab="personal"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      setTab('personal');
      history.replaceState(null, '', '#personal');
    });
  });

  document.querySelectorAll('a[data-account-tab="orders"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      setTab('orders');
      history.replaceState(null, '', '#my-orders');
    });
  });

  var manageLink = document.querySelector('.account-page__sidebar a[href="#manage-address"]');
  if (manageLink) {
    manageLink.addEventListener('click', function (e) {
      e.preventDefault();
      setTab('personal');
      history.replaceState(null, '', '#manage-address');
      requestAnimationFrame(function () {
        var el = document.getElementById('manage-address');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();
})();
