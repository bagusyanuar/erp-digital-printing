import { z } from "zod";
import type { CreateCategoryInput } from "@core/category/applications/inputs";

export const categoryInputSchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
}) as z.ZodType<CreateCategoryInput>;
