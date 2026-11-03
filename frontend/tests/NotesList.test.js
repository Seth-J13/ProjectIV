/**
 * Feature 9 — Note CRUD
 * Spec: features/feature-9-note-crud.md
 */
import { defineComponent } from "vue";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import NotesList from "../src/components/NotesList.vue";
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

const CREATED_MESSAGE = "New note created with id=4";
const UPDATED_MESSAGE = "Note updated";
const LONG_REASON = "this is not a maintenance issue";

const intersectionObservers = [];
let activeWrapper;

function note(id, overrides = {}) {
  return {
    id,
    reason: LONG_REASON,
    maintenance_request: false,
    request_id: 6,
    created_by: 10,
    date: "2026-11-02",
    text: `Details for note ${id}`,
    ...overrides,
  };
}

function signIn(role, userId = 1) {
  Utils.setStore("user", {
    userId,
    role,
    token: `${role}-token`,
    email: `${role}@example.com`,
  });
}

function pageText() {
  return document.body.innerText;
}

function buttonByText(text) {
  const button = [...document.querySelectorAll("button")].find((candidate) => candidate.textContent.trim() === text);

  if (!button) {
    throw new Error(`No button labeled ${text}`);
  }

  return button;
}

function findField(wrapper, label) {
  const fields = [
    ...wrapper.findAllComponents({ name: "VTextField" }),
    ...wrapper.findAllComponents({ name: "VTextarea" }),
  ];
  const field = fields.find((candidate) => candidate.props("label") === label);

  if (!field) {
    throw new Error(`No field labeled ${label}`);
  }

  return field;
}

async function fill(wrapper, label, value) {
  const field = findField(wrapper, label);
  const control = field.find("textarea").exists() ? field.find("textarea") : field.find("input");
  await control.setValue(value);
}

function noteBody(payload) {
  if (Array.isArray(payload)) {
    return payload.find((item) => item && Object.prototype.hasOwnProperty.call(item, "text")) ?? payload[0];
  }

  return payload;
}

function maintenanceFlag(form) {
  const fromProp = form.props("maintenanceRequest") ?? form.props("maintenance_request");

  if (fromProp != null) {
    return fromProp;
  }

  const checkbox = form.find('input[type="checkbox"]');
  return checkbox.exists() ? checkbox.element.checked : undefined;
}

async function mountList(props = {}) {
  const Host = defineComponent({
    components: { NotesList },
    data: () => ({
      mode: "embed",
      title: "Notes",
      requestId: 6,
      maintenanceRequest: false,
      userId: null,
      scope: "request",
      filter: null,
      ...props,
    }),
    template: `
      <div class="host">
        <NotesList
          :mode="mode"
          :title="title"
          :request-id="requestId"
          :maintenance-request="maintenanceRequest"
          :user-id="userId"
          :scope="scope"
          :filter="filter"
        />
      </div>
    `,
  });

  const { wrapper } = await mountWithPlugins(Host, { attachTo: document.body });
  activeWrapper = wrapper;
  await flushPromises();
  return wrapper;
}

async function scrollList() {
  const list = activeWrapper.get(".v-list").element;
  list.scrollTop = list.scrollHeight;
  list.dispatchEvent(new Event("scroll", { bubbles: true }));

  for (const observer of intersectionObservers) {
    observer.callback([{ isIntersecting: true, target: list }], observer);
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
  apiClient.put.mockResolvedValue({ status: 200, data: { message: UPDATED_MESSAGE, text: "Updated description" } });
  apiClient.delete.mockResolvedValue({ status: 204, data: "" });
  signIn("user");
});

afterEach(() => {
  activeWrapper?.unmount();
  activeWrapper = undefined;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("Feature 9 — Note CRUD", () => {
  describe("US-9.1: See Notes", () => {
    it("Landing View Request Form Note List Embed", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [note(1)] });
      await mountList({ mode: "embed", title: "Notes", requestId: 6, scope: "request" });

      expect(pageText()).toContain("Notes");
      expect(buttonByText("+ New Note").classList.contains("oc-cta")).toBe(true);
      expect(pageText()).toContain("#1");
      expect(pageText()).toContain("R: 6");
      expect(pageText()).toContain("this is not a mainte...");
      expect(String(apiClient.get.mock.calls.at(-1)[0])).toContain("6");
    });

    it("Vehicle Maintenance Note List Embed", async () => {
      apiClient.get.mockResolvedValue({
        status: 200,
        data: [
          note(1, { maintenance_request: true, request_id: 6, text: "Matching maintenance" }),
          note(2, { maintenance_request: false, request_id: 6, text: "Not maintenance" }),
          note(3, { maintenance_request: true, request_id: 9, text: "Other vehicle" }),
        ],
      });
      signIn("maintenance");
      await mountList({
        mode: "embed",
        title: "Vehicle Maintenance Notes",
        maintenanceRequest: true,
        scope: "maintenance",
        filter: (item) => item.maintenance_request === true && item.request_id === 6,
      });

      expect(pageText()).toContain("Vehicle Maintenance Notes");
      expect(pageText()).toContain("Matching maintenance");
      expect(pageText()).not.toContain("Not maintenance");
      expect(pageText()).not.toContain("Other vehicle");
    });

    it("More than 3 Notes in a Note List", async () => {
      const rows = Array.from({ length: 6 }, (_, index) =>
        note(index + 1, { reason: `Reason ${index + 1} is long enough`, text: `Batch text ${index + 1}` }),
      );
      let calls = 0;
      apiClient.get.mockImplementation(() => {
        const data = calls === 0 ? rows.slice(0, 3) : rows.slice(3, 6);
        calls += 1;
        return Promise.resolve({ status: 200, data });
      });

      await mountList({ mode: "list", title: "All Notes" });

      expect(activeWrapper.find(".v-list").exists()).toBe(true);
      expect(pageText()).toContain("Batch text 1");
      expect(pageText()).toContain("Batch text 3");
      expect(pageText()).not.toContain("Batch text 4");

      await scrollList();

      expect(pageText()).toContain("Batch text 4");
      expect(pageText()).toContain("Batch text 6");
      expect(calls).toBeGreaterThan(1);
      expect(window.scrollY).toBe(0);
    });

    it("Less than 3 list items left to GET", async () => {
      const rows = Array.from({ length: 4 }, (_, index) => note(index + 1, { text: `Short batch ${index + 1}` }));
      let calls = 0;
      apiClient.get.mockImplementation(() => {
        const data = calls === 0 ? rows.slice(0, 3) : rows.slice(3);
        calls += 1;
        return Promise.resolve({ status: 200, data });
      });

      await mountList({ mode: "list", title: "All Notes" });
      await scrollList();

      expect(pageText()).toContain("Short batch 4");
      const callsAfterShortBatch = calls;

      await scrollList();

      expect(calls).toBe(callsAfterShortBatch);
    });

    it("Press on list item body", async () => {
      const row = note(3, {
        reason: LONG_REASON,
        text: "Full description of the note",
        date: "2026-11-02",
        contributors: [
          { contributor_id: 10, created_note: true, date: "2026-11-02" },
          { contributor_id: 15, created_note: false, date: "2026-11-03" },
        ],
      });
      apiClient.get.mockResolvedValue({ status: 200, data: [row] });
      await mountList();

      activeWrapper.get(".v-card").trigger("click");
      await flushPromises();

      expect(pageText()).toContain("Request ID: 6");
      expect(pageText()).toContain("11/02/2026");
      expect(pageText()).toContain("Last updated on");
      expect(pageText()).toContain("11/03/2026");
      expect(pageText()).toContain(LONG_REASON);
      expect(pageText()).toContain("Full description of the note");
      expect(buttonByText("Close")).toBeTruthy();
    });

    it("Press on list item action icon", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [note(1, { reason: "Brake noise", text: "Grinding" })] });
      await mountList();

      document.querySelector('[aria-label="Edit"]').click();
      await flushPromises();

      expect(pageText()).toContain("Edit Note");
      expect(findField(activeWrapper, "Subject").find("input").element.value).toBe("Brake noise");
      expect([...document.querySelectorAll("button")].some((button) => button.textContent.trim() === "Close")).toBe(
        false,
      );
    });

    it("Press anywhere outside Note dialog", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [note(1, { text: "Keep this note" })] });
      await mountList();

      activeWrapper.get(".v-card").trigger("click");
      await flushPromises();
      buttonByText("Close").click();
      await flushPromises();

      expect(pageText()).not.toContain("Request ID:");
      expect(pageText()).toContain("#1");

      activeWrapper.get(".v-card").trigger("click");
      await flushPromises();
      document.querySelector(".v-overlay__scrim").dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      expect(pageText()).not.toContain("Request ID:");
      expect(pageText()).toContain("Keep this note");
      expect(apiClient.put).not.toHaveBeenCalled();
      expect(apiClient.delete).not.toHaveBeenCalled();
    });
  });

  describe("US-9.2: Remove Notes", () => {
    it("User selects Delete icon on Notes List item", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [note(1)] });
      await mountList();

      document.querySelector('[aria-label="Delete"]').click();
      await flushPromises();

      expect(buttonByText("Cancel")).toBeTruthy();
      expect(buttonByText("Delete")).toBeTruthy();
      expect(pageText()).toContain("Delete");
    });

    it("User cancels Delete", async () => {
      apiClient.get.mockResolvedValue({ status: 200, data: [note(1, { text: "Keep this note" })] });
      await mountList();
      document.querySelector('[aria-label="Delete"]').click();
      await flushPromises();

      buttonByText("Cancel").click();
      await flushPromises();

      expect(pageText()).not.toContain("Cancel");
      expect(apiClient.delete).not.toHaveBeenCalled();
      expect(pageText()).toContain("Keep this note");
    });

    it("User confirms Delete", async () => {
      apiClient.get
        .mockResolvedValueOnce({ status: 200, data: [note(1, { text: "Going away" }), note(2), note(3)] })
        .mockResolvedValue({ status: 200, data: [note(2), note(3), note(4, { text: "Next loaded note" })] });
      await mountList();
      document.querySelector('[aria-label="Delete"]').click();
      await flushPromises();

      const getsBeforeDelete = apiClient.get.mock.calls.length;
      buttonByText("Delete").click();
      await flushPromises();

      expect(apiClient.delete).toHaveBeenCalled();
      expect(String(apiClient.delete.mock.calls[0][0])).toContain("1");
      expect(pageText()).not.toContain("Going away");
      expect(pageText()).toContain("Next loaded note");
      expect(apiClient.get.mock.calls.length).toBeGreaterThan(getsBeforeDelete);
      expect([...document.querySelectorAll("button")].some((button) => button.textContent.trim() === "Cancel")).toBe(
        false,
      );
    });

    it("Maintenance deletes from Maintenance Requests Notes List", async () => {
      signIn("maintenance");
      apiClient.get
        .mockResolvedValueOnce({
          status: 200,
          data: [note(8, { maintenance_request: true, text: "Pads are worn" })],
        })
        .mockResolvedValue({ status: 200, data: [note(9, { maintenance_request: true, text: "Next service note" })] });
      await mountList({
        mode: "embed",
        title: "Vehicle Maintenance Notes",
        maintenanceRequest: true,
        scope: "maintenance",
      });
      document.querySelector('[aria-label="Delete"]').click();
      await flushPromises();

      buttonByText("Delete").click();
      await flushPromises();

      expect(apiClient.delete).toHaveBeenCalled();
      expect(pageText()).not.toContain("Pads are worn");
      expect(pageText()).toContain("Next service note");
      expect(pageText()).toContain("Vehicle Maintenance Notes");
      expect(JSON.stringify(apiClient.post.mock.calls)).toContain("Pads are worn");
    });
  });

  describe("US-9.3: Create Notes", () => {
    it("Press New Note from Request form", async () => {
      await mountList({ mode: "embed", maintenanceRequest: false, requestId: 6 });

      buttonByText("+ New Note").click();
      await flushPromises();

      const form = activeWrapper.findComponent({ name: "NoteForm" });
      expect(pageText()).toContain("Add Note");
      expect(form.exists()).toBe(true);
      expect(maintenanceFlag(form)).toBe(false);
    });

    it("Press Cancel from Request form (add)", async () => {
      await mountList({ mode: "embed", maintenanceRequest: false, requestId: 6 });
      buttonByText("+ New Note").click();
      await flushPromises();
      await fill(activeWrapper, "Subject", "Unique Subject");
      await fill(activeWrapper, "Description", "Temporary description");

      buttonByText("Cancel").click();
      await flushPromises();

      expect(pageText()).not.toContain("Add Note");
      expect(pageText()).not.toContain("Unique Subject");
      expect(pageText()).not.toContain("Temporary description");
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("Press New Note from Maintenance Request form", async () => {
      signIn("maintenance");
      await mountList({
        mode: "embed",
        title: "Vehicle Maintenance Notes",
        maintenanceRequest: true,
        scope: "maintenance",
      });

      buttonByText("+ New Note").click();
      await flushPromises();

      const form = activeWrapper.findComponent({ name: "NoteForm" });
      expect(pageText()).toContain("Add Note");
      expect(form.exists()).toBe(true);
      expect(maintenanceFlag(form)).toBe(true);
    });

    it("Send add request with valid form data", async () => {
      vi.useFakeTimers();
      apiClient.get
        .mockResolvedValueOnce({ status: 200, data: [] })
        .mockResolvedValue({ status: 200, data: [note(4, { reason: "Brake noise", text: "Grinding when stopping" })] });
      await mountList({ requestId: 6, maintenanceRequest: false });

      buttonByText("+ New Note").click();
      await flushPromises();
      await fill(activeWrapper, "Subject", "Brake noise");
      await fill(activeWrapper, "Description", "Grinding when stopping");

      const getsBeforeSubmit = apiClient.get.mock.calls.length;
      buttonByText("Add").click();
      await flushPromises();

      const body = noteBody(apiClient.post.mock.calls[0][1]);
      expect(body).toEqual(
        expect.objectContaining({
          reason: "Brake noise",
          text: "Grinding when stopping",
          request_id: 6,
          maintenance_request: false,
        }),
      );
      expect(pageText()).toContain(CREATED_MESSAGE);
      expect(pageText()).not.toContain("Add Note");
      expect(apiClient.get.mock.calls.length).toBeGreaterThan(getsBeforeSubmit);
      expect(pageText()).toContain("Brake noise");

      await vi.advanceTimersByTimeAsync(3000);
      expect(pageText()).not.toContain(CREATED_MESSAGE);
    });
  });

  describe("US-9.4: Edit Notes", () => {
    it("Press Edit icon on Notes List item", async () => {
      apiClient.get.mockResolvedValue({
        status: 200,
        data: [
          note(3, {
            reason: "Brake noise",
            text: "Grinding when stopping",
            contributors: [
              { contributor_id: 10, created_note: true, date: "2026-11-02" },
              { contributor_id: 15, created_note: false, date: "2026-11-03" },
            ],
          }),
        ],
      });
      await mountList({ mode: "embed", maintenanceRequest: false, requestId: 6 });

      document.querySelector('[aria-label="Edit"]').click();
      await flushPromises();

      expect(pageText()).toContain("Edit Note");
      expect(pageText()).toContain("Request ID: 6");
      expect(pageText()).toContain("Last updated on");
      expect(pageText()).toContain("11/03/2026");
      expect(pageText()).toContain("11/02/2026");
      expect(findField(activeWrapper, "Subject").find("input").element.value).toBe("Brake noise");
      expect(findField(activeWrapper, "Description").find("textarea").element.value).toBe("Grinding when stopping");
    });

    it("Press Edit icon from Maintenance Request list", async () => {
      signIn("maintenance");
      apiClient.get.mockResolvedValue({
        status: 200,
        data: [note(3, { maintenance_request: true, reason: "Pads", text: "Worn through" })],
      });
      await mountList({
        mode: "embed",
        title: "Vehicle Maintenance Notes",
        maintenanceRequest: true,
        scope: "maintenance",
      });

      document.querySelector('[aria-label="Edit"]').click();
      await flushPromises();

      const form = activeWrapper.findComponent({ name: "NoteForm" });
      expect(pageText()).toContain("Edit Note");
      expect(findField(activeWrapper, "Subject").find("input").element.value).toBe("Pads");
      expect(findField(activeWrapper, "Description").find("textarea").element.value).toBe("Worn through");
      expect(maintenanceFlag(form)).toBe(true);
    });

    it("Send edit request with valid form data", async () => {
      vi.useFakeTimers();
      apiClient.get
        .mockResolvedValueOnce({ status: 200, data: [note(3, { reason: "Brake noise", text: "Old description" })] })
        .mockResolvedValue({ status: 200, data: [note(3, { reason: "Brake noise", text: "Updated description" })] });
      await mountList({ requestId: 6 });

      document.querySelector('[aria-label="Edit"]').click();
      await flushPromises();
      await fill(activeWrapper, "Subject", "Brake noise");
      await fill(activeWrapper, "Description", "Updated description");

      const getsBeforeSave = apiClient.get.mock.calls.length;
      buttonByText("Save").click();
      await flushPromises();

      const [url, payload] = apiClient.put.mock.calls[0];
      expect(String(url)).toContain("3");
      expect(noteBody(payload)).toEqual(
        expect.objectContaining({
          reason: "Brake noise",
          text: "Updated description",
        }),
      );
      expect(pageText()).toContain(UPDATED_MESSAGE);
      expect(pageText()).not.toContain("Edit Note");
      expect(apiClient.get.mock.calls.length).toBeGreaterThan(getsBeforeSave);
      expect(pageText()).toContain("Updated description");

      await vi.advanceTimersByTimeAsync(3000);
      expect(pageText()).not.toContain(UPDATED_MESSAGE);
    });
  });

  describe("US-9.6: Admin Notes Management", () => {
    it("View Note Creation List for User Management", async () => {
      signIn("admin");
      apiClient.get.mockResolvedValue({
        status: 200,
        data: [note(1, { reason: "Created subject", text: "Created by this user" })],
      });
      await mountList({ mode: "embed", scope: "creator", userId: 15, title: "Notes" });

      const [url, config] = apiClient.get.mock.calls.at(-1);
      expect(`${url} ${JSON.stringify(config ?? {})}`).toMatch(/15/);
      expect(`${url} ${JSON.stringify(config ?? {})}`).toMatch(/creator/);
      expect(pageText()).toContain("Created by this user");
    });

    it("View Note Contribution List for User Management", async () => {
      signIn("admin");
      apiClient.get.mockResolvedValue({
        status: 200,
        data: [note(2, { reason: "Contributed subject", text: "Contributed by this user" })],
      });
      await mountList({ mode: "embed", scope: "contributor", userId: 15, title: "Notes" });

      const [url, config] = apiClient.get.mock.calls.at(-1);
      expect(`${url} ${JSON.stringify(config ?? {})}`).toMatch(/15/);
      expect(`${url} ${JSON.stringify(config ?? {})}`).toMatch(/contributor/);
      expect(pageText()).toContain("Contributed by this user");
    });

    it("Admin super-permissions on any list", async () => {
      signIn("admin", 1);
      apiClient.get.mockResolvedValue({
        status: 200,
        data: [note(5, { created_by: 50, reason: "Someone else's note", text: "Not mine" })],
      });
      await mountList({ mode: "embed", requestId: 6 });

      expect(pageText()).toContain("Not mine");
      expect(buttonByText("+ New Note")).toBeTruthy();
      expect(document.querySelector('[aria-label="Edit"]')).toBeTruthy();
      expect(document.querySelector('[aria-label="Delete"]')).toBeTruthy();

      document.querySelector('[aria-label="Edit"]').click();
      await flushPromises();
      await fill(activeWrapper, "Subject", "");
      buttonByText("Save").click();
      await flushPromises();

      expect(findField(activeWrapper, "Subject").html()).toContain("Required");
      expect(apiClient.put).not.toHaveBeenCalled();

      document.querySelector('[aria-label="Delete"]').click();
      await flushPromises();
      expect(buttonByText("Delete")).toBeTruthy();
    });
  });
});
