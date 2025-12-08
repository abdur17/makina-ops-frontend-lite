// src/api/usersApi.js
import { http } from "./httpClient";

export const usersApi = {
  async list(params = {}) {
    const res = await http.get("/users", { params });
    // assuming generic { data: { items: [], total: number } } shape; adjust if needed
    return res.data.data || res.data;
  },

  async getById(id) {
    const res = await http.get(`/users/${id}`);
    return res.data.data || res.data;
  },

  async create(payload) {
    const res = await http.post("/users", payload);
    return res.data.data || res.data;
  },

  async update(id, payload) {
    const res = await http.put(`/users/${id}`, payload);
    return res.data.data || res.data;
  },

  async remove(id) {
    const res = await http.delete(`/users/${id}`);
    return res.data.data || res.data;
  },
};
