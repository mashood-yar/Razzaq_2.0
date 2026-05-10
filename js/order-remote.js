/**
 * Persist orders to Supabase when configured (free tier).
 */
window.RAZZAQ_syncOrderRemote = async function (payload) {
  var sb = await window.RAZZAQ_getSupabase();
  if (!sb || !payload) return { ok: false, skipped: true };

  var row = {
    order_ref: payload.orderId,
    email: payload.email,
    customer_name: payload.name,
    phone: payload.phone || null,
    ship_address: payload.address,
    ship_city: payload.city,
    subtotal_pkr: Math.round(payload.subtotal),
    shipping_pkr: Math.round(payload.shipping),
    total_pkr: Math.round(payload.total),
    status: 'processing',
    items: payload.items,
  };

  var res = await sb.from('orders').insert(row).select('id').maybeSingle();
  if (res.error) {
    console.warn('Order sync failed', res.error);
    return { ok: false, error: res.error.message };
  }
  return { ok: true };
};
