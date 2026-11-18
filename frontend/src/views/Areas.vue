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
import { nextTick, onMounted, ref } from "vue";
import areaServices from "../services/areaServices.js";

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

function payloadFrom(source) {
  const body = {
    name: source.name.trim(),
    noticeEmail: source.noticeEmail.trim(),
  };
  const logo = source.logo.trim();

  if (logo) {
    body.logo = logo;
  }

  return body;
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
  createError.value = "";
  errorMessage.value = "";
  createOpen.value = true;
  await showDialog(createDialog);
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

async function saveCreate() {
  if (incomplete(createForm.value)) {
    createError.value = "Area is incomplete!";
    return;
  }

  saving.value = true;
  createError.value = "";

  try {
    const response = await areaServices.createArea(payloadFrom(createForm.value));
    areas.value = [...areas.value, response.data].sort((left, right) =>
      left.name.localeCompare(right.name)
    );
    closeCreate();
  } catch (error) {
    createError.value = error.response?.data?.message || "Unable to create the area.";
    errorMessage.value = createError.value;
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
    areas.value = areas.value
      .map((area) => (area.id === response.data.id ? response.data : area))
      .sort((left, right) => left.name.localeCompare(right.name));
    closeEdit();
  } catch (error) {
    editError.value = error.response?.data?.message || "Unable to update the area.";
    errorMessage.value = editError.value;
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
    errorMessage.value = editError.value;
  } finally {
    saving.value = false;
  }
}

onMounted(loadAreas);
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
        </tr>
      </thead>
      <tbody>
        <tr v-for="area in areas" :key="area.id" @click="openArea(area)">
          <td>{{ area.name }}</td>
          <td>{{ area.noticeEmail }}</td>
        </tr>
      </tbody>
    </v-table>

    <dialog ref="createDialog" class="area-dialog" aria-labelledby="create-area-title" @cancel.prevent="closeCreate">
      <v-card v-if="createOpen" rounded="lg" max-width="480">
        <v-card-item>
          <v-card-title id="create-area-title">Create area</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-alert v-if="createError" type="error" density="compact" class="mb-4">
            {{ createError }}
          </v-alert>
          <v-text-field v-model="createForm.name" label="Name" />
          <v-text-field v-model="createForm.noticeEmail" label="Notice email" />
          <v-text-field v-model="createForm.logo" label="Logo" />
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

    <dialog ref="editDialog" class="area-dialog" aria-labelledby="edit-area-title" @cancel.prevent="closeEdit">
      <v-card v-if="editOpen" rounded="lg" max-width="480">
        <v-card-item>
          <v-card-title id="edit-area-title">{{ editForm.name }}</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-alert v-if="editError" type="error" density="compact" class="mb-4">
            {{ editError }}
          </v-alert>
          <v-text-field v-model="editForm.name" label="Name" />
          <v-text-field v-model="editForm.noticeEmail" label="Notice email" />
          <v-text-field v-model="editForm.logo" label="Logo" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
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
}

.area-dialog::backdrop {
  background: rgba(0, 0, 0, 0.32);
}
</style>
