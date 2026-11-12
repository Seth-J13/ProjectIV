/**
 * Feature 6 — Destination CRUD
 * Spec: features/feature-6-destination-crud.md
 */
import { defineComponent } from "vue";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import DestinationForm from "../src/views/DestinationForm.vue";
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

const ZIP_ERROR = "Zip code must be formatted like ##### or #####-####";

const filledDestination = {
  id: 1,
  dest_name: "City Library",
  addr_line_1: "1 Main Street",
  addr_line_2: "",
  city: "Omaha",
  state: "Nebraska",
  zip: "12345",
};

let activeWrapper;

function findField(wrapper, label) {
  const fields = wrapper.findAllComponents({ name: "VTextField" });
  const field = fields.find((candidate) => candidate.props("label") === label);

  if (!field) {
    throw new Error(`No field labeled ${label}`);
  }

  return field;
}

async function fill(wrapper, label, value) {
  await findField(wrapper, label).find("input").setValue(value);
}

async function fillValidExcept(wrapper, skippedLabel) {
  const values = {
    Name: "City Library",
    "Street Address": "1 Main Street",
    "Address Line 2": "",
    City: "Omaha",
    State: "Nebraska",
    "Zip Code": "12345",
  };

  for (const [label, value] of Object.entries(values)) {
    if (label !== skippedLabel) {
      await fill(wrapper, label, value);
    }
  }
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

  const scrim = document.querySelector(".v-overlay__scrim");
  scrim?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  document.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
  await flushPromises();
}

function inputValues() {
  return [...document.querySelectorAll("input")].map((input) => input.value);
}

async function mountForm({ isAddMode, modelValue = {} }) {
  const Host = defineComponent({
    components: { DestinationForm },
    data: () => ({ isAddMode, modelValue }),
    template: `
      <div>
        <button type="button" class="outside-target">Outside</button>
        <DestinationForm :is-add-mode="isAddMode" :model-value="modelValue" />
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
  apiClient.get.mockResolvedValue({ status: 200, data: [] });
  apiClient.post.mockResolvedValue({ status: 201, data: { message: "New destination created with id=1" } });
  apiClient.put.mockResolvedValue({ status: 201, data: { message: "New destination created with id=1" } });
});

afterEach(() => {
  activeWrapper?.unmount();
  activeWrapper = undefined;
});

describe("Feature 6 — Destination CRUD", () => {
  describe("US-6.3: Add Destination", () => {
    it("Press outside DestinationForm component (add)", async () => {
      const wrapper = await mountForm({ isAddMode: true });

      expect(document.body.innerText).toContain("Add Destination");
      await fill(wrapper, "Name", "Unique Library Name");

      await pressOutside(wrapper);

      expect(document.body.innerText).not.toContain("Add Destination");
      expect(inputValues()).not.toContain("Unique Library Name");
    });

    it("Send add request with invalid form data", async () => {
      const wrapper = await mountForm({ isAddMode: true });

      await fillValidExcept(wrapper, "Zip Code");
      await fill(wrapper, "Zip Code", "1234");
      await buttonByText(wrapper, "Add").trigger("click");
      await flushPromises();

      expect(findField(wrapper, "Zip Code").html()).toContain(ZIP_ERROR);
      expect(document.body.innerText).toContain("Add Destination");
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("Send add request with a missing required field", async () => {
      const wrapper = await mountForm({ isAddMode: true });

      await fillValidExcept(wrapper, "Zip Code");
      await buttonByText(wrapper, "Add").trigger("click");
      await flushPromises();

      expect(findField(wrapper, "Zip Code").html()).toContain("Required");
      expect(document.body.innerText).toContain("Add Destination");
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe("US-6.6: Edit Destination", () => {
    it("Press outside DestinationForm component (edit)", async () => {
      const wrapper = await mountForm({ isAddMode: false, modelValue: filledDestination });

      expect(document.body.innerText).toContain("Edit Destination");
      expect(inputValues()).toContain("City Library");

      await pressOutside(wrapper);

      expect(document.body.innerText).not.toContain("Edit Destination");
      expect(inputValues()).not.toContain("City Library");
    });

    it("Send edit request with invalid form data", async () => {
      const wrapper = await mountForm({ isAddMode: false, modelValue: filledDestination });

      await fill(wrapper, "Zip Code", "1234");
      await buttonByText(wrapper, "Save").trigger("click");
      await flushPromises();

      expect(findField(wrapper, "Zip Code").html()).toContain(ZIP_ERROR);
      expect(document.body.innerText).toContain("Edit Destination");
      expect(apiClient.put).not.toHaveBeenCalled();
    });

    it("Send edit request with a missing required field", async () => {
      const wrapper = await mountForm({ isAddMode: false, modelValue: filledDestination });

      await fill(wrapper, "Zip Code", "");
      await buttonByText(wrapper, "Save").trigger("click");
      await flushPromises();

      expect(findField(wrapper, "Zip Code").html()).toContain("Required");
      expect(document.body.innerText).toContain("Edit Destination");
      expect(apiClient.put).not.toHaveBeenCalled();
    });
  });
});
