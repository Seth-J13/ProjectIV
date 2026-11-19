import apiClient from "./services.js";

const requestServices = {
  findAll() {
    return apiClient.get("/requests");
  },

  findVehicles() {
    return apiClient.get("/vehicles");
  },

  findDrivers() {
    return apiClient.get("/drivers");
  },

  findDestinations() {
    return apiClient.get("/destinations");
  },

  create(body) {
    return apiClient.post("/requests", body);
  },

  update(requestId, body) {
    return apiClient.put(`/requests/${requestId}`, body);
  },

  remove(requestId) {
    return apiClient.delete(`/requests/${requestId}`);
  },
};

export default requestServices;
