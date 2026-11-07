/**
 * Feature 2 — Google Auth
 * Spec: features/feature-2-Google-Auth.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import Login from "../src/views/Login.vue";
import Landing from "../src/views/Landing.vue";

const PLACEHOLDER = "This feature has not been implemented yet";
const CLIENT_ID = "test-google-client-id";
const ID_TOKEN = "verified-google-id-token";

const authApi = vi.hoisted(() => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  googleLogin: vi.fn(),
}));

vi.mock("../src/services/authServices.js", () => ({
  default: authApi,
}));

const Shell = {
  template: "<v-app><router-view /></v-app>",
};

let wrapper;
let googleMode = "success";

function storedUser() {
  const raw = localStorage.getItem("user");
  expect(raw).toBeTruthy();
  return JSON.parse(raw);
}

function installGoogleIdentity() {
  let credentialCallback = null;

  window.google = {
    accounts: {
      id: {
        initialize: vi.fn((config) => {
          credentialCallback = config.callback;
        }),
        renderButton: vi.fn(),
        prompt: vi.fn((momentListener) => {
          if (googleMode === "cancel") {
            momentListener?.({
              isNotDisplayed: () => false,
              isSkippedMoment: () => false,
              isDismissedMoment: () => true,
              getDismissedReason: () => "cancel_called",
            });
            return;
          }

          credentialCallback?.({ credential: ID_TOKEN });
        }),
      },
    },
  };
}

async function mountAuthApp(path = "/") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "login", component: Login },
      { path: "/landing", name: "landing", component: Landing },
    ],
  });

  await router.push(path);
  await router.isReady();

  wrapper = mount(Shell, {
    attachTo: document.body,
    global: {
      plugins: [createVuetify({ components, directives }), router],
      stubs: { teleport: true },
    },
  });

  return { router };
}

async function clickButton(label) {
  const matches = wrapper.findAll("button, [role='button']").filter((button) => {
    return button.text().replace(/\s+/g, " ").trim() === label;
  });

  if (matches.length === 0) {
    throw new Error(`Missing button: ${label}`);
  }

  await matches[matches.length - 1].trigger("click");
  await flushPromises();
}

function expectPlaceholder() {
  expect(wrapper.getComponent(Landing).text().replace(/\s+/g, " ").trim()).toBe(PLACEHOLDER);
}

describe("Feature 2 — Google Auth", () => {
  beforeEach(() => {
    localStorage.clear();
    googleMode = "success";
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", CLIENT_ID);
    authApi.loginUser.mockReset();
    authApi.registerUser.mockReset();
    authApi.googleLogin.mockReset();
    installGoogleIdentity();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    delete window.google;
    document.body.innerHTML = "";
    vi.unstubAllEnvs();
  });

  describe("US-2.1 — Continue with Google", () => {
    it("New Google user signs in", async () => {
      authApi.googleLogin.mockResolvedValue({
        data: {
          id: 1,
          email: "ada@example.com",
          firstName: "Ada",
          lastName: "Lovelace",
          role: "user",
          token: "google-session-token",
        },
      });

      const { router } = await mountAuthApp("/");
      await clickButton("Continue with Google");

      expect(window.google.accounts.id.initialize).toHaveBeenCalledWith(
        expect.objectContaining({ client_id: CLIENT_ID })
      );
      expect(window.google.accounts.id.prompt).toHaveBeenCalled();
      expect(JSON.stringify(authApi.googleLogin.mock.calls)).toContain(ID_TOKEN);
      expect(authApi.loginUser).not.toHaveBeenCalled();

      const user = storedUser();
      expect(user).toEqual({
        id: 1,
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        role: "user",
        token: "google-session-token",
      });
      const stored = localStorage.getItem("user");
      expect(stored).not.toContain(ID_TOKEN);
      expect(stored).not.toContain("googleSub");
      expect(router.currentRoute.value.path).toBe("/landing");
      expectPlaceholder();
    });

    it("Refresh after Google sign-in", async () => {
      const session = {
        id: 1,
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        role: "user",
        token: "google-session-token",
      };
      localStorage.setItem("user", JSON.stringify(session));

      const first = await mountAuthApp("/landing");
      expect(first.router.currentRoute.value.path).toBe("/landing");
      expectPlaceholder();
      wrapper.unmount();
      wrapper = undefined;

      const { router } = await mountAuthApp("/landing");

      expect(router.currentRoute.value.path).toBe("/landing");
      expect(storedUser()).toEqual(session);
      expectPlaceholder();
      expect(authApi.googleLogin).not.toHaveBeenCalled();
      expect(authApi.loginUser).not.toHaveBeenCalled();
    });
  });

  describe("US-2.4 — Stay signed out when Google does not confirm", () => {
    it("User cancels Google", async () => {
      googleMode = "cancel";
      installGoogleIdentity();

      const { router } = await mountAuthApp("/");
      await clickButton("Continue with Google");

      expect(window.google.accounts.id.prompt).toHaveBeenCalled();
      expect(authApi.googleLogin).not.toHaveBeenCalled();
      expect(localStorage.getItem("user")).toBeNull();
      expect(wrapper.text()).toContain("Google sign-in was cancelled.");
      expect(router.currentRoute.value.name).toBe("login");
      expect(router.currentRoute.value.path).toBe("/");
    });
  });
});
