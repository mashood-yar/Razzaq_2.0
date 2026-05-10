import type { ShipmentRequest, ShipmentResponse, TrackingResponse } from "./types";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export async function createTCSShipment(
  req: ShipmentRequest,
): Promise<ShipmentResponse> {
  try {
    const BASE = requireEnv("TCS_API_URL");
    const KEY = requireEnv("TCS_API_KEY");

    const payload = {
      api_key: KEY,
      account_no: requireEnv("TCS_ACCOUNT_NUMBER"),
      booking_type: req.serviceType === "express" ? "overnight" : "standard",
      consignee_name: req.recipient.name,
      consignee_phone: req.recipient.phone,
      consignee_email: req.recipient.email,
      consignee_address: `${req.recipient.address}, ${req.recipient.city}`,
      consignee_city: req.recipient.city,
      shipper_name: requireEnv("TCS_SENDER_NAME"),
      shipper_phone: requireEnv("TCS_SENDER_PHONE"),
      shipper_address: requireEnv("TCS_SENDER_ADDRESS"),
      pieces: req.parcel.pieces,
      weight: req.parcel.weight,
      description: req.parcel.description,
      declared_value: req.parcel.value,
      cod_amount: req.codAmount ?? 0,
      reference_no: req.orderNumber,
      special_instructions: req.instructions ?? "",
    };

    const res = await fetch(`${BASE.replace(/\/$/, "")}/create_booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok || data.status !== "success") {
      const msg =
        typeof data.message === "string"
          ? data.message
          : `TCS HTTP ${res.status}`;
      throw new Error(msg);
    }

    const tracking_number = String(data.tracking_number ?? "");
    return {
      success: true,
      trackingNumber: tracking_number,
      trackingUrl: `https://www.tcsexpress.com/track/${tracking_number}`,
      labelUrl:
        typeof data.label_url === "string" ? data.label_url : undefined,
      carrier: "tcs",
      estimatedDelivery:
        typeof data.estimated_delivery === "string"
          ? data.estimated_delivery
          : undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      trackingNumber: "",
      trackingUrl: "",
      carrier: "tcs",
      error: message,
    };
  }
}

export async function trackTCSShipment(
  trackingNumber: string,
): Promise<TrackingResponse> {
  const BASE = process.env.TCS_API_URL;
  const KEY = process.env.TCS_API_KEY;
  if (!BASE || !KEY) {
    return {
      trackingNumber,
      currentStatus: "unknown",
      events: [],
    };
  }

  const res = await fetch(
    `${BASE.replace(/\/$/, "")}/track_shipment?api_key=${encodeURIComponent(KEY)}&tracking_no=${encodeURIComponent(trackingNumber)}`,
  );
  const data = (await res.json()) as Record<string, unknown>;

  const eventsRaw = Array.isArray(data.tracking_events)
    ? data.tracking_events
    : [];

  return {
    trackingNumber,
    currentStatus:
      typeof data.current_status === "string"
        ? data.current_status
        : "unknown",
    estimatedDelivery:
      typeof data.estimated_delivery === "string"
        ? data.estimated_delivery
        : undefined,
    events: eventsRaw.map((e: Record<string, unknown>) => ({
      status: String(e.status ?? ""),
      location: String(e.location ?? ""),
      timestamp: String(e.timestamp ?? ""),
      description: String(e.description ?? e.status ?? ""),
    })),
  };
}
