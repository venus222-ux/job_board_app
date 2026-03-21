import { create } from "zustand";
import { refreshToken } from "../api";

type Role = "candidate" | "employer" | "admin" | null;

interface AppState {
  isAuth: boolean;
  token: string | null;
  role: Role;

  theme: "light" | "dark";
  user: any | null;

  setAuth: (token: string, role: Role) => void;
  logout: () => void;

  setIsAuth: (auth: boolean, token?: string) => void;
  setToken: (token: string | null) => void;

  toggleTheme: () => void;
  startTokenRefreshLoop: () => void;
}

let refreshInterval: ReturnType<typeof setInterval> | null = null;

export const useStore = create<AppState>((set, get) => ({
  isAuth: !!localStorage.getItem("token"),
  token: localStorage.getItem("token"),
  role: (localStorage.getItem("role") as Role) || null,

  theme: (localStorage.getItem("theme") as "light" | "dark") || "light",

  user: null,

  // 🔐 NEW — login helper
  setAuth: (token, role) => {
    localStorage.setItem("token", token);
    if (role) localStorage.setItem("role", role);

    set({
      isAuth: true,
      token,
      role,
    });
  },

  // 🚪 NEW — logout helper
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }

    set({
      isAuth: false,
      token: null,
      role: null,
    });
  },

  setIsAuth: (auth, token) => {
    if (auth && token) {
      localStorage.setItem("token", token);
      set({ isAuth: true, token });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }

      set({ isAuth: false, token: null, role: null });
    }
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
      set({ token });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      set({ token: null, role: null });
    }
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-bs-theme", newTheme);
      return { theme: newTheme };
    });
  },

  startTokenRefreshLoop: () => {
    if (refreshInterval) return;

    refreshInterval = setInterval(
      async () => {
        if (!localStorage.getItem("token")) return;

        try {
          const res = await refreshToken();
          const newToken = res.data.token;
          get().setToken(newToken);
        } catch {
          get().logout();
          window.location.replace("/login");
        }
      },
      4 * 60 * 1000,
    );
  },
}));
