// src/api/sitesApi.js
import { http } from "./httpClient";

export const sitesApi = {
  async list(params = {}) {
    const res = await http.get("/sites", { params });
    return res.data.data || res.data;
  },

  async getById(id) {
    const res = await http.get(`/sites/${id}`);
    return res.data.data || res.data;
  },

  async create(payload) {
    const res = await http.post("/sites", payload);
    return res.data.data || res.data;
  },

  async update(id, payload) {
    const res = await http.put(`/sites/${id}`, payload);
    return res.data.data || res.data;
  },

  async remove(id) {
    const res = await http.delete(`/sites/${id}`);
    return res.data.data || res.data;
  },
};
