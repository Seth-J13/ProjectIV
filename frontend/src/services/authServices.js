import apiClient from "./services.js";

function basicCredentials(email, password) {
  return btoa(`${email}:${password}`);
}

export default {
  loginUser(email, password) {
    return apiClient.post("login", null, {
      headers: { Authorization: `Basic ${basicCredentials(email, password)}` },
    });
  },

  registerUser(account) {
    return apiClient.post("register", account);
  },

  googleLogin(idToken) {
    return apiClient.post("google", { idToken });
  },

  logoutUser() {
    return apiClient.post("logout");
  },
};
