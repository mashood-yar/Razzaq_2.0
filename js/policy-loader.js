/**
 * CMS: policy HTML from Supabase policy_pages, else data/policies-fallback.json
 */
window.RAZZAQ_loadPolicyPage = async function (slug) {
  var sb = await window.RAZZAQ_getSupabase();
  if (sb) {
    var res = await sb.from('policy_pages').select('title, body_html, updated_at').eq('slug', slug).maybeSingle();
    if (!res.error && res.data && res.data.body_html) {
      return {
        title: res.data.title,
        html: res.data.body_html,
        updated_at: res.data.updated_at,
        source: 'supabase',
      };
    }
  }

  try {
    var r = await fetch('data/policies-fallback.json', { cache: 'no-store' });
    if (r.ok) {
      var json = await r.json();
      var page = json[slug];
      if (page && page.html) {
        return {
          title: page.title || slug,
          html: page.html,
          updated_at: page.updated_at || null,
          source: 'fallback',
        };
      }
    }
  } catch (e) {
    console.warn('policy fallback', e);
  }

  return null;
};
