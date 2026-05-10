export interface ShipmentRequest {
  orderId: string;
  orderNumber: string;
  recipient: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    province: string;
    postal: string;
    country: string;
  };
  parcel: {
    weight: number;
    description: string;
    value: number;
    pieces: number;
  };
  serviceType: "standard" | "express";
  codAmount?: number;
  instructions?: string;
}

export interface ShipmentResponse {
  success: boolean;
  trackingNumber: string;
  trackingUrl: string;
  labelUrl?: string;
  carrier: "tcs" | "leopards" | "dhl";
  estimatedDelivery?: string;
  error?: string;
}

export interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface TrackingResponse {
  trackingNumber: string;
  currentStatus: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
}
