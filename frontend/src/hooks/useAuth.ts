"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { LoginRequest, RegisterRequest } from "@/types";
import { useRouter } from "next/navigation";

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!store.isAuthenticated && !store.isLoading) {
      store.checkAuth();
    }
  }, []);

  const login = async (data: LoginRequest) => {
    await store.login(data);
    router.push("/dashboard");
  };

  const register = async (data: RegisterRequest) => {
    await store.register(data);
    router.push("/dashboard");
  };

  const logout = () => {
    store.logout();
    router.push("/login");
  };

  return {
    user: store.user,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    error: store.error,
    login,
    register,
    logout,
    checkAuth: store.checkAuth,
    clearError: store.clearError,
  };
}
