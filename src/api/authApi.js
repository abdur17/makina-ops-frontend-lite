import { http } from "./httpClient";

export const authApi = {
  login: (email, password) =>
    http.post("/auth/login", { email, password }),

  refresh: (refreshToken) =>
    http.post("/auth/refresh", { refreshToken }),
};
