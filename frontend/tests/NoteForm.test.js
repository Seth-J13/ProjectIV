/**
 * Feature 9 — Note CRUD
 * Spec: features/feature-9-note-crud.md
 */
import { defineComponent } from "vue";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import NoteForm from "../src/components/NoteForm.vue";
import apiClient from "../src/services/services.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/services.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const filledNote = {
  id: 3,
  reason: "Brake noise",
  text: "Grinding when stopping",
  request_id: 6,
  maintenance_request: false,
  date: "2026-11-02",
};

let activeWrapper;

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

function buttonByText(root, text) {
  const button = root.findAll("button").find((candidate) => candidate.text().trim() === text);

  if (!button) {
    throw new Error(`No button labeled ${text}`);
  }

  return button;
}

async function pressOutside(wrapper) {
  await wrapper.get(".outside-target").trigger("click");
  document.querySelector(".v-overlay__scrim")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  document.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
  await flushPromises();
}

function inputValues() {
  return [...document.querySelectorAll("input, textarea")].map((control) => control.value);
}

async function mountForm({ isAddMode, modelValue = { request_id: 6 } }) {
  const Host = defineComponent({
    components: { NoteForm },
    data: () => ({ isAddMode, modelValue }),
    template: `
      <div>
        <button type="button" class="outside-target">Outside</button>
        <NoteForm :is-add-mode="isAddMode" :model-value="modelValue" />
      </div>
    `,
  });

  const { wrapper } = await mountWithPlugins(Host, { attachTo: document.body });
  activeWrapper = wrapper;
  await flushPromises();
  return wrapper;
}

beforeEach(() => {
  apiClient.get.mockReset();
  apiClient.post.mockReset();
  apiClient.put.mockReset();
  apiClient.delete.mockReset();
  apiClient.post.mockResolvedValue({ status: 201, data: { message: "New note created with id=1" } });
  apiClient.put.mockResolvedValue({ status: 200, data: { message: "Note updated", ...filledNote } });
});

afterEach(() => {
  activeWrapper?.unmount();
  activeWrapper = undefined;
});

describe("Feature 9 — Note CRUD", () => {
  describe("US-9.3: Create Notes", () => {
    it("Press outside NoteForm component (add)", async () => {
      const wrapper = await mountForm({ isAddMode: true });

      expect(document.body.innerText).toContain("Add Note");
      await fill(wrapper, "Subject", "Unique Subject");

      await pressOutside(wrapper);

      expect(document.body.innerText).not.toContain("Add Note");
      expect(inputValues()).not.toContain("Unique Subject");
    });

    it("Send add request with invalid form data", async () => {
      const wrapper = await mountForm({ isAddMode: true });

      await fill(wrapper, "Subject", "a".repeat(255));
      await fill(wrapper, "Description", "A long enough description");
      await buttonByText(wrapper, "Add").trigger("click");
      await flushPromises();

      expect(findField(wrapper, "Subject").html()).toContain("254");
      expect(document.body.innerText).toContain("Add Note");
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("Send add request with a missing required field", async () => {
      const wrapper = await mountForm({ isAddMode: true });

      await fill(wrapper, "Description", "Description without a subject");
      await buttonByText(wrapper, "Add").trigger("click");
      await flushPromises();

      expect(findField(wrapper, "Subject").html()).toContain("Required");
      expect(document.body.innerText).toContain("Add Note");
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe("US-9.4: Edit Notes", () => {
    it("Press outside NoteForm component (edit)", async () => {
      const wrapper = await mountForm({ isAddMode: false, modelValue: filledNote });

      expect(document.body.innerText).toContain("Edit Note");
      expect(inputValues()).toContain("Brake noise");

      await pressOutside(wrapper);

      expect(document.body.innerText).not.toContain("Edit Note");
      expect(inputValues()).not.toContain("Brake noise");
    });

    it("Send edit request with invalid form data", async () => {
      const wrapper = await mountForm({ isAddMode: false, modelValue: filledNote });

      await fill(wrapper, "Subject", "b".repeat(255));
      await buttonByText(wrapper, "Save").trigger("click");
      await flushPromises();

      expect(findField(wrapper, "Subject").html()).toContain("254");
      expect(document.body.innerText).toContain("Edit Note");
      expect(apiClient.put).not.toHaveBeenCalled();
    });

    it("Send edit request with a missing required field", async () => {
      const wrapper = await mountForm({ isAddMode: false, modelValue: filledNote });

      await fill(wrapper, "Subject", "");
      await buttonByText(wrapper, "Save").trigger("click");
      await flushPromises();

      expect(findField(wrapper, "Subject").html()).toContain("Required");
      expect(document.body.innerText).toContain("Edit Note");
      expect(apiClient.put).not.toHaveBeenCalled();
    });
  });
});
