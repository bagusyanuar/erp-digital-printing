import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginInputSchema } from "@infrastructure/auth/validators";
import type { LoginInput } from "@core/auth/applications/inputs/auth.input";
import { useAuthStore } from "../stores/auth.store";
import { useAuthDI } from "./useAuthDI";
import { useNavigate } from "react-router-dom";
import { toast } from "@erp-digital-printing/ui/Toast";

/**
 * useLogin Hook
 * 
 * Hook ini mengintegrasikan:
 * - React Hook Form + Zod untuk validasi form.
 * - TanStack Query (useMutation) untuk eksekusi API.
 * - Dependency Injection (useAuthDI) untuk mendapatkan Use Case.
 * - Zustand (useAuthStore) untuk menyimpan session token.
 */
export const useLogin = () => {
  const { loginUseCase } = useAuthDI();
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Integrasi TanStack Query
  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginInput) => loginUseCase.execute(data),
    onSuccess: (data) => {
      // Simpan token ke global state (Zustand)
      setToken(data.accessToken);
      
      toast.success("Login Berhasil", "Selamat datang kembali di ERP Digital Printing.");
      
      // Redirect ke dashboard
      navigate("/dashboard");
    },
    onError: (error: unknown) => {
      // Error handling global
      let errorMessage = "Terjadi kesalahan saat login. Periksa kembali akun Anda.";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      toast.error("Login Gagal", errorMessage);
      console.error("Login Error:", error);
    },
  });

  // Helper untuk sinkronisasi dengan component custom yang mungkin butuh onChange manual
  const handleChange = (name: keyof LoginInput, value: string) => {
    setValue(name, value, { shouldValidate: true });
  };

  const onSubmit = (data: LoginInput) => {
    mutate(data);
  };

  return {
    register,
    errors,
    isLoading: isPending,
    setValue,
    handleChange, // Tetap kita expose untuk kemudahan transisi
    handleSubmit: handleSubmit(onSubmit),
  };
};
