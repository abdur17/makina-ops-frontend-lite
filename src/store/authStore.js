// src/store/authStore.js
import { create } from "zustand";

const STORAGE_KEY = "makina_ops_auth";

const getInitialState = () => {
  if (typeof window === "undefined") {
    return { user: null, accessToken: null, refreshToken: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { user: null, accessToken: null, refreshToken: null };
    }
    const parsed = JSON.parse(raw);
    return {
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
    };
  } catch (e) {
    console.error("Failed to parse auth storage", e);
    return { user: null, accessToken: null, refreshToken: null };
  }
};

const persist = (state) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to write auth storage", e);
  }
};

export const useAuthStore = create((set, get) => ({
  ...getInitialState(),

  setAuth: (user, accessToken, refreshToken) => {
    const next = { user, accessToken, refreshToken };
    set(next);
    persist(next);
  },

  setTokens: (accessToken, refreshToken) => {
    const current = get();
    const next = {
      user: current.user,
      accessToken,
      refreshToken,
    };
    set(next);
    persist(next);
  },

  logout: () => {
    const empty = { user: null, accessToken: null, refreshToken: null };
    set(empty);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },
}));
