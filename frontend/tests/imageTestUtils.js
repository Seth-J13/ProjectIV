import { defineComponent } from "vue";
import { flushPromises } from "@vue/test-utils";
import { mountWithPlugins } from "./testUtils.js";

export const TEN_MB = 10 * 1024 * 1024;
export const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

let largeBmpBytes;
let oversizedBytes;

export function signIn(role, userId = 4) {
  localStorage.setItem(
    "user",
    JSON.stringify({
      userId,
      role,
      token: `${role}-token`,
      email: `${role}@example.com`,
    }),
  );
}

export function imageRecord(type, parentId, { id, date, image = `data:image/png;base64,${TINY_PNG_BASE64}` } = {}) {
  return {
    id,
    image,
    date,
    [`${type}_id`]: parentId,
  };
}

export function bmpBytes(width, height) {
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelSize = rowSize * height;
  const bytes = new Uint8Array(54 + pixelSize);
  bytes[0] = 0x42;
  bytes[1] = 0x4d;
  writeUint32(bytes, 2, bytes.length);
  writeUint32(bytes, 10, 54);
  writeUint32(bytes, 14, 40);
  writeInt32(bytes, 18, width);
  writeInt32(bytes, 22, height);
  bytes[26] = 1;
  bytes[28] = 24;
  writeUint32(bytes, 34, pixelSize);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = 54 + y * rowSize + x * 3;
      bytes[offset] = 20;
      bytes[offset + 1] = 80;
      bytes[offset + 2] = 140;
    }
  }

  return bytes;
}

export function largeImageBytes() {
  if (!largeBmpBytes) {
    largeBmpBytes = bmpBytes(2000, 1750);
  }

  return largeBmpBytes;
}

export function oversizedImageBytes() {
  if (!oversizedBytes) {
    oversizedBytes = new Uint8Array(25 * 1024 * 1024 + 1);
    oversizedBytes[0] = 0x89;
  }

  return oversizedBytes;
}

export function tinyPngBytes() {
  const binary = atob(TINY_PNG_BASE64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function asFile(bytes, name, type) {
  return new File([bytes], name, { type });
}

export async function mountImage(component, { props = {}, template }) {
  const Host = defineComponent({
    components: { ImageUnderTest: component },
    data: () => ({ ...props }),
    template,
  });
  const { wrapper } = await mountWithPlugins(Host, { attachTo: document.body });
  await flushPromises();
  return wrapper;
}

export function pageText() {
  return document.body.innerText;
}

export function controlsNamed(name) {
  return [...document.querySelectorAll("button, [role='button'], img, [aria-label]")].filter((node) => {
    const label = node.getAttribute("aria-label") || node.textContent.trim();
    return label === name;
  });
}

export function controlNamed(name) {
  const match = controlsNamed(name)[0];

  if (!match) {
    throw new Error(`No control labeled ${name}`);
  }

  return match;
}

export async function pressControl(name) {
  controlNamed(name).click();
  await flushPromises();
}

export function dialog() {
  return document.querySelector("[role='dialog']");
}

export async function pressOutsideDialog() {
  document.querySelector(".v-overlay__scrim")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  document.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
  await flushPromises();
}

export function dropFiles(target, files) {
  const dataTransfer = createDataTransfer(files);

  for (const type of ["dragenter", "dragover", "drop"]) {
    const event = typeof DragEvent === "function" ? new DragEvent(type, { bubbles: true, cancelable: true }) : new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", { value: dataTransfer });
    target.dispatchEvent(event);
  }
}

export function chooseFiles(input, files) {
  const transfer = new DataTransfer();

  for (const file of files) {
    transfer.items.add(file);
  }

  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function parentIdFrom(body, type) {
  const key = `${type}_id`;

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return body.get(key);
  }

  return body?.[key];
}

export async function payloadBytes(body) {
  const value = imageValue(body);

  if (value == null) {
    return new Uint8Array();
  }

  if (value instanceof Blob) {
    return new Uint8Array(await value.arrayBuffer());
  }

  if (value instanceof Uint8Array) {
    return value;
  }

  if (typeof value === "string") {
    const dataUrl = value.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
    const payload = dataUrl ? dataUrl[1] : value;
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  }

  return new Uint8Array();
}

export function isPng(bytes) {
  return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

export function hasNegativeColor(element) {
  const style = getComputedStyle(element);
  return /invert/.test(style.filter) || /invert/.test(element.style.filter) || /difference/.test(style.mixBlendMode);
}

export function hasThickWhiteBorder(element) {
  const style = getComputedStyle(element);
  const width = Number.parseFloat(style.borderTopWidth || element.style.borderTopWidth || "0");
  const color = `${style.borderTopColor} ${element.style.borderColor} ${element.style.border}`;

  return element.classList.contains("oc-cta") && width >= 3 && /white|#fff|rgb\(255,\s*255,\s*255\)/i.test(color);
}

export function separatedByAbout25px(root = document.body) {
  const elements = [root, ...root.querySelectorAll("*")];

  return elements.some((element) => {
    const style = getComputedStyle(element);
    return [style.gap, style.columnGap, style.rowGap, element.style.gap].some((value) => /25px/.test(value || ""));
  });
}

export function scrollsInside(root = document.body) {
  return [...root.querySelectorAll("*")].some((element) => {
    const style = getComputedStyle(element);
    return /auto|scroll/.test(style.overflowY) || /auto|scroll/.test(element.style.overflowY);
  });
}

export function resetImageApi(apiClient) {
  apiClient.get.mockReset();
  apiClient.post.mockReset();
  apiClient.put.mockReset();
  apiClient.delete.mockReset();
  apiClient.get.mockResolvedValue({ status: 200, data: [] });
  apiClient.post.mockResolvedValue({ status: 201, data: { message: "New image created with id=1" } });
  apiClient.delete.mockResolvedValue({ status: 204, data: "" });
}

function imageValue(body) {
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const values = [...body.values()];
    return values.find((value) => value instanceof Blob) ?? values.find((value) => typeof value === "string" && value.length > 64);
  }

  return body?.image ?? body?.file ?? null;
}

function createDataTransfer(files) {
  if (typeof DataTransfer === "function") {
    const transfer = new DataTransfer();

    for (const file of files) {
      transfer.items.add(file);
    }

    return transfer;
  }

  return {
    files,
    types: ["Files"],
    items: files.map((file) => ({ kind: "file", getAsFile: () => file })),
  };
}

function writeUint32(bytes, offset, value) {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >> 8) & 0xff;
  bytes[offset + 2] = (value >> 16) & 0xff;
  bytes[offset + 3] = (value >> 24) & 0xff;
}

function writeInt32(bytes, offset, value) {
  writeUint32(bytes, offset, value >>> 0);
}
