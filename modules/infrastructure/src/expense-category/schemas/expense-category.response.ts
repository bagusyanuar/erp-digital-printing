export interface ExpenseCategoryResponse {
  id: string;
  name: string;
  group: "OPERATIONAL" | "PRODUCTION";
  product_category_id: string | null;
}
