export interface CategoryResponse {
  id: string;
  name: string;
  sequence?: number;
  is_production?: boolean;
  spk_category_id?: string | null;
  spk_category?: CategoryResponse | null;
}
