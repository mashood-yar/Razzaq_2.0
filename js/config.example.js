/**
 * Copy this file to config.js and fill in values from your Supabase project (free tier).
 * Dashboard: https://supabase.com/dashboard → Project Settings → API
 *
 * Never commit real keys to a public repo — keep config.js local or use CI secrets.
 */
window.RAZZAQ_CONFIG = {
  /** Set true after creating tables + RLS (see supabase/schema.sql) */
  enableSupabase: false,

  /** Project URL, e.g. https://xxxx.supabase.co */
  supabaseUrl: '',

  /** anon / public key (safe for browser with RLS) */
  supabaseAnonKey: '',

  /**
   * Optional: AfterShip API key (free tier includes limited tracking).
   * https://www.aftership.com/docs/tracking/quickstart/api-setup
   */
  aftershipApiKey: '',
};
