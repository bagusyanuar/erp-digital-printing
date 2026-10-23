export interface CategoryResponse {
  id: string;
  name: string;
  sequence?: number;
  spk_category_id?: string | null;
  spk_category?: CategoryResponse | null;
}
