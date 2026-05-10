import { createTCSShipment, trackTCSShipment } from "./tcs";
import { createLeopardsShipment, trackLeopardsShipment } from "./leopards";
import { createDHLShipment, trackDHLShipment } from "./dhl";
import type { ShipmentRequest, ShipmentResponse, TrackingResponse } from "./types";

export type Carrier = "tcs" | "leopards" | "dhl";

export type { ShipmentRequest, ShipmentResponse, TrackingResponse };

export async function createShipment(
  carrier: Carrier,
  req: ShipmentRequest,
): Promise<ShipmentResponse> {
  switch (carrier) {
    case "tcs":
      return createTCSShipment(req);
    case "leopards":
      return createLeopardsShipment(req);
    case "dhl":
      return createDHLShipment(req);
    default: {
      const _exhaustive: never = carrier;
      return _exhaustive;
    }
  }
}

export async function trackShipment(
  carrier: Carrier,
  trackingNumber: string,
): Promise<TrackingResponse> {
  switch (carrier) {
    case "tcs":
      return trackTCSShipment(trackingNumber);
    case "leopards":
      return trackLeopardsShipment(trackingNumber);
    case "dhl":
      return trackDHLShipment(trackingNumber);
    default: {
      const _exhaustive: never = carrier;
      return _exhaustive;
    }
  }
}
