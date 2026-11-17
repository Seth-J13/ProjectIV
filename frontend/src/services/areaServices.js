import apiClient from "./services.js";

export default {
  getAreas() {
    return apiClient.get("vehicle-t3/areas/");
  },
};
