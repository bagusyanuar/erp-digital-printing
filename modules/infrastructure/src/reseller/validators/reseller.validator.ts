import { z } from "zod";
import type { CreateResellerInput } from "@core/reseller/applications/inputs";

export const resellerInputSchema = z.object({
  name: z.string().min(1, "Nama reseller wajib diisi"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  creditLimit: z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? undefined : Number(val),
    z.number().min(0, "Limit kredit tidak boleh kurang dari 0").optional()
  ),
}) as z.ZodType<CreateResellerInput>;
