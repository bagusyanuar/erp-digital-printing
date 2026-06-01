import type { DraftOrderItemModel } from "../../domains/models/order.model";

export interface SaveDraftOrderInput {
  designer_id: string;
  reseller_id: string | null;
  customer_name: string;
  customer_phone: string;
  notes: string;
  items: DraftOrderItemModel[];
}
