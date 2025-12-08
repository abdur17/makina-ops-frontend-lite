// src/api/customersApi.js
import { http } from "./httpClient";

export const customersApi = {
  async list(params = {}) {
    const res = await http.get("/customers", { params });
    // generic CRUD shape: { data: { items: [], total } } or plain array
    return res.data.data || res.data;
  },

  async getById(id) {
    const res = await http.get(`/customers/${id}`);
    return res.data.data || res.data;
  },

  async create(payload) {
    const res = await http.post("/customers", payload);
    return res.data.data || res.data;
  },

  async update(id, payload) {
    const res = await http.put(`/customers/${id}`, payload);
    return res.data.data || res.data;
  },

  async remove(id) {
    const res = await http.delete(`/customers/${id}`);
    return res.data.data || res.data;
  },
};
