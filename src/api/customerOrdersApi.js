// src/api/customerOrdersApi.js
import { http } from "./httpClient";

export const customerOrdersApi = {
  async list(params = {}) {
    const res = await http.get("/customer-orders", { params });
    return res.data.data || res.data;
  },

  async getById(id) {
    const res = await http.get(`/customer-orders/${id}`);
    return res.data.data || res.data;
  },

  async create(payload) {
    const res = await http.post("/customer-orders", payload);
    return res.data.data || res.data;
  },

  async update(id, payload) {
    // ✅ use PUT to match generic CRUD router
    const res = await http.put(`/customer-orders/${id}`, payload);
    return res.data.data || res.data;
  },

  async remove(id) {
    const res = await http.delete(`/customer-orders/${id}`);
    return res.data.data || res.data;
  },
};
