/**
 * Reads data-policy-slug on <body>, fills #policy-title, #policy-body, #policy-updated.
 * Requires config.js, integrations.js, policy-loader.js.
 */
(function () {
  document.addEventListener('DOMContentLoaded', async function () {
    var slug = document.body.getAttribute('data-policy-slug');
    if (!slug) return;

    var titleEl = document.getElementById('policy-title');
    var bodyEl = document.getElementById('policy-body');
    var updatedEl = document.getElementById('policy-updated');
    if (!bodyEl) return;

    var data = await window.RAZZAQ_loadPolicyPage(slug);
    if (data) {
      if (titleEl && data.title) titleEl.textContent = data.title;
      bodyEl.innerHTML = data.html;
      if (updatedEl) {
        updatedEl.hidden = false;
        var src = data.source === 'supabase' ? 'CMS' : 'local fallback';
        if (data.updated_at) {
          try {
            var d = new Date(data.updated_at);
            updatedEl.textContent =
              'Last updated ' +
              d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) +
              ' · ' +
              src;
          } catch (e) {
            updatedEl.textContent = 'Source: ' + src;
          }
        } else {
          updatedEl.textContent = 'Source: ' + src;
        }
      }
    } else {
      bodyEl.innerHTML =
        '<p>Could not load this policy. Check Supabase keys or <code>data/policies-fallback.json</code>.</p>';
      if (updatedEl) updatedEl.hidden = true;
    }
  });
})();
