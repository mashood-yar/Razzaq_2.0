/**
 * Track order via Supabase RPC lookup_order + optional AfterShip (free tier API key).
 */
window.RAZZAQ_lookupOrder = async function (orderRef, email) {
  var sb = await window.RAZZAQ_getSupabase();
  if (!sb) return null;

  var res = await sb.rpc('lookup_order', {
    p_ref: orderRef.trim(),
    p_email: email.trim(),
  });

  if (res.error) {
    console.warn('lookup_order', res.error);
    return null;
  }
  var rows = res.data;
  if (!rows || !rows.length) return null;
  return rows[0];
};

/**
 * AfterShip — optional; requires API key in config. Free tier has limits.
 * https://www.aftership.com/docs/tracking
 */
window.RAZZAQ_fetchAftershipStatus = async function (trackingNumber) {
  var key = (window.RAZZAQ_CONFIG || {}).aftershipApiKey;
  if (!key || !trackingNumber) return null;

  try {
    var r = await fetch(
      'https://api.aftership.com/v4/trackings/' + encodeURIComponent(trackingNumber),
      {
        headers: {
          'aftership-api-key': key,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!r.ok) return null;
    var data = await r.json();
    var t = data && data.data;
    return t && t.tag ? String(t.tag) : null;
  } catch (e) {
    console.warn('AfterShip', e);
    return null;
  }
};
