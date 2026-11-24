/**
 * Feature 6 — Destination CRUD
 * Spec: features/feature-6-destination-crud.md
 */
import { defineComponent } from "vue";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import DestinationList from "../src/views/DestinationList.vue";
import Home from "../src/views/Home.vue";
import apiClient from "../src/services/services.js";
import Utils from "../src/config/utils.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/services.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const CREATED_MESSAGE = "New destination created with id=4";
const UPDATED_MESSAGE = "Destination updated with id=1";
const DELETED_MESSAGE = "Successfully deleted Destination!";

const intersectionObservers = [];
let activeWrapper;

function destination(id, overrides = {}) {
  return {
    id,
    zip: "68102",
    city: "Omaha",
    state: "Nebraska",
    addr_line_1: `${id} Main Street`,
    addr_line_2: id % 2 === 0 ? null : "P.O. Box 351",
    dest_name: `Destination ${id}`,
    last_visited: "2026-10-25",
    ...overrides,
  };
}

function signIn(role) {
  Utils.setStore("user", {
    userId: 1,
    role,
    token: `${role}-token`,
    email: `${role}@example.com`,
  });
}

function pageText() {
  return document.body.innerText;
}

function findField(wrapper, label) {
  const fields = [
    ...wrapper.findAllComponents({ name: "VTextField" }),
    ...wrapper.findAllComponents({ name: "VSelect" }),
  ];

  return fields.find((candidate) => candidate.props("label") === label);
}

async function fill(wrapper, label, value) {
  const field = findField(wrapper, label);

  if (!field) {
    throw new Error(`No field labeled ${label}`);
  }

  await field.find("input").setValue(value);
}

function buttonByText(text) {
  const button = [...document.querySelectorAll("button")].find((candidate) => candidate.textContent.trim() === text);

  if (!button) {
    throw new Error(`No button labeled ${text}`);
  }

  return button;
}

async function mountDestinations(role = "admin") {
  signIn(role);

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "home", component: Home },
      { path: "/destinations", name: "destinations", component: DestinationList },
    ],
  });

  const Shell = defineComponent({ template: "<router-view />" });
  const { wrapper } = await mountWithPlugins(Shell, {
    router,
    attachTo: document.body,
  });

  activeWrapper = wrapper;
  await router.push("/destinations");
  await router.isReady();
  await flushPromises();

  return { wrapper, router };
}

async function scrollDown() {
  document.documentElement.scrollTop = 1200;
  document.documentElement.dispatchEvent(new Event("scroll", { bubbles: true }));
  window.dispatchEvent(new Event("scroll"));

  for (const observer of intersectionObservers) {
    observer.callback([{ isIntersecting: true, target: document.documentElement }], observer);
  }

  await flushPromises();
}

beforeEach(() => {
  localStorage.clear();
  intersectionObservers.length = 0;
  vi.stubGlobal(
    "IntersectionObserver",
    class IntersectionObserverMock {
      constructor(callback) {
        this.callback = callback;
        intersectionObservers.push(this);
      }

      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );

  apiClient.get.mockReset();
  apiClient.post.mockReset();
  apiClient.put.mockReset();
  apiClient.delete.mockReset();
  apiClient.get.mockResolvedValue({ status: 200, data: [] });
  apiClient.post.mockResolvedValue({ status: 201, data: { message: CREATED_MESSAGE } });
  apiClient.put.mockResolvedValue({ status: 201, data: { message: UPDATED_MESSAGE } });
  apiClient.delete.mockResolvedValue({ status: 204, data: "" });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  activeWrapper?.unmount();
  activeWrapper = undefined;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("Feature 6 — Destination CRUD", () => {
  describe("US-6.1: View Current Destinations", () => {
    it("Admin views DestinationList", async () => {
      const row = destination(1, { dest_name: "City Library", addr_line_2: "Suite 2" });
      apiClient.get.mockResolvedValue({ status: 200, data: [row] });

      const { router } = await mountDestinations("admin");

      expect(router.currentRoute.value.name).toBe("destinations");
      expect(pageText()).toContain("Manage Destinations");
      expect(pageText()).toContain("+ New Destination");
      expect(buttonByText("+ New Destination").classList.contains("oc-cta")).toBe(true);

      for (const column of ["Name", "Street Address", "Address Line 2", "City", "State", "Zip Code", "Visited"]) {
        expect(pageText()).toContain(column);
      }

      expect(pageText()).toContain("City Library");
      expect(pageText()).toContain("1 Main Street");
      expect(pageText()).toContain("Suite 2");
      expect(pageText()).toContain("Omaha");
      expect(pageText()).toContain("Nebraska");
      expect(pageText()).toContain("68102");
      expect(pageText()).toContain("2026-10-25");
    });

    it("Other role views DestinationList", async () => {
      const { router } = await mountDestinations("driver");

      expect(router.currentRoute.value.name).toBe("home");
      expect(pageText()).not.toContain("Manage Destinations");
    });
  });

  describe("US-6.2: Destination Details", () => {
    it("No entries exist in Destinations table", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [] });
      await mountDestinations();

      expect(pageText()).toContain("No destinations yet. Add a destination to view its details.");
    });

    it("Less than 5 entries exist in Destinations table", async () => {
      const rows = [
        destination(1, { dest_name: "Library", addr_line_2: "P.O. Box 351" }),
        destination(2, { dest_name: "Museum", addr_line_2: null, zip: "68104" }),
        destination(3, { dest_name: "Campus", addr_line_1: "3 College Ave", city: "Lincoln" }),
      ];
      apiClient.get.mockResolvedValue({ status: 200, data: rows });
      await mountDestinations();

      expect(pageText()).toContain("Library");
      expect(pageText()).toContain("P.O. Box 351");
      expect(pageText()).toContain("Museum");
      expect(pageText()).toContain("68104");
      expect(pageText()).not.toContain("null");
      expect(pageText()).toContain("Campus");
      expect(pageText()).toContain("3 College Ave");
      expect(pageText()).toContain("Lincoln");
      expect(pageText()).toContain("2026-10-25");
    });

    it("More than 5 entries exist in Destinations table", async () => {
      const rows = Array.from({ length: 7 }, (_, index) => destination(index + 1));
      let calls = 0;
      apiClient.get.mockImplementation(() => {
        const data = calls === 0 ? rows.slice(0, 5) : rows.slice(5);
        calls += 1;
        return Promise.resolve({ status: 200, data });
      });

      await mountDestinations();

      for (const id of [1, 2, 3, 4, 5]) {
        expect(pageText()).toContain(`Destination ${id}`);
      }
      expect(pageText()).not.toContain("Destination 6");
      expect(pageText()).not.toContain("Destination 7");

      await scrollDown();

      expect(pageText()).toContain("Destination 6");
      expect(pageText()).toContain("Destination 7");
    });

    it("Back to Top button hidden when at top of page", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [destination(1)] });
      document.documentElement.scrollTop = 0;
      await mountDestinations();

      expect(pageText()).not.toContain("Top ↑");
    });

    it("Back to Top button shown when scrolling down", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [destination(1)] });
      await mountDestinations();

      await scrollDown();

      expect(pageText()).toContain("Top ↑");
    });

    it("Press Back to Top button", async () => {
      const rows = [destination(1), destination(2), destination(3)];
      apiClient.get.mockResolvedValue({ status: 200, data: rows });
      await mountDestinations();
      await scrollDown();

      const before = ["Destination 1", "Destination 2", "Destination 3"].map((name) => pageText().includes(name));
      buttonByText("Top ↑").click();
      await flushPromises();

      expect(window.scrollTo).toHaveBeenCalled();
      const after = ["Destination 1", "Destination 2", "Destination 3"].map((name) => pageText().includes(name));
      expect(after).toEqual(before);
      expect(after).toEqual([true, true, true]);
    });
  });

  describe("US-6.3: Add Destination", () => {
    it("Press New Destination", async () => {
      await mountDestinations();

      buttonByText("+ New Destination").click();
      await flushPromises();

      expect(pageText()).toContain("Add Destination");
      expect(activeWrapper.findComponent({ name: "DestinationForm" }).exists()).toBe(true);
    });

    it("Send add request with valid form data", async () => {
      vi.useFakeTimers();
      apiClient.get
        .mockResolvedValueOnce({ status: 200, data: [] })
        .mockResolvedValue({ status: 200, data: [destination(4, { dest_name: "City Library" })] });

      const { router } = await mountDestinations();
      buttonByText("+ New Destination").click();
      await flushPromises();

      await fill(activeWrapper, "Name", "City Library");
      await fill(activeWrapper, "Street Address", "1 Main Street");
      await fill(activeWrapper, "City", "Omaha");
      await fill(activeWrapper, "State", "Nebraska");
      await fill(activeWrapper, "Zip Code", "68102");

      const getsBeforeSubmit = apiClient.get.mock.calls.length;
      buttonByText("Add").click();
      await flushPromises();

      expect(apiClient.post).toHaveBeenCalled();
      const [, body] = apiClient.post.mock.calls[0];
      expect(body).toEqual(
        expect.objectContaining({
          dest_name: "City Library",
          addr_line_1: "1 Main Street",
          city: "Omaha",
          state: "Nebraska",
          zip: "68102",
        }),
      );
      expect(pageText()).toContain(CREATED_MESSAGE);
      expect(apiClient.get.mock.calls.length).toBeGreaterThan(getsBeforeSubmit);
      expect(pageText()).toContain("City Library");
      expect(router.currentRoute.value.name).toBe("destinations");

      await vi.advanceTimersByTimeAsync(3000);
      expect(pageText()).not.toContain(CREATED_MESSAGE);
    });
  });

  describe("US-6.4: Remove Destination", () => {
    it("Press Delete icon", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [destination(1)] });
      await mountDestinations();

      document.querySelector('[aria-label="Delete"]').click();
      await flushPromises();

      expect(pageText()).toContain("Delete Destination");
    });

    it("Press outside Delete confirmation dialog", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [destination(1, { dest_name: "City Library" })] });
      await mountDestinations();
      document.querySelector('[aria-label="Delete"]').click();
      await flushPromises();

      document.querySelector(".v-overlay__scrim").dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      expect(pageText()).not.toContain("Delete Destination");
      expect(apiClient.delete).not.toHaveBeenCalled();
      expect(pageText()).toContain("City Library");
    });

    it("Press Cancel inside Delete confirmation dialog", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [destination(1, { dest_name: "City Library" })] });
      await mountDestinations();
      document.querySelector('[aria-label="Delete"]').click();
      await flushPromises();

      buttonByText("Cancel").click();
      await flushPromises();

      expect(pageText()).not.toContain("Delete Destination");
      expect(apiClient.delete).not.toHaveBeenCalled();
      expect(pageText()).toContain("City Library");
    });

    it("Press Delete inside Delete confirmation dialog", async () => {
      vi.useFakeTimers();
      const library = destination(1, { dest_name: "City Library" });
      const museum = destination(2, { dest_name: "City Museum" });
      apiClient.get
        .mockResolvedValueOnce({ status: 200, data: [library, museum] })
        .mockResolvedValue({ status: 200, data: [museum] });

      const { router } = await mountDestinations();
      document.querySelector('[aria-label="Delete"]').click();
      await flushPromises();

      const getsBeforeDelete = apiClient.get.mock.calls.length;
      buttonByText("Delete").click();
      await flushPromises();

      expect(apiClient.delete).toHaveBeenCalled();
      expect(String(apiClient.delete.mock.calls[0][0])).toContain("1");
      expect(pageText()).not.toContain("Delete Destination");
      expect(pageText()).not.toContain("City Library");
      expect(pageText()).toContain(DELETED_MESSAGE);
      expect(apiClient.get.mock.calls.length).toBeGreaterThan(getsBeforeDelete);
      expect(pageText()).toContain("City Museum");
      expect(router.currentRoute.value.name).toBe("destinations");

      await vi.advanceTimersByTimeAsync(3000);
      expect(pageText()).not.toContain(DELETED_MESSAGE);
    });
  });

  describe("US-6.5: Destinations Search Bar", () => {
    it("No rendering Search Bar when no destinations exist", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [] });
      await mountDestinations();

      expect(findField(activeWrapper, "Search")).toBeUndefined();
      expect(activeWrapper.findComponent({ name: "VSelect" }).exists()).toBe(false);
    });

    it("Search Bar rendering when destinations exist", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [destination(1)] });
      await mountDestinations();

      expect(findField(activeWrapper, "Search")).toBeTruthy();
      expect(activeWrapper.findComponent({ name: "VSelect" }).exists()).toBe(true);
    });

    it("No search attribute selected", async () => {
      apiClient.get.mockResolvedValue({
        status: 200,
        data: [
          destination(1, { dest_name: "Library", city: "Omaha" }),
          destination(2, { dest_name: "Museum", city: "Lincoln" }),
        ],
      });
      await mountDestinations();

      const attribute = activeWrapper.findComponent({ name: "VSelect" });
      await attribute.setValue(null);
      await fill(activeWrapper, "Search", "Lib");

      expect(pageText()).toContain("Library");
      expect(pageText()).not.toContain("Museum");
    });

    it("Search attribute selected", async () => {
      apiClient.get.mockResolvedValue({
        status: 200,
        data: [
          destination(1, { dest_name: "Library", city: "Omaha" }),
          destination(2, { dest_name: "Museum", city: "Lincoln" }),
        ],
      });
      await mountDestinations();

      await activeWrapper.findComponent({ name: "VSelect" }).setValue("City");
      await fill(activeWrapper, "Search", "Linc");

      expect(pageText()).toContain("Museum");
      expect(pageText()).not.toContain("Library");
    });
  });

  describe("US-6.6: Edit Destination", () => {
    it("Press Edit icon", async () => {
      const row = destination(1, {
        dest_name: "City Library",
        addr_line_1: "1 Main Street",
        addr_line_2: "Suite 2",
        city: "Omaha",
        state: "Nebraska",
        zip: "68102",
      });
      apiClient.get.mockResolvedValue({ status: 200, data: [row] });
      await mountDestinations();

      document.querySelector('[aria-label="Edit"]').click();
      await flushPromises();

      expect(pageText()).toContain("Edit Destination");
      expect(findField(activeWrapper, "Name").find("input").element.value).toBe("City Library");
      expect(findField(activeWrapper, "Street Address").find("input").element.value).toBe("1 Main Street");
      expect(findField(activeWrapper, "Address Line 2").find("input").element.value).toBe("Suite 2");
      expect(findField(activeWrapper, "City").find("input").element.value).toBe("Omaha");
      expect(findField(activeWrapper, "State").find("input").element.value).toBe("Nebraska");
      expect(findField(activeWrapper, "Zip Code").find("input").element.value).toBe("68102");
    });

    it("Send edit request with valid form data", async () => {
      vi.useFakeTimers();
      const row = destination(1, { dest_name: "City Library", addr_line_2: "Suite 2" });
      apiClient.get
        .mockResolvedValueOnce({ status: 200, data: [row] })
        .mockResolvedValue({ status: 200, data: [{ ...row, dest_name: "Updated Library", addr_line_2: null }] });

      const { router } = await mountDestinations();
      document.querySelector('[aria-label="Edit"]').click();
      await flushPromises();

      await fill(activeWrapper, "Name", "Updated Library");
      await fill(activeWrapper, "Street Address", "1 Main Street");
      await fill(activeWrapper, "Address Line 2", "");
      await fill(activeWrapper, "City", "Omaha");
      await fill(activeWrapper, "State", "Nebraska");
      await fill(activeWrapper, "Zip Code", "68102");

      const getsBeforeSave = apiClient.get.mock.calls.length;
      buttonByText("Save").click();
      await flushPromises();

      expect(apiClient.put).toHaveBeenCalled();
      const [url, body] = apiClient.put.mock.calls[0];
      expect(String(url)).toContain("1");
      expect(body).toEqual(
        expect.objectContaining({
          dest_name: "Updated Library",
          addr_line_1: "1 Main Street",
          city: "Omaha",
          state: "Nebraska",
          zip: "68102",
        }),
      );
      expect(pageText()).toContain(UPDATED_MESSAGE);
      expect(apiClient.get.mock.calls.length).toBeGreaterThan(getsBeforeSave);
      expect(pageText()).toContain("Updated Library");
      expect(router.currentRoute.value.name).toBe("destinations");

      await vi.advanceTimersByTimeAsync(3000);
      expect(pageText()).not.toContain(UPDATED_MESSAGE);
    });
  });
});
