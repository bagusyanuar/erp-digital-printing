import * as React from "react";
import type { LoginInput } from "@core/auth/applications/inputs";

export const useLogin = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [form, setForm] = React.useState<LoginInput>({
    username: "",
    password: "",
  });

  const handleChange = (name: keyof LoginInput, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Logic login akan memanggil Usecase di sini nanti
      console.log("Submitting login form:", form);
      
      // Simulasi delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    handleChange,
    handleSubmit,
  };
};
