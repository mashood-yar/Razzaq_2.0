import type { ShipmentRequest, ShipmentResponse, TrackingResponse } from "./types";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export async function createLeopardsShipment(
  req: ShipmentRequest,
): Promise<ShipmentResponse> {
  try {
    const BASE = requireEnv("LEOPARDS_API_URL");
    const payload = {
      api_key: requireEnv("LEOPARDS_API_KEY"),
      api_password: requireEnv("LEOPARDS_API_PASSWORD"),
      booked_packet_weight: req.parcel.weight * 1000,
      booked_packet_no_piece: req.parcel.pieces,
      booked_packet_collect_amount: req.codAmount ?? 0,
      booked_packet_order_id: req.orderNumber,
      origin_city: process.env.LEOPARDS_ORIGIN_CITY ?? "Rawalpindi",
      destination_city: req.recipient.city,
      shipment_type_id: req.serviceType === "express" ? 2 : 1,
      consignee_name: req.recipient.name,
      consignee_phone: req.recipient.phone,
      consignee_email: req.recipient.email,
      consignee_address: req.recipient.address,
    };

    const res = await fetch(`${BASE.replace(/\/$/, "")}/bookPacket/format/json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (data.status !== 1) {
      throw new Error(
        typeof data.error === "string" ? data.error : "Leopards API error",
      );
    }

    const track = String(data.track_number ?? "");
    return {
      success: true,
      trackingNumber: track,
      trackingUrl: `https://www.leopardscourier.com/leopards-tracking/?track_numbers=${encodeURIComponent(track)}`,
      carrier: "leopards",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      trackingNumber: "",
      trackingUrl: "",
      carrier: "leopards",
      error: message,
    };
  }
}

export async function trackLeopardsShipment(
  trackingNumber: string,
): Promise<TrackingResponse> {
  const BASE = process.env.LEOPARDS_API_URL;
  const KEY = process.env.LEOPARDS_API_KEY;
  const PASS = process.env.LEOPARDS_API_PASSWORD;
  if (!BASE || !KEY || !PASS) {
    return {
      trackingNumber,
      currentStatus: "unknown",
      events: [],
    };
  }

  const url = `${BASE.replace(/\/$/, "")}/trackBookedPacket/format/json?api_key=${encodeURIComponent(KEY)}&api_password=${encodeURIComponent(PASS)}&track_numbers=${encodeURIComponent(trackingNumber)}`;
  const res = await fetch(url);
  const data = (await res.json()) as Record<string, unknown>;
  const list = data.packet_list as Record<string, unknown>[] | undefined;
  const packet = list?.[0] ?? {};

  const activity_log = Array.isArray(packet.activity_log)
    ? packet.activity_log
    : [];

  return {
    trackingNumber,
    currentStatus: String(packet?.booked_packet_status ?? "unknown"),
    events: activity_log.map((e: Record<string, unknown>) => ({
      status: String(e.status ?? ""),
      location: String(e.city ?? ""),
      timestamp: String(e.date_time ?? ""),
      description: String(e.comments ?? e.status ?? ""),
    })),
  };
}
