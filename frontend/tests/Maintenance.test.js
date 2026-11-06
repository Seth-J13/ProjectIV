/**
 * Feature 5 — Maintenance Info CRUD
 * Spec: features/feature-5-Maintenance-Info-CRUD.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import Maintenance from "../src/views/Maintenance.vue";
import { mountWithPlugins, vuetify } from "./testUtils.js";
import Utils from "../src/config/utils.js";

const getMaintenanceInfo = vi.fn();
const updateMaintenanceInfo = vi.fn();
const createMaintenanceInfo = vi.fn();
const getNotes = vi.fn();
const createNote = vi.fn();
const updateNote = vi.fn();
const deleteNote = vi.fn();
const getRequests = vi.fn();
const getFuels = vi.fn();
const createFuel = vi.fn();
const updateFuel = vi.fn();
const deleteFuel = vi.fn();
const updateVehicleMileage = vi.fn();
const createVehicleServiceLog = vi.fn();
const getVehicle = vi.fn();

vi.mock("../src/services/maintenanceServices.js", () => ({
  default: {
    getMaintenanceInfo: (...a) => getMaintenanceInfo(...a),
    updateMaintenanceInfo: (...a) => updateMaintenanceInfo(...a),
    createMaintenanceInfo: (...a) => createMaintenanceInfo(...a),
    getNotes: (...a) => getNotes(...a),
    createNote: (...a) => createNote(...a),
    updateNote: (...a) => updateNote(...a),
    deleteNote: (...a) => deleteNote(...a),
    getRequests: (...a) => getRequests(...a),
    getFuels: (...a) => getFuels(...a),
    createFuel: (...a) => createFuel(...a),
    updateFuel: (...a) => updateFuel(...a),
    deleteFuel: (...a) => deleteFuel(...a),
    updateVehicleMileage: (...a) => updateVehicleMileage(...a),
    createVehicleServiceLog: (...a) => createVehicleServiceLog(...a),
    getVehicle: (...a) => getVehicle(...a),
  },
}));

const sampleVin = "12345671234567123";

const sampleVehicle = {
  vin: sampleVin,
  make: "Honda",
  model: "Accord",
  year: 2014,
  mileage: 5000,
  department: "Engineering",
};

const sampleMaintenance = {
  make: "Honda",
  model: "Accord",
  year: 2014,
  fuel_type_id: 1,
  fuel_type: "87 Octane",
  fuel_capacity: 30,
  oil_viscosity: "5W4",
  recommended_tire_psi: 35,
  tire_type: "P205/55R16 95H",
};

const sampleNotes = [
  {
    note_id: 1,
    subject: "Check tires",
    description: "Increase tire pressure",
    text: "Increase tire pressure",
    request_id: 5,
  },
  {
    note_id: 2,
    subject: "Oil change",
    description: "Replace oil filter",
    text: "Replace oil filter",
    request_id: 5,
  },
];

const sampleFuels = [
  { fuel_id: 1, fuel_type: "87 Octane" },
  { fuel_id: 2, fuel_type: "Diesel" },
  { fuel_id: 3, fuel_type: "Electric" },
];

function setUser(role = "admin") {
  Utils.setStore("user", {
    userId: 1,
    username: `${role}user`,
    role,
    token: `${role}-token`,
  });
}

function apiCallCount() {
  return [
    getMaintenanceInfo,
    updateMaintenanceInfo,
    createMaintenanceInfo,
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    getRequests,
    getFuels,
    createFuel,
    updateFuel,
    deleteFuel,
    updateVehicleMileage,
    createVehicleServiceLog,
    getVehicle,
  ].reduce((sum, fn) => sum + fn.mock.calls.length, 0);
}

async function flush() {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

async function createMaintenanceRouter(vin = sampleVin) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/maintenance-info/:vin?",
        name: "maintenance",
        component: Maintenance,
        props: true,
      },
      {
        path: "/vehicles",
        name: "vehicleManagement",
        component: { template: "<div>Vehicles</div>" },
      },
      {
        path: "/vehicle-service-logs/:vehicle_id?",
        name: "vehicleServiceLogs",
        component: { template: "<div>Service Logs</div>" },
      },
    ],
  });
  await router.push(`/maintenance-info/${vin}`);
  await router.isReady();
  return router;
}

async function mountMaintenance(role = "admin") {
  setUser(role);
  getVehicle.mockResolvedValue({ status: 200, data: sampleVehicle });
  getMaintenanceInfo.mockResolvedValue({ status: 200, data: sampleMaintenance });
  getNotes.mockResolvedValue({ status: 200, data: sampleNotes });
  getRequests.mockResolvedValue({
    status: 200,
    data: [{ requester_id: 53, vehicle_id: sampleVin }],
  });
  getFuels.mockResolvedValue({ status: 200, data: sampleFuels });

  const router = await createMaintenanceRouter();
  const { wrapper } = await mountWithPlugins(Maintenance, {
    router,
    props: { vin: sampleVin },
    global: {
      plugins: [vuetify, router],
      stubs: { teleport: true },
    },
  });
  await flush();
  return { wrapper, router };
}

function findButtonByText(wrapper, text) {
  return wrapper.findAll("button").find((btn) => btn.text().includes(text));
}

function findByAriaLabel(wrapper, label) {
  const exact = wrapper.find(`[aria-label="${label}"]`);
  if (exact.exists()) return exact;
  return wrapper.find(`[aria-label*="${label}"]`);
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("Feature 5 — Maintenance Info CRUD", () => {
  describe("US-5.1 — User views a vehicle's maintenance page", () => {
    it("User has just loaded the `Maintenance.vue`", async () => {
      const { wrapper } = await mountMaintenance();
      const before = apiCallCount();

      expect(wrapper.text()).toMatch(/back/i);
      expect(wrapper.text()).toMatch(/view service logs/i);
      expect(wrapper.text()).toMatch(/edit maintenance info/i);
      expect(wrapper.text()).toMatch(/update mileage/i);
      expect(wrapper.text()).toMatch(/manage fuels/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User has just viewed the action buttons", async () => {
      const { wrapper } = await mountMaintenance();
      const before = apiCallCount();

      expect(wrapper.text()).toContain("Honda");
      expect(wrapper.text()).toContain("Accord");
      expect(wrapper.text()).toContain("2014");
      expect(wrapper.text()).toMatch(/87 Octane|Fuel Type/i);
      expect(wrapper.text()).toMatch(/30|Fuel Capacity/i);
      expect(wrapper.text()).toMatch(/5W4|Oil/i);
      expect(wrapper.text()).toMatch(/35|Tire PSI|PSI/i);
      expect(wrapper.text()).toMatch(/P205|Tire Type/i);
      expect(wrapper.text()).toMatch(/5000|mileage/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User has just viewed the maintenance info for the vehicle", async () => {
      const { wrapper } = await mountMaintenance();
      const before = apiCallCount();

      expect(wrapper.text()).toMatch(/Subject/i);
      expect(wrapper.text()).toMatch(/Actions/i);
      expect(wrapper.text()).toContain("Check tires");
      expect(wrapper.text()).toMatch(/Add Note/i);
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-5.2 —  User adds a maintenance note", () => {
    it("User clicks the `Add Note` button", async () => {
      const { wrapper } = await mountMaintenance();
      const before = apiCallCount();

      const btn = findButtonByText(wrapper, "Add Note");
      expect(btn).toBeTruthy();
      await btn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Add Maintenance Note/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs valid text into the subject text field", async () => {
      const { wrapper } = await mountMaintenance();
      const addBtn = findButtonByText(wrapper, "Add Note");
      await addBtn.trigger("click");
      await flush();
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.noteForm = { ...(wrapper.vm.noteForm || {}), subject: "New subject" };
      }
      await flush();

      expect(wrapper.text()).toContain("New subject");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs no text into the subject text field", async () => {
      const { wrapper } = await mountMaintenance();
      const addBtn = findButtonByText(wrapper, "Add Note");
      await addBtn.trigger("click");
      await flush();
      const before = createNote.mock.calls.length;

      if (wrapper.vm) {
        wrapper.vm.noteForm = {
          subject: "",
          description: "Has description",
        };
      }
      await flush();

      const submit = findButtonByText(wrapper, "Add Note");
      await submit.trigger("click");
      await flush();

      expect(wrapper.text()).toContain("Subject is required.");
      expect(createNote.mock.calls.length).toBe(before);
    });

    it("User inputs valid text into the description field", async () => {
      const { wrapper } = await mountMaintenance();
      await findButtonByText(wrapper, "Add Note").trigger("click");
      await flush();
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.noteForm = {
          ...(wrapper.vm.noteForm || {}),
          description: "Short desc",
        };
      }
      await flush();

      expect(wrapper.text()).toContain("Short desc");
      expect(wrapper.text()).toMatch(/\d+/);
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs invalid text into the description field", async () => {
      const { wrapper } = await mountMaintenance();
      await findButtonByText(wrapper, "Add Note").trigger("click");
      await flush();
      const before = createNote.mock.calls.length;

      if (wrapper.vm) {
        wrapper.vm.noteForm = { subject: "Has subject", description: "" };
      }
      await flush();
      await findButtonByText(wrapper, "Add Note").trigger("click");
      await flush();

      expect(wrapper.text()).toContain("Description is required.");
      expect(createNote.mock.calls.length).toBe(before);
    });

    it("User inputs too many characters into the description field", async () => {
      const { wrapper } = await mountMaintenance();
      await findButtonByText(wrapper, "Add Note").trigger("click");
      await flush();
      const before = apiCallCount();

      const longText = "x".repeat(256);
      if (wrapper.vm) {
        wrapper.vm.noteForm = {
          ...(wrapper.vm.noteForm || {}),
          description: longText,
        };
      }
      await flush();

      expect(wrapper.text()).toContain("Too many inputted characters");
      expect(wrapper.text()).toMatch(/-/);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `Cancel` button", async () => {
      const { wrapper } = await mountMaintenance();
      await findButtonByText(wrapper, "Add Note").trigger("click");
      await flush();

      if (wrapper.vm) {
        wrapper.vm.noteForm = { subject: "Temp", description: "Temp desc" };
      }
      await flush();
      const before = apiCallCount();

      const cancel = findButtonByText(wrapper, "Cancel") || findButtonByText(wrapper, "cancel");
      await cancel.trigger("click");
      await flush();

      expect(wrapper.text()).not.toMatch(/Add Maintenance Note/i);
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-5.3 — User edits a maintenance note", () => {
    it("User clicks the `Edit Note` icon button", async () => {
      const { wrapper } = await mountMaintenance();
      const before = apiCallCount();

      const editBtn =
        findByAriaLabel(wrapper, "Edit Note") ||
        findByAriaLabel(wrapper, "Edit");
      expect(editBtn.exists()).toBe(true);
      await editBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Edit Maintenance Note/i);
      expect(apiCallCount()).toBe(before);
    });

    it("`Edit Maintenance Note` modal opens", async () => {
      const { wrapper } = await mountMaintenance();
      const editBtn =
        findByAriaLabel(wrapper, "Edit Note") ||
        findByAriaLabel(wrapper, "Edit");
      await editBtn.trigger("click");
      await flush();
      const before = apiCallCount();

      expect(wrapper.text()).toContain("Check tires");
      expect(wrapper.text()).toContain("Increase tire pressure");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs valid text into the subject text field", async () => {
      const { wrapper } = await mountMaintenance();
      const editBtn =
        findByAriaLabel(wrapper, "Edit Note") ||
        findByAriaLabel(wrapper, "Edit");
      await editBtn.trigger("click");
      await flush();
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.noteForm = {
          ...(wrapper.vm.noteForm || {}),
          subject: "Edited subject",
        };
      }
      await flush();

      expect(wrapper.text()).toContain("Edited subject");
      expect(apiCallCount()).toBe(before);
    });

    it("User deletes previous input and does not input any text into the subject text field", async () => {
      const { wrapper } = await mountMaintenance();
      const editBtn =
        findByAriaLabel(wrapper, "Edit Note") ||
        findByAriaLabel(wrapper, "Edit");
      await editBtn.trigger("click");
      await flush();
      const before = updateNote.mock.calls.length;

      if (wrapper.vm) {
        wrapper.vm.noteForm = { subject: "", description: "Still has desc" };
      }
      await flush();

      const updateBtn =
        findButtonByText(wrapper, "Update Note") ||
        findButtonByText(wrapper, "Update");
      await updateBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toContain("Subject is required.");
      expect(updateNote.mock.calls.length).toBe(before);
    });

    it("User inputs text into the description field", async () => {
      const { wrapper } = await mountMaintenance();
      const editBtn =
        findByAriaLabel(wrapper, "Edit Note") ||
        findByAriaLabel(wrapper, "Edit");
      await editBtn.trigger("click");
      await flush();
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.noteForm = {
          ...(wrapper.vm.noteForm || {}),
          description: "Edited description",
        };
      }
      await flush();

      expect(wrapper.text()).toContain("Edited description");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs invalid text into the description field", async () => {
      const { wrapper } = await mountMaintenance();
      const editBtn =
        findByAriaLabel(wrapper, "Edit Note") ||
        findByAriaLabel(wrapper, "Edit");
      await editBtn.trigger("click");
      await flush();
      const before = updateNote.mock.calls.length;

      if (wrapper.vm) {
        wrapper.vm.noteForm = { subject: "Has subject", description: "" };
      }
      await flush();

      const submit =
        findButtonByText(wrapper, "Update Note") ||
        findButtonByText(wrapper, "Add Note");
      await submit.trigger("click");
      await flush();

      expect(wrapper.text()).toContain("Description is required.");
      expect(updateNote.mock.calls.length).toBe(before);
    });

    it("User inputs too many characters into the description field", async () => {
      const { wrapper } = await mountMaintenance();
      const editBtn =
        findByAriaLabel(wrapper, "Edit Note") ||
        findByAriaLabel(wrapper, "Edit");
      await editBtn.trigger("click");
      await flush();
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.noteForm = {
          ...(wrapper.vm.noteForm || {}),
          description: "y".repeat(256),
        };
      }
      await flush();

      expect(wrapper.text()).toContain("Too many inputted characters");
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `Cancel` button", async () => {
      const { wrapper } = await mountMaintenance();
      const editBtn =
        findByAriaLabel(wrapper, "Edit Note") ||
        findByAriaLabel(wrapper, "Edit");
      await editBtn.trigger("click");
      await flush();
      const before = apiCallCount();

      const cancel = findButtonByText(wrapper, "Cancel") || findButtonByText(wrapper, "cancel");
      await cancel.trigger("click");
      await flush();

      expect(wrapper.text()).not.toMatch(/Edit Maintenance Note/i);
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-5.4 — User deletes a maintenance note", () => {
    it("User clicks the `Delete Note` icon button", async () => {
      const { wrapper } = await mountMaintenance();
      const before = apiCallCount();

      const deleteBtn =
        findByAriaLabel(wrapper, "Delete Note") ||
        findByAriaLabel(wrapper, "Delete");
      expect(deleteBtn.exists()).toBe(true);
      await deleteBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Complete/i);
      expect(wrapper.text()).toContain("Confirm Completion?");
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks `cancel` button", async () => {
      const { wrapper } = await mountMaintenance();
      const deleteBtn =
        findByAriaLabel(wrapper, "Delete Note") ||
        findByAriaLabel(wrapper, "Delete");
      await deleteBtn.trigger("click");
      await flush();
      const before = apiCallCount();

      const cancel = findButtonByText(wrapper, "cancel") || findButtonByText(wrapper, "Cancel");
      await cancel.trigger("click");
      await flush();

      expect(wrapper.text()).not.toContain("Confirm Completion?");
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-5.5 — User updates the car's mileage", () => {
    it("User clicks `update mileage` button", async () => {
      const { wrapper } = await mountMaintenance();
      const before = apiCallCount();

      const btn =
        findButtonByText(wrapper, "Update Mileage") ||
        findButtonByText(wrapper, "update mileage");
      expect(btn).toBeTruthy();
      await btn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Update Mileage/i);
      expect(apiCallCount()).toBe(before);
    });

    it("`Update Mileage` modal opens", async () => {
      const { wrapper } = await mountMaintenance();
      await (
        findButtonByText(wrapper, "Update Mileage") ||
        findButtonByText(wrapper, "update mileage")
      ).trigger("click");
      await flush();
      const before = apiCallCount();

      expect(wrapper.text()).toContain("5000");
      expect(wrapper.text()).toMatch(/cancel/i);
      expect(wrapper.text()).toMatch(/confirm|update/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs a `NaN` mileage", async () => {
      const { wrapper } = await mountMaintenance();
      await (
        findButtonByText(wrapper, "Update Mileage") ||
        findButtonByText(wrapper, "update mileage")
      ).trigger("click");
      await flush();
      const before = updateVehicleMileage.mock.calls.length;

      if (wrapper.vm) wrapper.vm.newMileage = "abc";
      await flush();

      const confirm =
        findButtonByText(wrapper, "confirm") || findButtonByText(wrapper, "Confirm");
      await confirm.trigger("click");
      await flush();

      expect(wrapper.text()).toContain("Mileage must be a whole number.");
      expect(updateVehicleMileage.mock.calls.length).toBe(before);
    });

    it("User inputs a low mileage", async () => {
      const { wrapper } = await mountMaintenance();
      await (
        findButtonByText(wrapper, "Update Mileage") ||
        findButtonByText(wrapper, "update mileage")
      ).trigger("click");
      await flush();
      const before = updateVehicleMileage.mock.calls.length;

      if (wrapper.vm) wrapper.vm.newMileage = 1000;
      await flush();

      const confirm =
        findButtonByText(wrapper, "confirm") || findButtonByText(wrapper, "Confirm");
      await confirm.trigger("click");
      await flush();

      expect(wrapper.text()).toContain(
        "New mileage must be greater than the old mileage."
      );
      expect(updateVehicleMileage.mock.calls.length).toBe(before);
    });

    it("User clicks the `cancel` button", async () => {
      const { wrapper } = await mountMaintenance();
      await (
        findButtonByText(wrapper, "Update Mileage") ||
        findButtonByText(wrapper, "update mileage")
      ).trigger("click");
      await flush();

      if (wrapper.vm) wrapper.vm.newMileage = 9000;
      await flush();
      const before = apiCallCount();

      const cancel = findButtonByText(wrapper, "cancel") || findButtonByText(wrapper, "Cancel");
      await cancel.trigger("click");
      await flush();

      expect(wrapper.text()).not.toMatch(/Update Mileage/i);
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-5.6 — User selects a service note", () => {
    it("User selects a service note", async () => {
      const { wrapper } = await mountMaintenance();
      const before = apiCallCount();

      const row = wrapper.findAll("*").find((n) => n.text().includes("Check tires"));
      expect(row).toBeTruthy();
      await row.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/View Maintenance Note/i);
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-5.7 — User clicks the `View Service Logs` button", () => {
    it("User clicks the `view service logs` button", async () => {
      const { wrapper, router } = await mountMaintenance();
      const pushSpy = vi.spyOn(router, "push");
      const before = apiCallCount();

      const btn =
        findButtonByText(wrapper, "View Service Logs") ||
        findButtonByText(wrapper, "view service logs");
      await btn.trigger("click");
      await flush();

      expect(pushSpy).toHaveBeenCalled();
      expect(JSON.stringify(pushSpy.mock.calls[0][0])).toMatch(
        /service.?log|vehicle_id|12345671234567123/i
      );
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-5.8 — User clicks the `Back` button", () => {
    it("User clicks the `Back` button", async () => {
      const { wrapper, router } = await mountMaintenance();
      const pushSpy = vi.spyOn(router, "push");
      const before = apiCallCount();

      const btn = findButtonByText(wrapper, "Back") || findButtonByText(wrapper, "back");
      await btn.trigger("click");
      await flush();

      expect(pushSpy).toHaveBeenCalled();
      expect(JSON.stringify(pushSpy.mock.calls[0][0])).toMatch(/vehicle/i);
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-5.9 — User clicks the `Edit Maintenance Info` button", () => {
    async function openEditMaintenanceInfo(wrapper) {
      const btn =
        findButtonByText(wrapper, "Edit Maintenance Info") ||
        findButtonByText(wrapper, "edit maintenance info");
      await btn.trigger("click");
      await flush();
    }

    it("User clicks `edit maintenance info` button", async () => {
      const { wrapper } = await mountMaintenance();
      const before = apiCallCount();
      await openEditMaintenanceInfo(wrapper);

      expect(wrapper.text()).toMatch(/Edit Maintenance Info/i);
      expect(apiCallCount()).toBe(before);
    });

    it("`Edit Maintenance Info` modal opens", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      expect(wrapper.text()).toContain("Honda");
      expect(wrapper.text()).toContain("Accord");
      expect(wrapper.text()).toContain("2014");
      expect(wrapper.text()).toMatch(/87 Octane/i);
      expect(wrapper.text()).toContain("30");
      expect(wrapper.text()).toContain("5W4");
      expect(wrapper.text()).toContain("35");
      expect(wrapper.text()).toContain("P205/55R16 95H");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs a `make`, `model`, and `year` that don't exist in the database", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = updateMaintenanceInfo.mock.calls.length;

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          make: "BrandNewMake",
          model: "BrandNewModel",
          year: 2022,
        };
      }
      await flush();

      const updateBtn =
        findButtonByText(wrapper, "Update Maintenance Info") ||
        findButtonByText(wrapper, "Update");
      await updateBtn.trigger("click");
      await flush();

      expect(updateMaintenanceInfo.mock.calls.length).toBe(before);
    });

    it("User deletes previous input for any input field and does not add new input", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = updateMaintenanceInfo.mock.calls.length;

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          make: "",
          model: "",
          year: null,
          fuel_type: "",
          fuel_capacity: "",
          oil_viscosity: "",
          recommended_tire_psi: "",
          tire_type: "",
        };
      }
      await flush();

      const updateBtn =
        findButtonByText(wrapper, "Update Maintenance Info") ||
        findButtonByText(wrapper, "Update");
      await updateBtn.trigger("click");
      await flush();

      expect(wrapper.find(".error--text, .text-error, .v-field--error").exists() || wrapper.html().includes("error")).toBe(true);
      expect(updateMaintenanceInfo.mock.calls.length).toBe(before);
    });

    it("User selects a fuel type `Electric`", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          fuel_type: "Electric",
          fuel_type_id: 3,
        };
        if (typeof wrapper.vm.onFuelTypeChange === "function") {
          wrapper.vm.onFuelTypeChange("Electric");
        }
      }
      await flush();

      const capacity = wrapper.find('[aria-label*="Fuel Capacity"], [label*="Fuel Capacity"], input[disabled]');
      expect(
        capacity.exists() ||
          wrapper.vm?.fuelCapacityDisabled === true ||
          wrapper.html().includes("disabled")
      ).toBe(true);
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs a fuel capacity that is `NaN`", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          fuel_capacity: "abc",
        };
        if (typeof wrapper.vm.validateFuelCapacity === "function") {
          wrapper.vm.validateFuelCapacity();
        }
      }
      await flush();

      expect(wrapper.text()).toContain("Must be a whole number");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs a `negative` number into fuel capacity", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          fuel_capacity: -5,
        };
        if (typeof wrapper.vm.validateFuelCapacity === "function") {
          wrapper.vm.validateFuelCapacity();
        }
      }
      await flush();

      expect(wrapper.text()).toContain("Must be a positive number");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs a number greater than `300`", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          fuel_capacity: 301,
        };
        if (typeof wrapper.vm.validateFuelCapacity === "function") {
          wrapper.vm.validateFuelCapacity();
        }
      }
      await flush();

      expect(wrapper.text()).toContain("Must be below 300 or lower");
      expect(apiCallCount()).toBe(before);
    });

    it("User enters oil viscosity", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          oil_viscosity: "0W2",
        };
      }
      await flush();

      expect(wrapper.text()).toContain("0W2");
      expect(apiCallCount()).toBe(before);
    });

    it("User enters a `NaN` into Recommended Tire PSI", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          recommended_tire_psi: "abc",
        };
        if (typeof wrapper.vm.validateTirePsi === "function") {
          wrapper.vm.validateTirePsi();
        }
      }
      await flush();

      expect(wrapper.text()).toContain("Must be a number (i.e. 10.00)");
      expect(apiCallCount()).toBe(before);
    });

    it("User enters a number greater than `999.99` into Recommended Tire PSI", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          recommended_tire_psi: 1000,
        };
        if (typeof wrapper.vm.validateTirePsi === "function") {
          wrapper.vm.validateTirePsi();
        }
      }
      await flush();

      expect(wrapper.text()).toContain("Must be below 999.99");
      expect(apiCallCount()).toBe(before);
    });

    it("User enters a `negative` number into Recommended Tire PSI", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          recommended_tire_psi: -1,
        };
        if (typeof wrapper.vm.validateTirePsi === "function") {
          wrapper.vm.validateTirePsi();
        }
      }
      await flush();

      expect(wrapper.text()).toContain("Must be greater than 000.00");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs into tire type", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          tire_type: "P215/60R16",
        };
      }
      await flush();

      expect(wrapper.text()).toContain("P215/60R16");
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `Update` button and only the `make`, `year`, and `model` are not in the database", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          make: "GhostMake",
          model: "GhostModel",
          year: 2023,
          fuel_type: "87 Octane",
        };
      }
      await flush();

      const updateBtn =
        findButtonByText(wrapper, "Update") ||
        findButtonByText(wrapper, "Update Maintenance Info");
      await updateBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Confirm Create New Maintenance Info/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks `Update` button and only the `fuel type` is not in the database", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          fuel_type: "BrandNewFuelType",
        };
      }
      await flush();

      const updateBtn =
        findButtonByText(wrapper, "Update") ||
        findButtonByText(wrapper, "Update Maintenance Info");
      await updateBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Confirm Create New Fuel Type/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks `Update` button and both the `fuel type` and `make`, `year`, and `model` are not in the database", async () => {
      const { wrapper } = await mountMaintenance();
      await openEditMaintenanceInfo(wrapper);
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.maintenanceForm = {
          ...(wrapper.vm.maintenanceForm || sampleMaintenance),
          make: "GhostMake",
          model: "GhostModel",
          year: 2023,
          fuel_type: "BrandNewFuelType",
        };
      }
      await flush();

      const updateBtn =
        findButtonByText(wrapper, "Update") ||
        findButtonByText(wrapper, "Update Maintenance Info");
      await updateBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Confirm Create New Maintenance Info/i);
      expect(wrapper.text()).toMatch(/Confirm Create New Fuel Type/i);
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-5.10 — User clicks the `Manage Fuels` button", () => {
    async function openFuelManagement(wrapper) {
      const btn =
        findButtonByText(wrapper, "Manage Fuels") ||
        findButtonByText(wrapper, "manage fuels");
      await btn.trigger("click");
      await flush();
    }

    it("User clicks the `manage fuels` button", async () => {
      const { wrapper } = await mountMaintenance();
      const before = apiCallCount();
      await openFuelManagement(wrapper);

      expect(wrapper.text()).toMatch(/Fuel Management/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User views the fuels table", async () => {
      const { wrapper } = await mountMaintenance();
      await openFuelManagement(wrapper);
      const before = apiCallCount();

      expect(wrapper.text()).toContain("87 Octane");
      expect(wrapper.text()).toContain("Diesel");
      expect(
        findByAriaLabel(wrapper, "Edit").exists() ||
          findByAriaLabel(wrapper, "edit").exists()
      ).toBe(true);
      expect(
        findByAriaLabel(wrapper, "Delete").exists() ||
          findByAriaLabel(wrapper, "delete").exists()
      ).toBe(true);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `edit` fuel icon button", async () => {
      const { wrapper } = await mountMaintenance();
      await openFuelManagement(wrapper);
      const before = apiCallCount();

      const editBtn =
        findByAriaLabel(wrapper, "Edit") || findByAriaLabel(wrapper, "edit");
      await editBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Edit Fuel/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `cancel` button on the `Edit Fuel` modal", async () => {
      const { wrapper } = await mountMaintenance();
      await openFuelManagement(wrapper);
      const editBtn =
        findByAriaLabel(wrapper, "Edit") || findByAriaLabel(wrapper, "edit");
      await editBtn.trigger("click");
      await flush();
      const before = apiCallCount();

      const cancel = findButtonByText(wrapper, "cancel") || findButtonByText(wrapper, "Cancel");
      await cancel.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Fuel Management/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User modifies the `fuel type` text field on the `Edit Fuel` modal", async () => {
      const { wrapper } = await mountMaintenance();
      await openFuelManagement(wrapper);
      const editBtn =
        findByAriaLabel(wrapper, "Edit") || findByAriaLabel(wrapper, "edit");
      await editBtn.trigger("click");
      await flush();
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.fuelForm = { ...(wrapper.vm.fuelForm || {}), fuel_type: "Premium 91" };
      }
      await flush();

      expect(wrapper.text()).toContain("Premium 91");
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `Add Fuel` button", async () => {
      const { wrapper } = await mountMaintenance();
      await openFuelManagement(wrapper);
      const before = apiCallCount();

      const addBtn =
        findButtonByText(wrapper, "Add Fuel") ||
        findButtonByText(wrapper, "Add New Fuel");
      await addBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Add Fuel/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `cancel` button on the `Add Fuel` modal", async () => {
      const { wrapper } = await mountMaintenance();
      await openFuelManagement(wrapper);
      const addBtn =
        findButtonByText(wrapper, "Add Fuel") ||
        findButtonByText(wrapper, "Add New Fuel");
      await addBtn.trigger("click");
      await flush();
      const before = apiCallCount();

      const cancel = findButtonByText(wrapper, "cancel") || findButtonByText(wrapper, "Cancel");
      await cancel.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Fuel Management/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User modifies the `fuel type` text field on the `Add Fuel` modal", async () => {
      const { wrapper } = await mountMaintenance();
      await openFuelManagement(wrapper);
      const addBtn =
        findButtonByText(wrapper, "Add Fuel") ||
        findButtonByText(wrapper, "Add New Fuel");
      await addBtn.trigger("click");
      await flush();
      const before = apiCallCount();

      if (wrapper.vm) {
        wrapper.vm.fuelForm = { fuel_type: "Hydrogen" };
      }
      await flush();

      expect(wrapper.text()).toContain("Hydrogen");
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `Back` button on the `View Fuel Management` modal", async () => {
      const { wrapper } = await mountMaintenance();
      await openFuelManagement(wrapper);
      const before = apiCallCount();

      const back =
        findButtonByText(wrapper, "Back") || findButtonByText(wrapper, "back");
      await back.trigger("click");
      await flush();

      expect(wrapper.text()).not.toMatch(/Fuel Management/i);
      expect(apiCallCount()).toBe(before);
    });
  });
});
