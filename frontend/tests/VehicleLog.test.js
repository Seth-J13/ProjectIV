/**
 * Feature 10 — Vehicle Service Log
 * Spec: features/feature-10-Vehicle-Service-CRUD copy.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import MenuBar from "../src/components/MenuBar.vue";
import VehicleLogs from "../src/views/VehicleLogs.vue";

const logApi = vi.hoisted(() => ({
  listLogs: vi.fn(),
  listOwnerChoices: vi.fn(),
  createLog: vi.fn(),
  updateLog: vi.fn(),
  removeLog: vi.fn(),
  addOwner: vi.fn(),
}));

vi.mock("../src/services/vehicleLogServices.js", () => ({
  default: logApi,
}));

const Shell = {
  components: { MenuBar },
  template: "<v-app><MenuBar /><v-main><router-view /></v-main></v-app>",
};

const VIN = "1HGCM82633A004352";

const sampleLog = {
  id: 1,
  serviceDate: "2026-11-10",
  vin: VIN,
  description: "Replaced front brake pads",
  completed: true,
  creatorId: 2,
  ownerIds: [2],
  createdAt: "2026-11-10T18:00:00.000Z",
  updatedAt: "2026-11-10T18:00:00.000Z",
};

let wrapper;
let listedLogs;

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
      { path: "/vehicle-logs", name: "vehicle-logs", component: VehicleLogs },
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

  await field.setValue(value);
}

describe("Feature 10 — Vehicle Service Log", () => {
  beforeEach(() => {
    localStorage.clear();
    listedLogs = [];
    logApi.listLogs.mockReset();
    logApi.listOwnerChoices.mockReset();
    logApi.createLog.mockReset();
    logApi.updateLog.mockReset();
    logApi.removeLog.mockReset();
    logApi.addOwner.mockReset();
    logApi.listLogs.mockImplementation(() => Promise.resolve({ data: listedLogs }));
    logApi.listOwnerChoices.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    document.body.innerHTML = "";
  });

  describe("US-10.1 — Create Vehicle logs", () => {
    it("Maintenance creates a log", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("maintenance")));
      logApi.createLog.mockImplementation(async (body) => {
        const created = { ...sampleLog, ...body, creatorId: 2, ownerIds: [2] };
        listedLogs = [created];
        return { status: 201, data: created };
      });

      const { router } = await mountApp("/vehicle-logs");

      expect(router.currentRoute.value.path).toBe("/vehicle-logs");
      await clickLabel("Create log");
      await setField("Service date", "2026-11-10");
      await setField("Vehicle", VIN);
      await setField("Description", "Replaced front brake pads");
      await setField("Completed", true);
      await clickLabel("Save");

      expect(logApi.createLog).toHaveBeenCalledWith({
        serviceDate: "2026-11-10",
        vin: VIN,
        description: "Replaced front brake pads",
        completed: true,
      });
      expect(wrapper.text()).toContain(VIN);
      expect(wrapper.text()).toContain("2");
    });
  });

  describe("US-10.3 — Read Vehicle Logs", () => {
    it("Maintenance reads the logs", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("maintenance")));
      listedLogs = [{ ...sampleLog }];

      const { router } = await mountApp("/vehicle-logs");

      expect(router.currentRoute.value.path).toBe("/vehicle-logs");
      expect(wrapper.text()).toContain("2026-11-10");
      expect(wrapper.text()).toContain(VIN);
      expect(wrapper.text()).toContain("Replaced front brake pads");
      expect(wrapper.text()).toContain("Yes");
      expect(wrapper.text()).toContain("2");
    });

    it("Admin reads the logs", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("admin")));
      listedLogs = [{ ...sampleLog, creatorId: 4, ownerIds: [4] }];

      const { router } = await mountApp("/vehicle-logs");

      expect(router.currentRoute.value.path).toBe("/vehicle-logs");
      expect(wrapper.text()).toContain(VIN);
      expect(wrapper.text()).toContain("Replaced front brake pads");
    });

    it("Driver cannot open the page", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("driver")));
      listedLogs = [{ ...sampleLog }];

      const { router } = await mountApp("/vehicle-logs");

      expect(router.currentRoute.value.path).toBe("/landing");
      expect(wrapper.text()).not.toContain(VIN);
      expect(wrapper.text()).not.toContain("Create log");
      expect(logApi.listLogs).not.toHaveBeenCalled();
    });
  });

  describe("US-10.2 — Vehicle logs Ownership permissions", () => {
    it("Owner picker sends the user id", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("maintenance")));
      listedLogs = [{ ...sampleLog }];
      logApi.listOwnerChoices.mockResolvedValue({
        data: [
          { id: 9, firstName: "Grace", lastName: "Hopper" },
          { id: 12, firstName: "Alan", lastName: "Turing" },
        ],
      });
      logApi.addOwner.mockResolvedValue({
        data: { ...sampleLog, ownerIds: [2, 12] },
      });

      await mountApp("/vehicle-logs");
      const row = wrapper.findAll("tbody tr").find((item) => item.text().includes(VIN));

      await row.trigger("click");
      await flushPromises();

      expect(wrapper.text()).toContain("Owners: 2");

      const field = wrapper
        .findAllComponents({ name: "VCombobox" })
        .find((item) => item.props("label") === "User");

      expect(field.props("items").map((item) => item.label)).toEqual([
        "Grace Hopper (9)",
        "Alan Turing (12)",
      ]);

      await field.setValue("12");
      await clickLabel("Add owner");

      expect(logApi.addOwner).toHaveBeenCalledTimes(1);
      expect(logApi.addOwner).toHaveBeenCalledWith(1, 12);
      expect(wrapper.text()).toContain("Alan Turing (12)");
      expect(wrapper.text()).toContain("Owners: 2, Alan Turing (12)");
    });
  });

  describe("US-10.4 — Modify Vehicle Log", () => {
    it("Owner updates a log", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("maintenance")));
      listedLogs = [{ ...sampleLog }];
      logApi.updateLog.mockImplementation(async (id, body) => {
        const updated = { ...sampleLog, ...body, id };
        listedLogs = [updated];
        return { data: updated };
      });

      await mountApp("/vehicle-logs");
      const row = wrapper.findAll("tbody tr").find((item) => item.text().includes(VIN));

      expect(row).toBeTruthy();
      await row.trigger("click");
      await flushPromises();
      await setField("Description", "Adjusted the brake pads");
      await clickLabel("Save");

      expect(logApi.updateLog).toHaveBeenCalledWith(1, {
        serviceDate: "2026-11-10",
        vin: VIN,
        description: "Adjusted the brake pads",
        completed: true,
      });
      expect(wrapper.text()).toContain("Adjusted the brake pads");
    });

    it("Click outside cancels the log", async () => {
      localStorage.setItem("user", JSON.stringify(storedSession("maintenance")));
      listedLogs = [{ ...sampleLog, description: "Original pads" }];

      await mountApp("/vehicle-logs");
      const row = wrapper.findAll("tbody tr").find((item) => item.text().includes(VIN));

      await row.trigger("click");
      await flushPromises();
      await setField("Description", "Unsaved change");

      const dialogs = wrapper.findAll("dialog");
      await dialogs[dialogs.length - 1].trigger("click");
      await flushPromises();

      expect(logApi.updateLog).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain("Original pads");
      expect(wrapper.text()).not.toContain("Unsaved change");
    });
  });
});
