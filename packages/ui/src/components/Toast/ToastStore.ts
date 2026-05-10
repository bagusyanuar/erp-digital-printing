import { ToastProps } from "./Toast.types";

type ToastListener = (toasts: ToastProps[]) => void;

class ToastStore {
  private toasts: ToastProps[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  add(toast: Omit<ToastProps, "id">) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    this.toasts = [newToast, ...this.toasts].slice(0, 5); // Limit to 5 toasts
    this.notify();

    if (toast.duration !== 0) {
      setTimeout(() => {
        this.remove(id);
      }, toast.duration || 3000);
    }
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  getToasts() {
    return this.toasts;
  }
}

export const toastStore = new ToastStore();

export const toast = {
  success: (title: string, description?: string) => 
    toastStore.add({ title, description, variant: "success" }),
  error: (title: string, description?: string) => 
    toastStore.add({ title, description, variant: "error" }),
  warning: (title: string, description?: string) => 
    toastStore.add({ title, description, variant: "warning" }),
  info: (title: string, description?: string) => 
    toastStore.add({ title, description, variant: "info" }),
  default: (title: string, description?: string) => 
    toastStore.add({ title, description, variant: "default" }),
};
