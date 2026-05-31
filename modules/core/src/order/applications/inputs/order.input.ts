import type { DraftOrderItemModel } from "../../domains/models/order.model";

export interface SaveDraftOrderInput {
  designer_id: string;
  notes: string;
  items: DraftOrderItemModel[];
}
