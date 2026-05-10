/**
 * Lazy Supabase client (ESM from CDN). Safe no-op when disabled or missing keys.
 */
window.RAZZAQ_getSupabase = async function () {
  var c = window.RAZZAQ_CONFIG || {};
  if (!c.enableSupabase || !c.supabaseUrl || !c.supabaseAnonKey) {
    return null;
  }
  if (window.__RAZZAQ_SB_CLIENT) {
    return window.__RAZZAQ_SB_CLIENT;
  }
  try {
    var mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    var createClient = mod.createClient;
    window.__RAZZAQ_SB_CLIENT = createClient(c.supabaseUrl, c.supabaseAnonKey);
    return window.__RAZZAQ_SB_CLIENT;
  } catch (e) {
    console.warn('Supabase client failed to load', e);
    return null;
  }
};
