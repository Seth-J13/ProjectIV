/**
 * Feature 12 — Landing Vue
 * Spec: features/feature-12-Landing-Vue.md
 *
 * Landing.vue reuses the Feature 8 services:
 * - requestServices.findVehicles()   (vehicleId, license, make, model, year, available, inUse)
 * - requestServices.findAll()        (requests the caller may see)
 * - requestServices.create(body)     (trip or maintenance request)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import Landing from "../src/views/Landing.vue";
import TripRequestForm from "../src/components/TripRequestForm.vue";
import MaintenanceRequestForm from "../src/components/MaintenanceRequestForm.vue";
import Utils from "../src/config/utils.js";
import { mountWithPlugins } from "./testUtils.js";

const { findAll, findVehicles, findDrivers, findDestinations, create } = vi.hoisted(() => ({
  findAll: vi.fn(),
  findVehicles: vi.fn(),
  findDrivers: vi.fn(),
  findDestinations: vi.fn(),
  create: vi.fn(),
}));

vi.mock("../src/services/requestServices.js", () => ({
  default: {
    findAll: (...args) => findAll(...args),
    findVehicles: (...args) => findVehicles(...args),
    findDrivers: (...args) => findDrivers(...args),
    findDestinations: (...args) => findDestinations(...args),
    create: (...args) => create(...args),
  },
}));

const userIds = { admin: 1, maintenance: 2, driver: 3, user: 4 };

const vehicles = [
  {
    vehicleId: "101",
    license: "ABC344",
    make: "Honda",
    model: "Accord",
    year: 2014,
    available: true,
    inUse: false,
  },
  {
    vehicleId: "202",
    license: "HID999",
    make: "Ford",
    model: "F-150",
    year: 2018,
    available: false,
    inUse: false,
  },
  {
    vehicleId: "303",
    license: "SRV303",
    make: "Toyota",
    model: "Camry",
    year: 2019,
    available: true,
    inUse: true,
  },
  {
    vehicleId: "404",
    license: "MY404",
    make: "Chevy",
    model: "Malibu",
    year: 2021,
    available: true,
    inUse: true,
  },
  {
    vehicleId: "808",
    license: "OTH808",
    make: "Nissan",
    model: "Altima",
    year: 2020,
    available: true,
    inUse: true,
  },
];

function requestsFor(role) {
  const mine = userIds[role];
  const rows = [
    // Mine and in use right now.
    { requestId: 1, requestType: "trip", requesterId: mine, vehicleId: "404", currentlyActive: true },
    // Mine, booked for later: not reserved yet.
    { requestId: 2, requestType: "trip", requesterId: mine, vehicleId: "101", currentlyActive: false },
    // Someone else's.
    { requestId: 3, requestType: "trip", requesterId: 99, vehicleId: "808", currentlyActive: true },
    { requestId: 4, requestType: "maintenance", requesterId: 99, vehicleId: "303", currentlyActive: true },
  ];

  if (role === "admin") {
    return rows;
  }

  // A maintenance user also reads every maintenance request.
  if (role === "maintenance") {
    return rows.filter((row) => row.requesterId === mine || row.requestType === "maintenance");
  }

  return rows.filter((row) => row.requesterId === mine);
}

function setUser(role) {
  Utils.setStore("user", {
    id: userIds[role],
    email: `${role}@example.com`,
    firstName: "Test",
    lastName: role,
    role,
    token: `${role}-token`,
  });
}

function apiCalls() {
  return (
    findAll.mock.calls.length +
    findVehicles.mock.calls.length +
    findDrivers.mock.calls.length +
    findDestinations.mock.calls.length +
    create.mock.calls.length
  );
}

async function flush() {
  await flushPromises();
  await nextTick();
  await flushPromises();
}

async function mountLanding(role) {
  setUser(role);
  findVehicles.mockResolvedValue({ data: vehicles });
  findAll.mockResolvedValue({ data: requestsFor(role) });
  findDrivers.mockResolvedValue({ data: [{ driverId: 3, name: "Jane Doe" }] });
  findDestinations.mockResolvedValue({ data: [{ destId: 7, name: "State Capitol" }] });

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/landing", name: "landing", component: Landing },
      { path: "/requests", name: "requests", component: { template: "<div>Requests</div>" } },
      { path: "/maintenance-info/:vin?", name: "maintenance", component: { template: "<div>Maintenance</div>" } },
    ],
  });
  await router.push("/landing");
  await router.isReady();

  const { wrapper } = await mountWithPlugins(Landing, { router });
  await flush();
  return { wrapper, router };
}

function section(wrapper, key) {
  return wrapper.find(`[data-testid="section-${key}"]`);
}

function rowTexts(wrapper, key) {
  return section(wrapper, key)
    .findAll("tbody tr")
    .map((row) => row.text());
}

function rowFor(wrapper, key, license) {
  return section(wrapper, key)
    .findAll("tbody tr")
    .find((row) => row.text().includes(license));
}

async function fillTrip(wrapper, overrides = {}) {
  Object.assign(wrapper.findComponent(TripRequestForm).props("form"), {
    vehicleId: "101",
    driverId: 3,
    destId: 7,
    startDate: "2026-11-20",
    endDate: "2026-11-21",
    numPeople: "4",
    ...overrides,
  });
  await nextTick();
}

async function submitForm(wrapper) {
  await wrapper.find("form").trigger("submit");
  await flush();
}

beforeEach(() => {
  localStorage.clear();
  findAll.mockReset();
  findVehicles.mockReset();
  findDrivers.mockReset();
  findDestinations.mockReset();
  create.mockReset();
});

afterEach(() => {
  localStorage.clear();
});

describe("Feature 12 — Landing Vue", () => {
  describe("US-12.1 — View Available Vehicles", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        findVehicles.mockClear();
        const { wrapper } = await mountLanding(role);

        expect(wrapper.find("h1").text()).toBe("Vehicle Management System");
        expect(findVehicles).toHaveBeenCalledTimes(1);
        wrapper.unmount();
      }
    });

    it("User clicks a vehicle in the `Available Vehicles` list", async () => {
      const { wrapper } = await mountLanding("user");
      const before = apiCalls();

      await rowFor(wrapper, "available", "ABC344").trigger("click");
      await flush();

      expect(wrapper.findComponent(TripRequestForm).props("form").vehicleId).toBe("101");
      const fieldValue = (label) =>
        wrapper
          .findAllComponents({ name: "VTextField" })
          .find((field) => field.props("label") === label)
          .find("input").element.value;
      expect(fieldValue("Vehicle")).toBe("ABC344 Honda Accord");
      expect(fieldValue("License")).toBe("ABC344");
      expect(fieldValue("Make")).toBe("Honda");
      expect(fieldValue("Model")).toBe("Accord");
      expect(apiCalls()).toBe(before);
    });

    it("User views `Available Vehicles` list", async () => {
      const { wrapper } = await mountLanding("user");
      const headers = section(wrapper, "available")
        .findAll("thead th")
        .map((th) => th.text());

      expect(headers).toEqual(["License", "Make", "Model", "Year", "Image"]);

      const rows = rowTexts(wrapper, "available");
      expect(rows).toHaveLength(1);
      expect(rows[0]).toContain("ABC344");
      expect(rows[0]).toContain("Honda");
      expect(rows[0]).toContain("Accord");
      expect(rows[0]).toContain("2014");
      // Unavailable and in-use vehicles are not offered.
      expect(section(wrapper, "available").text()).not.toContain("HID999");
      expect(section(wrapper, "available").text()).not.toContain("MY404");
    });
  });

  describe("US-12.2 — View `Your Reserved Vehicles`", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const { wrapper } = await mountLanding(role);

        expect(findAll).toHaveBeenCalled();
        const rows = rowTexts(wrapper, "your-reserved");
        expect(rows).toHaveLength(1);
        expect(rows[0]).toContain("MY404");
        wrapper.unmount();
        findAll.mockClear();
      }
    });

    it("User clicks on a list item", async () => {
      const { wrapper, router } = await mountLanding("user");
      const before = apiCalls();

      await rowFor(wrapper, "your-reserved", "MY404").trigger("click");
      await flush();
      await vi.waitFor(() => expect(router.currentRoute.value.name).toBe("requests"));
      expect(apiCalls()).toBe(before);
    });

    it("User views `Your Reserved Vehicles` list", async () => {
      const { wrapper } = await mountLanding("driver");
      const headers = section(wrapper, "your-reserved")
        .findAll("thead th")
        .map((th) => th.text());

      expect(headers).toEqual(["License", "Make", "Model", "Year", "Image"]);

      const text = section(wrapper, "your-reserved").text();
      expect(text).toContain("MY404");
      expect(text).toContain("Chevy");
      expect(text).toContain("Malibu");
      expect(text).toContain("2021");
      // Someone else's reservation, and one booked for later, are not mine to see here.
      expect(text).not.toContain("OTH808");
      expect(text).not.toContain("ABC344");
    });
  });

  describe("US-12.3 — View Vehicles Currently in Service", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      for (const role of ["admin", "maintenance"]) {
        const { wrapper } = await mountLanding(role);

        expect(findVehicles).toHaveBeenCalled();
        expect(findAll).toHaveBeenCalled();
        const rows = rowTexts(wrapper, "in-service");
        expect(rows).toHaveLength(1);
        expect(rows[0]).toContain("SRV303");
        wrapper.unmount();
      }

      for (const role of ["driver", "user"]) {
        const { wrapper } = await mountLanding(role);

        expect(section(wrapper, "in-service").exists()).toBe(false);
        wrapper.unmount();
      }
    });

    it("User clicks a list item", async () => {
      const { wrapper, router } = await mountLanding("maintenance");
      const before = apiCalls();

      await rowFor(wrapper, "in-service", "SRV303").trigger("click");
      await flush();
      await vi.waitFor(() => expect(router.currentRoute.value.name).toBe("maintenance"));
      expect(router.currentRoute.value.params.vin).toBe("303");
      expect(apiCalls()).toBe(before);
    });

    it("User views `Vehicles In Service` list", async () => {
      const { wrapper } = await mountLanding("admin");
      const headers = section(wrapper, "in-service")
        .findAll("thead th")
        .map((th) => th.text());

      expect(headers).toEqual(["License", "Make", "Model", "Year", "Image", "Action"]);

      const row = rowFor(wrapper, "in-service", "SRV303");
      expect(row.text()).toContain("Toyota");
      expect(row.text()).toContain("Camry");
      expect(row.text()).toContain("2019");
      expect(row.find('button[aria-label="Info"]').exists()).toBe(true);
    });

    it("User clicks `Info Icon` button", async () => {
      const { wrapper, router } = await mountLanding("admin");
      const before = apiCalls();

      await rowFor(wrapper, "in-service", "SRV303").find('button[aria-label="Info"]').trigger("click");
      await flush();
      await vi.waitFor(() => expect(router.currentRoute.value.name).toBe("maintenance"));
      expect(router.currentRoute.value.params.vin).toBe("303");
      expect(apiCalls()).toBe(before);
    });
  });

  describe("US-12.4 — Toggle between TripRequestVorm.vue and Maintenance Request", () => {
    it("User clicks the form toggle switch", async () => {
      for (const role of ["admin", "maintenance"]) {
        const { wrapper } = await mountLanding(role);
        const before = apiCalls();

        expect(wrapper.findComponent(TripRequestForm).exists()).toBe(true);
        expect(wrapper.findComponent(MaintenanceRequestForm).exists()).toBe(false);

        await wrapper.find('input[role="switch"]').setValue(true);
        await flush();

        expect(wrapper.findComponent(MaintenanceRequestForm).exists()).toBe(true);
        expect(wrapper.findComponent(TripRequestForm).exists()).toBe(false);
        expect(apiCalls()).toBe(before);
        wrapper.unmount();
      }

      const { wrapper } = await mountLanding("user");
      expect(wrapper.find('input[role="switch"]').exists()).toBe(false);
    });
  });

  describe("US-12.5 — View `TripRequestVorm.vue` component", () => {
    it("User correctly fills out the `TripRequestVorm.vue`", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        create.mockReset();
        create.mockResolvedValue({ status: 201, data: { requestId: 10, requestType: "trip" } });
        const { wrapper } = await mountLanding(role);
        await fillTrip(wrapper);

        await submitForm(wrapper);

        expect(create).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledWith(
          expect.objectContaining({
            requestType: "trip",
            vehicleId: "101",
            driverId: 3,
            destId: 7,
            startDate: "2026-11-20",
            endDate: "2026-11-21",
            numPeople: 4,
          })
        );
        expect(wrapper.findComponent(TripRequestForm).props("form")).toMatchObject({
          vehicleId: null,
          driverId: null,
          destId: null,
          startDate: "",
          endDate: "",
          numPeople: "",
        });
        wrapper.unmount();
      }
    });

    it("User incorrectly fills out the `TripRequestVorm.vue`", async () => {
      create.mockRejectedValue({
        response: { status: 400, data: { message: "driver is required." } },
      });
      const { wrapper } = await mountLanding("user");
      await fillTrip(wrapper, { driverId: null });

      await submitForm(wrapper);

      expect(create).toHaveBeenCalledTimes(1);
      expect(wrapper.text()).toContain("driver is required.");
      expect(wrapper.findComponent(TripRequestForm).props("form").vehicleId).toBe("101");
    });
  });

  describe("US-12.6 — View `MaintenanceRequestVorm.vue` component", () => {
    async function openMaintenance(role) {
      const mounted = await mountLanding(role);
      await mounted.wrapper.find('input[role="switch"]').setValue(true);
      await flush();
      return mounted.wrapper;
    }

    it("User correctly fills out the `MaintenanceRequestVorm.vue`", async () => {
      for (const role of ["admin", "maintenance"]) {
        create.mockReset();
        create.mockResolvedValue({ status: 201, data: { requestId: 11, requestType: "maintenance" } });
        const wrapper = await openMaintenance(role);
        Object.assign(wrapper.findComponent(MaintenanceRequestForm).props("form"), {
          vehicleId: "101",
          startDate: "2026-11-20",
          startTime: "08:00",
        });
        await nextTick();

        await submitForm(wrapper);

        expect(create).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledWith(
          expect.objectContaining({
            requestType: "maintenance",
            vehicleId: "101",
            startDate: "2026-11-20",
            startTime: "08:00",
          })
        );
        expect(wrapper.findComponent(MaintenanceRequestForm).props("form")).toMatchObject({
          vehicleId: null,
          startDate: "",
          startTime: "",
        });
        wrapper.unmount();
      }
    });

    it("User incorrectly fills out the `MaintenanceRequestVorm.vue`", async () => {
      create.mockRejectedValue({
        response: { status: 400, data: { message: "vehicle is required." } },
      });
      const wrapper = await openMaintenance("maintenance");

      await submitForm(wrapper);

      expect(create).toHaveBeenCalledTimes(1);
      expect(wrapper.text()).toContain("vehicle is required.");
    });
  });

  describe("US-12.7 — View `Reserved Vehicles`", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      const { wrapper } = await mountLanding("admin");

      expect(findAll).toHaveBeenCalled();
      const text = section(wrapper, "reserved").text();
      expect(text).toContain("MY404");
      expect(text).toContain("OTH808");
      expect(text).toContain("SRV303");

      for (const role of ["maintenance", "driver", "user"]) {
        const other = await mountLanding(role);
        expect(section(other.wrapper, "reserved").exists()).toBe(false);
        other.wrapper.unmount();
      }
    });

    it("User views `Reserved Vehicles` list", async () => {
      const { wrapper } = await mountLanding("admin");
      const headers = section(wrapper, "reserved")
        .findAll("thead th")
        .map((th) => th.text());

      expect(headers).toEqual(["License", "Make", "Model", "Year", "Image", "Action"]);

      const row = rowFor(wrapper, "reserved", "OTH808");
      expect(row.text()).toContain("Nissan");
      expect(row.text()).toContain("Altima");
      expect(row.text()).toContain("2020");
      expect(row.find('button[aria-label="Info"]').exists()).toBe(true);
      // Booked for later is not reserved yet.
      expect(section(wrapper, "reserved").text()).not.toContain("ABC344");
    });

    it("User clicks `Info Icon` button", async () => {
      const { wrapper, router } = await mountLanding("admin");
      const before = apiCalls();

      await rowFor(wrapper, "reserved", "OTH808").find('button[aria-label="Info"]').trigger("click");
      await flush();
      await vi.waitFor(() => expect(router.currentRoute.value.name).toBe("requests"));
      expect(router.currentRoute.value.query.vehicleId).toBe("808");
      expect(apiCalls()).toBe(before);
    });
  });
});
