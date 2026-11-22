import { deflate } from "pako";

const MAX_UPLOAD = 25 * 1024 * 1024;
const PNG = [0x89, 0x50, 0x4e, 0x47];

export function isAllowedImage(file) {
  const name = String(file?.name ?? "").toLowerCase();
  const type = String(file?.type ?? "").toLowerCase();
  return (
    /\.(png|apng|jpe?g|tiff?|avif|webp|bmp)$/.test(name) ||
    /(png|jpeg|jpg|tiff|tif|avif|webp|bmp)/.test(type)
  );
}

export function isTooLarge(file) {
  return Number(file?.size ?? 0) > MAX_UPLOAD;
}

export async function fileToPngBase64(file) {
  const bytes = await readFileBytes(file);
  const png = await toPngBytes(file, bytes);
  let binary = "";

  for (let index = 0; index < png.length; index += 1) {
    binary += String.fromCharCode(png[index]);
  }

  return btoa(binary);
}

function bytesFromFile(file) {
  for (const symbol of Object.getOwnPropertySymbols(file)) {
    const buffer = file[symbol]?._buffer;

    if (buffer) {
      return new Uint8Array(buffer);
    }
  }

  return null;
}

function readFileBytes(file) {
  const buffered = bytesFromFile(file);

  if (buffered) {
    return Promise.resolve(buffered);
  }

  if (typeof file.arrayBuffer === "function") {
    return file.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }

  if (typeof FileReader !== "undefined") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  return new Response(file).arrayBuffer().then((buffer) => new Uint8Array(buffer));
}

async function toPngBytes(file, bytes) {
  const drawn = await drawPng(file, bytes);

  if (drawn && isPng(drawn) && drawn.length < bytes.length) {
    return drawn;
  }

  if (isBmp(bytes)) {
    return bmpToPng(bytes);
  }

  if (isPng(bytes)) {
    return bytes;
  }

  return drawn && isPng(drawn) ? drawn : bytes;
}

async function drawPng(file, bytes) {
  if (typeof createImageBitmap !== "function") {
    return null;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const scale = bytes.length > 10 * 1024 * 1024 ? Math.min(1, 1600 / bitmap.width) : 1;
    canvas.width = Math.max(1, Math.floor(bitmap.width * scale));
    canvas.height = Math.max(1, Math.floor(bitmap.height * scale));
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

    if (!blob) {
      return null;
    }

    return new Uint8Array(await blob.arrayBuffer());
  } catch {
    return null;
  }
}

function isPng(bytes) {
  return PNG.every((byte, index) => bytes[index] === byte);
}

function isBmp(bytes) {
  return bytes[0] === 0x42 && bytes[1] === 0x4d;
}

function bmpToPng(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const fullWidth = view.getInt32(18, true);
  const heightValue = view.getInt32(22, true);
  const fullHeight = Math.abs(heightValue);
  const step = Math.max(1, Math.ceil(Math.max(fullWidth, fullHeight) / 320));
  const width = Math.max(1, Math.ceil(fullWidth / step));
  const height = Math.max(1, Math.ceil(fullHeight / step));
  const rowSize = Math.ceil((fullWidth * 3) / 4) * 4;
  const raw = new Uint8Array(height * (1 + width * 3));

  for (let y = 0; y < height; y += 1) {
    const sourceY = heightValue > 0 ? fullHeight - 1 - y * step : y * step;
    const dest = y * (1 + width * 3);
    raw[dest] = 0;

    for (let x = 0; x < width; x += 1) {
      const source = 54 + sourceY * rowSize + x * step * 3;
      raw[dest + 1 + x * 3] = bytes[source + 2];
      raw[dest + 2 + x * 3] = bytes[source + 1];
      raw[dest + 3 + x * 3] = bytes[source];
    }
  }

  return pngFromRgb(width, height, deflate(raw));
}

function pngFromRgb(width, height, compressed) {
  const signature = new Uint8Array(PNG);
  const ihdr = new Uint8Array(13);
  const header = new DataView(ihdr.buffer);
  header.setUint32(0, width);
  header.setUint32(4, height);
  ihdr[8] = 8;
  ihdr[9] = 2;

  const chunks = [chunk("IHDR", ihdr), chunk("IDAT", compressed), chunk("IEND", new Uint8Array())];
  const size = signature.length + chunks.reduce((sum, part) => sum + part.length, 0);
  const png = new Uint8Array(size);
  png.set(signature, 0);
  let offset = signature.length;

  for (const part of chunks) {
    png.set(part, offset);
    offset += part.length;
  }

  return png;
}

function chunk(name, data) {
  const bytes = new Uint8Array(12 + data.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, data.length);
  bytes[4] = name.charCodeAt(0);
  bytes[5] = name.charCodeAt(1);
  bytes[6] = name.charCodeAt(2);
  bytes[7] = name.charCodeAt(3);
  bytes.set(data, 8);
  const crc = crc32(bytes.subarray(4, 8 + data.length));
  view.setUint32(8 + data.length, crc);
  return bytes;
}

function crc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (~crc) >>> 0;
}
