export type GiftStatus = "available" | "reserved" | "hidden" | "owned" | "archived";

export type ReservationStatus = "confirmed" | "cancelled";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
};

export type Gift = {
  id: string;
  category_id: string;
  category?: Category | null;
  name: string;
  slug: string;
  suggested_brands: string[];
  image_url: string | null;
  description: string;
  notes: string | null;
  quantity_needed: number;
  quantity_owned: number;
  quantity_reserved: number;
  progress_weight: number;
  status: GiftStatus;
  is_public: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
};

export type Reservation = {
  id: string;
  gift_id: string;
  gift?: Gift | null;
  guest_name: string;
  guest_phone: string | null;
  guest_message: string | null;
  quantity: number;
  status: ReservationStatus;
  created_at: string;
  updated_at?: string;
};

export type EventSettings = {
  id: string;
  event_date: string;
  event_time: string;
  location_name: string;
  address: string;
  google_maps_url: string;
  whatsapp_number: string;
  dress_code: string | null;
  welcome_message: string;
  event_headline: string | null;
  event_description: string | null;
  couple_photo_url: string | null;
  couple_photo_alt: string | null;
  ultrasound_photo_url: string | null;
  ultrasound_photo_alt: string | null;
};

export type RegistryProgress = {
  total_weight: number;
  completed_weight: number;
  percentage: number;
  total_items: number;
  owned_items: number;
  reserved_items: number;
};

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "error" | "info";
};
