/**
 * Feature 1 — User Auth & Session Management
 * Spec: features/feature-1-User-Auth-&-Session-Management.md
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
const PASSWORD = "a-valid-password";

const authApi = vi.hoisted(() => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

vi.mock("../src/services/authServices.js", () => ({
  default: authApi,
}));

const Shell = {
  template: "<v-app><router-view /></v-app>",
};

let wrapper;

function storedUser() {
  const raw = localStorage.getItem("user");
  expect(raw).toBeTruthy();
  return JSON.parse(raw);
}

function sessionResponse({ email, firstName, lastName, role, token }) {
  return {
    data: {
      id: 1,
      email,
      firstName,
      lastName,
      role,
      token,
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

function fieldByLabel(label) {
  const field = [...wrapper.findAllComponents({ name: "VTextField" })]
    .reverse()
    .find((item) => item.props("label") === label);

  if (!field) {
    throw new Error(`Missing field: ${label}`);
  }

  return field;
}

async function fillField(label, value) {
  await fieldByLabel(label).find("input").setValue(value);
}

async function clickButton(label) {
  const matches = wrapper
    .findAll("button")
    .filter((button) => button.text().replace(/\s+/g, " ").trim() === label);

  if (matches.length === 0) {
    throw new Error(`Missing button: ${label}`);
  }

  await matches[matches.length - 1].trigger("click");
  await flushPromises();
}

function expectPlaceholder() {
  expect(wrapper.getComponent(Landing).text().replace(/\s+/g, " ").trim()).toBe(PLACEHOLDER);
}

async function signIn({ email, firstName, lastName, role, token }) {
  authApi.loginUser.mockResolvedValue(
    sessionResponse({ email, firstName, lastName, role, token })
  );

  const { router } = await mountAuthApp("/");
  await fillField("Email", email);
  await fillField("Password", PASSWORD);
  await clickButton("Login");

  expect(authApi.loginUser).toHaveBeenCalledTimes(1);
  const submitted = JSON.stringify(authApi.loginUser.mock.calls);
  expect(submitted).toContain(email);
  expect(submitted).toContain(PASSWORD);

  const user = storedUser();
  expect(user).toMatchObject({ email, firstName, lastName, role, token });
  expect(user.password).toBeUndefined();
  expect(router.currentRoute.value.path).toBe("/landing");
  expectPlaceholder();
}

describe("Feature 1 — User Auth & Session Management", () => {
  beforeEach(() => {
    localStorage.clear();
    authApi.loginUser.mockReset();
    authApi.registerUser.mockReset();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    document.body.innerHTML = "";
  });

  describe("US-1.1 — Sign in", () => {
    it("Admin signs in", async () => {
      await signIn({
        email: "admin@example.com",
        firstName: "Ann",
        lastName: "Admin",
        role: "admin",
        token: "admin-session",
      });
    });

    it("User signs in", async () => {
      await signIn({
        email: "user@example.com",
        firstName: "Uma",
        lastName: "User",
        role: "user",
        token: "user-session",
      });
    });

    it("Driver signs in", async () => {
      await signIn({
        email: "driver@example.com",
        firstName: "Drew",
        lastName: "Driver",
        role: "driver",
        token: "driver-session",
      });
    });

    it("Maintenance signs in", async () => {
      await signIn({
        email: "maint@example.com",
        firstName: "Mia",
        lastName: "Maint",
        role: "maintenance",
        token: "maint-session",
      });
    });
  });

  describe("US-1.2 — Stay signed in across page loads", () => {
    const session = {
      id: 4,
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      role: "user",
      token: "valid-session",
    };

    it("Opening the signed-in screen", async () => {
      localStorage.setItem("user", JSON.stringify(session));

      const { router } = await mountAuthApp("/landing");

      expect(router.currentRoute.value.name).toBe("landing");
      expect(storedUser()).toMatchObject(session);
      expectPlaceholder();
      expect(authApi.loginUser).not.toHaveBeenCalled();
    });

    it("Refresh pages", async () => {
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
      expect(wrapper.text()).not.toContain("Create Account");
      expect(authApi.loginUser).not.toHaveBeenCalled();
    });
  });

  describe("US-1.4 — Create account", () => {
    it("Creating new account", async () => {
      authApi.registerUser.mockResolvedValue(
        sessionResponse({
          email: "DDevito@example.com",
          firstName: "Danny",
          lastName: "Devito",
          role: "user",
          token: "new-user-session",
        })
      );

      const { router } = await mountAuthApp("/");
      await clickButton("Create Account");
      await fillField("First name", "Danny");
      await fillField("Last name", "Devito");
      await fillField("Email", "DDevito@example.com");
      await fillField("Password", PASSWORD);
      await clickButton("Create Account");

      expect(authApi.registerUser).toHaveBeenCalledTimes(1);
      const body = authApi.registerUser.mock.calls[0][0];
      expect(body).toEqual({
        firstName: "Danny",
        lastName: "Devito",
        email: "DDevito@example.com",
        password: PASSWORD,
      });

      const user = storedUser();
      expect(user).toMatchObject({
        email: "DDevito@example.com",
        firstName: "Danny",
        lastName: "Devito",
        role: "user",
        token: "new-user-session",
      });
      expect(user.password).toBeUndefined();
      expect(router.currentRoute.value.path).toBe("/landing");
      expectPlaceholder();
    });
  });
});
