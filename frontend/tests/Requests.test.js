/**
 * Feature 8 — Request Management
 * Spec: features/feature-8-Requests-Crud.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import Requests from "../src/views/Requests.vue";
import apiClient from "../src/services/services.js";
import Utils from "../src/config/utils.js";
import appRouter from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/services.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const vehicle = { vehicleId: 12, license: "ABC-1234", make: "Ford", model: "Transit" };
const driver = { driverId: 3, name: "Jane Doe" };
const destination = { destId: 7, name: "State Capitol" };

const tripRequest = {
  requestId: 41,
  requestType: "trip",
  requesterId: 2,
  vehicle,
  driver,
  destination,
  startDate: "2026-11-10",
  startTime: "09:00",
  endDate: "2026-11-10",
  endTime: "17:00",
  numPeople: 6,
  currentlyActive: true,
};

const maintenanceRequest = {
  requestId: 42,
  requestType: "maintenance",
  requesterId: 1,
  vehicle,
  driver: null,
  destination: null,
  driverId: null,
  destId: null,
  startDate: "2026-11-15",
  startTime: "08:00",
  endDate: null,
  endTime: null,
  numPeople: null,
  currentlyActive: true,
};

let requests = [];

function signIn(role = "worker") {
  Utils.setStore("user", {
    userId: role === "admin" ? 1 : 2,
    username: role,
    role,
    token: `${role}-token`,
  });
}

function pageText() {
  return document.body.textContent.replace(/\s+/g, " ");
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

function buttonByText(text) {
  return [...document.querySelectorAll("button")].find((button) =>
    button.textContent.replace(/\s+/g, " ").includes(text)
  );
}

async function clickButton(text) {
  const button = buttonByText(text);
  expect(button).toBeTruthy();
  button.click();
  await flushPromises();
}

async function clickExact(text) {
  const node = [...document.querySelectorAll("button, .v-list-item, .v-selection-control, label")].find((element) => {
    const value = element.textContent.replace(/\s+/g, " ").trim();
    return value === text;
  });
  expect(node).toBeTruthy();
  node.click();
  await flushPromises();
}

async function chooseOption(labelPattern, optionPattern) {
  const input = inputByLabel(labelPattern);
  expect(input).toBeTruthy();
  input.closest(".v-input")?.click();
  input.click();
  await flushPromises();

  const option = [...document.querySelectorAll(".v-list-item, [role='option']")].find((element) =>
    optionPattern.test(element.textContent)
  );
  expect(option).toBeTruthy();
  option.click();
  await flushPromises();
}

function rowForRequest(requestId) {
  const rows = [...document.querySelectorAll("tr, .v-list-item")];
  return rows.find((row) => new RegExp(`\\b${requestId}\\b`).test(row.textContent));
}

function installGetMock() {
  apiClient.get.mockImplementation(async (url) => {
    const path = String(url);
    if (path.includes("vehicle")) {
      return { data: [vehicle] };
    }
    if (path.includes("driver")) {
      return { data: [driver] };
    }
    if (path.includes("destination")) {
      return { data: [destination] };
    }
    return { data: requests };
  });
}

async function mountRequests(role = "worker") {
  signIn(role);

  const memoryRouter = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/login", name: "login", component: { template: "<div>Login</div>" } },
      { path: "/requests", name: "requests", component: Requests },
    ],
  });

  await memoryRouter.push({ name: "requests" });
  await memoryRouter.isReady();

  const mounted = await mountWithPlugins(Requests, {
    router: memoryRouter,
    attachTo: document.body,
  });

  await flushPromises();
  return mounted;
}

async function openTripForm() {
  await clickButton("+ New request");
  await clickExact("Trip");
}

describe("Feature 8 — Request Management", () => {
  let wrapper;

  beforeEach(() => {
    localStorage.clear();
    requests = [];
    apiClient.get.mockReset();
    apiClient.post.mockReset();
    apiClient.put.mockReset();
    apiClient.delete.mockReset();
    installGetMock();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    document.body.innerHTML = "";
    localStorage.clear();
  });

  describe("US-8.1 — Create a normal request", () => {
    it("User creates a trip request", async () => {
      apiClient.post.mockImplementation(async (_url, body) => {
        const created = {
          ...tripRequest,
          ...body,
          requestId: 41,
          requestType: "trip",
          vehicle,
          driver,
          destination,
          numPeople: Number(body.numPeople),
        };
        requests = [created];
        return { status: 201, data: created };
      });

      ({ wrapper } = await mountRequests());
      await openTripForm();

      expect(buttonByText("+ New request").classList.contains("oc-cta")).toBe(true);
      await chooseOption(/vehicle/i, /ABC-1234/);
      await chooseOption(/driver/i, /Jane Doe/);
      await chooseOption(/destination/i, /State Capitol/);
      setControlValue(inputByLabel(/start date/i), "2026-11-10");
      setControlValue(inputByLabel(/start time/i), "09:00");
      setControlValue(inputByLabel(/end date/i), "2026-11-10");
      setControlValue(inputByLabel(/end time/i), "17:00");
      setControlValue(inputByLabel(/people/i), "6");
      await flushPromises();

      const createButton = buttonByText("Create");
      expect(createButton.classList.contains("oc-cta")).toBe(true);
      createButton.click();
      await flushPromises();

      expect(apiClient.post).toHaveBeenCalled();
      const [url, body] = apiClient.post.mock.calls[0];
      expect(String(url)).toContain("requests");
      expect(body).toMatchObject({
        requestType: "trip",
        vehicleId: 12,
        driverId: 3,
        destId: 7,
        startDate: "2026-11-10",
        startTime: "09:00",
        endDate: "2026-11-10",
        endTime: "17:00",
      });
      expect(Number(body.numPeople)).toBe(6);
      expect(pageText()).toContain("trip");
      expect(pageText()).toContain("ABC-1234");
      expect(buttonByText("Create")).toBeUndefined();
    });

    it("Trip form shows vehicle details", async () => {
      ({ wrapper } = await mountRequests());
      await openTripForm();
      await chooseOption(/vehicle/i, /ABC-1234/);

      expect(pageText()).toContain("ABC-1234");
      expect(pageText()).toContain("Ford");
      expect(pageText()).toContain("Transit");
    });

    it("User creates a trip request with a missing required field", async () => {
      ({ wrapper } = await mountRequests());
      await openTripForm();
      await clickButton("Create");

      expect(pageText()).toMatch(/is required\./);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("User creates a trip request with an end before the start", async () => {
      apiClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: "end must be after start." },
        },
      });

      ({ wrapper } = await mountRequests());
      await openTripForm();
      await chooseOption(/vehicle/i, /ABC-1234/);
      await chooseOption(/driver/i, /Jane Doe/);
      await chooseOption(/destination/i, /State Capitol/);
      setControlValue(inputByLabel(/start date/i), "2026-11-10");
      setControlValue(inputByLabel(/start time/i), "09:00");
      setControlValue(inputByLabel(/end date/i), "2026-11-09");
      setControlValue(inputByLabel(/end time/i), "08:00");
      setControlValue(inputByLabel(/people/i), "6");
      await flushPromises();
      await clickButton("Create");

      expect(apiClient.post).toHaveBeenCalled();
      expect(document.querySelector(".v-alert")).toBeTruthy();
      expect(pageText()).toContain("end must be after start.");
    });
  });

  describe("US-8.2 — Create a maintenance request", () => {
    it("Admin creates a maintenance request", async () => {
      apiClient.post.mockImplementation(async (_url, body) => {
        const created = {
          ...maintenanceRequest,
          ...body,
          requestId: 42,
          requestType: "maintenance",
          vehicle,
          driver: null,
          destination: null,
          driverId: null,
          destId: null,
          numPeople: null,
        };
        requests = [created];
        return { status: 201, data: created };
      });

      ({ wrapper } = await mountRequests("admin"));
      await clickButton("+ New request");
      await clickExact("Maintenance");
      await chooseOption(/vehicle/i, /ABC-1234/);
      setControlValue(inputByLabel(/start date/i), "2026-11-15");
      await flushPromises();
      await clickButton("Create");

      expect(apiClient.post).toHaveBeenCalled();
      const body = apiClient.post.mock.calls[0][1];
      expect(body.requestType).toBe("maintenance");
      expect(body.vehicleId).toBe(12);
      expect(body.driverId ?? null).toBeNull();
      expect(body.destId ?? null).toBeNull();
      expect(body.numPeople ?? null).toBeNull();
      expect(pageText()).toContain("maintenance");
    });

    it("Maintenance form hides trip-only fields", async () => {
      ({ wrapper } = await mountRequests("admin"));
      await clickButton("+ New request");
      await clickExact("Maintenance");

      expect(inputByLabel(/vehicle/i)).toBeTruthy();
      expect(inputByLabel(/start date/i)).toBeTruthy();
      expect(inputByLabel(/driver/i)).toBeNull();
      expect(inputByLabel(/destination/i)).toBeNull();
      expect(inputByLabel(/people/i)).toBeNull();
    });

    it("Maintenance request without a start date", async () => {
      ({ wrapper } = await mountRequests("admin"));
      await clickButton("+ New request");
      await clickExact("Maintenance");
      await chooseOption(/vehicle/i, /ABC-1234/);
      await clickButton("Create");

      expect(pageText()).toContain("start date is required.");
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe("US-8.3 — View requests", () => {
    it("Requests view loads with existing requests", async () => {
      const second = {
        ...tripRequest,
        requestId: 44,
        startDate: "2026-11-12",
        endDate: "2026-11-12",
      };
      requests = [tripRequest, second];

      ({ wrapper } = await mountRequests());

      for (const row of [rowForRequest(41), rowForRequest(44)]) {
        expect(row).toBeTruthy();
        expect(row.textContent).toContain("trip");
        expect(row.textContent).toContain("ABC-1234");
        expect(row.textContent).toMatch(/2026-11-1[02]/);
        expect(row.querySelector('[aria-label="Edit request"]')).toBeTruthy();
        expect(row.querySelector('[aria-label="Delete request"]')).toBeTruthy();
      }
    });

    it("No requests exist", async () => {
      ({ wrapper } = await mountRequests());

      expect(pageText()).toContain("No requests yet. Create a request.");
    });
  });

  describe("US-8.4 — Manage request rows", () => {
    it("Request rows show edit and delete actions", async () => {
      requests = [tripRequest];

      ({ wrapper } = await mountRequests());

      const row = rowForRequest(41);
      expect(row).toBeTruthy();
      expect(row.querySelector('[aria-label="Edit request"]')).toBeTruthy();
      expect(row.querySelector('[aria-label="Delete request"]')).toBeTruthy();
    });
  });

  describe("US-8.5 — Edit and delete requests", () => {
    it("User edits a request", async () => {
      requests = [tripRequest];
      apiClient.put.mockImplementation(async (_url, body) => {
        const updated = { ...tripRequest, ...body, numPeople: 4 };
        requests = [updated];
        return { status: 200, data: updated };
      });

      ({ wrapper } = await mountRequests());
      rowForRequest(41).querySelector('[aria-label="Edit request"]').click();
      await flushPromises();

      setControlValue(inputByLabel(/people/i), "4");
      await flushPromises();
      await clickButton("Save");

      expect(apiClient.put).toHaveBeenCalled();
      const [url, body] = apiClient.put.mock.calls[0];
      expect(String(url)).toContain("requests/41");
      expect(Number(body.numPeople)).toBe(4);
      expect(rowForRequest(41).textContent).toContain("4");
    });

    it("User deletes a request", async () => {
      requests = [tripRequest];
      apiClient.delete.mockImplementation(async () => {
        requests = [];
        return { status: 204, data: "" };
      });

      ({ wrapper } = await mountRequests());
      rowForRequest(41).querySelector('[aria-label="Delete request"]').click();
      await flushPromises();

      const overlay = document.querySelector(".v-overlay--active");
      const confirm = [...overlay.querySelectorAll("button")].find(
        (button) => !/cancel/i.test(button.textContent)
      );
      expect(confirm).toBeTruthy();
      confirm.click();
      await flushPromises();

      expect(apiClient.delete).toHaveBeenCalled();
      expect(String(apiClient.delete.mock.calls[0][0])).toContain("requests/41");
      expect(rowForRequest(41)).toBeUndefined();
    });
  });

  describe("US-8.6 — Filter requests", () => {
    it("Active-only filter", async () => {
      requests = [
        tripRequest,
        { ...tripRequest, requestId: 50, currentlyActive: false },
      ];

      ({ wrapper } = await mountRequests());

      expect(rowForRequest(41)).toBeTruthy();
      expect(rowForRequest(50)).toBeTruthy();

      const activeOnly = [...document.querySelectorAll("label, .v-label, .v-selection-control")].find((element) =>
        /Active only/i.test(element.textContent)
      );
      expect(activeOnly).toBeTruthy();
      activeOnly.click();
      await flushPromises();

      expect(rowForRequest(41)).toBeTruthy();
      expect(rowForRequest(50)).toBeUndefined();
    });

    it("Request type filter", async () => {
      requests = [tripRequest, maintenanceRequest];

      ({ wrapper } = await mountRequests("admin"));

      await chooseOption(/type/i, /^Maintenance$/);

      expect(rowForRequest(42)).toBeTruthy();
      expect(rowForRequest(41)).toBeUndefined();
    });
  });

  describe("Authentication", () => {
    it("Unauthenticated user accesses the requests view", async () => {
      localStorage.clear();

      await appRouter.push({ name: "requests" }).catch(() => {});
      await appRouter.isReady();
      await flushPromises();

      expect(appRouter.currentRoute.value.name).toBe("login");
    });
  });
});
