export type Business = {
  id: string;
  business_name: string;
  category: string;
  subcategory?: string | null;
  services?: string[] | null;
  short_description?: string | null;
  description?: string | null;
  phone?: string | null;
  image_url?: string | null;
  address?: string | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  maps_url?: string | null;
  listing_status?: string | null;
  listing_expires_at?: string | null;
};

export type Category = {
  name: string;
  icon: string;
  keywords: string[];
};

export type QuickLink = {
  label: string;
  query: string;
};