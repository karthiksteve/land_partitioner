"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import type { User } from "@/types";

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, setAuth, logout: storeLogout, setUser } = useAuthStore();

  const login = useCallback(
    async (username: string, password: string) => {
      const response = await authApi.login({ username, password });
      setAuth(response.user, response.access_token);
      return response;
    },
    [setAuth]
  );

  const register = useCallback(
    async (data: {
      full_name: string;
      email: string;
      username: string;
      password: string;
      role: string;
    }) => {
      const response = await authApi.register(data);
      return response;
    },
    []
  );

  const logout = useCallback(() => {
    storeLogout();
    router.push("/");
  }, [storeLogout, router]);

  const fetchUser = useCallback(async () => {
    try {
      const userData: User = await authApi.getMe();
      setUser(userData);
      return userData;
    } catch {
      storeLogout();
      return null;
    }
  }, [setUser, storeLogout]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser && !isAuthenticated) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setAuth(parsedUser, storedToken);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, [isAuthenticated, setAuth]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
  };
}
