/**
 * Feature 11 — Images CRUD
 * Spec: features/feature-11-images-crud.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ImagesContainer from "../src/components/ImagesContainer.vue";
import apiClient from "../src/services/services.js";
import {
  TEN_MB,
  asFile,
  chooseFiles,
  tinyPngBytes,
  controlNamed,
  dialog,
  dropFiles,
  imageRecord,
  isPng,
  largeImageBytes,
  mountImage,
  oversizedImageBytes,
  pageText,
  parentIdFrom,
  payloadBytes,
  pressControl,
  pressOutsideDialog,
  resetImageApi,
  scrollsInside,
  separatedByAbout25px,
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

const containerTemplate = `<ImageUnderTest :type="type" :parent-id="parentId" />`;

let activeWrapper;

async function mountContainer(type, parentId, role = "maintenance") {
  signIn(role);
  activeWrapper = await mountImage(ImagesContainer, {
    props: { type, parentId },
    template: containerTemplate,
  });
  return activeWrapper;
}

function dropTarget() {
  return [...document.querySelectorAll("*")].find((element) => element.textContent.includes("Drop or Upload Image Here"));
}

async function dragValid(type, parentId) {
  const stored = imageRecord(type, parentId, { id: parentId + 11, date: "2026-06-18" });
  const readsBefore = apiClient.get.mock.calls.length;
  apiClient.get.mockResolvedValue({ status: 200, data: [stored] });
  apiClient.post.mockResolvedValue({
    status: 201,
    data: { message: `New image created with id=${stored.id}` },
  });
  const href = window.location.href;
  const source = asFile(largeImageBytes(), "lot.bmp", "image/bmp");
  dropFiles(dropTarget(), [source]);
  await flushPromises();

  expect(apiClient.post).toHaveBeenCalled();
  const [url, body] = apiClient.post.mock.calls.at(-1);
  expect(String(url)).toMatch(new RegExp(`/vehicle-t3/${type}image/?$`));
  expect(String(parentIdFrom(body, type))).toBe(String(parentId));
  const storedBytes = await payloadBytes(body);
  expect(isPng(storedBytes)).toBe(true);
  expect(storedBytes.length).toBeLessThan(TEN_MB);
  expect(storedBytes.length).toBeLessThan(source.size);
  expect(apiClient.get.mock.calls.length).toBeGreaterThan(readsBefore);
  expect(pageText()).toContain(stored.date);
  expect(window.location.href).toBe(href);
  expect(activeWrapper.findAllComponents({ name: "VAlert" }).some((alert) => alert.props("type") === "error")).toBe(false);
}

async function openChoices() {
  dropTarget().click();
  await flushPromises();
}

async function rejectBadFiles() {
  await openChoices();
  await pressControl("From Computer");
  const input = document.querySelector("input[type='file']");
  const postsBefore = apiClient.post.mock.calls.length;

  chooseFiles(input, [asFile(new Uint8Array([1, 2, 3]), "notes.txt", "text/plain")]);
  await flushPromises();
  expect(activeWrapper.findAllComponents({ name: "VAlert" }).some((alert) => alert.props("type") === "error")).toBe(true);
  expect(apiClient.post.mock.calls.length).toBe(postsBefore);
  expect(dialog() || pageText().includes("From Computer")).toBeTruthy();

  chooseFiles(input, [asFile(oversizedImageBytes(), "huge.png", "image/png")]);
  await flushPromises();
  expect(activeWrapper.findAllComponents({ name: "VAlert" }).some((alert) => alert.props("type") === "error")).toBe(true);
  expect(apiClient.post.mock.calls.length).toBe(postsBefore);
  expect(pageText()).toContain("From Computer");
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

  describe("US-11.2: Create VehicleImage on Vehicle listings", () => {
    it("Drag a valid image onto Vehicle Images", async () => {
      const parentId = 4201;
      await mountContainer("vehicle", parentId);
      await dragValid("vehicle", parentId);
    });

    it("Press inside the Vehicle Images container", async () => {
      const parentId = 4202;
      apiClient.get.mockResolvedValue({
        status: 200,
        data: [imageRecord("vehicle", parentId, { id: 42021, date: "2026-04-04" })],
      });
      await mountContainer("vehicle", parentId);
      await openChoices();

      expect(pageText()).toContain("From Cloud");
      expect(pageText()).toContain("From Computer");
      expect(controlNamed("From Cloud").classList.contains("oc-cta")).toBe(true);
    });

    it("Upload from the cloud", async () => {
      const parentId = 4203;
      let releasePost;
      apiClient.post.mockImplementation(
        () =>
          new Promise((resolve) => {
            releasePost = () =>
              resolve({ status: 201, data: { message: "New image created with id=42031" } });
          }),
      );
      await mountContainer("vehicle", parentId);
      await openChoices();
      await pressControl("From Cloud");

      expect(pageText()).toContain("Google Drive");
      expect(pageText()).toContain("Dropbox");
      expect(pageText()).toContain("OneDrive");
      await pressControl("Google Drive");
      const png = tinyPngBytes();
      const files = [asFile(png, "a.png", "image/png"), asFile(png, "b.png", "image/png")];
      dropFiles(dialog() || dropTarget(), files);
      await flushPromises();

      expect(document.querySelector("[role='progressbar'], .v-progress-linear")).not.toBeNull();
      releasePost();
      await flushPromises();
      expect(apiClient.post.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(apiClient.post.mock.calls.every(([url]) => /\/vehicle-t3\/vehicleimage\/?$/.test(String(url)))).toBe(true);

      const postsBeforeOutside = apiClient.post.mock.calls.length;
      await pressOutsideDialog();
      expect(dialog()).not.toBeNull();
      expect(document.activeElement === dialog() || dialog().contains(document.activeElement)).toBe(true);
      expect(apiClient.post.mock.calls.length).toBe(postsBeforeOutside);

      await pressControl("X");
      expect(dialog()).toBeNull();
    });

    it("Upload from the computer", async () => {
      const parentId = 4204;
      await mountContainer("vehicle", parentId);
      await openChoices();
      await pressControl("From Computer");
      const input = document.querySelector("input[type='file']");
      const png = tinyPngBytes();
      chooseFiles(input, [asFile(png, "one.png", "image/png"), asFile(png, "two.png", "image/png")]);
      await flushPromises();

      expect(apiClient.post).toHaveBeenCalled();
      expect(String(apiClient.post.mock.calls.at(-1)[0])).toMatch(/\/vehicle-t3\/vehicleimage\/?$/);
      const posted = await Promise.all(apiClient.post.mock.calls.map((call) => payloadBytes(call[1])));
      expect(posted.some((bytes) => isPng(bytes))).toBe(true);
    });

    it("Reject an invalid vehicle image", async () => {
      await mountContainer("vehicle", 4205);
      await rejectBadFiles();
    });
  });

  describe("US-11.4: See NoteImage on Note details", () => {
    it("Note form shows its images", async () => {
      const parentId = 4401;
      const images = [
        imageRecord("note", parentId, { id: 44011, date: "2026-07-01" }),
        imageRecord("note", parentId, { id: 44012, date: "2026-07-02" }),
      ];
      apiClient.get.mockResolvedValue({ status: 200, data: images });
      await mountContainer("note", parentId, "user");

      expect(pageText()).toContain("Drop or Upload Image Here");
      expect(pageText()).toContain(images[0].date);
      expect(pageText()).toContain(images[1].date);
      expect(String(apiClient.get.mock.calls.at(-1)[0])).toMatch(new RegExp(`/vehicle-t3/noteimage/note/${parentId}$`));
      expect(separatedByAbout25px(activeWrapper.element)).toBe(true);
      expect(scrollsInside(activeWrapper.element)).toBe(true);
    });

    it("Note has no images", async () => {
      const parentId = 4402;
      apiClient.get.mockRejectedValue({
        response: { status: 404, data: { message: "This note <:noteId> doesn't have any images" } },
      });
      await mountContainer("note", parentId, "user");

      expect(pageText()).toContain("Drop or Upload Image Here");
      expect(String(apiClient.get.mock.calls.at(-1)[0])).toMatch(new RegExp(`/vehicle-t3/noteimage/note/${parentId}$`));
    });
  });

  describe("US-11.5: Create NoteImage on Note details", () => {
    it("Drag a valid image onto a note", async () => {
      const parentId = 4501;
      await mountContainer("note", parentId, "user");
      await dragValid("note", parentId);
    });

    it("Press inside the note image container", async () => {
      const parentId = 4502;
      apiClient.get.mockResolvedValue({
        status: 200,
        data: [imageRecord("note", parentId, { id: 45021, date: "2026-08-08" })],
      });
      await mountContainer("note", parentId, "user");
      await openChoices();

      expect(pageText()).toContain("From Cloud");
      expect(pageText()).toContain("From Computer");
    });

    it("Reject an invalid note image", async () => {
      await mountContainer("note", 4503, "user");
      await rejectBadFiles();
    });
  });

  describe("US-11.9: Create AreaImage on Area listings", () => {
    it("Drag a valid image onto an area", async () => {
      const parentId = 4901;
      await mountContainer("area", parentId);
      await dragValid("area", parentId);
    });

    it("Press inside the area image container", async () => {
      const parentId = 4902;
      apiClient.get.mockResolvedValue({
        status: 200,
        data: [imageRecord("area", parentId, { id: 49021, date: "2026-09-09" })],
      });
      await mountContainer("area", parentId);
      await openChoices();

      expect(pageText()).toContain("From Cloud");
      expect(pageText()).toContain("From Computer");
    });

    it("Reject an invalid area image", async () => {
      await mountContainer("area", 4903);
      await rejectBadFiles();
    });
  });
});
