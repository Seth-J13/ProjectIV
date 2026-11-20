<script>
export default { name: "ImagesContainer" };
</script>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import apiClient from "../services/services.js";
import ImagesDetails from "./ImagesDetails.vue";
import { fileToPngBase64, isAllowedImage, isTooLarge } from "../utils/imageFile.js";

const props = defineProps({
  type: { type: String, required: true },
  parentId: { type: [Number, String], default: null },
  heading: { type: String, default: "" },
  modelValue: { type: Array, default: undefined },
  allowDelete: { type: Boolean, default: true },
  allowAdd: { type: Boolean, default: true },
  readonly: { type: Boolean, default: false },
  defer: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);
const canAdd = computed(() => props.allowAdd && !props.readonly);

const images = ref([]);
const loading = ref(false);
const choicesOpen = ref(false);
const cloudOpen = ref(false);
const uploading = ref(false);
const errorMessage = ref("");
const fileInput = ref(null);
const cloudDialog = ref(null);
const root = ref(null);
const removedIds = ref([]);
const driveToken = ref("");
const driveFiles = ref(null);
const drivePageToken = ref("");
const selectedDriveIds = ref([]);
const driveLoading = ref(false);

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

function heldLocally() {
  return props.parentId == null || props.parentId === "";
}

function localRecord(image) {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return {
    id: `local-${now.getTime()}-${images.value.length}`,
    image,
    date: `${now.getFullYear()}-${month}-${day}`,
    local: true,
  };
}

function publish(next) {
  if (props.defer) {
    const nextIds = new Set(next.map((item) => item.id));

    for (const item of images.value) {
      if (!item.local && item.id != null && !nextIds.has(item.id) && !removedIds.value.includes(item.id)) {
        removedIds.value.push(item.id);
      }
    }
  }

  images.value = next;
  emit("update:modelValue", next);
}

async function commit(parentId) {
  const id = parentId ?? props.parentId;

  if (id == null || id === "") {
    return;
  }

  const pendingDeletes = [...removedIds.value];

  for (const imageId of pendingDeletes) {
    await apiClient.delete(`/vehicle-t3/${props.type}image/${imageId}`);
    removedIds.value = removedIds.value.filter((item) => item !== imageId);
  }

  for (const item of images.value.filter((entry) => entry.local)) {
    await apiClient.post(`/vehicle-t3/${props.type}image/`, {
      image: item.image,
      [`${props.type}_id`]: id,
    });
    item.local = false;
  }
}

defineExpose({ commit });

async function load() {
  if (heldLocally()) {
    images.value = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    return;
  }

  loading.value = true;

  try {
    const response = await apiClient.get(`/vehicle-t3/${props.type}image/${props.type}/${props.parentId}`);
    images.value = Array.isArray(response?.data) ? response.data : [];
  } catch {
    images.value = [];
  } finally {
    loading.value = false;
  }
}

function openChoices(event) {
  if (!canAdd.value || event?.target?.closest?.("img, button")) {
    return;
  }

  choicesOpen.value = true;
}

function loadGoogleIdentity() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }

      reject(new Error("Google sign-in failed."));
    };
    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT}"]`);

    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("Google sign-in failed.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error("Google sign-in failed."));
    document.head.appendChild(script);
  });
}

function openCloud() {
  errorMessage.value = "";
  cloudOpen.value = true;
  loadGoogleIdentity().catch(() => {});
}

function browseGoogleDrive() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const oauth2 = window.google?.accounts?.oauth2;

  if (!clientId || typeof oauth2?.initTokenClient !== "function") {
    errorMessage.value = "Google sign-in is still loading. Press Google Drive again.";
    loadGoogleIdentity().catch(() => {
      errorMessage.value = "Google sign-in failed.";
    });
    return;
  }

  errorMessage.value = "";
  const client = oauth2.initTokenClient({
    client_id: clientId,
    scope: DRIVE_SCOPE,
    callback: (tokenResponse) => {
      if (!tokenResponse?.access_token) {
        errorMessage.value = "Google sign-in failed.";
        return;
      }

      driveToken.value = tokenResponse.access_token;
      loadDriveFiles("");
    },
    error_callback: () => {
      errorMessage.value = "Google sign-in failed.";
    },
  });
  client.requestAccessToken();
}

async function loadDriveFiles(pageToken) {
  driveLoading.value = true;
  errorMessage.value = "";

  try {
    const query = [
      "mimeType='image/png'",
      "mimeType='image/apng'",
      "mimeType='image/jpeg'",
      "mimeType='image/jpg'",
      "mimeType='image/tiff'",
      "mimeType='image/tif'",
      "mimeType='image/avif'",
      "mimeType='image/webp'",
      "mimeType='image/bmp'",
      "mimeType='image/x-ms-bmp'",
    ].join(" or ");
    const params = new URLSearchParams({
      q: `(${query}) and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType,size)",
      pageSize: "50",
      orderBy: "modifiedTime desc",
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const listed = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${driveToken.value}` },
    });
    const body = await listed.json();

    if (!listed.ok) {
      throw new Error(body?.error?.message || "Could not read Google Drive.");
    }

    const files = Array.isArray(body.files) ? body.files : [];
    driveFiles.value = pageToken ? [...(driveFiles.value ?? []), ...files] : files;
    drivePageToken.value = body.nextPageToken || "";
    if (!pageToken) {
      selectedDriveIds.value = [];
    }
  } catch (error) {
    errorMessage.value = error.message || "Could not read Google Drive.";
  } finally {
    driveLoading.value = false;
  }
}

function toggleDriveFile(id) {
  selectedDriveIds.value = selectedDriveIds.value.includes(id)
    ? selectedDriveIds.value.filter((item) => item !== id)
    : [...selectedDriveIds.value, id];
}

async function addDriveFiles() {
  const chosen = (driveFiles.value ?? []).filter((file) => selectedDriveIds.value.includes(file.id));

  if (!chosen.length || !driveToken.value) {
    return;
  }

  uploading.value = true;
  errorMessage.value = "";

  try {
    const files = [];

    for (const item of chosen) {
      const downloaded = await fetch(`https://www.googleapis.com/drive/v3/files/${item.id}?alt=media`, {
        headers: { Authorization: `Bearer ${driveToken.value}` },
      });

      if (!downloaded.ok) {
        throw new Error("Could not download that Google Drive image.");
      }

      const blob = await downloaded.blob();
      files.push(new File([blob], item.name || "image", { type: item.mimeType || blob.type }));
    }

    uploading.value = false;
    await acceptFiles(files);
  } catch (error) {
    errorMessage.value = error.message || "Could not download that Google Drive image.";
    uploading.value = false;
  }
}

function emphasizeCloud() {
  cloudDialog.value?.focus();
}

function pickComputer() {
  errorMessage.value = "";
  choicesOpen.value = true;
  fileInput.value?.click();
}

async function acceptFiles(fileList) {
  if (!canAdd.value) {
    return;
  }

  const files = [...(fileList ?? [])];

  if (!files.length) {
    return;
  }

  const invalid = files.find((file) => isTooLarge(file) || !isAllowedImage(file));

  if (invalid) {
    errorMessage.value = isTooLarge(invalid)
      ? "Images must be 25 megabytes or smaller."
      : "Use a png, jpg, tiff, avif, webp, or bmp image.";
    choicesOpen.value = true;
    return;
  }

  uploading.value = true;
  errorMessage.value = "";

  try {
    if (heldLocally() || props.defer) {
      const next = [...images.value];

      for (const file of files) {
        next.push(localRecord(await fileToPngBase64(file)));
      }

      publish(next);
    } else {
      for (const file of files) {
        const image = await fileToPngBase64(file);
        await apiClient.post(`/vehicle-t3/${props.type}image/`, {
          image,
          [`${props.type}_id`]: props.parentId,
        });
      }

      await load();
    }

    cloudOpen.value = false;
    choicesOpen.value = false;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Could not upload the image.";
  } finally {
    uploading.value = false;
  }
}

function onContainerDragOver(event) {
  if (canAdd.value) {
    event.preventDefault();
  }
}

function onDrop(event) {
  if (!canAdd.value) {
    return;
  }

  event.preventDefault();
  acceptFiles(event.dataTransfer?.files);
}

function isDocumentTarget(event) {
  const zone = root.value;
  return Boolean(zone && event.target === document.documentElement && event.target.contains(zone));
}

function onDocumentClick(event) {
  if (canAdd.value && isDocumentTarget(event)) {
    openChoices(event);
  }
}

function onDocumentDragOver(event) {
  if (canAdd.value && isDocumentTarget(event)) {
    event.preventDefault();
  }
}

function onDocumentDrop(event) {
  if (canAdd.value && isDocumentTarget(event)) {
    onDrop(event);
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (heldLocally() && Array.isArray(value)) {
      images.value = [...value];
    }
  }
);

onMounted(() => {
  load();
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("dragover", onDocumentDragOver);
  document.addEventListener("drop", onDocumentDrop);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("dragover", onDocumentDragOver);
  document.removeEventListener("drop", onDocumentDrop);
});
</script>

<template>
  <section
    ref="root"
    class="images-container oc-cta"
    @click="openChoices"
    @dragover="onContainerDragOver"
    @drop="onDrop"
  >
    <h2 v-if="heading" class="text-center">{{ heading }}</h2>
    <p v-if="canAdd" class="text-center">Drop or Upload Image Here</p>
    <v-progress-linear v-if="loading || uploading" indeterminate color="primary" />
    <v-alert v-if="errorMessage" type="error" class="mb-3">{{ errorMessage }}</v-alert>
    <div v-if="canAdd && choicesOpen" class="image-choices">
      <v-btn color="primary" variant="elevated" class="oc-cta" type="button" @click.stop="openCloud">From Cloud</v-btn>
      <v-btn color="primary" variant="elevated" class="oc-cta" type="button" @click.stop="pickComputer">From Computer</v-btn>
    </div>
    <input v-if="canAdd" ref="fileInput" type="file" multiple accept="image/*" hidden @change="acceptFiles($event.target.files)" />
    <ImagesDetails
      :type="type"
      :parent-id="parentId"
      host="container"
      :allow-delete="allowDelete && canAdd"
      :defer="defer"
      :images="images"
      @update:images="publish"
    />

    <div
      v-if="canAdd && cloudOpen"
      ref="cloudDialog"
      class="cloud-dialog"
      role="dialog"
      tabindex="-1"
      @dragover.prevent
      @drop.stop.prevent="acceptFiles($event.dataTransfer?.files)"
    >
      <div class="v-overlay__scrim" @click.stop="emphasizeCloud"></div>
      <v-card class="cloud-dialog-card" rounded="lg">
        <v-btn class="dialog-x" color="secondary" variant="text" type="button" aria-label="X" @click.stop="cloudOpen = false">X</v-btn>
        <div class="cloud-actions">
          <v-btn color="primary" variant="elevated" class="oc-cta" type="button" @click.stop="browseGoogleDrive">Google Drive</v-btn>
        </div>
        <v-progress-linear v-if="uploading || driveLoading" indeterminate color="primary" />
        <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>
        <div v-if="driveFiles" class="drive-browser">
          <p v-if="!driveFiles.length" class="text-center">This Google Drive account has no images.</p>
          <div v-else class="drive-files">
            <button
              v-for="file in driveFiles"
              :key="file.id"
              type="button"
              class="drive-file"
              :aria-pressed="selectedDriveIds.includes(file.id)"
              @click.stop="toggleDriveFile(file.id)"
            >
              {{ file.name }}
            </button>
          </div>
          <v-btn
            v-if="driveFiles.length"
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            :disabled="!selectedDriveIds.length"
            @click.stop="addDriveFiles"
          >
            Add images
          </v-btn>
          <v-btn
            v-if="drivePageToken"
            color="secondary"
            variant="text"
            type="button"
            @click.stop="loadDriveFiles(drivePageToken)"
          >
            More
          </v-btn>
        </div>
      </v-card>
    </div>
  </section>
</template>

<style scoped>
.images-container {
  background: rgb(var(--v-theme-surface-variant));
  border: 1px dashed rgb(var(--v-theme-outline));
  border-radius: 8px;
  padding: 16px;
}

.image-choices,
.cloud-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.cloud-dialog {
  position: fixed;
  inset: 0;
  z-index: 2800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cloud-dialog-card {
  position: relative;
  z-index: 1;
  width: min(480px, calc(100% - 32px));
  padding: 16px;
}

.dialog-x {
  position: absolute;
  top: 4px;
  right: 4px;
}

.drive-browser {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.drive-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.drive-file {
  text-align: left;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgb(var(--v-theme-outline));
  background: transparent;
  color: inherit;
}

.drive-file[aria-pressed="true"] {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}
</style>
