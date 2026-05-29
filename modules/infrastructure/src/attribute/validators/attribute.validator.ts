import { z } from "zod";
import type { CreateAttributeInput } from "@core/attribute/applications/inputs";

export const attributeInputSchema = z.object({
  name: z.string().min(1, "Nama atribut wajib diisi"),
  value_type: z.string().default("text"),
  options: z.array(z.string()).optional(),
}) as z.ZodType<CreateAttributeInput>;
