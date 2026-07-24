import type {
  Category,
  EventSettings,
  Gift,
  GiftStatus,
  RegistryProgress,
  Reservation,
} from "./domain";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, "id"> & { id?: string };
        Update: Partial<Omit<Category, "id">>;
        Relationships: [];
      };
      event_settings: {
        Row: EventSettings;
        Insert: Omit<EventSettings, "id"> & { id?: string };
        Update: Partial<Omit<EventSettings, "id">>;
        Relationships: [];
      };
      gifts: {
        Row: Gift;
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          suggested_brands?: string[];
          image_url?: string | null;
          description: string;
          notes?: string | null;
          quantity_needed: number;
          quantity_owned?: number;
          quantity_reserved?: number;
          progress_weight?: number;
          status?: GiftStatus;
          is_public?: boolean;
          display_order?: number;
        };
        Update: Partial<{
          category_id: string;
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
        }>;
        Relationships: [];
      };
      reservations: {
        Row: Reservation;
        Insert: Omit<Reservation, "id" | "gift" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Reservation, "id" | "gift">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_registry_progress: {
        Args: Record<string, never>;
        Returns: RegistryProgress[];
      };
      create_gift_reservation: {
        Args: {
          p_gift_id: string;
          p_quantity: number;
          p_guest_name: string;
          p_guest_phone?: string | null;
          p_guest_message?: string | null;
        };
        Returns: Reservation;
      };
      cancel_reservation: {
        Args: {
          p_reservation_id: string;
        };
        Returns: Reservation;
      };
    };
    Enums: {
      gift_status: Gift["status"];
      reservation_status: Reservation["status"];
    };
    CompositeTypes: Record<string, never>;
  };
};
