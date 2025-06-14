
// מרכזיות הגדרת טיפוס Branch
export interface Branch {
  id: string;
  name: string;
  address: string | null;
  business_id: string;
  latitude?: number | null;
  longitude?: number | null;
  gps_radius?: number | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// פונקציית נרמליזציה לוודא עקביות
export const normalizeBranch = (data: any): Branch => ({
  id: data.id,
  name: data.name,
  address: data.address || null,
  business_id: data.business_id,
  latitude: data.latitude || null,
  longitude: data.longitude || null,
  gps_radius: data.gps_radius || null,
  is_active: data.is_active ?? true,
  created_at: data.created_at,
  updated_at: data.updated_at,
});
