<script>
import Utils from "../config/utils.js";

export default {
  beforeRouteEnter(to, from, next) {
    const user = Utils.getStore("user");

    if (!user) {
      next({ name: "login" });
      return;
    }

    if (user.role !== "admin") {
      next({ name: "landing" });
      return;
    }

    next();
  },
};
</script>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, computed } from "vue";
import areaServices from "../services/areaServices.js";
import ImagesTooltip from "../components/ImagesTooltip.vue";
import ImagesContainer from "../components/ImagesContainer.vue";
import { fileToPngBase64, isAllowedImage, isTooLarge } from "../utils/imageFile.js";

const areas = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const createOpen = ref(false);
const editOpen = ref(false);
const saving = ref(false);
const createDialog = ref(null);
const editDialog = ref(null);
const createError = ref("");
const editError = ref("");

function emptyForm() {
  return {
    id: null,
    name: "",
    noticeEmail: "",
    logo: "",
  };
}

const createForm = ref(emptyForm());
const editForm = ref(emptyForm());
const areaImages = ref(null);
const createImages = ref(null);
const createLogoInput = ref(null);
const editLogoInput = ref(null);
const pendingCreateImages = ref([]);
const detailsDialog = ref(null);
const detailsOpen = ref(false);
const detailsArea = ref(null);
const hoveredAreaId = ref(null);
const hoveredArea = computed(() => areas.value.find((area) => area.id === hoveredAreaId.value) ?? null);
const hoverX = ref(null);
const hoverTop = ref(null);
let hoverHideTimer;

function retainHover() {
  clearTimeout(hoverHideTimer);
}

function releaseHover() {
  clearTimeout(hoverHideTimer);
  hoverHideTimer = setTimeout(() => {
    hoveredAreaId.value = null;
  }, 300);
}

function payloadFrom(source) {
  const body = {
    name: source.name.trim(),
    noticeEmail: source.noticeEmail.trim(),
  };
  const logo = typeof source.logo === "string" ? source.logo.trim() : "";

  if (logo) {
    body.logo = logo;
  }

  return body;
}

function logoSrc(logo) {
  if (!logo) {
    return "";
  }

  return String(logo).startsWith("data:") ? String(logo) : `data:image/png;base64,${logo}`;
}

async function chooseLogo(event, form) {
  const file = event.target.files?.[0];
  event.target.value = "";

  if (!file) {
    return;
  }

  if (isTooLarge(file) || !isAllowedImage(file)) {
    const message = isTooLarge(file)
      ? "Images must be 25 megabytes or smaller."
      : "Use a png, jpg, tiff, avif, webp, or bmp image.";

    if (form === createForm.value) {
      createError.value = message;
    } else {
      editError.value = message;
    }
    return;
  }

  form.logo = await fileToPngBase64(file);
}

function incomplete(source) {
  return !source.name.trim() || !source.noticeEmail.trim();
}

async function loadAreas() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await areaServices.listAreas();
    areas.value = response.data ?? [];
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Unable to load areas.";
    areas.value = [];
  } finally {
    loading.value = false;
  }
}

async function showDialog(dialog) {
  await nextTick();

  if (typeof dialog.value?.showModal === "function" && !dialog.value.open) {
    dialog.value.showModal();
  }
}

async function openCreate() {
  createForm.value = emptyForm();
  pendingCreateImages.value = [];
  createError.value = "";
  errorMessage.value = "";
  createOpen.value = true;
  await showDialog(createDialog);
}

function hoverArea(event, area) {
  retainHover();
  hoveredAreaId.value = area.id;
  hoverX.value = event.clientX;
  hoverTop.value = event.currentTarget.getBoundingClientRect().top;
}

function moveAreaHover(event) {
  hoverX.value = event.clientX;
}

async function openDetails(area) {
  detailsArea.value = area;
  detailsOpen.value = true;
  await showDialog(detailsDialog);
}

function closeDetails() {
  detailsOpen.value = false;

  if (detailsDialog.value?.open) {
    detailsDialog.value.close();
  }
}

function dismissDetailsOnBackdrop(event) {
  if (event.target === detailsDialog.value) {
    closeDetails();
  }
}

async function openArea(area) {
  editForm.value = {
    id: area.id,
    name: area.name,
    noticeEmail: area.noticeEmail,
    logo: area.logo || "",
  };
  editError.value = "";
  errorMessage.value = "";
  editOpen.value = true;
  await showDialog(editDialog);
}

function closeCreate() {
  createOpen.value = false;
  createError.value = "";

  if (createDialog.value?.open) {
    createDialog.value.close();
  }
}

function closeEdit() {
  editOpen.value = false;
  editError.value = "";

  if (editDialog.value?.open) {
    editDialog.value.close();
  }
}

function dismissEditOnBackdrop(event) {
  if (event.target === editDialog.value) {
    closeEdit();
  }
}

async function saveCreate() {
  if (incomplete(createForm.value)) {
    createError.value = "Area is incomplete!";
    return;
  }

  saving.value = true;
  createError.value = "";

  try {
    const response = await areaServices.createArea(payloadFrom(createForm.value));
    await createImages.value?.commit(response.data?.id);
    areas.value = [...areas.value, response.data].sort((left, right) =>
      left.name.localeCompare(right.name)
    );
    closeCreate();
  } catch (error) {
    createError.value = error.response?.data?.message || "Unable to create the area.";
  } finally {
    saving.value = false;
  }
}

async function saveEdit() {
  if (incomplete(editForm.value)) {
    editError.value = "Area is incomplete!";
    return;
  }

  saving.value = true;
  editError.value = "";

  try {
    const response = await areaServices.updateArea(editForm.value.id, payloadFrom(editForm.value));
    await areaImages.value?.commit(editForm.value.id);
    areas.value = areas.value
      .map((area) => (area.id === response.data.id ? response.data : area))
      .sort((left, right) => left.name.localeCompare(right.name));
    closeEdit();
  } catch (error) {
    editError.value = error.response?.data?.message || "Unable to update the area.";
  } finally {
    saving.value = false;
  }
}

async function deleteArea() {
  saving.value = true;
  editError.value = "";

  try {
    await areaServices.removeArea(editForm.value.id);
    areas.value = areas.value.filter((area) => area.id !== editForm.value.id);
    closeEdit();
  } catch (error) {
    editError.value = error.response?.data?.message || "Unable to delete the area.";
  } finally {
    saving.value = false;
  }
}

onMounted(loadAreas);
onBeforeUnmount(() => {
  clearTimeout(hoverHideTimer);
});
</script>

<template>
  <v-container class="py-10">
    <h1 class="text-h4 mb-6">Areas</h1>

    <v-btn class="oc-cta mb-4" color="primary" variant="elevated" type="button" @click="openCreate">
      Create area
    </v-btn>

    <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4">
      {{ errorMessage }}
    </v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Notice email</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="area in areas"
          :key="area.id"
          @click="openArea(area)"
          @mouseenter="hoverArea($event, area)"
          @mousemove="moveAreaHover"
          @mouseleave="releaseHover"
        >
          <td>{{ area.name }}</td>
          <td>{{ area.noticeEmail }}</td>
          <td>
            <v-btn color="secondary" variant="text" type="button" @click.stop="openDetails(area)">
              Details
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <dialog
      ref="detailsDialog"
      class="area-dialog"
      aria-labelledby="area-details-title"
      @cancel.prevent="closeDetails"
      @click="dismissDetailsOnBackdrop"
    >
      <v-card v-if="detailsOpen && detailsArea" rounded="lg" max-width="480">
        <v-card-item>
          <v-card-title id="area-details-title">{{ detailsArea.name }}</v-card-title>
        </v-card-item>
        <v-card-text>
          <p>{{ detailsArea.noticeEmail }}</p>
          <img v-if="detailsArea.logo" class="area-logo" :src="logoSrc(detailsArea.logo)" alt="Logo" />
          <ImagesContainer readonly type="area" :parent-id="detailsArea.id" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="closeDetails">Close</v-btn>
        </v-card-actions>
      </v-card>
    </dialog>

    <ImagesTooltip
      v-if="hoveredAreaId"
      active
      type="area"
      :parent-id="hoveredAreaId"
      :pointer-x="hoverX"
      :anchor-top="hoverTop"
      :logo="hoveredArea?.logo || ''"
      @keep="retainHover"
      @release="releaseHover"
    />

    <dialog ref="createDialog" class="area-dialog" aria-labelledby="create-area-title" @cancel.prevent="closeCreate">
      <v-card v-if="createOpen" rounded="lg" max-width="480">
        <v-card-item>
          <v-card-title id="create-area-title">Create area</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-text-field v-model="createForm.name" label="Name" />
          <v-text-field v-model="createForm.noticeEmail" label="Notice email" />
          <input ref="createLogoInput" type="file" accept="image/*" hidden @change="chooseLogo($event, createForm)" />
          <v-btn color="primary" variant="elevated" class="oc-cta" type="button" @click="createLogoInput?.click()">
            Logo
          </v-btn>
          <img v-if="createForm.logo" class="area-logo" :src="logoSrc(createForm.logo)" alt="Logo" />
          <ImagesContainer ref="createImages" v-model="pendingCreateImages" defer type="area" />
          <v-alert v-if="createError" type="error" density="compact" class="mt-4">
            {{ createError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="closeCreate">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            :loading="saving"
            @click="saveCreate"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </dialog>

    <dialog
      ref="editDialog"
      class="area-dialog"
      aria-labelledby="edit-area-title"
      @cancel.prevent="closeEdit"
      @click="dismissEditOnBackdrop"
    >
      <v-card v-if="editOpen" rounded="lg" max-width="480">
        <v-card-item>
          <v-card-title id="edit-area-title">{{ editForm.name }}</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-text-field v-model="editForm.name" label="Name" />
          <v-text-field v-model="editForm.noticeEmail" label="Notice email" />
          <input ref="editLogoInput" type="file" accept="image/*" hidden @change="chooseLogo($event, editForm)" />
          <v-btn color="primary" variant="elevated" class="oc-cta" type="button" @click="editLogoInput?.click()">
            Logo
          </v-btn>
          <img v-if="editForm.logo" class="area-logo" :src="logoSrc(editForm.logo)" alt="Logo" />
          <ImagesContainer
            v-if="editForm.id"
            ref="areaImages"
            defer
            type="area"
            :parent-id="editForm.id"
          />
          <v-alert v-if="editError" type="error" density="compact" class="mt-4">
            {{ editError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="closeEdit">Close</v-btn>
          <v-btn color="secondary" variant="text" type="button" :loading="saving" @click="deleteArea">
            Delete
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            :loading="saving"
            @click="saveEdit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </dialog>
  </v-container>
</template>

<style scoped>
.area-dialog {
  border: none;
  padding: 0;
  background: transparent;
  max-width: 480px;
  width: calc(100% - 32px);
  max-height: calc(100% - 32px);
  overflow: auto;
}

.area-dialog::backdrop {
  background: rgba(0, 0, 0, 0.32);
}

.area-logo {
  display: block;
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin: 8px 0;
}
</style>
