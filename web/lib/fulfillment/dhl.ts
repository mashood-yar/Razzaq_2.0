import type { ShipmentRequest, ShipmentResponse, TrackingResponse } from "./types";

function basicAuth(): string {
  const user = process.env.DHL_API_KEY;
  const pass = process.env.DHL_API_SECRET;
  if (!user || !pass) throw new Error("DHL_API_KEY or DHL_API_SECRET is not set");
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

export async function createDHLShipment(
  req: ShipmentRequest,
): Promise<ShipmentResponse> {
  try {
    const BASE = process.env.DHL_API_URL;
    if (!BASE) throw new Error("DHL_API_URL is not set");

    const senderPhone =
      process.env.DHL_SENDER_PHONE ?? process.env.TCS_SENDER_PHONE ?? "";

    const payload = {
      plannedShippingDateAndTime: new Date().toISOString().split(".")[0],
      pickup: { isRequested: false },
      productCode: req.serviceType === "express" ? "P" : "K",
      accounts: [
        {
          typeCode: "shipper",
          number: process.env.DHL_ACCOUNT_NUMBER ?? "",
        },
      ],
      shipper: {
        name: process.env.DHL_SENDER_NAME ?? "",
        phone: senderPhone,
        address: {
          addressLine1: process.env.DHL_SENDER_ADDRESS ?? "",
          cityName: process.env.DHL_SENDER_CITY ?? "",
          countryCode: process.env.DHL_SENDER_COUNTRY ?? "PK",
          postalCode: process.env.DHL_SENDER_POSTAL ?? "",
        },
      },
      consignee: {
        name: req.recipient.name,
        phone: req.recipient.phone,
        email: req.recipient.email,
        address: {
          addressLine1: req.recipient.address,
          cityName: req.recipient.city,
          countryCode: req.recipient.country,
          postalCode: req.recipient.postal,
        },
      },
      packages: [
        {
          weight: req.parcel.weight,
          dimensions: { length: 30, width: 20, height: 10 },
          customerReferences: [{ value: req.orderNumber, typeCode: "CU" }],
          description: req.parcel.description,
        },
      ],
      outputImageProperties: {
        printerDPI: 300,
        encodingFormat: "pdf",
        imageOptions: [{ typeCode: "label", templateName: "ECOM26_84_001" }],
      },
    };

    const res = await fetch(`${BASE.replace(/\/$/, "")}/shipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuth(),
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const detail =
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail ?? data);
      throw new Error(detail || `DHL HTTP ${res.status}`);
    }

    const trackingNumber = String(data.shipmentTrackingNumber ?? "");
    const documents = Array.isArray(data.documents) ? data.documents : [];
    const doc0 = documents[0] as Record<string, unknown> | undefined;
    const labelBase64 =
      typeof doc0?.content === "string" ? doc0.content : undefined;

    let labelUrl: string | undefined;
    if (labelBase64 && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createServiceRoleClient } = await import(
          "@/lib/supabase/service"
        );
        const supabase = createServiceRoleClient();
        const buf = Buffer.from(labelBase64, "base64");
        const path = `${req.orderNumber}-${trackingNumber}.pdf`;
        const { data: upload, error } = await supabase.storage
          .from("shipping-labels")
          .upload(path, buf, {
            contentType: "application/pdf",
            upsert: true,
          });
        if (!error && upload) {
          const { data: pub } = supabase.storage
            .from("shipping-labels")
            .getPublicUrl(upload.path);
          labelUrl = pub.publicUrl;
        }
      } catch {
        /* bucket may not exist yet */
      }
    }

    return {
      success: true,
      trackingNumber,
      trackingUrl: `https://www.dhl.com/pk-en/home/tracking.html?tracking-id=${encodeURIComponent(trackingNumber)}`,
      labelUrl,
      carrier: "dhl",
      estimatedDelivery:
        typeof data.estimatedDeliveryTime === "string"
          ? data.estimatedDeliveryTime
          : undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      trackingNumber: "",
      trackingUrl: "",
      carrier: "dhl",
      error: message,
    };
  }
}

export async function trackDHLShipment(
  trackingNumber: string,
): Promise<TrackingResponse> {
  const BASE = process.env.DHL_API_URL;
  const KEY = process.env.DHL_API_KEY;
  if (!BASE || !KEY) {
    return {
      trackingNumber,
      currentStatus: "unknown",
      events: [],
    };
  }

  const res = await fetch(
    `${BASE.replace(/\/$/, "")}/shipments?trackingNumber=${encodeURIComponent(trackingNumber)}`,
    {
      headers: {
        "DHL-API-Key": KEY,
      },
    },
  );

  const data = (await res.json()) as Record<string, unknown>;
  const shipments = Array.isArray(data.shipments)
    ? data.shipments
    : [];
  const shipment = shipments[0] as Record<string, unknown> | undefined;
  const status = shipment?.status as Record<string, unknown> | undefined;

  const eventsRaw = Array.isArray(shipment?.events) ? shipment.events : [];

  return {
    trackingNumber,
    currentStatus: String(status?.status ?? "unknown"),
    estimatedDelivery:
      typeof shipment?.estimatedTimeOfDelivery === "string"
        ? shipment.estimatedTimeOfDelivery
        : undefined,
    events: eventsRaw.map((e: Record<string, unknown>) => {
      const loc = e.location as
        | { address?: { addressLocality?: string } }
        | undefined;
      return {
        status: String(e.status ?? e.description ?? ""),
        location: String(loc?.address?.addressLocality ?? ""),
        timestamp: String(e.timestamp ?? ""),
        description: String(e.description ?? ""),
      };
    }),
  };
}
