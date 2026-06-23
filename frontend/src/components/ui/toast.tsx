"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-gov-green" />,
  error: <AlertCircle className="h-5 w-5 text-red-600" />,
  info: <Info className="h-5 w-5 text-gov-blue" />,
  warning: <AlertTriangle className="h-5 w-5 text-gov-saffron" />,
};

const bgMap: Record<ToastType, string> = {
  success: "border-l-gov-green",
  error: "border-l-red-600",
  info: "border-l-gov-blue",
  warning: "border-l-gov-saffron",
};

export function Toast({
  message,
  type = "info",
  onClose,
  duration = 5000,
}: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-md border border-gov-border bg-white px-4 py-3 shadow-gov-lg border-l-4",
        bgMap[type]
      )}
    >
      {iconMap[type]}
      <p className="text-sm text-gov-text-dark">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 rounded-md p-1 text-gov-text-light hover:bg-gov-gray"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<
    { id: string; message: string; type: ToastType }[]
  >([]);

  const showToast = React.useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).substring(7);
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
