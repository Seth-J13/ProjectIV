import apiClient from "./services.js";

export function listDestinations(offset = 0) {
  return apiClient.get("vehicle-t3/destinations", { params: { offset } });
}

export function createDestination(body) {
  return apiClient.post("vehicle-t3/destinations/", body);
}

export function updateDestination(id, body) {
  return apiClient.put(`vehicle-t3/destinations/${id}`, body);
}

export function deleteDestination(id) {
  return apiClient.delete(`vehicle-t3/destinations/${id}`);
}
