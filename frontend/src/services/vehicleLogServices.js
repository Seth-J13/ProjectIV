import apiClient from "./services.js";

export default {
  listLogs() {
    return apiClient.get("vehicle-logs");
  },

  createLog(log) {
    return apiClient.post("vehicle-logs", log);
  },

  updateLog(id, log) {
    return apiClient.put(`vehicle-logs/${id}`, log);
  },

  removeLog(id) {
    return apiClient.delete(`vehicle-logs/${id}`);
  },

  addOwner(id, userId) {
    return apiClient.post(`vehicle-logs/${id}/owners`, { userId });
  },
};
