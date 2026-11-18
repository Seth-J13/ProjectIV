import apiClient from "./services.js";

export default {
  listAreas() {
    return apiClient.get("areas");
  },

  createArea(area) {
    return apiClient.post("areas", area);
  },

  updateArea(id, area) {
    return apiClient.put(`areas/${id}`, area);
  },

  removeArea(id) {
    return apiClient.delete(`areas/${id}`);
  },
};
