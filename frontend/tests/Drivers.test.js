/**
 * Feature 7 — Driver Crud
 * Spec: features/feature-7-Driver-CRUD.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import Drivers from "../src/views/Drivers.vue";
import apiClient from "../src/services/services.js";
import Utils from "../src/config/utils.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/services.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const sampleDrivers = [
  {
    driver_id: 1,
    license_status: "active",
    license_exp_date: "05/2026",
    availability: "available",
  },
  {
    driver_id: 2,
    license_status: "suspended",
    license_exp_date: "06/2027",
    availability: "not available",
  },
  {
    driver_id: 3,
    license_status: "expired",
    license_exp_date: "01/2025",
    availability: "on call",
  },
  {
    driver_id: 4,
    license_status: "active",
    license_exp_date: "08/2028",
    availability: "available",
  },
];

function signInAdmin() {
  Utils.setStore("user", {
    userId: 1,
    username: "admin",
    role: "admin",
    token: "admin-token",
  });
}

function pageText() {
  return document.body.textContent.replace(/\s+/g, " ");
}

function buttonByText(text) {
  return [...document.querySelectorAll("button")].find((button) =>
    button.textContent.replace(/\s+/g, " ").includes(text)
  );
}

function inputByLabel(pattern) {
  const labels = [...document.querySelectorAll(".v-label, label")];
  const label = labels.find((element) => pattern.test(element.textContent.trim()));
  const field = label?.closest(".v-input");
  return field?.querySelector("input, textarea") ?? null;
}

function setControlValue(input, value) {
  const prototype = Object.getPrototypeOf(input);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor.set.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function clickButton(text) {
  const button = buttonByText(text);
  expect(button).toBeTruthy();
  button.click();
  await flushPromises();
}

function rowForDriver(driverId) {
  const rows = [...document.querySelectorAll("tr, .v-list-item")];
  return rows.find((row) => new RegExp(`\\b${driverId}\\b`).test(row.textContent));
}

async function mountDrivers() {
  signInAdmin();

  const memoryRouter = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/login", name: "login", component: { template: "<div>Login</div>" } },
      { path: "/drivers", name: "drivers", component: Drivers },
    ],
  });

  await memoryRouter.push({ name: "drivers" });
  await memoryRouter.isReady();

  const mounted = await mountWithPlugins(Drivers, {
    router: memoryRouter,
    attachTo: document.body,
  });

  await flushPromises();
  return mounted;
}

describe("Feature 7 — Driver Crud", () => {
  let wrapper;

  beforeEach(() => {
    localStorage.clear();
    apiClient.get.mockReset();
    apiClient.post.mockReset();
    apiClient.put.mockReset();
    apiClient.delete.mockReset();
    apiClient.get.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    document.body.innerHTML = "";
    localStorage.clear();
  });

  describe("US-7.1 — Create drivers", () => {
    it("Admin creates a new driver", async () => {
      const created = {
        driver_id: 1,
        license_status: "active",
        license_exp_date: "05/2026",
        availability: "available",
      };

      apiClient.post.mockImplementation(async (_url, body) => {
        const driver = { ...created, ...body, driver_id: body.driver_id ?? created.driver_id };
        apiClient.get.mockResolvedValue({ data: [driver] });
        return { status: 201, data: driver };
      });

      ({ wrapper } = await mountDrivers());

      await clickButton("+ New driver");
      expect(buttonByText("+ New driver").classList.contains("oc-cta")).toBe(true);

      const name = inputByLabel(/name/i);
      const licenseStatus = inputByLabel(/license status/i);
      const expiration = inputByLabel(/expiration/i);
      const availability = inputByLabel(/availability/i);

      expect(name).toBeTruthy();
      expect(licenseStatus).toBeTruthy();
      expect(expiration).toBeTruthy();
      expect(availability).toBeTruthy();

      setControlValue(name, "Pat Driver");
      setControlValue(licenseStatus, "active");
      setControlValue(expiration, "05/2026");
      setControlValue(availability, "available");
      await flushPromises();

      const createButton = buttonByText("Create");
      expect(createButton.classList.contains("oc-cta")).toBe(true);
      createButton.click();
      await flushPromises();

      expect(apiClient.post).toHaveBeenCalled();
      const [url, body] = apiClient.post.mock.calls[0];
      expect(String(url)).toContain("vehicle-t3");
      expect(body).toMatchObject({
        license_status: "active",
        license_exp_date: "05/2026",
        availability: "available",
      });
      expect(pageText()).toContain("active");
      expect(pageText()).toContain("05/2026");
      expect(pageText()).toContain("available");
      expect(buttonByText("Create")).toBeUndefined();
    });

    it("Admin creates a driver with an empty name", async () => {
      ({ wrapper } = await mountDrivers());

      await clickButton("+ New driver");

      const name = inputByLabel(/name/i);
      expect(name).toBeTruthy();
      setControlValue(name, "   ");
      await flushPromises();

      await clickButton("Create");

      expect(pageText()).toContain("Driver name is required.");
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("Admin creates a driver with an empty license status", async () => {
      ({ wrapper } = await mountDrivers());

      await clickButton("+ New driver");
      setControlValue(inputByLabel(/name/i), "Pat Driver");
      setControlValue(inputByLabel(/expiration/i), "05/2026");
      setControlValue(inputByLabel(/availability/i), "available");
      await flushPromises();

      await clickButton("Create");

      expect(pageText()).toContain("license status is required.");
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("Admin creates a driver without license expiration date", async () => {
      ({ wrapper } = await mountDrivers());

      await clickButton("+ New driver");
      setControlValue(inputByLabel(/name/i), "Pat Driver");
      setControlValue(inputByLabel(/license status/i), "active");
      setControlValue(inputByLabel(/availability/i), "available");
      await flushPromises();

      await clickButton("Create");

      expect(pageText()).toContain("license expiration date is required.");
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("Admin creates a driver without availability", async () => {
      ({ wrapper } = await mountDrivers());

      await clickButton("+ New driver");
      setControlValue(inputByLabel(/name/i), "Pat Driver");
      setControlValue(inputByLabel(/license status/i), "active");
      setControlValue(inputByLabel(/expiration/i), "05/2026");
      await flushPromises();

      await clickButton("Create");

      expect(pageText()).toContain("availability is required.");
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("Admin creates a driver with an id that is improperly formatted", async () => {
      ({ wrapper } = await mountDrivers());

      await clickButton("+ New driver");
      setControlValue(inputByLabel(/name/i), "Pat Driver");
      setControlValue(inputByLabel(/driver\s*_?id/i), "abc");
      setControlValue(inputByLabel(/license status/i), "active");
      setControlValue(inputByLabel(/expiration/i), "05/2026");
      setControlValue(inputByLabel(/availability/i), "available");
      await flushPromises();

      await clickButton("Create");

      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe("US-7.2 — View all drivers", () => {
    it("No drivers exist", async () => {
      ({ wrapper } = await mountDrivers());

      expect(pageText()).toContain("No drivers yet. Create a driver.");
    });
  });

  describe("US-7.3 — Manage driver rows", () => {
    it("driver rows show edit and delete actions", async () => {
      apiClient.get.mockResolvedValue({ data: [sampleDrivers[0]] });

      ({ wrapper } = await mountDrivers());

      const row = rowForDriver(1);
      expect(row).toBeTruthy();
      expect(row.querySelector('[aria-label="Edit driver"]')).toBeTruthy();
      expect(row.querySelector('[aria-label="Delete driver"]')).toBeTruthy();
    });
  });

  describe("US-7.4 — Edit and delete drivers", () => {
    it("Admin edits a driver", async () => {
      const suspended = {
        driver_id: 1,
        license_status: "suspended",
        license_exp_date: "05/2026",
        availability: "available",
      };

      apiClient.get.mockResolvedValue({ data: [suspended] });
      apiClient.put.mockImplementation(async (_url, body) => {
        const updated = { ...suspended, ...body, license_status: "active" };
        apiClient.get.mockResolvedValue({ data: [updated] });
        return { status: 200, data: updated };
      });

      ({ wrapper } = await mountDrivers());

      const row = rowForDriver(1);
      row.querySelector('[aria-label="Edit driver"]').click();
      await flushPromises();

      const licenseStatus = inputByLabel(/license status/i);
      expect(licenseStatus.value).toBe("suspended");
      setControlValue(licenseStatus, "active");
      await flushPromises();

      await clickButton("Save");

      expect(apiClient.put).toHaveBeenCalled();
      const [url, body] = apiClient.put.mock.calls[0];
      expect(String(url)).toContain("vehicle-t3/1");
      expect(body.license_status).toBe("active");
      expect(pageText()).toContain("active");
      expect(rowForDriver(1).textContent).not.toContain("suspended");
    });

    it("Admin deletes a driver", async () => {
      apiClient.get.mockResolvedValue({ data: [sampleDrivers[0]] });
      apiClient.delete.mockImplementation(async () => {
        apiClient.get.mockResolvedValue({ data: [] });
        return { status: 204, data: "" };
      });

      ({ wrapper } = await mountDrivers());

      rowForDriver(1).querySelector('[aria-label="Delete driver"]').click();
      await flushPromises();

      const overlay = document.querySelector(".v-overlay--active");
      const confirm = [...overlay.querySelectorAll("button")].find(
        (button) => !/cancel/i.test(button.textContent)
      );
      expect(confirm).toBeTruthy();
      confirm.click();
      await flushPromises();

      expect(apiClient.delete).toHaveBeenCalled();
      expect(String(apiClient.delete.mock.calls[0][0])).toContain("vehicle-t3/1");
      expect(rowForDriver(1)).toBeUndefined();
    });
  });

  describe("US-7.5 — Search drivers", () => {
    it("Search bar appears with drivers", async () => {
      apiClient.get.mockResolvedValue({ data: [sampleDrivers[0]] });

      ({ wrapper } = await mountDrivers());

      const findInput = inputByLabel(/^Find$/);
      const row = rowForDriver(1);
      expect(findInput).toBeTruthy();
      expect(row).toBeTruthy();
      expect(
        findInput.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it("search bar appears with no drivers", async () => {
      apiClient.get.mockResolvedValue({
        data: [
          {
            driver_id: 1,
            license_status: "active",
            license_exp_date: "08/2030",
            availability: "available",
          },
        ],
      });

      ({ wrapper } = await mountDrivers());

      const findInput = inputByLabel(/^Find$/);
      expect(findInput).toBeTruthy();
      expect(rowForDriver(1)).toBeTruthy();

      setControlValue(findInput, "2");
      await flushPromises();

      expect(rowForDriver(1)).toBeUndefined();
    });

    it("Admin types in driver search bar", async () => {
      apiClient.get.mockResolvedValue({ data: sampleDrivers });

      ({ wrapper } = await mountDrivers());

      setControlValue(inputByLabel(/^Find$/), "active");
      await flushPromises();

      expect(rowForDriver(1)).toBeTruthy();
      expect(rowForDriver(4)).toBeTruthy();
      expect(rowForDriver(2)).toBeUndefined();
      expect(rowForDriver(3)).toBeUndefined();
    });

    it("Admin types in driver search bar 2", async () => {
      apiClient.get.mockResolvedValue({ data: sampleDrivers });

      ({ wrapper } = await mountDrivers());

      setControlValue(inputByLabel(/^Find$/), "suspended");
      await flushPromises();

      expect(rowForDriver(2)).toBeTruthy();
      expect(rowForDriver(1)).toBeUndefined();
      expect(rowForDriver(3)).toBeUndefined();
      expect(rowForDriver(4)).toBeUndefined();
    });

    it("Unauthenticated user accesses the drivers view", async () => {
      localStorage.clear();

      await router.push({ name: "drivers" }).catch(() => {});
      await router.isReady();
      await flushPromises();

      expect(router.currentRoute.value.name).toBe("login");
    });
  });
});
