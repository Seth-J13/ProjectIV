import apiClient from "./services.js";

const driverServices = {
  findAll() {
    return apiClient.get("/vehicle-t3");
  },

  create(driver) {
    return apiClient.post("/vehicle-t3", driver);
  },

  update(driverId, driver) {
    return apiClient.put(`/vehicle-t3/${driverId}`, driver);
  },

  remove(driverId) {
    return apiClient.delete(`/vehicle-t3/${driverId}`);
  },
};

export default driverServices;
