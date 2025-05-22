
import { ToastActionElement, ToastProps } from "@/components/ui/toast";
import { useState, useEffect } from "react";

type Toast = {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

// Simple in-memory state for toasts
let toastsData: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

const addToast = (toast: Toast) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast = { ...toast, id };
  toastsData = [...toastsData, newToast];
  listeners.forEach(listener => listener(toastsData));
  return id;
};

const dismissToast = (id: string) => {
  toastsData = toastsData.filter(t => t.id !== id);
  listeners.forEach(listener => listener(toastsData));
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>(toastsData);
  
  useEffect(() => {
    const listener = (updatedToasts: Toast[]) => {
      setToasts([...updatedToasts]);
    };
    
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const toast = (props: Toast) => {
    return addToast(props);
  };

  const dismiss = (id: string) => {
    dismissToast(id);
  };

  return {
    toast,
    dismiss,
    toasts
  };
};

export const toast = (props: Toast) => {
  return addToast(props);
};
