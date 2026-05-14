import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginInputSchema } from "@infrastructure/auth/validators";
import type { LoginInput } from "@core/auth/applications/inputs";
import * as React from "react";

export const useLogin = () => {
  const [isLoading, setIsLoading] = React.useState(false);

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

  // Helper untuk sinkronisasi dengan component custom yang mungkin butuh onChange manual
  const handleChange = (name: keyof LoginInput, value: string) => {
    setValue(name, value, { shouldValidate: true });
  };

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      // Logic login akan memanggil Usecase di sini nanti
      console.log("Submitting login form (RHF + Zod):", data);

      // Simulasi delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    errors,
    isLoading,
    setValue,
    handleChange, // Tetap kita expose untuk kemudahan transisi
    handleSubmit: handleSubmit(onSubmit),
  };
};
