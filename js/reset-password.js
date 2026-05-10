/**
 * Supabase recovery session from email link → updateUser({ password }).
 * Requires config.js, integrations.js.
 */
(function () {
  document.addEventListener('DOMContentLoaded', async function () {
    var form = document.getElementById('form-reset');
    var msg = document.getElementById('auth-message');
    if (!form) return;

    function show(text, isErr) {
      if (!msg) return;
      msg.hidden = false;
      msg.textContent = text;
      msg.style.color = isErr ? '#a33' : 'var(--shell-noir, #024950)';
    }

    var sb = await window.RAZZAQ_getSupabase();
    if (!sb) {
      show('Add Supabase URL and anon key in js/config.js.', true);
      form.querySelector('button[type="submit"]').disabled = true;
      return;
    }

    async function getRecoverySession() {
      var a = await sb.auth.getSession();
      if (a.data.session) return a.data.session;
      await new Promise(function (r) {
        setTimeout(r, 250);
      });
      var b = await sb.auth.getSession();
      return b.data.session || null;
    }

    var session = await getRecoverySession();
    if (!session) {
      show('Open this page from the password reset link in your email.', true);
      form.querySelector('button[type="submit"]').disabled = true;
      return;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var p1 = document.getElementById('new-password')?.value;
      var p2 = document.getElementById('new-password2')?.value;
      if (p1 !== p2) {
        show('Passwords do not match.', true);
        return;
      }
      var res = await sb.auth.updateUser({ password: p1 });
      if (res.error) {
        show(res.error.message, true);
        return;
      }
      await sb.auth.signOut();
      show('Password updated. Redirecting to sign in…', false);
      setTimeout(function () {
        window.location.href = 'login.html';
      }, 800);
    });
  });
})();
