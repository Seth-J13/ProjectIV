/**
 * Feature 11 — Images CRUD
 * Spec: features/feature-11-images-crud.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ImagesTooltip from "../src/components/ImagesTooltip.vue";
import apiClient from "../src/services/services.js";
import {
  dialog,
  hasThickWhiteBorder,
  imageRecord,
  mountImage,
  pageText,
  pressControl,
  pressOutsideDialog,
  resetImageApi,
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

const tooltipTemplate = `
  <ImageUnderTest :type="type" :parent-id="parentId">
    <button type="button" class="list-item">Listing</button>
  </ImageUnderTest>
`;

let activeWrapper;

async function mountTooltip(type, parentId) {
  activeWrapper = await mountImage(ImagesTooltip, {
    props: { type, parentId },
    template: tooltipTemplate,
  });
  return activeWrapper;
}

function listImages(type, parentId) {
  return [
    imageRecord(type, parentId, { id: parentId + 1, date: "2026-05-02" }),
    imageRecord(type, parentId, { id: parentId + 2, date: "2026-01-09" }),
  ];
}

async function hoverListing() {
  document.querySelector(".list-item").dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 200));
  await flushPromises();
}

async function finishHover() {
  await new Promise((resolve) => setTimeout(resolve, 900));
  await flushPromises();
}

function tooltipElement(date) {
  return [...document.querySelectorAll(".oc-cta")].find((element) => element.textContent.includes(date));
}

async function movePointer(x, y) {
  const event = new MouseEvent("mousemove", { bubbles: true, clientX: x, clientY: y });
  document.dispatchEvent(event);
  tooltipElement("2026-05-02")?.dispatchEvent(event);
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
    it("Hover a vehicle listing", async () => {
      const parentId = 3101;
      const [first] = listImages("vehicle", parentId);
      signIn("maintenance");
      apiClient.get.mockResolvedValue({ status: 200, data: listImages("vehicle", parentId) });
      await mountTooltip("vehicle", parentId);

      await hoverListing();
      expect(pageText()).not.toContain(first.date);

      await finishHover();
      const tooltip = tooltipElement(first.date);
      expect(tooltip).toBeTruthy();
      expect(hasThickWhiteBorder(tooltip)).toBe(true);
      expect(pageText()).not.toContain("2026-01-09");

      await movePointer(36, 90);
      const left = tooltip.style.left;
      const top = tooltip.style.top;
      await movePointer(180, 12);
      expect(tooltip.style.left).not.toBe(left);
      expect(tooltip.style.top).toBe(top);

      document.querySelector(".list-item").dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      tooltip.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await flushPromises();
      expect(pageText()).toContain(first.date);
    });

    it("Press the vehicle image tooltip", async () => {
      const parentId = 3102;
      const images = listImages("vehicle", parentId);
      signIn("admin");
      apiClient.get.mockResolvedValue({ status: 200, data: images });
      await mountTooltip("vehicle", parentId);
      await hoverListing();
      await finishHover();

      tooltipElement(images[0].date).click();
      await flushPromises();

      expect(String(apiClient.get.mock.calls.at(-1)[0])).toMatch(new RegExp(`/vehicle-t3/vehicleimage/vehicle/${parentId}$`));
      expect(dialog()).not.toBeNull();
      expect(pageText()).toContain(images[0].date);
      expect(pageText()).toContain(images[1].date);
      expect(apiClient.delete).not.toHaveBeenCalled();
    });

    it("Close the vehicle image modal", async () => {
      const parentId = 3103;
      const images = listImages("vehicle", parentId);
      signIn("maintenance");
      apiClient.get.mockResolvedValue({ status: 200, data: images });
      await mountTooltip("vehicle", parentId);
      await hoverListing();
      await finishHover();
      tooltipElement(images[0].date).click();
      await flushPromises();

      await pressOutsideDialog();
      expect(dialog()).toBeNull();
      expect(apiClient.delete).not.toHaveBeenCalled();

      tooltipElement(images[0].date).click();
      await flushPromises();
      const modalX = dialog().querySelector("button, [role='button'], [aria-label]");
      const labeled = [...dialog().querySelectorAll("button, [aria-label]")].find((node) => {
        return (node.getAttribute("aria-label") || node.textContent.trim()) === "X";
      });
      (labeled || modalX).click();
      await flushPromises();
      expect(dialog()).toBeNull();
      expect(apiClient.delete).not.toHaveBeenCalled();
    });
  });

  describe("US-11.8: See AreaImage on Area listings", () => {
    it("Hover an area listing", async () => {
      const parentId = 8101;
      const [first] = listImages("area", parentId);
      signIn("admin");
      apiClient.get.mockResolvedValue({ status: 200, data: listImages("area", parentId) });
      await mountTooltip("area", parentId);

      await hoverListing();
      expect(pageText()).not.toContain(first.date);
      await finishHover();

      const tooltip = tooltipElement(first.date);
      expect(tooltip).toBeTruthy();
      expect(hasThickWhiteBorder(tooltip)).toBe(true);

      await movePointer(24, 70);
      const left = tooltip.style.left;
      const top = tooltip.style.top;
      await movePointer(160, 8);
      expect(tooltip.style.left).not.toBe(left);
      expect(tooltip.style.top).toBe(top);

      document.querySelector(".list-item").dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      tooltip.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await flushPromises();
      expect(pageText()).toContain(first.date);
    });

    it("Press the area image tooltip", async () => {
      const parentId = 8102;
      const images = listImages("area", parentId);
      signIn("maintenance");
      apiClient.get.mockResolvedValue({ status: 200, data: images });
      await mountTooltip("area", parentId);
      await hoverListing();
      await finishHover();
      tooltipElement(images[0].date).click();
      await flushPromises();

      expect(String(apiClient.get.mock.calls.at(-1)[0])).toMatch(new RegExp(`/vehicle-t3/areaimage/area/${parentId}$`));
      expect(dialog()).not.toBeNull();
      expect(pageText()).toContain(images[0].date);
      expect(pageText()).toContain(images[1].date);
    });

    it("Close the area image modal", async () => {
      const parentId = 8103;
      const images = listImages("area", parentId);
      signIn("admin");
      apiClient.get.mockResolvedValue({ status: 200, data: images });
      await mountTooltip("area", parentId);
      await hoverListing();
      await finishHover();
      tooltipElement(images[0].date).click();
      await flushPromises();

      await pressOutsideDialog();
      expect(dialog()).toBeNull();
      expect(apiClient.delete).not.toHaveBeenCalled();

      tooltipElement(images[0].date).click();
      await flushPromises();
      await pressControl("X");
      expect(dialog()).toBeNull();
      expect(apiClient.delete).not.toHaveBeenCalled();
    });
  });
});
