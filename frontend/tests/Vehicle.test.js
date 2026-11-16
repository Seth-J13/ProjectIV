/**
 * Feature 4 — Vehicle CRUD
 * Spec: features/feature-4-Vehicle-CRUD.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DOMWrapper, flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import Vehicle from "../src/views/Vehicle.vue";
import Utils from "../src/config/utils.js";
import vehicleServices from "../src/services/vehicleServices.js";
import areaServices from "../src/services/areaServices.js";

vi.mock("../src/services/vehicleServices.js", () => ({
  default: {
    getVehicles: vi.fn(),
    getVehicle: vi.fn(),
    createVehicle: vi.fn(),
    updateVehicle: vi.fn(),
    deleteVehicle: vi.fn(),
    getFuels: vi.fn(),
    createFuel: vi.fn(),
    getMaintenanceInfo: vi.fn(),
    createMaintenanceInfo: vi.fn(),
  },
}));
vi.mock("../src/services/areaServices.js", () => ({ default: { getAreas: vi.fn() } }));

const vehicleApi = vehicleServices;
const areaApi = areaServices;

const FORM_ERROR = "An error occured processing your form.";
const MAINTENANCE_INFO_QUESTION =
  "Do you want to create a new maintenance info of BrandNewMake, BrandNewModel, and 2022?";

const areas = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Facilities" },
];

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
    area_id: 1,
    area: { id: 1, name: "Engineering" },
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
    area_id: 2,
    area: { id: 2, name: "Facilities" },
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
    area_id: 1,
    area: { id: 1, name: "Engineering" },
    available: 1,
    mileage: 500,
  },
];

const newVehicleForm = {
  VIN: "55555555555555555",
  License: "NEW123",
  Make: "BrandNewMake",
  Model: "BrandNewModel",
  Year: 2022,
  Color: "Red",
  Area: 1,
  "Purchase Date": "2022-01-01",
  "Tag Expiration Month": "2023-01-01",
  "Fuel Type": "87 Octane",
  "Fuel Capacity": 15,
  "Recommended Tire PSI": 35,
};

let wrapper;
let router;

function setUser(role) {
  Utils.setStore("user", { userId: 1, username: `${role}user`, role, token: `${role}-token` });
}

function vehiclesResponse(vehicles) {
  return {
    status: 200,
    data: { message: "Successfully retreived all vehicles", vehicles },
  };
}

function notFound() {
  return Promise.reject({ response: { status: 404, data: { message: "Not found" } } });
}

async function mountVehicle(role = "admin", vehicles = sampleVehicles) {
  setUser(role);
  vehicleApi.getVehicles.mockResolvedValue(vehiclesResponse(vehicles));
  vehicleApi.getFuels.mockResolvedValue({ status: 200, data: [{ fuel_id: 1, fuel_type: "87 Octane" }] });
  vehicleApi.getMaintenanceInfo.mockResolvedValue({ status: 200, data: {} });
  areaApi.getAreas.mockResolvedValue({ status: 200, data: areas });

  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/vehicles", name: "vehicleManagement", component: Vehicle },
      { path: "/maintenance/:vin", name: "maintenance", component: { template: "<div>Maintenance</div>" } },
      { path: "/", name: "login", component: { template: "<div>Login</div>" } },
    ],
  });
  await router.push("/vehicles");
  await router.isReady();

  wrapper = mount(Vehicle, {
    attachTo: document.body,
    global: {
      plugins: [createVuetify({ components, directives }), router],
    },
  });
  await flushPromises();
}

function apiCallCount() {
  let count = 0;
  for (const mock of [...Object.values(vehicleApi), ...Object.values(areaApi)]) {
    count += mock.mock.calls.length;
  }
  return count;
}

function tableText() {
  return wrapper.find("tbody").text();
}

// v-dialog content is teleported to document.body, so it is queried from there.
function modal(selector) {
  const element = document.querySelector(selector);
  return {
    exists: () => element !== null,
    text: () => (element?.textContent ?? "").replace(/\s+/g, " ").trim(),
  };
}

function findFieldAt(label, index) {
  for (const name of ["VCombobox", "VSelect", "VNumberInput", "VTextField"]) {
    const matches = wrapper.findAllComponents({ name }).filter((item) => item.props("label") === label);
    if (matches.length > 0) {
      return index === "last" ? matches[matches.length - 1] : matches[index];
    }
  }
  throw new Error(`Missing field: ${label}`);
}

// Filters render before the modal, so the first match is a filter and the last is the modal field.
function findField(label) {
  return findFieldAt(label, 0);
}

function modalField(label) {
  return findFieldAt(label, "last");
}

async function setFilter(label, value) {
  await findField(label).setValue(value);
  await flushPromises();
}

async function setModal(fields) {
  for (const [label, value] of Object.entries(fields)) {
    await modalField(label).setValue(value);
  }
  await flushPromises();
}

async function clickIn(selector, text) {
  const button = [...document.querySelector(selector).querySelectorAll("button")].find(
    (node) => node.textContent.trim() === text
  );
  if (!button) {
    throw new Error(`Missing button "${text}" in ${selector}`);
  }
  await new DOMWrapper(button).trigger("click");
  await flushPromises();
}

async function openAddModal() {
  const addButton = wrapper.findAll("button").find((node) => node.text().trim() === "Add Vehicle");
  await addButton.trigger("click");
  await flushPromises();
}

async function openEditModal(index = 0) {
  await wrapper.findAll('[aria-label="Edit"]')[index].trigger("click");
  await flushPromises();
}

async function submitAdd() {
  await clickIn("#vehicle-dialog", "Add Vehicle");
}

async function submitAddWith(overrides = {}) {
  await openAddModal();
  await setModal({ ...newVehicleForm, ...overrides });
  await submitAdd();
}

beforeEach(() => {
  Object.values(vehicleApi).forEach((fn) => fn.mockReset());
  Object.values(areaApi).forEach((fn) => fn.mockReset());
  vehicleApi.createVehicle.mockResolvedValue({ status: 201, data: { message: "Successfully created vehicle." } });
  vehicleApi.updateVehicle.mockResolvedValue({ status: 201, data: { message: "Successfully updated vehicle." } });
  vehicleApi.deleteVehicle.mockResolvedValue({ status: 200, data: { message: "Successfully deleted vehicle." } });
  vehicleApi.createMaintenanceInfo.mockResolvedValue({
    status: 201,
    data: { message: "Successfully created maintenance-info." },
  });
  vehicleApi.createFuel.mockResolvedValue({
    status: 201,
    data: { message: "Successfully created fuel type.", fuel_id: 7 },
  });
  localStorage.clear();
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
  localStorage.clear();
});

describe("Feature 4 — Vehicle CRUD", () => {
  describe("US-4.1 — Add a new vehicle as a `admin` role", () => {
    it("User clicks the add button", async () => {
      await mountVehicle("admin");
      const before = apiCallCount();

      await openAddModal();

      expect(modal("#vehicle-dialog").exists()).toBe(true);
      expect(modal("#vehicle-dialog").text()).toContain("Add Vehicle");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs invalid information into `Add Vehicle` modal", async () => {
      await mountVehicle("admin");
      await openAddModal();
      await setModal({ ...newVehicleForm, Make: "" });

      await submitAdd();

      expect(modal("#vehicle-dialog").text()).toContain(FORM_ERROR);
      expect(vehicleApi.createVehicle).not.toHaveBeenCalled();
      expect(vehicleApi.getMaintenanceInfo).not.toHaveBeenCalled();
    });

    it("User inputs valid information into the `Add Vehicle` modal", async () => {
      await mountVehicle("admin");

      await submitAddWith({ Make: "Honda", Model: "Accord", Year: 2014 });

      expect(vehicleApi.createVehicle).toHaveBeenCalledWith(
        expect.objectContaining({
          vin: "55555555555555555",
          make: "Honda",
          model: "Accord",
          year: 2014,
          area_id: 1,
          license_plate_num: "NEW123",
        })
      );
      expect(wrapper.vm.showVehicleDialog).toBe(false);
    });

    it("User inputs valid information into the `Add Vehicle` modal but a record already exists", async () => {
      await mountVehicle("admin");
      vehicleApi.createVehicle.mockRejectedValue({
        response: { status: 409, data: { message: "A vehicle already has license number NEW123" } },
      });

      await submitAddWith({ Make: "Honda", Model: "Accord", Year: 2014 });

      expect(wrapper.vm.showVehicleDialog).toBe(false);
      expect(wrapper.text()).toContain("A vehicle already has license number NEW123");
    });
  });

  describe("US-4.2 — Add a new vehicle as a `maintenance` role", () => {
    it("User clicks the add button", async () => {
      await mountVehicle("maintenance");
      const before = apiCallCount();

      await openAddModal();

      expect(modal("#vehicle-dialog").text()).toContain("Add Vehicle");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs a `make`, `model`, and `year` into the comboboxes that doesn't exist", async () => {
      await mountVehicle("maintenance");
      vehicleApi.getMaintenanceInfo.mockImplementation(notFound);

      await submitAddWith();

      expect(vehicleApi.getMaintenanceInfo).toHaveBeenCalledWith("BrandNewMake", "BrandNewModel", 2022);
      expect(wrapper.vm.showConfirmMaintenanceInfo).toBe(true);
      expect(modal("#confirm-maintenance-info").text()).toContain(MAINTENANCE_INFO_QUESTION);
      expect(vehicleApi.createVehicle).not.toHaveBeenCalled();
    });

    it("User inputs invalid information into `Add Vehicle` modal", async () => {
      await mountVehicle("maintenance");
      await openAddModal();
      await setModal({ ...newVehicleForm, VIN: "123" });

      await submitAdd();

      expect(modal("#vehicle-dialog").text()).toContain(FORM_ERROR);
      expect(vehicleApi.createVehicle).not.toHaveBeenCalled();
    });
  });

  describe("US-4.3 — Edit a vehicle as a `maintenance` or `admin` role", () => {
    it("User clicks the edit icon button", async () => {
      await mountVehicle("admin");
      const before = apiCallCount();

      await openEditModal(0);

      const dialog = modal("#vehicle-dialog");
      expect(dialog.text()).toContain("Edit Vehicle");
      expect(modalField("Make").props("modelValue")).toBe("Honda");
      expect(modalField("Model").props("modelValue")).toBe("Accord");
      expect(modalField("Year").props("modelValue")).toBe(2014);
      expect(modalField("License").props("modelValue")).toBe("ABC344");
      expect(modalField("Area").props("modelValue")).toBe(1);
      expect(modalField("Purchase Date").props("modelValue")).toBe("2015-12-16");
      expect(apiCallCount()).toBe(before);
    });

    it("User inputs invalid information into `Edit Vehicle` modal", async () => {
      await mountVehicle("maintenance");
      await openEditModal(0);
      await setModal({ Make: "" });

      await clickIn("#vehicle-dialog", "Update Vehicle");

      expect(modal("#vehicle-dialog").text()).toContain(FORM_ERROR);
      expect(vehicleApi.updateVehicle).not.toHaveBeenCalled();
    });

    it("User inputs valid information into the `Edit Vehicle` modal", async () => {
      await mountVehicle("admin");
      await openEditModal(0);
      await setModal({ Color: "Silver" });

      await clickIn("#vehicle-dialog", "Update Vehicle");

      expect(vehicleApi.updateVehicle).toHaveBeenCalledWith(
        "12345671234567123",
        expect.objectContaining({ vin: "12345671234567123", color: "Silver", make: "Honda" })
      );
      expect(wrapper.vm.showVehicleDialog).toBe(false);
    });
  });

  describe("US-4.4 — Delete a vehicle as a `maintenance` or `admin` role", () => {
    it("User clicks the delete icon button", async () => {
      await mountVehicle("admin");

      await wrapper.findAll('[aria-label="Delete"]')[1].trigger("click");
      await flushPromises();

      expect(vehicleApi.deleteVehicle).toHaveBeenCalledWith("98765432109876543");
      expect(vehicleApi.getVehicles).toHaveBeenCalledTimes(2);
    });
  });

  describe("US-4.5 — View all vehicles as a `maintenance` or `admin` role", () => {
    it("There no vehicles to display in the vehicle list", async () => {
      await mountVehicle("admin", []);

      expect(vehicleApi.getVehicles).toHaveBeenCalled();
      for (const header of ["License", "Make", "Model", "Year", "Purchase Date", "Color", "Department", "Actions"]) {
        expect(wrapper.find("thead").text()).toContain(header);
      }
      expect(wrapper.findAll("tbody tr")).toHaveLength(0);
      expect(wrapper.text()).toContain("No vehicles to display");
    });

    it("User first loads the Vehicle page", async () => {
      await mountVehicle("maintenance");

      expect(vehicleApi.getVehicles).toHaveBeenCalledTimes(1);
      expect(wrapper.text()).toContain("Vehicle Management");
      expect(wrapper.findAll("tbody tr")).toHaveLength(3);
      const firstRow = wrapper.find("tbody tr").text();
      for (const value of ["ABC344", "Honda", "Accord", "2014", "2015-12-16", "White", "Engineering"]) {
        expect(firstRow).toContain(value);
      }
      expect(wrapper.findAll('[aria-label="Maintenance"]')).toHaveLength(3);
      expect(wrapper.findAll('[aria-label="Edit"]')).toHaveLength(3);
      expect(wrapper.findAll('[aria-label="Delete"]')).toHaveLength(3);
      expect(wrapper.find('[aria-label="Maintenance"] .mdi-wrench').exists()).toBe(true);
      expect(wrapper.find('[aria-label="Edit"] .mdi-pencil').exists()).toBe(true);
      expect(wrapper.find('[aria-label="Delete"] .mdi-delete').exists()).toBe(true);
    });

    it("User adds a new vehicle", async () => {
      await mountVehicle("admin");
      const added = {
        ...sampleVehicles[0],
        vin: "55555555555555555",
        make: "Subaru",
        model: "Outback",
        license_plate_num: "NEW123",
      };
      vehicleApi.getVehicles.mockResolvedValue(vehiclesResponse([...sampleVehicles, added]));

      await submitAddWith({ Make: "Honda", Model: "Accord", Year: 2014 });

      expect(vehicleApi.createVehicle).toHaveBeenCalledTimes(1);
      expect(vehicleApi.getVehicles).toHaveBeenCalledTimes(2);
      expect(wrapper.findAll("tbody tr")).toHaveLength(4);
      expect(tableText()).toContain("Subaru");
    });

    it("User edits a vehicle in the list", async () => {
      await mountVehicle("admin");
      const edited = sampleVehicles.map((vehicle, index) =>
        index === 0 ? { ...vehicle, color: "Silver" } : vehicle
      );
      vehicleApi.getVehicles.mockResolvedValue(vehiclesResponse(edited));

      await openEditModal(0);
      await setModal({ Color: "Silver" });
      await clickIn("#vehicle-dialog", "Update Vehicle");

      expect(vehicleApi.updateVehicle).toHaveBeenCalledTimes(1);
      expect(vehicleApi.getVehicles).toHaveBeenCalledTimes(2);
      expect(tableText()).toContain("Silver");
      expect(wrapper.findAll("tbody tr")).toHaveLength(3);
    });

    it("Vehicle does not have a color value", async () => {
      await mountVehicle("admin");
      const before = apiCallCount();

      expect(wrapper.findAll("tbody tr")[2].text()).toContain("No Color");
      expect(wrapper.findAll("tbody tr")[0].text()).not.toContain("No Color");
      expect(apiCallCount()).toBe(before);
    });

    it("Vehicle does not have a license plate number value", async () => {
      await mountVehicle("admin");
      const before = apiCallCount();

      expect(wrapper.findAll("tbody tr")[2].text()).toContain("No License Plate");
      expect(wrapper.findAll("tbody tr")[0].text()).not.toContain("No License Plate");
      expect(apiCallCount()).toBe(before);
    });
  });

  describe("US-4.6 — Filter vehicle list as a `maintenance` or `admin` role", () => {
    async function mountAndFilter(label, value) {
      await mountVehicle("admin");
      const before = apiCallCount();
      await setFilter(label, value);
      expect(apiCallCount()).toBe(before);
    }

    it("User chooses from the year drop down filter", async () => {
      await mountAndFilter("Year", 2014);

      expect(findField("Year").props("modelValue")).toBe(2014);
      expect(tableText()).toContain("Accord");
      expect(tableText()).toContain("Camry");
      expect(tableText()).not.toContain("F-150");

      await setFilter("Make", "Toy");
      expect(tableText()).toContain("Camry");
      expect(tableText()).not.toContain("Accord");
    });

    it("User chooses from the area drop down filter", async () => {
      await mountAndFilter("Area", 2);

      expect(findField("Area").props("modelValue")).toBe(2);
      expect(tableText()).toContain("F-150");
      expect(tableText()).not.toContain("Accord");
      expect(tableText()).not.toContain("Camry");
    });

    it("User begins to type in the `Make` filter", async () => {
      await mountAndFilter("Make", "Hon");

      expect(tableText()).toContain("Honda");
      expect(tableText()).not.toContain("Ford");

      await setFilter("Make", "xyz");
      expect(wrapper.findAll("tbody tr")).toHaveLength(0);
    });

    it("User begins to type in the `Model` filter", async () => {
      await mountAndFilter("Model", "F-1");

      expect(tableText()).toContain("F-150");
      expect(tableText()).not.toContain("Accord");
    });

    it("User begins to type in the `Color` filter", async () => {
      await mountAndFilter("Color", "Bla");

      expect(tableText()).toContain("Black");
      expect(tableText()).not.toContain("White");
      expect(tableText()).not.toContain("No Color");
    });

    it("User begins to type in the `License` filter", async () => {
      await mountAndFilter("License", "XYZ");

      expect(tableText()).toContain("XYZ999");
      expect(tableText()).not.toContain("ABC344");
      expect(tableText()).not.toContain("No License Plate");
    });

    it("User chooses from the `From Purchase Date` date filter", async () => {
      await mountAndFilter("From Purchase Date", "2019-01-10");

      expect(findField("From Purchase Date").props("modelValue")).toBe("2019-01-10");
      expect(tableText()).toContain("F-150");
      expect(tableText()).not.toContain("Accord");
      expect(tableText()).not.toContain("Camry");
    });

    it("User chooses from the `Before Purchase Date` date filter", async () => {
      await mountAndFilter("Before Purchase Date", "2015-12-16");

      expect(findField("Before Purchase Date").props("modelValue")).toBe("2015-12-16");
      expect(tableText()).toContain("Accord");
      expect(tableText()).toContain("Camry");
      expect(tableText()).not.toContain("F-150");
    });
  });

  describe("US-4.7 — Vehicle maintenance as a `maintenance` or `admin`", () => {
    it("User clicks the `Maintenance` icon button", async () => {
      await mountVehicle("maintenance");

      await wrapper.findAll('[aria-label="Maintenance"]')[0].trigger("click");
      await vi.waitFor(() => expect(router.currentRoute.value.name).toBe("maintenance"));


      expect(router.currentRoute.value.params.vin).toBe("12345671234567123");
      expect(router.currentRoute.value.path).toContain("12345671234567123");
    });
  });

  describe("US-4.8 — View vehicle image as a `maintenance` or `admin`", () => {
    it("User hovers over a vehicle list item as a `maintenance`or`admin`", async () => {
      await mountVehicle("admin", [
        { ...sampleVehicles[0], images: ["https://example.com/honda.jpg", "https://example.com/second.jpg"] },
        sampleVehicles[1],
      ]);
      expect(wrapper.find("img").exists()).toBe(false);

      await wrapper.findAll("tbody tr")[0].trigger("mouseenter");

      const image = wrapper.find("img");
      expect(image.exists()).toBe(true);
      expect(image.attributes("src")).toBe("https://example.com/honda.jpg");
      expect(wrapper.find("tbody img").exists()).toBe(false);

      await wrapper.findAll("tbody tr")[0].trigger("mouseleave");
      expect(wrapper.find("img").exists()).toBe(false);

      await wrapper.findAll("tbody tr")[1].trigger("mouseenter");
      expect(wrapper.find("img").exists()).toBe(false);
    });
  });

  describe("US-4.9 — Confirm create new `maintenance-info` as a `maintenance` or `admin`", () => {
    async function openMaintenanceInfoConfirm(overrides = {}) {
      vehicleApi.getMaintenanceInfo.mockImplementation(notFound);
      await submitAddWith(overrides);
    }

    it("`Confirm Create New Maintenance Info` modal opens", async () => {
      await mountVehicle("admin");
      await openMaintenanceInfoConfirm();
      const before = apiCallCount();

      const dialog = modal("#confirm-maintenance-info");
      expect(dialog.text()).toContain("Confirm Add New Maintenance Info?");
      expect(dialog.text()).toContain(MAINTENANCE_INFO_QUESTION);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `cancel` button", async () => {
      await mountVehicle("admin");
      await openMaintenanceInfoConfirm();
      const before = apiCallCount();

      await clickIn("#confirm-maintenance-info", "cancel");

      expect(wrapper.vm.showConfirmMaintenanceInfo).toBe(false);
      expect(wrapper.vm.showVehicleDialog).toBe(true);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `confirm`button with`Confirm Create New Fuel Type` modal closed", async () => {
      await mountVehicle("admin");
      await openMaintenanceInfoConfirm();
      expect(wrapper.vm.showConfirmFuelType).toBe(false);

      await clickIn("#confirm-maintenance-info", "confirm");

      expect(vehicleApi.createFuel).not.toHaveBeenCalled();
      expect(vehicleApi.createMaintenanceInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          make: "BrandNewMake",
          model: "BrandNewModel",
          year: 2022,
          fuel_type_id: 1,
          fuel_capacity: 15,
          recommended_tire_psi: 35,
        })
      );
      expect(vehicleApi.createVehicle).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.showConfirmMaintenanceInfo).toBe(false);
      expect(wrapper.vm.showVehicleDialog).toBe(false);
    });

    it("User clicks the `confirm`button with`Confirm Create New Fuel Type` modal open", async () => {
      await mountVehicle("admin");
      await openMaintenanceInfoConfirm({ "Fuel Type": "E85" });
      expect(wrapper.vm.showConfirmFuelType).toBe(true);

      await clickIn("#confirm-maintenance-info", "confirm");

      expect(vehicleApi.createFuel).toHaveBeenCalledWith({ fuel_type: "E85" });
      expect(vehicleApi.createMaintenanceInfo).toHaveBeenCalledWith(
        expect.objectContaining({ fuel_type_id: 7 })
      );
      expect(vehicleApi.createVehicle).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.showConfirmMaintenanceInfo).toBe(false);
      expect(wrapper.vm.showConfirmFuelType).toBe(false);
      expect(wrapper.vm.showVehicleDialog).toBe(false);
    });
  });

  describe("US-4.10 — Confirm create new `fuel type` as a `maintenance` or `admin`", () => {
    it("`Confirm Create New Fuel Type` modal opens", async () => {
      await mountVehicle("maintenance");
      await submitAddWith({ "Fuel Type": "E85", Make: "Honda", Model: "Accord", Year: 2014 });
      const before = apiCallCount();

      const dialog = modal("#confirm-fuel-type");
      expect(dialog.text()).toContain("Do you want to create a new fuel type of E85?");
      expect(wrapper.vm.showConfirmMaintenanceInfo).toBe(false);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `cancel` button", async () => {
      await mountVehicle("maintenance");
      await submitAddWith({ "Fuel Type": "E85", Make: "Honda", Model: "Accord", Year: 2014 });
      const before = apiCallCount();

      await clickIn("#confirm-fuel-type", "cancel");

      expect(wrapper.vm.showConfirmFuelType).toBe(false);
      expect(wrapper.vm.showVehicleDialog).toBe(true);
      expect(apiCallCount()).toBe(before);
    });

    it("User clicks the `confirm`button with`Confirm Create New Maintenance Info` modal closed", async () => {
      await mountVehicle("maintenance");
      await submitAddWith({ "Fuel Type": "E85", Make: "Honda", Model: "Accord", Year: 2014 });
      expect(wrapper.vm.showConfirmMaintenanceInfo).toBe(false);

      await clickIn("#confirm-fuel-type", "confirm");

      expect(vehicleApi.createFuel).toHaveBeenCalledWith({ fuel_type: "E85" });
      expect(vehicleApi.createMaintenanceInfo).not.toHaveBeenCalled();
      expect(vehicleApi.createVehicle).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.showConfirmFuelType).toBe(false);
      expect(wrapper.vm.showVehicleDialog).toBe(false);
    });

    it("User clicks the `confirm`button with`Confirm Create New Maintenance Info` modal open", async () => {
      await mountVehicle("maintenance");
      vehicleApi.getMaintenanceInfo.mockImplementation(notFound);
      await submitAddWith({ "Fuel Type": "E85" });
      expect(wrapper.vm.showConfirmMaintenanceInfo).toBe(true);
      expect(wrapper.vm.showConfirmFuelType).toBe(true);
      const before = apiCallCount();

      await clickIn("#confirm-fuel-type", "confirm");

      expect(wrapper.vm.showConfirmFuelType).toBe(false);
      expect(wrapper.vm.showConfirmMaintenanceInfo).toBe(true);
      expect(modal("#confirm-maintenance-info").text()).toContain(MAINTENANCE_INFO_QUESTION);
      expect(apiCallCount()).toBe(before);
    });
  });
});
