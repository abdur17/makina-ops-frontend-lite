// src/api/customerUsersApi.js
import { usersApi } from "./usersApi";

export const customerUsersApi = {
  async list(params = {}) {
    // Always scope to CUSTOMER role
    return usersApi.list({ role: "CUSTOMER", ...params });
  },

  async getById(id) {
    return usersApi.getById(id);
  },

  async create(payload) {
    // Force CUSTOMER role
    return usersApi.create({ ...payload, role: "CUSTOMER" });
  },

  async update(id, payload) {
    return usersApi.update(id, payload);
  },

  async remove(id) {
    return usersApi.remove(id);
  },
};
