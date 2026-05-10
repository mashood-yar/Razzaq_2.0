/**
 * Supabase Auth (free tier) — login / register / forgot password flows.
 * Requires js/config.js + js/integrations.js before this file.
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-auth-page');
    if (!page) return;

    var formLogin = document.getElementById('form-login');
    var formRegister = document.getElementById('form-register');
    var formForgot = document.getElementById('form-forgot');

    var msg = document.getElementById('auth-message');

    function show(text, isErr) {
      if (!msg) return;
      msg.hidden = false;
      msg.textContent = text;
      msg.classList.remove('auth-message--ok', 'auth-message--err');
      if (document.body.classList.contains('auth-split')) {
        msg.classList.add(isErr ? 'auth-message--err' : 'auth-message--ok');
        msg.removeAttribute('style');
      } else {
        msg.style.color = isErr ? '#a33' : 'var(--shell-noir, #024950)';
      }
    }

    document.querySelectorAll('.auth-password-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('aria-controls');
        var input = id ? document.getElementById(id) : null;
        if (!input) {
          var wrap = btn.closest('.auth-field__control');
          if (wrap) input = wrap.querySelector('input');
        }
        if (!input && btn.closest('.auth-field--password')) {
          input = btn.closest('.auth-field--password').querySelector('input');
        }
        if (!input) return;
        var showPw = input.type === 'password';
        input.type = showPw ? 'text' : 'password';
        btn.setAttribute('aria-pressed', showPw ? 'true' : 'false');
        btn.setAttribute('aria-label', showPw ? 'Hide password' : 'Show password');
      });
    });

    document.querySelectorAll('.auth-social-google').forEach(function (btn) {
      btn.addEventListener('click', function () {
        show('Social sign-in is not connected yet.', false);
      });
    });

    if (formLogin) {
      formLogin.addEventListener('submit', async function (e) {
        e.preventDefault();
        var sb = await window.RAZZAQ_getSupabase();
        var email = document.getElementById('login-email')?.value.trim();
        var password = document.getElementById('login-password')?.value;
        if (!sb) {
          show('Supabase not configured — open account.html (demo redirect).', false);
          setTimeout(function () {
            window.location.href = 'account.html';
          }, 600);
          return;
        }
        var res = await sb.auth.signInWithPassword({ email: email, password: password });
        if (res.error) {
          show(res.error.message, true);
          return;
        }
        window.location.href = 'account.html';
      });
    }

    if (formRegister) {
      formRegister.addEventListener('submit', async function (e) {
        e.preventDefault();
        var sb = await window.RAZZAQ_getSupabase();
        var email = document.getElementById('reg-email')?.value.trim();
        var password = document.getElementById('reg-password')?.value;
        var password2 = document.getElementById('reg-password2')?.value;
        var name = document.getElementById('reg-name')?.value.trim();
        if (password !== password2) {
          show('Passwords do not match.', true);
          return;
        }
        if (!sb) {
          show('Add Supabase keys in js/config.js, or continue to the demo account area.', false);
          setTimeout(function () {
            window.location.href = 'account.html';
          }, 800);
          return;
        }
        var res = await sb.auth.signUp({
          email: email,
          password: password,
          options: { data: { full_name: name } },
        });
        if (res.error) {
          show(res.error.message, true);
          return;
        }
        show('Check your email to confirm, then sign in.', false);
      });
    }

    if (formForgot) {
      formForgot.addEventListener('submit', async function (e) {
        e.preventDefault();
        var sb = await window.RAZZAQ_getSupabase();
        var email = document.getElementById('forgot-email')?.value.trim();
        var redirect = new URL('reset-password.html', window.location.href).href;
        if (!sb) {
          show('Configure Supabase to send reset emails.', true);
          return;
        }
        var res = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirect });
        if (res.error) {
          show(res.error.message, true);
          return;
        }
        show('If an account exists, a reset link was sent.', false);
      });
    }
  });
})();
