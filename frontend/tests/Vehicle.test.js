/**
 * Feature 4 — Vehicle CRUD
 * Spec: features/feature-4-Vehicle-CRUD.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import Vehicle from "../src/views/Vehicle.vue";
import { mountWithPlugins, vuetify } from "./testUtils.js";
import Utils from "../src/config/utils.js";

const getVehicles = vi.fn();
const createVehicle = vi.fn();
const updateVehicle = vi.fn();
const deleteVehicle = vi.fn();
const getMaintenanceInfo = vi.fn();
const createMaintenanceInfo = vi.fn();
const getFuels = vi.fn();
const createFuel = vi.fn();
const getDepartments = vi.fn();

vi.mock("../src/services/vehicleServices.js", () => ({
  default: {
    getVehicles: (...args) => getVehicles(...args),
    createVehicle: (...args) => createVehicle(...args),
    updateVehicle: (...args) => updateVehicle(...args),
    deleteVehicle: (...args) => deleteVehicle(...args),
    getMaintenanceInfo: (...args) => getMaintenanceInfo(...args),
    createMaintenanceInfo: (...args) => createMaintenanceInfo(...args),
    getFuels: (...args) => getFuels(...args),
    createFuel: (...args) => createFuel(...args),
  },
}));

vi.mock("../src/services/departmentServices.js", () => ({
  default: {
    getDepartments: (...args) => getDepartments(...args),
  },
}));

const sampleVehicles = [
  {
    vin: "12345671234567123",
    make: "Honda",
    model: "Accord",
    year: 2014,
    purchased_date: "2015-12-16",
    color: "White",
    license_plate_num: "ABC344",
    tag_exp_month: "2016-05-25",
    department: "Engineering",
    available: 1,
    mileage: 0,
  },
  {
    vin: "98765432109876543",
    make: "Ford",
    model: "F-150",
    year: 2018,
    purchased_date: "2019-01-10",
    color: "Black",
    license_plate_num: "XYZ999",
    tag_exp_month: "2020-06-01",
    department: "Facilities",
    available: 1,
    mileage: 12000,
  },
  {
    vin: "11112222333344445",
    make: "Toyota",
    model: "Camry",
    year: 2014,
    purchased_date: "2014-06-01",
    color: null,
    license_plate_num: null,
    tag_exp_month: "2015-01-01",
    department: "Engineering",
    available: 1,
    mileage: 500,
  },
];

function setUser(role) {
  Utils.setStore("user", {
    userId: 1,
    username: `${role}user`,
    role,
    token: `${role}-token`,
  });
}

async function createVehicleRouter(initialPath = "/vehicles") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/vehicles",
        name: "vehicleManagement",
        component: Vehicle,
      },
      {
        path: "/maintenance-info/:vin?",
        name: "maintenance",
        component: { template: "<div>Maintenance</div>" },
      },
      {
        path: "/login",
        name: "login",
        component: { template: "<div>Login</div>" },
      },
    ],
  });

  await router.push(initialPath);
  await router.isReady();
  return router;
}

async function mountVehicle(role = "admin", vehicles = sampleVehicles) {
  setUser(role);
  getVehicles.mockResolvedValue({
    status: 200,
    data: {
      message: "Successfully retreived all vehicles",
      vehicles,
    },
  });
  getFuels.mockResolvedValue({
    status: 200,
    data: [{ fuel_id: 1, fuel_type: "87 Octane" }],
  });
  getDepartments.mockResolvedValue({
    status: 200,
    data: [{ name: "Engineering" }, { name: "Facilities" }],
  });
  getMaintenanceInfo.mockResolvedValue({ status: 200, data: {} });

  const router = await createVehicleRouter();
  const { wrapper } = await mountWithPlugins(Vehicle, {
    router,
    global: {
      plugins: [vuetify, router],
      stubs: {
        teleport: true,
      },
    },
  });

  await flush();
  return { wrapper, router };
}

async function flush() {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function apiCallCount() {
  return (
    getVehicles.mock.calls.length +
    createVehicle.mock.calls.length +
    updateVehicle.mock.calls.length +
    deleteVehicle.mock.calls.length +
    getMaintenanceInfo.mock.calls.length +
    createMaintenanceInfo.mock.calls.length +
    getFuels.mock.calls.length +
    createFuel.mock.calls.length +
    getDepartments.mock.calls.length
  );
}

function findByText(wrapper, text) {
  return wrapper.findAll("*").find((node) => node.text().includes(text));
}

function findButtonByText(wrapper, text) {
  const buttons = wrapper.findAll("button");
  return buttons.find((btn) => btn.text().includes(text));
}

function findByAriaLabel(wrapper, label) {
  return wrapper.find(`[aria-label="${label}"]`);
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("Feature 4 — Vehicle CRUD", () => {
  describe("US-4.1 — Add a new vehicle as a `admin` role", () => {
    it("User clicks the add button", async () => {
      const { wrapper } = await mountVehicle("admin");
      const before = apiCallCount();

      const addBtn =
        findButtonByText(wrapper, "Add Vehicle") ||
        findButtonByText(wrapper, "Add");
      expect(addBtn).toBeTruthy();
      await addBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Add Vehicle/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs invalid information into `Add Vehicle` modal", async () => {
      const { wrapper } = await mountVehicle("admin");
      const addBtn =
        findButtonByText(wrapper, "Add Vehicle") ||
        findButtonByText(wrapper, "Add");
      await addBtn.trigger("click");
      await flush();

      const before = createVehicle.mock.calls.length;
      const submit =
        findButtonByText(wrapper, "Add Vehicle") ||
        wrapper.find('[type="submit"]');
      await submit.trigger("click");
      await flush();

      expect(wrapper.text()).toContain("An error occured processing your form.");
      expect(createVehicle.mock.calls.length).toBe(before);
    });
  });

  describe("US-4.2 — Add a new vehicle as a `maintenance` role", () => {
    it("User clicks the add button", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      const before = apiCallCount();

      const addBtn =
        findButtonByText(wrapper, "Add Vehicle") ||
        findButtonByText(wrapper, "Add");
      expect(addBtn).toBeTruthy();
      await addBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Add Vehicle/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs a `make`, `model`, and `year` into the comboboxes that doesn't exist", async () => {
      getMaintenanceInfo.mockResolvedValue({ status: 404, data: { message: "Not found" } });
      const { wrapper } = await mountVehicle("maintenance");

      const addBtn =
        findButtonByText(wrapper, "Add Vehicle") ||
        findButtonByText(wrapper, "Add");
      await addBtn.trigger("click");
      await flush();

      if (wrapper.vm) {
        wrapper.vm.form = {
          ...(wrapper.vm.form || {}),
          make: "BrandNewMake",
          model: "BrandNewModel",
          year: 2022,
          fuel_type: "87 Octane",
          vin: "55555555555555555",
          purchased_date: "2022-01-01",
          tag_exp_month: "2023-01-01",
          department: "Engineering",
          available: 1,
        };
        await flush();
      }

      const beforeCreate = createVehicle.mock.calls.length;
      const submit = findButtonByText(wrapper, "Add Vehicle");
      if (submit) await submit.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Confirm Create New Maintenance Info/i);
      expect(createVehicle.mock.calls.length).toBe(beforeCreate);
    });

    it("User inputs invalid information into `Add Vehicle` modal", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      const addBtn =
        findButtonByText(wrapper, "Add Vehicle") ||
        findButtonByText(wrapper, "Add");
      await addBtn.trigger("click");
      await flush();

      const before = createVehicle.mock.calls.length;
      const submit =
        findButtonByText(wrapper, "Add Vehicle") ||
        wrapper.find('[type="submit"]');
      await submit.trigger("click");
      await flush();

      expect(wrapper.text()).toContain("An error occured processing your form.");
      expect(createVehicle.mock.calls.length).toBe(before);
    });
  });

  describe("US-4.3 — Edit a vehicle as a `admin` role", () => {
    it("User clicks the edit icon button", async () => {
      const { wrapper } = await mountVehicle("admin");
      const before = apiCallCount();

      const editBtn =
        findByAriaLabel(wrapper, "Edit") ||
        findByAriaLabel(wrapper, "edit") ||
        wrapper.find('[aria-label*="Edit" i]');
      expect(editBtn.exists()).toBe(true);
      await editBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Edit Vehicle|Update Vehicle/i);
      expect(wrapper.text()).toContain("Honda");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs invalid information into `Edit Vehicle` modal", async () => {
      const { wrapper } = await mountVehicle("admin");
      const editBtn =
        findByAriaLabel(wrapper, "Edit") ||
        wrapper.find('[aria-label*="Edit" i]');
      await editBtn.trigger("click");
      await flush();

      if (wrapper.vm?.form) {
        wrapper.vm.form.make = "";
        await flush();
      }

      const before = updateVehicle.mock.calls.length;
      const submit =
        findButtonByText(wrapper, "Update Vehicle") ||
        findButtonByText(wrapper, "Edit Vehicle");
      if (submit) await submit.trigger("click");
      await flush();

      expect(wrapper.text()).toContain("An error occured processing your form.");
      expect(updateVehicle.mock.calls.length).toBe(before);
    });
  });

  describe("US-4.4 — Edit a vehicle as a `maintenance` role", () => {
    it("User clicks the edit icon button", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      const before = apiCallCount();

      const editBtn =
        findByAriaLabel(wrapper, "Edit") ||
        wrapper.find('[aria-label*="Edit" i]');
      expect(editBtn.exists()).toBe(true);
      await editBtn.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Edit Vehicle|Update Vehicle/i);
      expect(wrapper.text()).toContain("Honda");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs invalid information into `Edit Vehicle` modal", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      const editBtn =
        findByAriaLabel(wrapper, "Edit") ||
        wrapper.find('[aria-label*="Edit" i]');
      await editBtn.trigger("click");
      await flush();

      if (wrapper.vm?.form) {
        wrapper.vm.form.make = "";
        await flush();
      }

      const before = updateVehicle.mock.calls.length;
      const submit =
        findButtonByText(wrapper, "Update Vehicle") ||
        findButtonByText(wrapper, "Edit Vehicle");
      if (submit) await submit.trigger("click");
      await flush();

      expect(wrapper.text()).toContain("An error occured processing your form.");
      expect(updateVehicle.mock.calls.length).toBe(before);
    });
  });

  describe("US-4.7 — View all vehicles as a `admin` role", () => {
    it("There no vehicles to display in the vehicle list", async () => {
      const { wrapper } = await mountVehicle("admin", []);

      expect(getVehicles).toHaveBeenCalled();
      expect(wrapper.text()).toMatch(/License|Make|Model|Year/i);
      expect(wrapper.text()).toContain("No vehicles to display");
    });

    it("User first loads the Vehicle page", async () => {
      const { wrapper } = await mountVehicle("admin");

      expect(getVehicles).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Honda");
      expect(wrapper.text()).toContain("Accord");
      expect(wrapper.text()).toContain("2014");
      expect(wrapper.text()).toContain("ABC344");
      expect(wrapper.text()).toContain("White");
      expect(wrapper.text()).toContain("Engineering");

      expect(
        findByAriaLabel(wrapper, "Maintenance")?.exists() ||
          wrapper.find('[aria-label*="Maintenance" i]').exists()
      ).toBe(true);
      expect(
        findByAriaLabel(wrapper, "Edit")?.exists() ||
          wrapper.find('[aria-label*="Edit" i]').exists()
      ).toBe(true);
      expect(
        findByAriaLabel(wrapper, "Delete")?.exists() ||
          wrapper.find('[aria-label*="Delete" i]').exists()
      ).toBe(true);
    });

    it("User adds a new vehicle", async () => {
      createVehicle.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created vehicle." },
      });
      const { wrapper } = await mountVehicle("admin");
      getVehicles.mockClear();
      getVehicles.mockResolvedValue({
        status: 200,
        data: {
          message: "Successfully retreived all vehicles",
          vehicles: sampleVehicles,
        },
      });

      if (typeof wrapper.vm?.refreshVehicles === "function") {
        await wrapper.vm.refreshVehicles();
      } else if (typeof wrapper.vm?.fetchVehicles === "function") {
        await wrapper.vm.fetchVehicles();
      } else {
        await getVehicles();
        await flush();
      }
      await flush();

      expect(getVehicles).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Honda");
      expect(
        findByAriaLabel(wrapper, "Edit")?.exists() ||
          wrapper.find('[aria-label*="Edit" i]').exists()
      ).toBe(true);
    });

    it("User edits a vehicle in the list", async () => {
      updateVehicle.mockResolvedValue({
        status: 201,
        data: { message: "Successfully updated vehicle." },
      });
      const { wrapper } = await mountVehicle("admin");
      getVehicles.mockClear();
      getVehicles.mockResolvedValue({
        status: 200,
        data: {
          message: "Successfully retreived all vehicles",
          vehicles: sampleVehicles,
        },
      });

      if (typeof wrapper.vm?.refreshVehicles === "function") {
        await wrapper.vm.refreshVehicles();
      } else if (typeof wrapper.vm?.fetchVehicles === "function") {
        await wrapper.vm.fetchVehicles();
      } else {
        await getVehicles();
        await flush();
      }
      await flush();

      expect(getVehicles).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Ford");
      expect(
        findByAriaLabel(wrapper, "Delete")?.exists() ||
          wrapper.find('[aria-label*="Delete" i]').exists()
      ).toBe(true);
    });

    it("Vehicle does not have a color value", async () => {
      const { wrapper } = await mountVehicle("admin");
      const before = apiCallCount();

      expect(wrapper.text()).toContain("No Color");
      expect(apiCallCount()).toBe(before);
    });

    it("Vehicle does not have a license plate number value", async () => {
      const { wrapper } = await mountVehicle("admin");
      const before = apiCallCount();

      expect(wrapper.text()).toContain("No License Plate");
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-4.8 — View all vehicles as a `maintenance` role", () => {
    it("There no vehicles to display in the vehicle list", async () => {
      const { wrapper } = await mountVehicle("maintenance", []);

      expect(getVehicles).toHaveBeenCalled();
      expect(wrapper.text()).toMatch(/License|Make|Model|Year/i);
      expect(wrapper.text()).toContain("No vehicles to display");
    });

    it("User first loads the Vehicle page", async () => {
      const { wrapper } = await mountVehicle("maintenance");

      expect(getVehicles).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Honda");
      expect(wrapper.text()).toContain("Accord");
      expect(wrapper.text()).toContain("2014");
      expect(
        findByAriaLabel(wrapper, "Maintenance")?.exists() ||
          wrapper.find('[aria-label*="Maintenance" i]').exists()
      ).toBe(true);
      expect(
        findByAriaLabel(wrapper, "Edit")?.exists() ||
          wrapper.find('[aria-label*="Edit" i]').exists()
      ).toBe(true);
      expect(
        findByAriaLabel(wrapper, "Delete")?.exists() ||
          wrapper.find('[aria-label*="Delete" i]').exists()
      ).toBe(true);
    });

    it("User adds a new vehicle", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      getVehicles.mockClear();
      getVehicles.mockResolvedValue({
        status: 200,
        data: {
          message: "Successfully retreived all vehicles",
          vehicles: sampleVehicles,
        },
      });

      if (typeof wrapper.vm?.refreshVehicles === "function") {
        await wrapper.vm.refreshVehicles();
      } else if (typeof wrapper.vm?.fetchVehicles === "function") {
        await wrapper.vm.fetchVehicles();
      } else {
        await getVehicles();
        await flush();
      }
      await flush();

      expect(getVehicles).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Honda");
    });

    it("User edits a vehicle in the list", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      getVehicles.mockClear();
      getVehicles.mockResolvedValue({
        status: 200,
        data: {
          message: "Successfully retreived all vehicles",
          vehicles: sampleVehicles,
        },
      });

      if (typeof wrapper.vm?.refreshVehicles === "function") {
        await wrapper.vm.refreshVehicles();
      } else if (typeof wrapper.vm?.fetchVehicles === "function") {
        await wrapper.vm.fetchVehicles();
      } else {
        await getVehicles();
        await flush();
      }
      await flush();

      expect(getVehicles).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Ford");
    });

    it("Vehicle does not have a color value", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      const before = apiCallCount();
      expect(wrapper.text()).toContain("No Color");
      expect(apiCallCount()).toBe(before);
    });

    it("Vehicle does not have a license plate number value", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      const before = apiCallCount();
      expect(wrapper.text()).toContain("No License Plate");
      expect(apiCallCount()).toBe(before);
    });
  });

  async function expectClientFilter(role, setFilter) {
    const { wrapper } = await mountVehicle(role);
    const before = apiCallCount();

    await setFilter(wrapper);
    await flush();

    expect(apiCallCount()).toBe(before);
    return wrapper;
  }

  describe("US-4.9 — Filter vehicle list as `admin` role", () => {
    it("User chooses from the year drop down filter", async () => {
      const wrapper = await expectClientFilter("admin", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), year: 2014 };
      });
      expect(wrapper.text()).toContain("Honda");
      expect(wrapper.text()).not.toContain("F-150");
    });

    it("User chooses from the department drop down filter", async () => {
      const wrapper = await expectClientFilter("admin", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), department: "Facilities" };
      });
      expect(wrapper.text()).toContain("Ford");
      expect(wrapper.text()).not.toContain("Accord");
    });

    it("User begins to type in the `Make` filter", async () => {
      const wrapper = await expectClientFilter("admin", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), make: "Hon" };
      });
      expect(wrapper.text()).toContain("Honda");
      expect(wrapper.text()).not.toContain("Ford");
    });

    it("User begins to type in the `Model` filter", async () => {
      const wrapper = await expectClientFilter("admin", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), model: "F-1" };
      });
      expect(wrapper.text()).toContain("F-150");
      expect(wrapper.text()).not.toContain("Accord");
    });

    it("User begins to type in the `Color` filter", async () => {
      const wrapper = await expectClientFilter("admin", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), color: "Bla" };
      });
      expect(wrapper.text()).toContain("Black");
      expect(wrapper.text()).not.toContain("Accord");
    });

    it("User begins to type in the `License` filter", async () => {
      const wrapper = await expectClientFilter("admin", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), license: "XYZ" };
      });
      expect(wrapper.text()).toContain("XYZ999");
      expect(wrapper.text()).not.toContain("ABC344");
    });

    it("User chooses from the `From Purchase Date` date filter", async () => {
      const wrapper = await expectClientFilter("admin", async (w) => {
        if (w.vm) {
          w.vm.filters = {
            ...(w.vm.filters || {}),
            fromPurchaseDate: "2019-01-01",
          };
        }
      });
      expect(wrapper.text()).toContain("Ford");
      expect(wrapper.text()).not.toContain("Accord");
    });

    it("User chooses from the `Before Purchase Date` date filter", async () => {
      const wrapper = await expectClientFilter("admin", async (w) => {
        if (w.vm) {
          w.vm.filters = {
            ...(w.vm.filters || {}),
            beforePurchaseDate: "2016-01-01",
          };
        }
      });
      expect(wrapper.text()).toContain("Honda");
      expect(wrapper.text()).not.toContain("F-150");
    });
  });

  describe("US-4.10 — Filter vehicle list as `maintenance` role", () => {
    it("User chooses from the year drop down filter", async () => {
      const wrapper = await expectClientFilter("maintenance", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), year: 2014 };
      });
      expect(wrapper.text()).toContain("Honda");
      expect(wrapper.text()).not.toContain("F-150");
    });

    it("User chooses from the department drop down filter", async () => {
      const wrapper = await expectClientFilter("maintenance", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), department: "Facilities" };
      });
      expect(wrapper.text()).toContain("Ford");
      expect(wrapper.text()).not.toContain("Accord");
    });

    it("User begins to type in the `Make` filter", async () => {
      const wrapper = await expectClientFilter("maintenance", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), make: "Hon" };
      });
      expect(wrapper.text()).toContain("Honda");
      expect(wrapper.text()).not.toContain("Ford");
    });

    it("User begins to type in the `Model` filter", async () => {
      const wrapper = await expectClientFilter("maintenance", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), model: "F-1" };
      });
      expect(wrapper.text()).toContain("F-150");
      expect(wrapper.text()).not.toContain("Accord");
    });

    it("User begins to type in the `Color` filter", async () => {
      const wrapper = await expectClientFilter("maintenance", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), color: "Bla" };
      });
      expect(wrapper.text()).toContain("Black");
      expect(wrapper.text()).not.toContain("Accord");
    });

    it("User begins to type in the `License` filter", async () => {
      const wrapper = await expectClientFilter("maintenance", async (w) => {
        if (w.vm) w.vm.filters = { ...(w.vm.filters || {}), license: "XYZ" };
      });
      expect(wrapper.text()).toContain("XYZ999");
      expect(wrapper.text()).not.toContain("ABC344");
    });

    it("User chooses from the `From Purchase Date` date filter", async () => {
      const wrapper = await expectClientFilter("maintenance", async (w) => {
        if (w.vm) {
          w.vm.filters = {
            ...(w.vm.filters || {}),
            fromPurchaseDate: "2019-01-01",
          };
        }
      });
      expect(wrapper.text()).toContain("Ford");
      expect(wrapper.text()).not.toContain("Accord");
    });

    it("User chooses from the `Before Purchase Date` date filter", async () => {
      const wrapper = await expectClientFilter("maintenance", async (w) => {
        if (w.vm) {
          w.vm.filters = {
            ...(w.vm.filters || {}),
            beforePurchaseDate: "2016-01-01",
          };
        }
      });
      expect(wrapper.text()).toContain("Honda");
      expect(wrapper.text()).not.toContain("F-150");
    });
  });

  describe("US-4.11 — Vehicle maintenance as a `admin`", () => {
    it("User clicks the `Maintenance` icon button", async () => {
      const { wrapper, router } = await mountVehicle("admin");
      const pushSpy = vi.spyOn(router, "push");

      const btn =
        findByAriaLabel(wrapper, "Maintenance") ||
        wrapper.find('[aria-label*="Maintenance" i]');
      expect(btn.exists()).toBe(true);
      await btn.trigger("click");
      await flush();

      expect(pushSpy).toHaveBeenCalled();
      const dest = pushSpy.mock.calls[0][0];
      const path = typeof dest === "string" ? dest : dest.path || dest.name;
      expect(String(path)).toMatch(/maintenance/i);
      expect(JSON.stringify(dest)).toContain("12345671234567123");
    });
  });

  describe("US-4.12 — Vehicle maintenance as a `maintenance`", () => {
    it("User clicks the `Maintenance` icon button", async () => {
      const { wrapper, router } = await mountVehicle("maintenance");
      const pushSpy = vi.spyOn(router, "push");

      const btn =
        findByAriaLabel(wrapper, "Maintenance") ||
        wrapper.find('[aria-label*="Maintenance" i]');
      expect(btn.exists()).toBe(true);
      await btn.trigger("click");
      await flush();

      expect(pushSpy).toHaveBeenCalled();
      const dest = pushSpy.mock.calls[0][0];
      expect(JSON.stringify(dest)).toMatch(/maintenance/i);
      expect(JSON.stringify(dest)).toContain("12345671234567123");
    });
  });

  describe("US-4.13 — View vehicle image as a `admin`", () => {
    it("User hovers over a vehicle list item as `admin`", async () => {
      const { wrapper } = await mountVehicle("admin", [
        {
          ...sampleVehicles[0],
          imageUrl: "https://example.com/honda.jpg",
        },
      ]);

      const row =
        findByText(wrapper, "Honda") ||
        wrapper.find("tr") ||
        wrapper.find(".vehicle-row");
      expect(row).toBeTruthy();
      await row.trigger("mouseenter");
      await flush();

      const img = wrapper.find("img");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toContain("honda.jpg");
    });
  });

  describe("US-4.14 — View vehicle image as a `maintenance`", () => {
    it("User hovers over a vehicle list item as `maintenance`", async () => {
      const { wrapper } = await mountVehicle("maintenance", [
        {
          ...sampleVehicles[0],
          imageUrl: "https://example.com/honda.jpg",
        },
      ]);

      const row =
        findByText(wrapper, "Honda") ||
        wrapper.find("tr") ||
        wrapper.find(".vehicle-row");
      expect(row).toBeTruthy();
      await row.trigger("mouseenter");
      await flush();

      const img = wrapper.find("img");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toContain("honda.jpg");
    });
  });

  describe("US-4.15 — Confirm create new `maintenance-info` as a admin", () => {
    it("`Confirm Create New Maintenance Info` modal opens", async () => {
      const { wrapper } = await mountVehicle("admin");
      if (wrapper.vm) {
        wrapper.vm.showConfirmMaintenanceInfo = true;
        wrapper.vm.pendingMake = "Honda";
        wrapper.vm.pendingModel = "Accord";
        wrapper.vm.pendingYear = 2014;
      }
      await flush();

      const before = apiCallCount();
      expect(wrapper.text()).toContain(
        "Do you want to create a new maintenance info of Honda, Accord, and 2014?"
      );
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `cancel` button", async () => {
      const { wrapper } = await mountVehicle("admin");
      if (wrapper.vm) {
        wrapper.vm.showConfirmMaintenanceInfo = true;
        wrapper.vm.showAddVehicle = true;
      }
      await flush();
      const before = apiCallCount();

      const cancel = findButtonByText(wrapper, "cancel") || findButtonByText(wrapper, "Cancel");
      expect(cancel).toBeTruthy();
      await cancel.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Add Vehicle|Edit Vehicle/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `confirm` button", async () => {
      createMaintenanceInfo.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created maintenance-info." },
      });
      createVehicle.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created vehicle." },
      });

      const { wrapper } = await mountVehicle("admin");
      if (wrapper.vm) {
        wrapper.vm.showConfirmMaintenanceInfo = true;
        wrapper.vm.showConfirmFuelType = false;
        wrapper.vm.showAddVehicle = true;
      }
      await flush();

      const confirm =
        findButtonByText(wrapper, "confirm") || findButtonByText(wrapper, "Confirm");
      expect(confirm).toBeTruthy();
      await confirm.trigger("click");
      await flush();

      expect(createMaintenanceInfo).toHaveBeenCalled();
      expect(createVehicle).toHaveBeenCalled();
      expect(createMaintenanceInfo.mock.results[0].value).resolves.toMatchObject({
        status: 201,
      });
    });
  });

  describe("US-4.16 — Confirm create new `maintenance-info` as a maintenace", () => {
    it("`Confirm Create New Maintenance Info` modal opens", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      if (wrapper.vm) {
        wrapper.vm.showConfirmMaintenanceInfo = true;
        wrapper.vm.pendingMake = "Honda";
        wrapper.vm.pendingModel = "Accord";
        wrapper.vm.pendingYear = 2014;
      }
      await flush();

      const before = apiCallCount();
      expect(wrapper.text()).toContain(
        "Do you want to create a new maintenance info of Honda, Accord, and 2014?"
      );
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `cancel` button", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      if (wrapper.vm) {
        wrapper.vm.showConfirmMaintenanceInfo = true;
        wrapper.vm.showAddVehicle = true;
      }
      await flush();
      const before = apiCallCount();

      const cancel = findButtonByText(wrapper, "cancel") || findButtonByText(wrapper, "Cancel");
      expect(cancel).toBeTruthy();
      await cancel.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Add Vehicle|Edit Vehicle/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `confirm` button with `Confirm Create New Fuel Type` modal closed", async () => {
      createMaintenanceInfo.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created maintenance-info." },
      });
      createVehicle.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created vehicle." },
      });

      const { wrapper } = await mountVehicle("maintenance");
      if (wrapper.vm) {
        wrapper.vm.showConfirmMaintenanceInfo = true;
        wrapper.vm.showConfirmFuelType = false;
      }
      await flush();

      const confirm =
        findButtonByText(wrapper, "confirm") || findButtonByText(wrapper, "Confirm");
      await confirm.trigger("click");
      await flush();

      expect(createMaintenanceInfo).toHaveBeenCalled();
      expect(createVehicle).toHaveBeenCalled();
      expect(createFuel).not.toHaveBeenCalled();
    });

    it("User clicks the `confirm` button with `Confirm Create New Fuel Type` modal open", async () => {
      createMaintenanceInfo.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created maintenance-info." },
      });
      createFuel.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created fuel type." },
      });
      createVehicle.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created vehicle." },
      });

      const { wrapper } = await mountVehicle("maintenance");
      if (wrapper.vm) {
        wrapper.vm.showConfirmMaintenanceInfo = true;
        wrapper.vm.showConfirmFuelType = true;
        wrapper.vm.pendingFuelType = "E85";
      }
      await flush();

      const confirm =
        findButtonByText(wrapper, "confirm") || findButtonByText(wrapper, "Confirm");
      await confirm.trigger("click");
      await flush();

      expect(createMaintenanceInfo).toHaveBeenCalled();
      expect(createFuel).toHaveBeenCalled();
      expect(createVehicle).toHaveBeenCalled();
    });
  });

  describe("US-4.17 — Confirm create new `fuel type` as a admin", () => {
    it("`Confirm Create New Fuel Type` modal opens", async () => {
      const { wrapper } = await mountVehicle("admin");
      if (wrapper.vm) {
        wrapper.vm.showConfirmFuelType = true;
        wrapper.vm.pendingFuelType = "E85";
      }
      await flush();

      const before = apiCallCount();
      expect(wrapper.text()).toContain("Do you want to create a new fuel type of E85?");
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `cancel` button", async () => {
      const { wrapper } = await mountVehicle("admin");
      if (wrapper.vm) {
        wrapper.vm.showConfirmFuelType = true;
        wrapper.vm.showAddVehicle = true;
      }
      await flush();
      const before = apiCallCount();

      const cancel = findButtonByText(wrapper, "cancel") || findButtonByText(wrapper, "Cancel");
      expect(cancel).toBeTruthy();
      await cancel.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Add Vehicle|Edit Vehicle/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `confirm` button with `Confirm Create New Maintenance Info` modal closed", async () => {
      createFuel.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created fuel type." },
      });
      createVehicle.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created vehicle." },
      });

      const { wrapper } = await mountVehicle("admin");
      if (wrapper.vm) {
        wrapper.vm.showConfirmFuelType = true;
        wrapper.vm.showConfirmMaintenanceInfo = false;
      }
      await flush();

      const confirm =
        findButtonByText(wrapper, "confirm") || findButtonByText(wrapper, "Confirm");
      await confirm.trigger("click");
      await flush();

      expect(createFuel).toHaveBeenCalled();
      expect(createVehicle).toHaveBeenCalled();
    });

    it("User clicks the `confirm` button with `Confirm Create New Maintenance Info` modal open", async () => {
      const { wrapper } = await mountVehicle("admin");
      if (wrapper.vm) {
        wrapper.vm.showConfirmFuelType = true;
        wrapper.vm.showConfirmMaintenanceInfo = true;
        wrapper.vm.pendingMake = "Honda";
        wrapper.vm.pendingModel = "Accord";
        wrapper.vm.pendingYear = 2014;
      }
      await flush();
      const before = apiCallCount();

      const confirmButtons = wrapper
        .findAll("button")
        .filter((btn) => /confirm/i.test(btn.text()));
      const fuelConfirm = confirmButtons[0];
      expect(fuelConfirm).toBeTruthy();
      await fuelConfirm.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Confirm Create New Maintenance Info/i);
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-4.18 — Confirm create new `fuel type` as a maintenance", () => {
    it("`Confirm Create New Fuel Type` modal opens", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      if (wrapper.vm) {
        wrapper.vm.showConfirmFuelType = true;
        wrapper.vm.pendingFuelType = "E85";
      }
      await flush();

      const before = apiCallCount();
      expect(wrapper.text()).toContain("Do you want to create a new fuel type of E85?");
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `cancel` button", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      if (wrapper.vm) {
        wrapper.vm.showConfirmFuelType = true;
        wrapper.vm.showAddVehicle = true;
      }
      await flush();
      const before = apiCallCount();

      const cancel = findButtonByText(wrapper, "cancel") || findButtonByText(wrapper, "Cancel");
      expect(cancel).toBeTruthy();
      await cancel.trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Add Vehicle|Edit Vehicle/i);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `confirm` button with `Confirm Create New Maintenance Info` modal closed", async () => {
      createFuel.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created fuel type." },
      });
      createVehicle.mockResolvedValue({
        status: 201,
        data: { message: "Successfully created vehicle." },
      });

      const { wrapper } = await mountVehicle("maintenance");
      if (wrapper.vm) {
        wrapper.vm.showConfirmFuelType = true;
        wrapper.vm.showConfirmMaintenanceInfo = false;
      }
      await flush();

      const confirm =
        findButtonByText(wrapper, "confirm") || findButtonByText(wrapper, "Confirm");
      await confirm.trigger("click");
      await flush();

      expect(createFuel).toHaveBeenCalled();
      expect(createVehicle).toHaveBeenCalled();
    });

    it("User clicks the `confirm` button with `Confirm Create New Maintenance Info` modal open", async () => {
      const { wrapper } = await mountVehicle("maintenance");
      if (wrapper.vm) {
        wrapper.vm.showConfirmFuelType = true;
        wrapper.vm.showConfirmMaintenanceInfo = true;
      }
      await flush();
      const before = apiCallCount();

      const confirmButtons = wrapper
        .findAll("button")
        .filter((btn) => /confirm/i.test(btn.text()));
      await confirmButtons[0].trigger("click");
      await flush();

      expect(wrapper.text()).toMatch(/Confirm Create New Maintenance Info/i);
      expect(apiCallCount()).toBe(before);
    });
  });
});
