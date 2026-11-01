export interface CategoryModel {
  id: string;
  name: string;
  sequence?: number;
  isProduction?: boolean;
  spkCategoryId?: string | null;
  spkCategory?: CategoryModel | null;
}
