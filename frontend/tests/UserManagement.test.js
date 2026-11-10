/**
 * Feature 3 — User Management
 * Spec: features/feature-3-User-Management.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import MenuBar from "../src/components/MenuBar.vue";
import UserManagement from "../src/views/UserManagement.vue";

const userApi = vi.hoisted(() => ({
  listUsers: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("../src/services/userServices.js", () => ({
  default: userApi,
}));

const Shell = {
  components: { MenuBar },
  template: "<v-app><MenuBar /><v-main><router-view /></v-main></v-app>",
};

const accounts = [
  {
    id: 2,
    firstName: "Amy",
    lastName: "Adams",
    email: "amy@example.com",
    role: "user",
  },
  {
    id: 1,
    firstName: "Ann",
    lastName: "Admin",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: 3,
    firstName: "Zoe",
    lastName: "Zimmer",
    email: "zoe@example.com",
    role: "driver",
  },
];

let wrapper;
let listedUsers;

function storedSession(role) {
  return {
    id: role === "admin" ? 1 : 2,
    email: role === "admin" ? "admin@example.com" : "amy@example.com",
    firstName: role === "admin" ? "Ann" : "Amy",
    lastName: role === "admin" ? "Admin" : "Adams",
    role,
    token: `${role}-token`,
  };
}

async function mountApp(path = "/landing") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "login", component: { template: "<div>Login</div>" } },
      { path: "/landing", name: "landing", component: { template: "<div>Landing</div>" } },
      { path: "/users", name: "users", component: UserManagement },
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

  await flushPromises();
  return { router };
}

async function clickLabel(label) {
  const matches = wrapper.findAll("a, button, [role='button']").filter((node) => {
    return node.text().replace(/\s+/g, " ").trim() === label;
  });

  if (matches.length === 0) {
    throw new Error(`Missing control: ${label}`);
  }

  await matches[matches.length - 1].trigger("click");
  await flushPromises();
}

async function setField(label, value) {
  const fields = [
    ...wrapper.findAllComponents({ name: "VTextField" }),
    ...wrapper.findAllComponents({ name: "VSelect" }),
  ];
  const field = [...fields].reverse().find((item) => item.props("label") === label);

  if (!field) {
    throw new Error(`Missing field: ${label}`);
  }

  const input = field.find("input");
  if (input.exists()) {
    await input.setValue(value);
    return;
  }

  await field.setValue(value);
}

function expectAccountVisible(account) {
  const text = wrapper.text();
  expect(text).toContain(account.firstName);
  expect(text).toContain(account.lastName);
  expect(text).toContain(account.email);
  expect(text).toContain(account.role);
}

describe("Feature 3 — User Management", () => {
  beforeEach(() => {
    localStorage.clear();
    listedUsers = accounts.map((account) => ({ ...account }));
    userApi.listUsers.mockReset();
    userApi.updateUser.mockReset();
    userApi.listUsers.mockImplementation(() => Promise.resolve({ data: listedUsers }));
    userApi.updateUser.mockImplementation(async (id, body) => {
      listedUsers = listedUsers.map((account) => {
        return account.id === id ? { ...account, ...body } : account;
      });
      return { data: listedUsers.find((account) => account.id === id) };
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    document.body.innerHTML = "";
  });

  describe("US-3.1 — View users", () => {
    it("Admin opens user management", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("admin")));

      const { router } = await mountApp("/landing");
      await clickLabel("User Management");

      expect(router.currentRoute.value.path).toBe("/users");
      expect(wrapper.text()).toContain("User Management");
      expectAccountVisible(accounts[0]);
      expectAccountVisible(accounts[2]);
      expect(wrapper.text().indexOf("Adams")).toBeLessThan(wrapper.text().indexOf("Zimmer"));
      expect(wrapper.text()).not.toContain("password");
      expect(userApi.listUsers).toHaveBeenCalled();
    });

    it("Refresh user management", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("admin")));

      const first = await mountApp("/users");
      expect(first.router.currentRoute.value.path).toBe("/users");
      expectAccountVisible(accounts[0]);
      expectAccountVisible(accounts[2]);
      wrapper.unmount();
      wrapper = undefined;

      const { router } = await mountApp("/users");

      expect(router.currentRoute.value.path).toBe("/users");
      expectAccountVisible(accounts[0]);
      expectAccountVisible(accounts[2]);
      expect(wrapper.text()).not.toContain("password");
    });
  });

  describe("US-3.2 — Edit user data", () => {
    it("Admin edits a user", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("admin")));

      const { router } = await mountApp("/users");
      const row = wrapper.findAll("tr").find((item) => item.text().includes("amy@example.com"));

      expect(row).toBeTruthy();
      await row.get("button").trigger("click");
      await flushPromises();
      await setField("First name", "Ada");
      await setField("Last name", "Lovelace");
      await setField("Email", "ada@example.com");
      await setField("Role", "maintenance");
      await clickLabel("Save");

      expect(userApi.updateUser).toHaveBeenCalledWith(2, {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        role: "maintenance",
      });
      expect(wrapper.text()).toContain("User updated.");
      expect(wrapper.text()).toContain("Ada");
      expect(wrapper.text()).toContain("Lovelace");
      expect(wrapper.text()).toContain("ada@example.com");
      expect(wrapper.text()).toContain("maintenance");
      expect(router.currentRoute.value.path).toBe("/users");
    });
  });

  describe("US-3.3 — Keep the page admin-only", () => {
    it("Non-admin cannot open user management", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("user")));

      const { router } = await mountApp("/landing");

      expect(wrapper.text()).not.toContain("User Management");

      await router.push("/users");
      await flushPromises();

      expect(router.currentRoute.value.path).toBe("/landing");
      expect(wrapper.text()).not.toContain("zoe@example.com");
      expect(wrapper.text()).not.toContain("User Management");
    });
  });
});
