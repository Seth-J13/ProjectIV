/**
 * Feature 11 — Images CRUD
 * Spec: features/feature-11-images-crud.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ImagesDetails from "../src/components/ImagesDetails.vue";
import apiClient from "../src/services/services.js";
import {
  controlNamed,
  controlsNamed,
  dialog,
  hasNegativeColor,
  imageRecord,
  mountImage,
  pageText,
  pressControl,
  pressOutsideDialog,
  resetImageApi,
  scrollsInside,
  signIn,
} from "./imageTestUtils.js";

vi.mock("../src/services/services.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const detailsTemplate = `<ImageUnderTest :type="type" :parent-id="parentId" :host="host" :images="images" />`;

let activeWrapper;

function pair(type, parentId) {
  return [
    imageRecord(type, parentId, { id: parentId + 1, date: "2026-05-02" }),
    imageRecord(type, parentId, { id: parentId + 2, date: "2026-01-09" }),
  ];
}

async function mountDetails({ type, parentId, host = "container", images }) {
  signIn(type === "note" ? "user" : "maintenance");
  activeWrapper = await mountImage(ImagesDetails, {
    props: { type, parentId, host, images },
    template: detailsTemplate,
  });
  return activeWrapper;
}

async function expand(date) {
  const content = controlsNamed("Image Content").find((node) => node.closest("body") && pageText().includes(date));
  (content || controlNamed("Image Content")).click();
  await flushPromises();
}

describe("Feature 11 — Images CRUD", () => {
  beforeEach(() => {
    localStorage.clear();
    resetImageApi(apiClient);
  });

  afterEach(() => {
    activeWrapper?.unmount();
    activeWrapper = undefined;
    document.body.innerHTML = "";
  });

  describe("US-11.1: See VehicleImage on Vehicle listings", () => {
    it("Press the vehicle image tooltip", async () => {
      const parentId = 3201;
      const images = pair("vehicle", parentId);
      await mountDetails({ type: "vehicle", parentId, host: "box", images });

      expect(pageText()).toContain(images[0].date);
      expect(pageText()).toContain(images[1].date);
      expect(scrollsInside(activeWrapper.element)).toBe(true);

      await expand(images[0].date);
      expect(dialog().textContent).toContain(images[0].date);
      await pressControl("<");
      expect(dialog().textContent).toContain(images[0].date);
      await pressControl(">");
      expect(dialog().textContent).toContain(images[1].date);
      await pressControl(">");
      expect(dialog().textContent).toContain(images[1].date);

      const image = dialog().querySelector("img");
      const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      image.dispatchEvent(menu);
      expect(menu.defaultPrevented).toBe(true);
      expect(dialog().textContent).not.toMatch(/save/i);
    });
  });

  describe("US-11.3: Delete VehicleImage on Vehicle listings", () => {
    it("Show delete on a vehicle image", async () => {
      const parentId = 3301;
      const images = pair("vehicle", parentId);
      await mountDetails({ type: "vehicle", parentId, images });

      const remove = controlNamed("X");
      expect(hasNegativeColor(remove)).toBe(true);
      expect(apiClient.delete).not.toHaveBeenCalled();
    });

    it("Delete one vehicle image", async () => {
      const parentId = 3302;
      const images = pair("vehicle", parentId);
      const href = window.location.href;
      apiClient.get.mockResolvedValue({ status: 200, data: [] });
      await mountDetails({ type: "vehicle", parentId, images });
      const getsBefore = apiClient.get.mock.calls.length;

      await pressControl("X");

      expect(String(apiClient.delete.mock.calls[0][0])).toMatch(new RegExp(`/vehicle-t3/vehicleimage/${images[0].id}$`));
      expect(apiClient.delete.mock.calls).toHaveLength(1);
      expect(apiClient.get.mock.calls.length).toBeGreaterThan(getsBefore);
      expect(pageText()).not.toContain(images[0].date);
      expect(window.location.href).toBe(href);
    });

    it("Close an expanded vehicle image", async () => {
      const parentId = 3303;
      const images = pair("vehicle", parentId);
      await mountDetails({ type: "vehicle", parentId, images });
      await expand(images[0].date);

      await pressOutsideDialog();
      expect(dialog()).toBeNull();
      expect(apiClient.delete).not.toHaveBeenCalled();

      await expand(images[0].date);
      const overlayX = [...dialog().querySelectorAll("button, [aria-label]")].find((node) => {
        return (node.getAttribute("aria-label") || node.textContent.trim()) === "X";
      });
      overlayX.click();
      await flushPromises();
      expect(dialog()).toBeNull();
      expect(apiClient.delete).not.toHaveBeenCalled();
    });
  });

  describe("US-11.4: See NoteImage on Note details", () => {
    it("Note form shows its images", async () => {
      const parentId = 3401;
      const images = pair("note", parentId);
      await mountDetails({ type: "note", parentId, images });

      expect(pageText()).toContain(images[0].date);
      expect(pageText()).toContain(images[1].date);
      expect(document.querySelectorAll("img").length).toBeGreaterThanOrEqual(2);
    });

    it("Expand a note image", async () => {
      const parentId = 3402;
      const images = pair("note", parentId);
      await mountDetails({ type: "note", parentId, images });
      await expand(images[0].date);

      expect(dialog().textContent).toContain(images[0].date);
      await pressControl("<");
      expect(dialog().textContent).toContain(images[0].date);
      await pressControl(">");
      expect(dialog().textContent).toContain(images[1].date);
      await pressControl(">");
      expect(dialog().textContent).toContain(images[1].date);

      const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      dialog().querySelector("img").dispatchEvent(menu);
      expect(menu.defaultPrevented).toBe(true);
      expect(dialog().textContent).not.toMatch(/save/i);
    });

    it("Close an expanded note image", async () => {
      const parentId = 3403;
      const images = pair("note", parentId);
      await mountDetails({ type: "note", parentId, images });
      await expand(images[0].date);
      await pressOutsideDialog();
      expect(dialog()).toBeNull();
      expect(apiClient.delete).not.toHaveBeenCalled();

      await expand(images[0].date);
      [...dialog().querySelectorAll("button, [aria-label]")]
        .find((node) => (node.getAttribute("aria-label") || node.textContent.trim()) === "X")
        .click();
      await flushPromises();
      expect(dialog()).toBeNull();
      expect(apiClient.delete).not.toHaveBeenCalled();
    });

    it("Note has no images", async () => {
      const parentId = 3404;
      apiClient.get.mockRejectedValue({
        response: { status: 404, data: { message: "This note <:noteId> doesn't have any images" } },
      });
      await mountDetails({ type: "note", parentId, images: undefined });

      expect(pageText()).toContain("No images");
    });
  });

  describe("US-11.6: Delete NoteImage on Note", () => {
    it("Delete a note image from the note form", async () => {
      const parentId = 3601;
      const images = pair("note", parentId);
      const href = window.location.href;
      apiClient.get.mockResolvedValue({ status: 200, data: [] });
      await mountDetails({ type: "note", parentId, images });
      const remove = controlNamed("X");
      expect(hasNegativeColor(remove)).toBe(true);
      const getsBefore = apiClient.get.mock.calls.length;

      remove.click();
      await flushPromises();

      expect(String(apiClient.delete.mock.calls[0][0])).toMatch(new RegExp(`/vehicle-t3/noteimage/${images[0].id}$`));
      expect(apiClient.delete.mock.calls).toHaveLength(1);
      expect(apiClient.get.mock.calls.length).toBeGreaterThan(getsBefore);
      expect(pageText()).not.toContain(images[0].date);
      expect(window.location.href).toBe(href);
    });

    it("Close an expanded note image without deleting", async () => {
      const parentId = 3602;
      const images = pair("note", parentId);
      await mountDetails({ type: "note", parentId, images });
      await expand(images[0].date);
      [...dialog().querySelectorAll("button, [aria-label]")]
        .find((node) => (node.getAttribute("aria-label") || node.textContent.trim()) === "X")
        .click();
      await flushPromises();

      expect(dialog()).toBeNull();
      expect(apiClient.delete).not.toHaveBeenCalled();
    });
  });

  describe("US-11.7: See VehicleImage on Request Form", () => {
    it("Selected vehicle shows its images", async () => {
      const parentId = 3701;
      const images = pair("vehicle", parentId);
      await mountDetails({ type: "vehicle", parentId, host: "box", images });
      await expand(images[0].date);
      expect(dialog().textContent).toContain(images[0].date);
      await pressControl(">");
      expect(dialog().textContent).toContain(images[1].date);
      await pressControl("<");
      expect(dialog().textContent).toContain(images[0].date);
    });
  });

  describe("US-11.8: See AreaImage on Area listings", () => {
    it("Press the area image tooltip", async () => {
      const parentId = 3801;
      const images = pair("area", parentId);
      await mountDetails({ type: "area", parentId, host: "box", images });
      await expand(images[0].date);

      expect(dialog().textContent).toContain(images[0].date);
      await pressControl("<");
      expect(dialog().textContent).toContain(images[0].date);
      await pressControl(">");
      expect(dialog().textContent).toContain(images[1].date);
      await pressControl(">");
      expect(dialog().textContent).toContain(images[1].date);
    });
  });

  describe("US-11.10: Delete AreaImage on Area listings", () => {
    it("Delete one area image", async () => {
      const parentId = 30101;
      const images = pair("area", parentId);
      const href = window.location.href;
      apiClient.get.mockResolvedValue({ status: 200, data: [] });
      await mountDetails({ type: "area", parentId, images });
      const remove = controlNamed("X");
      expect(hasNegativeColor(remove)).toBe(true);
      const getsBefore = apiClient.get.mock.calls.length;

      remove.click();
      await flushPromises();

      expect(String(apiClient.delete.mock.calls[0][0])).toMatch(new RegExp(`/vehicle-t3/areaimage/${images[0].id}$`));
      expect(apiClient.get.mock.calls.length).toBeGreaterThan(getsBefore);
      expect(pageText()).not.toContain(images[0].date);
      expect(window.location.href).toBe(href);
    });

    it("Close an expanded area image", async () => {
      const parentId = 30102;
      const images = pair("area", parentId);
      await mountDetails({ type: "area", parentId, images });
      await expand(images[0].date);
      await pressOutsideDialog();
      expect(dialog()).toBeNull();
      expect(apiClient.delete).not.toHaveBeenCalled();

      await expand(images[0].date);
      [...dialog().querySelectorAll("button, [aria-label]")]
        .find((node) => (node.getAttribute("aria-label") || node.textContent.trim()) === "X")
        .click();
      await flushPromises();
      expect(dialog()).toBeNull();
      expect(apiClient.delete).not.toHaveBeenCalled();
    });
  });

  describe("US-11.11: See AreaImage on Request Form", () => {
    it("Selected area shows its images", async () => {
      const parentId = 31101;
      const images = pair("area", parentId);
      await mountDetails({ type: "area", parentId, host: "box", images });
      await expand(images[0].date);
      expect(dialog().textContent).toContain(images[0].date);
      await pressControl(">");
      expect(dialog().textContent).toContain(images[1].date);
      await pressControl("<");
      expect(dialog().textContent).toContain(images[0].date);
    });
  });
});
