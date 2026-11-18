import apiClient from "./services.js";

export default {
  getVehicles() {
    return apiClient.get("vehicle-t3/vehicles/");
  },

  getVehicle(vin) {
    return apiClient.get(`vehicle-t3/vehicles/${vin}`);
  },

  createVehicle(vehicle) {
    return apiClient.put("vehicle-t3/vehicles/", vehicle);
  },

  updateVehicle(vin, vehicle) {
    return apiClient.post(`vehicle-t3/vehicles/${vin}`, vehicle);
  },

  deleteVehicle(vin) {
    return apiClient.delete(`vehicle-t3/vehicles/${vin}`);
  },

  getFuels() {
    return apiClient.get("vehicle-t3/fuels/");
  },

  createFuel(fuel) {
    return apiClient.post("vehicle-t3/fuels/", fuel);
  },

  getMaintenanceInfo(make, model, year) {
    return apiClient.get("vehicle-t3/maintenance-info", { params: { make, model, year } });
  },

  createMaintenanceInfo(info) {
    const { make, model, year } = info;
    return apiClient.put("vehicle-t3/maintenance-info", info, { params: { make, model, year } });
  },
};
