import apiClient from "./services.js";

export default {
  getMaintenanceInfo(make, model, year) {
    return apiClient.get("vehicle-t3/maintenance-infos", { params: { make, model, year } });
  },

  updateMaintenanceInfo(make, model, year, info) {
    return apiClient.put("vehicle-t3/maintenance-infos", info, { params: { make, model, year } });
  },

  createMaintenanceInfo(info) {
    return apiClient.post("vehicle-t3/maintenance-info/", info);
  },

  getRequests(vehicleId) {
    return apiClient.get(`vehicle-t3/requests/${vehicleId}`);
  },

  getNotes(requestId) {
    return apiClient.get(`vehicle-t3/notes/${requestId}`);
  },

  createNote(note) {
    return apiClient.post("vehicle-t3/notes/", note);
  },

  updateNote(noteId, note) {
    return apiClient.put(`vehicle-t3/notes/${noteId}`, note);
  },

  deleteNote(noteId) {
    return apiClient.delete(`vehicle-t3/notes/${noteId}`);
  },

  getFuels() {
    return apiClient.get("vehicle-t3/fuels/");
  },

  createFuel(fuel) {
    return apiClient.post("vehicle-t3/fuels/", fuel);
  },

  updateFuel(fuelId, fuel) {
    return apiClient.put(`vehicle-t3/fuels/${fuelId}`, fuel);
  },

  deleteFuel(fuelId) {
    return apiClient.delete(`vehicle-t3/fuels/${fuelId}`);
  },

  getVehicle(vin) {
    return apiClient.get(`vehicle-t3/vehicles/${vin}`);
  },

  updateVehicle(vin, vehicle) {
    return apiClient.put(`vehicle-t3/vehicles/${vin}`, vehicle);
  },

  updateVehicleMileage(vin, mileage) {
    return apiClient.put(`vehicle-t3/vehicles/${vin}`, { mileage });
  },

  createVehicleServiceLog(log) {
    return apiClient.post("vehicle-t3/vehicle-service-logs/", log);
  },
};
