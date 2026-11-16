/**
 * Feature 11 — Images CRUD
 * Spec: features/feature-11-images-crud.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ImagesBox from "../src/components/ImagesBox.vue";
import apiClient from "../src/services/services.js";
import {
  controlNamed,
  controlsNamed,
  dialog,
  imageRecord,
  mountImage,
  pageText,
  pressControl,
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

const boxTemplate = `<ImageUnderTest :type="type" :parent-id="parentId" />`;

let activeWrapper;

function pair(type, parentId) {
  return [
    imageRecord(type, parentId, { id: parentId + 1, date: "2026-05-02" }),
    imageRecord(type, parentId, { id: parentId + 2, date: "2026-01-09" }),
  ];
}

async function mountBox(type, parentId) {
  signIn("user");
  activeWrapper = await mountImage(ImagesBox, {
    props: { type, parentId },
    template: boxTemplate,
  });
  return activeWrapper;
}

async function pressEveryControl() {
  const names = new Set(controlsNamed("X").concat(controlsNamed("<"), controlsNamed(">"), controlsNamed("Image Content")).map((node) => node));

  for (const node of document.querySelectorAll("button, [role='button'], img, [aria-label]")) {
    names.add(node);
  }

  for (const node of names) {
    node.click();
    await flushPromises();
  }
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

  describe("US-11.7: See VehicleImage on Request Form", () => {
    it("Selected vehicle shows its images", async () => {
      const parentId = 5701;
      const images = pair("vehicle", parentId);
      apiClient.get.mockResolvedValue({ status: 200, data: images });
      await mountBox("vehicle", parentId);

      expect(pageText()).toContain("Image(s)");
      expect(pageText()).toContain(images[0].date);
      expect(String(apiClient.get.mock.calls.at(-1)[0])).toMatch(new RegExp(`/vehicle-t3/vehicleimage/vehicle/${parentId}$`));

      controlNamed("Image Content").click();
      await flushPromises();
      expect(dialog().textContent).toContain(images[0].date);
      await pressControl(">");
      expect(dialog().textContent).toContain(images[1].date);
      await pressControl("<");
      expect(dialog().textContent).toContain(images[0].date);
    });

    it("Request form does not delete vehicle images", async () => {
      const parentId = 5702;
      apiClient.get.mockResolvedValue({ status: 200, data: pair("vehicle", parentId) });
      await mountBox("vehicle", parentId);
      controlNamed("Image Content").click();
      await flushPromises();
      await pressEveryControl();

      expect(apiClient.delete).not.toHaveBeenCalled();
    });
  });

  describe("US-11.11: See AreaImage on Request Form", () => {
    it("Selected area shows its images", async () => {
      const parentId = 51101;
      const images = pair("area", parentId);
      apiClient.get.mockResolvedValue({ status: 200, data: images });
      await mountBox("area", parentId);

      expect(pageText()).toContain("Image(s)");
      expect(pageText()).toContain(images[0].date);
      expect(String(apiClient.get.mock.calls.at(-1)[0])).toMatch(new RegExp(`/vehicle-t3/areaimage/area/${parentId}$`));

      controlNamed("Image Content").click();
      await flushPromises();
      expect(dialog().textContent).toContain(images[0].date);
      await pressControl(">");
      expect(dialog().textContent).toContain(images[1].date);
    });

    it("Request form does not delete area images", async () => {
      const parentId = 51102;
      apiClient.get.mockResolvedValue({ status: 200, data: pair("area", parentId) });
      await mountBox("area", parentId);
      controlNamed("Image Content").click();
      await flushPromises();
      await pressEveryControl();

      expect(apiClient.delete).not.toHaveBeenCalled();
    });
  });
});
