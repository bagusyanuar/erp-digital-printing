export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export type ToastAction = 
  | { type: "ADD_TOAST"; toast: ToastProps }
  | { type: "REMOVE_TOAST"; id: string };
