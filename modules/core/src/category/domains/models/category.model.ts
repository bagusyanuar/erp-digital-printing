export interface CategoryModel {
  id: string;
  name: string;
  sequence?: number;
  spkCategoryId?: string | null;
  spkCategory?: CategoryModel | null;
}
