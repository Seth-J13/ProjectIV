/**
 * Feature 13 — Area
 * Spec: features/feature-13-Area-CRUD.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import MenuBar from "../src/components/MenuBar.vue";
import Areas from "../src/views/Areas.vue";

const areaApi = vi.hoisted(() => ({
  listAreas: vi.fn(),
  createArea: vi.fn(),
  updateArea: vi.fn(),
  removeArea: vi.fn(),
}));

vi.mock("../src/services/areaServices.js", () => ({
  default: areaApi,
}));

const Shell = {
  components: { MenuBar },
  template: "<v-app><MenuBar /><v-main><router-view /></v-main></v-app>",
};

const northCampus = {
  id: 1,
  name: "North Campus",
  noticeEmail: "north@example.com",
  logo: null,
};

let wrapper;
let listedAreas;

function storedSession(role) {
  return {
    id: role === "admin" ? 1 : 2,
    email: `${role}@example.com`,
    firstName: "Ada",
    lastName: role === "admin" ? "Admin" : "Requester",
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
      { path: "/areas", name: "areas", component: Areas },
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
  await flushPromises();
}

async function setField(label, value) {
  const fields = wrapper.findAllComponents({ name: "VTextField" });
  const field = [...fields].reverse().find((item) => item.props("label") === label);

  if (!field) {
    throw new Error(`Missing field: ${label}`);
  }

  await field.find("input").setValue(value);
}

describe("Feature 13 — Area", () => {
  beforeEach(() => {
    localStorage.clear();
    listedAreas = [];
    areaApi.listAreas.mockReset();
    areaApi.createArea.mockReset();
    areaApi.updateArea.mockReset();
    areaApi.removeArea.mockReset();
    areaApi.listAreas.mockImplementation(() => Promise.resolve({ data: listedAreas }));
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    document.body.innerHTML = "";
  });

  describe("US-13.1 — Create an area", () => {
    it("Admin creates an area", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("admin")));
      areaApi.createArea.mockImplementation(async (body) => {
        const created = { id: 1, logo: null, ...body };
        listedAreas = [created];
        return { status: 201, data: created };
      });

      const { router } = await mountApp("/landing");
      await clickLabel("Areas");

      expect(router.currentRoute.value.path).toBe("/areas");
      expect(wrapper.text()).toContain("Create area");

      await clickLabel("Create area");
      await setField("Name", "North Campus");
      await setField("Notice email", "north@example.com");
      await clickLabel("Save");

      expect(areaApi.createArea).toHaveBeenCalledWith({
        name: "North Campus",
        noticeEmail: "north@example.com",
      });
      expect(wrapper.text()).toContain("North Campus");
      expect(wrapper.text()).toContain("north@example.com");
    });
  });

  describe("US-13.2 — Read areas", () => {
    it("Admin reads the list", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("admin")));
      listedAreas = [{ ...northCampus }];

      const { router } = await mountApp("/areas");

      expect(router.currentRoute.value.path).toBe("/areas");
      expect(wrapper.text()).toContain("North Campus");
      expect(wrapper.text()).toContain("north@example.com");
    });
  });

  describe("US-13.3 — Update an area", () => {
    it("Admin updates an area", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("admin")));
      listedAreas = [{ ...northCampus }];
      areaApi.updateArea.mockImplementation(async (id, body) => {
        const updated = { ...northCampus, ...body, id };
        listedAreas = [updated];
        return { data: updated };
      });

      await mountApp("/areas");
      const row = wrapper.findAll("tbody tr").find((item) => item.text().includes("North Campus"));

      expect(row).toBeTruthy();
      await row.trigger("click");
      await flushPromises();
      await setField("Notice email", "updated@example.com");
      await clickLabel("Save");

      expect(areaApi.updateArea).toHaveBeenCalledWith(1, {
        name: "North Campus",
        noticeEmail: "updated@example.com",
      });
      expect(wrapper.text()).toContain("updated@example.com");
    });

    it("Close discards an area edit", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("admin")));
      listedAreas = [{ ...northCampus }];

      await mountApp("/areas");
      const row = wrapper.findAll("tbody tr").find((item) => item.text().includes("North Campus"));
      await row.trigger("click");
      await flushPromises();
      await setField("Notice email", "updated@example.com");
      await clickLabel("Close");

      expect(areaApi.updateArea).not.toHaveBeenCalled();
      expect(areaApi.removeArea).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain("north@example.com");
      expect(wrapper.text()).not.toContain("updated@example.com");
    });

    it("Clicking outside discards an area edit", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("admin")));
      listedAreas = [{ ...northCampus }];

      await mountApp("/areas");
      const row = wrapper.findAll("tbody tr").find((item) => item.text().includes("North Campus"));
      await row.trigger("click");
      await flushPromises();
      await setField("Notice email", "updated@example.com");
      await wrapper.get("dialog[aria-labelledby='edit-area-title']").trigger("click");
      await flushPromises();

      expect(areaApi.updateArea).not.toHaveBeenCalled();
      expect(areaApi.removeArea).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain("north@example.com");
      expect(wrapper.text()).not.toContain("updated@example.com");
    });
  });

  describe("US-13.5 — Block other roles", () => {
    it("Maintenance cannot open areas", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("maintenance")));
      listedAreas = [{ ...northCampus }];

      const { router } = await mountApp("/areas");

      expect(router.currentRoute.value.path).toBe("/landing");
      expect(wrapper.text()).not.toContain("North Campus");
      expect(wrapper.text()).not.toContain("Create area");
      expect(areaApi.listAreas).not.toHaveBeenCalled();
    });

    it("Driver cannot open areas", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("driver")));
      listedAreas = [{ ...northCampus }];

      const { router } = await mountApp("/areas");

      expect(router.currentRoute.value.path).toBe("/landing");
      expect(wrapper.text()).not.toContain("North Campus");
      expect(wrapper.text()).not.toContain("Create area");
      expect(areaApi.listAreas).not.toHaveBeenCalled();
    });
  });
});
