import { z } from "zod";
import type { CreateResellerInput } from "@core/reseller/applications/inputs";

export const resellerInputSchema = z.object({
  name: z.string().min(1, "Nama reseller wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  creditLimit: z.number({
    required_error: "Limit kredit wajib diisi",
    invalid_type_error: "Limit kredit harus berupa angka",
  }).min(0, "Limit kredit tidak boleh kurang dari 0"),
}) as z.ZodType<CreateResellerInput>;
