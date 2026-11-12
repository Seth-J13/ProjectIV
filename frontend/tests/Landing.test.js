/**
 * Feature 12 — Landing Vue
 * Spec: features/feature-12-Landing-Vue.md
 *
 * Landing.vue should call:
 * - vehicleServices.getVehicles()
 * - requestServices.getRequests(requesterId) for Your Reserved Vehicles
 * - requestServices.getRequests() with no requesterId when an admin loads Reserved Vehicles
 * - requestServices.createVehicleRequest(body) with maintenance: false
 * - requestServices.createMaintenanceRequest(body) with maintenance: true
 *
 * A request GET resolves to { data: { message, requests } }.
 * Headings: "Available Vehicles", "Your Reserved Vehicles", "Vehicles In Service", "Reserved Vehicles".
 * In-service rows use inMaintenance: true. Info buttons use aria-label "Info".
 * Routes: "requests" (/requests), "maintenance" (/maintenance-info/:vin?).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import Landing from "../src/views/Landing.vue";
import Utils from "../src/config/utils.js";
import { mountWithPlugins } from "./testUtils.js";

const { getVehicles, getRequests, createVehicleRequest, createMaintenanceRequest } = vi.hoisted(() => ({
  getVehicles: vi.fn(),
  getRequests: vi.fn(),
  createVehicleRequest: vi.fn(),
  createMaintenanceRequest: vi.fn(),
}));

vi.mock("../src/services/vehicleServices.js", () => ({
  default: {
    getVehicles: (...args) => getVehicles(...args),
  },
}));

vi.mock("../src/services/requestServices.js", () => ({
  default: {
    getRequests: (...args) => getRequests(...args),
    createVehicleRequest: (...args) => createVehicleRequest(...args),
    createMaintenanceRequest: (...args) => createMaintenanceRequest(...args),
  },
}));

const availableVehicle = {
  vehicleId: "101",
  vin: "1234567123456712",
  license: "ABC344",
  license_plate_num: "ABC344",
  make: "Honda",
  model: "Accord",
  year: 2014,
  image: "/images/accord.png",
  available: true,
  inMaintenance: false,
};

const hiddenVehicle = {
  vehicleId: "202",
  vin: "9999999999999999",
  license: "HID999",
  license_plate_num: "HID999",
  make: "Ford",
  model: "F-150",
  year: 2018,
  image: "/images/f150.png",
  available: false,
  inMaintenance: false,
};

const inServiceVehicle = {
  vehicleId: "303",
  vin: "5555555555555555",
  license: "SRV303",
  license_plate_num: "SRV303",
  make: "Toyota",
  model: "Camry",
  year: 2019,
  image: "/images/camry.png",
  available: false,
  inMaintenance: true,
};

const reservedVehicle = {
  vehicleId: "404",
  vin: "4044044044044044",
  license: "MY404",
  license_plate_num: "MY404",
  make: "Chevy",
  model: "Malibu",
  year: 2021,
  image: "/images/malibu.png",
  available: false,
  inMaintenance: false,
};

const otherReservedVehicle = {
  vehicleId: "808",
  vin: "8088088088088088",
  license: "OTH808",
  license_plate_num: "OTH808",
  make: "Nissan",
  model: "Altima",
  year: 2020,
  image: "/images/altima.png",
  available: false,
  inMaintenance: false,
};

const vehicles = [
  availableVehicle,
  hiddenVehicle,
  inServiceVehicle,
  reservedVehicle,
  otherReservedVehicle,
];

const userIds = {
  admin: 1,
  maintenance: 2,
  driver: 3,
  user: 4,
};

const otherReservation = {
  requestId: 502,
  requesterId: 99,
  vehicleId: otherReservedVehicle.vehicleId,
  maintenance: false,
  currentlyActive: true,
  vehicle: otherReservedVehicle,
};

const serviceReservation = {
  requestId: 503,
  requesterId: 99,
  vehicleId: inServiceVehicle.vehicleId,
  maintenance: true,
  currentlyActive: true,
  vehicle: inServiceVehicle,
};

function myReservation(requesterId) {
  return {
    requestId: 501,
    requesterId: Number(requesterId),
    vehicleId: reservedVehicle.vehicleId,
    maintenance: false,
    currentlyActive: true,
    vehicle: reservedVehicle,
  };
}

function setUser(role) {
  const userId = userIds[role];
  Utils.setStore("user", {
    userId,
    requesterId: userId,
    username: role,
    role,
    token: `${role}-token`,
  });
  return userId;
}

function requesterIdFromCall(arg) {
  if (typeof arg === "number" || typeof arg === "string") {
    return Number(arg);
  }
  if (!arg || typeof arg !== "object") {
    return NaN;
  }
  return Number(arg.requesterId ?? arg.userId ?? arg.params?.requesterId ?? arg.params?.userId);
}

function apiCallCount() {
  return (
    getVehicles.mock.calls.length +
    getRequests.mock.calls.length +
    createVehicleRequest.mock.calls.length +
    createMaintenanceRequest.mock.calls.length
  );
}

async function flush() {
  await flushPromises();
  await nextTick();
  await flushPromises();
}

async function createLandingRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/landing", name: "landing", component: Landing },
      { path: "/requests", name: "requests", component: { template: "<div>Requests</div>" } },
      {
        path: "/maintenance-info/:vin?",
        name: "maintenance",
        component: { template: "<div>Maintenance</div>" },
        props: true,
      },
      { path: "/login", name: "login", component: { template: "<div>Login</div>" } },
    ],
  });

  await router.push({ name: "landing" });
  await router.isReady();
  return router;
}

let activeWrapper;

async function mountLanding(role) {
  activeWrapper?.unmount();
  document.body.innerHTML = "";

  const requesterId = setUser(role);
  const router = await createLandingRouter();
  const { wrapper } = await mountWithPlugins(Landing, {
    router,
    attachTo: document.body,
  });
  activeWrapper = wrapper;
  await flush();
  return { wrapper, router, requesterId };
}

const headingSelector =
  "h1, h2, h3, h4, caption, .v-card-title, .v-toolbar-title, .text-h6, .text-h5, .text-subtitle-1";

function headingByTitle(wrapper, title) {
  return wrapper.findAll(headingSelector).find((node) => node.text().replace(/\s+/g, " ").trim() === title);
}

function sectionByTitle(wrapper, title) {
  const heading = headingByTitle(wrapper, title);
  expect(heading, `heading "${title}"`).toBeTruthy();

  let element = heading.element;
  while (element && element !== wrapper.element) {
    const owner = wrapper.findAll("*").find((node) => node.element === element);
    if (owner && owner.find("tbody tr, .v-data-table__tr").exists()) {
      return owner;
    }
    element = element.parentElement;
  }

  expect.fail(`No table found for "${title}"`);
}

function rowContaining(section, text) {
  const row = section
    .findAll("tbody tr, .v-data-table__tr")
    .find((node) => node.text().includes(text));
  expect(row, `row containing "${text}"`).toBeTruthy();
  return row;
}

function expectHeaders(section, headers) {
  const text = section.text();
  for (const header of headers) {
    expect(text).toContain(header);
  }
}

function infoButton(row) {
  const button = row.findAll("button").find((node) => /info/i.test(node.attributes("aria-label") || ""));
  expect(button, 'button with aria-label "Info"').toBeTruthy();
  return button;
}

function visibleShortText(wrapper, pattern) {
  return wrapper.findAll("*").some((node) => {
    if (!node.isVisible()) {
      return false;
    }
    const text = node.text().replace(/\s+/g, " ").trim();
    return text.length > 0 && text.length <= 60 && pattern.test(text);
  });
}

function labelInput(pattern) {
  const labels = [...document.querySelectorAll("label, .v-label")];
  const label = labels.find((element) =>
    pattern.test(element.textContent.replace(/\s+/g, " ").trim())
  );
  if (!label) {
    return null;
  }
  const root = label.closest(".v-input") || label.parentElement;
  return root?.querySelector("input, textarea") ?? null;
}

function setControlValue(input, value) {
  const prototype = Object.getPrototypeOf(input);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor.set.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function fillRequired(pattern, value) {
  const input = labelInput(pattern);
  expect(input, `field matching ${pattern}`).toBeTruthy();
  setControlValue(input, value);
  return input;
}

function visibleSubmitButton() {
  return [...document.querySelectorAll("button")].find((button) => {
    const text = button.textContent.replace(/\s+/g, " ");
    const style = window.getComputedStyle(button);
    return /submit/i.test(text) && style.display !== "none" && style.visibility !== "hidden";
  });
}

function payloadOf(mock) {
  const args = mock.mock.calls.at(-1) ?? [];
  return args.find((arg) => arg && typeof arg === "object" && !Array.isArray(arg));
}

function formShowsVehicle(vehicle) {
  const formInputs = [...document.querySelectorAll("form input, .v-form input")]
    .map((input) => input.value)
    .join(" ");
  const formText = [...document.querySelectorAll("form, .v-form")].map((node) => node.textContent).join(" ");
  const blob = `${formInputs} ${formText}`;
  expect(blob).toContain(vehicle.license);
  expect(blob).toContain(vehicle.make);
  expect(blob).toContain(vehicle.model);
}

function expectVehicleColumns(section, vehicle) {
  expect(section.text()).toContain(vehicle.license);
  expect(section.text()).toContain(vehicle.make);
  expect(section.text()).toContain(vehicle.model);
  expect(section.text()).toContain(String(vehicle.year));
  expect(section.find("img").exists()).toBe(true);
}

async function fillVehicleRequestForm() {
  fillRequired(/license/i, availableVehicle.license);
  fillRequired(/make/i, availableVehicle.make);
  fillRequired(/model/i, availableVehicle.model);
  fillRequired(/driver/i, "Jane Doe");
  fillRequired(/destination/i, "State Capitol");
  fillRequired(/people/i, "5");
  fillRequired(/start date/i, "2026-10-25");
  fillRequired(/end date/i, "2026-10-28");
  const startTime = labelInput(/start time/i);
  const endTime = labelInput(/end time/i);
  if (startTime) {
    setControlValue(startTime, "09:00:00");
  }
  if (endTime) {
    setControlValue(endTime, "17:00:00");
  }
}

function routeIncludesVehicle(route, vehicle) {
  expect(route.fullPath).toMatch(new RegExp(`${vehicle.vin}|${vehicle.vehicleId}|${vehicle.license}`));
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  getVehicles.mockResolvedValue({ status: 200, data: vehicles });
  getRequests.mockImplementation(async (arg) => {
    const fromArg = requesterIdFromCall(arg);
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    const requesterId = Number.isFinite(fromArg) ? fromArg : null;
    const mine = myReservation(requesterId ?? stored.requesterId);
    const requests = requesterId === null ? [mine, otherReservation, serviceReservation] : [mine];
    return {
      status: 200,
      data: {
        message: "Reserved vehicles retrieved.",
        requests,
      },
    };
  });
});

afterEach(() => {
  activeWrapper?.unmount();
  activeWrapper = undefined;
  document.body.innerHTML = "";
  localStorage.clear();
});

describe("Feature 12 — Landing Vue", () => {
  describe("US-12.1 — View Available Vehicles", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const { wrapper } = await mountLanding(role);

        expect(getVehicles).toHaveBeenCalled();
        expect(wrapper.text()).toContain("Vehicle Management System");

        const section = sectionByTitle(wrapper, "Available Vehicles");
        expect(section.text()).toContain(availableVehicle.license);
        expect(section.text()).toContain(availableVehicle.make);
        expect(section.text()).toContain(availableVehicle.model);
        expect(section.text()).not.toContain(hiddenVehicle.license);
        expect(section.text()).not.toContain(otherReservedVehicle.license);
      }
    });

    it("User clicks a vehicle in the `Available Vehicles` list", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const { wrapper, router } = await mountLanding(role);
        const before = apiCallCount();
        const row = rowContaining(sectionByTitle(wrapper, "Available Vehicles"), availableVehicle.license);

        await row.trigger("click");
        await flush();

        expect(apiCallCount()).toBe(before);
        expect(router.currentRoute.value.name).toBe("landing");
        formShowsVehicle(availableVehicle);
      }
    });

    it("User views `Available Vehicles` list", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const { wrapper } = await mountLanding(role);
        const section = sectionByTitle(wrapper, "Available Vehicles");

        expectHeaders(section, ["License", "Make", "Model", "Year", "Image"]);
        expectVehicleColumns(section, availableVehicle);
      }
    });
  });

  describe("US-12.2 — View `Your Reserved Vehicles`", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const { wrapper, requesterId } = await mountLanding(role);

        expect(getVehicles).toHaveBeenCalled();
        expect(getRequests).toHaveBeenCalled();
        expect(
          getRequests.mock.calls.some((args) => args.some((arg) => requesterIdFromCall(arg) === requesterId))
        ).toBe(true);

        const section = sectionByTitle(wrapper, "Your Reserved Vehicles");
        expect(section.text()).toContain(reservedVehicle.license);
        expect(section.text()).toContain(reservedVehicle.make);
        expect(section.text()).toContain(reservedVehicle.model);
        expect(section.text()).not.toContain(otherReservedVehicle.license);
        expect(section.text()).not.toContain(hiddenVehicle.license);
      }
    });

    it("User clicks on a list item", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const { wrapper, router } = await mountLanding(role);
        const before = apiCallCount();
        const row = rowContaining(sectionByTitle(wrapper, "Your Reserved Vehicles"), reservedVehicle.license);

        await row.trigger("click");
        await flush();

        expect(apiCallCount()).toBe(before);
        expect(router.currentRoute.value.name).toBe("requests");
      }
    });

    it("User views `Your Reserved Vehicles` list", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const { wrapper } = await mountLanding(role);
        const section = sectionByTitle(wrapper, "Your Reserved Vehicles");

        expectHeaders(section, ["License", "Make", "Model", "Year", "Image"]);
        expectVehicleColumns(section, reservedVehicle);
      }
    });
  });

  describe("US-12.3 — View Vehicles Currently in Service", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      for (const role of ["admin", "maintenance"]) {
        const { wrapper } = await mountLanding(role);
        const section = sectionByTitle(wrapper, "Vehicles In Service");

        expect(getVehicles).toHaveBeenCalled();
        expect(section.text()).toContain(inServiceVehicle.license);
        expect(section.text()).toContain(inServiceVehicle.make);
        expect(section.text()).toContain(inServiceVehicle.model);
        expect(section.text()).not.toContain(hiddenVehicle.license);
      }

      for (const role of ["driver", "user"]) {
        const { wrapper } = await mountLanding(role);
        expect(headingByTitle(wrapper, "Vehicles In Service")).toBeFalsy();
        expect(wrapper.text()).not.toContain(inServiceVehicle.license);
      }
    });

    it("User clicks a list item", async () => {
      for (const role of ["admin", "maintenance"]) {
        const { wrapper, router } = await mountLanding(role);
        const before = apiCallCount();
        const row = rowContaining(sectionByTitle(wrapper, "Vehicles In Service"), inServiceVehicle.license);

        await row.trigger("click");
        await flush();

        expect(apiCallCount()).toBe(before);
        expect(router.currentRoute.value.name).toBe("maintenance");
        routeIncludesVehicle(router.currentRoute.value, inServiceVehicle);
      }
    });

    it("User views `Vehicles In Service` list", async () => {
      for (const role of ["admin", "maintenance"]) {
        const { wrapper } = await mountLanding(role);
        const section = sectionByTitle(wrapper, "Vehicles In Service");
        const row = rowContaining(section, inServiceVehicle.license);

        expectHeaders(section, ["License", "Make", "Model", "Year", "Image"]);
        expectVehicleColumns(section, inServiceVehicle);
        expect(infoButton(row).exists()).toBe(true);
        expect(section.text()).not.toContain(availableVehicle.license);
      }
    });

    it("User clicks `Info Icon` button", async () => {
      for (const role of ["admin", "maintenance"]) {
        const { wrapper, router } = await mountLanding(role);
        const row = rowContaining(sectionByTitle(wrapper, "Vehicles In Service"), inServiceVehicle.license);

        await infoButton(row).trigger("click");
        await flush();

        expect(router.currentRoute.value.name).toBe("maintenance");
        routeIncludesVehicle(router.currentRoute.value, inServiceVehicle);
      }
    });
  });

  describe("US-12.4 — Toggle between Vehicle Request Form and Maintenance Request", () => {
    it("User clicks the form toggle switch", async () => {
      for (const role of ["admin", "maintenance"]) {
        const { wrapper } = await mountLanding(role);
        const before = apiCallCount();
        const toggle = wrapper.find("[role='switch']");

        expect(toggle.exists()).toBe(true);
        expect(visibleShortText(wrapper, /Vehicle Request Form/)).toBe(true);

        await toggle.setValue(true);
        await flush();

        expect(apiCallCount()).toBe(before);
        expect(visibleShortText(wrapper, /Maintenance Request Form/)).toBe(true);
        expect(visibleShortText(wrapper, /Vehicle Request Form/)).toBe(false);
      }

      for (const role of ["driver", "user"]) {
        const { wrapper } = await mountLanding(role);
        expect(wrapper.find("[role='switch']").exists()).toBe(false);
        expect(visibleShortText(wrapper, /Vehicle Request Form/)).toBe(true);
        expect(visibleShortText(wrapper, /Maintenance Request Form/)).toBe(false);
      }
    });
  });

  describe("US-12.5 — View `Vehicle Request Form` component", () => {
    it("User correctly fills out the `Vehicle Request Form`", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const { requesterId } = await mountLanding(role);
        createVehicleRequest.mockResolvedValue({
          status: 201,
          data: { message: "Vehicle request created." },
        });

        await fillVehicleRequestForm();
        const before = createVehicleRequest.mock.calls.length;
        const submit = visibleSubmitButton();
        expect(submit).toBeTruthy();
        submit.click();
        await flush();

        expect(createVehicleRequest.mock.calls.length).toBe(before + 1);
        const body = payloadOf(createVehicleRequest);
        expect(body.maintenance).toBe(false);
        expect(Number(body.requesterId)).toBe(requesterId);
        expect(JSON.stringify(body)).toContain("2026-10-25");
        expect(JSON.stringify(body)).toContain("2026-10-28");
        expect(labelInput(/people/i).value).toBe("");
        expect(labelInput(/start date/i).value).toBe("");
      }
    });

    it("User incorrectly fills out the `Vehicle Request Form`", async () => {
      for (const role of ["admin", "maintenance", "driver", "user"]) {
        const { wrapper } = await mountLanding(role);
        createVehicleRequest.mockRejectedValue({
          response: {
            status: 400,
            data: { message: "destination is required" },
          },
        });

        fillRequired(/license/i, availableVehicle.license);
        fillRequired(/make/i, availableVehicle.make);
        fillRequired(/model/i, availableVehicle.model);
        fillRequired(/driver/i, "Jane Doe");
        fillRequired(/people/i, "5");
        fillRequired(/start date/i, "2026-10-25");
        fillRequired(/end date/i, "2026-10-28");

        const before = createVehicleRequest.mock.calls.length;
        const submit = visibleSubmitButton();
        expect(submit).toBeTruthy();
        submit.click();
        await flush();

        expect(createVehicleRequest.mock.calls.length).toBe(before + 1);
        expect(wrapper.text()).toContain("destination is required");
        expect(labelInput(/start date/i).value).toBe("2026-10-25");
      }
    });
  });

  describe("US-12.6 — View `Maintenance Request Form` component", () => {
    it("User correctly fills out the `Maintenance Request Form`", async () => {
      for (const role of ["admin", "maintenance"]) {
        const { requesterId } = await mountLanding(role);
        createMaintenanceRequest.mockResolvedValue({
          status: 201,
          data: { message: "Maintenance request created." },
        });

        const toggle = wrapperToggle();
        await toggle.setValue(true);
        await flush();

        fillRequired(/license/i, inServiceVehicle.license);
        fillRequired(/start date/i, "2026-10-25");
        fillRequired(/end date/i, "2026-10-28");

        const beforeVehicle = createVehicleRequest.mock.calls.length;
        const beforeMaintenance = createMaintenanceRequest.mock.calls.length;
        const submit = visibleSubmitButton();
        expect(submit).toBeTruthy();
        submit.click();
        await flush();

        expect(createMaintenanceRequest.mock.calls.length).toBe(beforeMaintenance + 1);
        expect(createVehicleRequest.mock.calls.length).toBe(beforeVehicle);
        const body = payloadOf(createMaintenanceRequest);
        expect(body.maintenance).toBe(true);
        expect(Number(body.requesterId)).toBe(requesterId);
        expect(JSON.stringify(body)).toContain("2026-10-25");
        expect(labelInput(/start date/i).value).toBe("");
      }
    });

    it("User incorrectly fills out the `Maintenance Request Form`", async () => {
      for (const role of ["admin", "maintenance"]) {
        const { wrapper } = await mountLanding(role);
        createMaintenanceRequest.mockRejectedValue({
          response: {
            status: 400,
            data: { message: "start date is required" },
          },
        });

        await wrapper.find("[role='switch']").setValue(true);
        await flush();

        fillRequired(/license/i, inServiceVehicle.license);
        fillRequired(/end date/i, "2026-10-28");

        const before = createMaintenanceRequest.mock.calls.length;
        const submit = visibleSubmitButton();
        expect(submit).toBeTruthy();
        submit.click();
        await flush();

        expect(createMaintenanceRequest.mock.calls.length).toBe(before + 1);
        expect(wrapper.text()).toContain("start date is required");
        expect(labelInput(/end date/i).value).toBe("2026-10-28");
      }
    });
  });

  describe("US-12.7 — View `Reserved Vehicles`", () => {
    it("User logs in and `Landing.vue` is loaded", async () => {
      const { wrapper } = await mountLanding("admin");
      const section = sectionByTitle(wrapper, "Reserved Vehicles");

      expect(
        getRequests.mock.calls.some((args) => !args.some((arg) => Number.isFinite(requesterIdFromCall(arg))))
      ).toBe(true);
      expect(section.text()).toContain(otherReservedVehicle.license);
      expect(section.text()).toContain(reservedVehicle.license);

      for (const role of ["maintenance", "driver", "user"]) {
        const mounted = await mountLanding(role);
        expect(headingByTitle(mounted.wrapper, "Reserved Vehicles")).toBeFalsy();
        expect(mounted.wrapper.text()).not.toContain(otherReservedVehicle.license);
      }
    });

    it("User views `Reserved Vehicles` list", async () => {
      const { wrapper } = await mountLanding("admin");
      const section = sectionByTitle(wrapper, "Reserved Vehicles");
      const row = rowContaining(section, otherReservedVehicle.license);

      expectHeaders(section, ["License", "Make", "Model", "Year", "Image"]);
      expectVehicleColumns(section, otherReservedVehicle);
      expectVehicleColumns(section, reservedVehicle);
      expect(infoButton(row).exists()).toBe(true);
    });

    it("User clicks `Info Icon` button", async () => {
      const { wrapper, router } = await mountLanding("admin");
      const row = rowContaining(sectionByTitle(wrapper, "Reserved Vehicles"), otherReservedVehicle.license);

      await infoButton(row).trigger("click");
      await flush();

      expect(router.currentRoute.value.name).toBe("requests");
      routeIncludesVehicle(router.currentRoute.value, otherReservedVehicle);
    });
  });
});

function wrapperToggle() {
  const toggle = activeWrapper.find("[role='switch']");
  expect(toggle.exists()).toBe(true);
  return toggle;
}
