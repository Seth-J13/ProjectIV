import apiClient from "./services.js";

export default {
  listUsers() {
    return apiClient.get("users");
  },

  updateUser(id, user) {
    return apiClient.put(`users/${id}`, user);
  },
};
