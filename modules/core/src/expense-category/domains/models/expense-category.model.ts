export interface ExpenseCategoryModel {
  id: string;
  name: string;
  group: "OPERATIONAL" | "PRODUCTION";
  productCategoryId: string | null;
}
