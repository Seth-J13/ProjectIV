<script>
export default { name: "NotesList" };
</script>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import apiClient from "../services/services.js";
import NoteForm from "./NoteForm.vue";
import ImagesContainer from "./ImagesContainer.vue";

const props = defineProps({
  mode: { type: String, default: "embed" },
  title: { type: String, default: "Notes" },
  requestId: { type: [Number, String], default: null },
  maintenanceRequest: { type: Boolean, default: false },
  userId: { type: [Number, String], default: null },
  scope: { type: String, default: "request" },
  filter: { type: Function, default: null },
  vehicleId: { type: String, default: "" },
  draft: { type: Boolean, default: false },
  modelValue: { type: Array, default: () => [] },
  allowCreate: { type: Boolean, default: true },
  showCreate: { type: Boolean, default: true },
});

const emit = defineEmits(["update:modelValue"]);

const items = ref([]);
const search = ref("");
const loading = ref(false);
const errorMessage = ref("");
const offset = ref(0);
const done = ref(false);
const sentinel = ref(null);
const toast = ref("");
const formOpen = ref(false);
const formAdd = ref(true);
const formNote = ref({});
const detailsOpen = ref(false);
const selected = ref(null);
const pendingDelete = ref(null);

let fetching = false;
let localId = 1;
let observer;
let toastTimer;

const paged = computed(() => props.scope !== "request" && props.scope !== "contributor");

const visible = computed(() => {
  const query = props.mode === "list" ? search.value.trim().toLowerCase() : "";

  return items.value.filter((item) => {
    if (typeof props.filter === "function" && !props.filter(item)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const reason = String(item?.reason ?? "").toLowerCase();
    const text = String(item?.text ?? "").toLowerCase();
    return reason.includes(query) || text.includes(query);
  });
});

function preview(reason) {
  const value = String(reason ?? "");
  if (value.length > 20) {
    return `${value.slice(0, 20)}...`;
  }

  return value;
}

function formatDate(value) {
  if (value == null || value === "") {
    return "";
  }

  const match = String(value).match(/(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!match) {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${month}/${day}/${now.getFullYear()} ${hours}:${minutes}`;
  }

  const date = `${match[2]}/${match[3]}/${match[1]}`;
  return match[4] == null ? date : `${date} ${match[4]}:${match[5]}`;
}

function datesFor(item) {
  const dates = (item?.contributors ?? []).map((entry) => entry.date).filter(Boolean);
  if (!dates.length && item?.date) {
    dates.push(item.date);
  }

  return [...dates].sort();
}

function earliest(item) {
  const dates = datesFor(item);
  return formatDate(dates[0]);
}

function latest(item) {
  const dates = datesFor(item);
  return formatDate(dates[dates.length - 1]);
}

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function publishDrafts() {
  emit("update:modelValue", items.value.map((item) => ({ ...item })));
}

async function loadMore() {
  if (props.draft || done.value || fetching) {
    return;
  }

  fetching = true;
  loading.value = true;
  errorMessage.value = "";

  try {
    let response;

    if (props.scope === "request" && props.requestId != null) {
      response = await apiClient.get(`/vehicle-t3/notes/request/${props.requestId}`);
    } else if (props.scope === "contributor" && props.userId != null) {
      response = await apiClient.get(`/vehicle-t3/notes/user/${props.userId}`);
    } else {
      response = await apiClient.get(`/vehicle-t3/notes?offset=${offset.value}`);
    }

    const data = Array.isArray(response.data) ? response.data : [];

    if (paged.value) {
      items.value = items.value.concat(data);
      offset.value += 3;
      if (data.length < 3) {
        done.value = true;
      }
    } else {
      items.value = data;
      done.value = true;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      done.value = true;
    } else {
      errorMessage.value = error.response?.data?.message || "Unable to load notes.";
      done.value = true;
    }
  } finally {
    loading.value = false;
    fetching = false;
  }
}

async function reload() {
  items.value = [];
  offset.value = 0;
  done.value = false;
  await loadMore();
}

function openAdd() {
  detailsOpen.value = false;
  formAdd.value = true;
  formNote.value = { request_id: props.requestId };
  formOpen.value = true;
}

function openEdit(item) {
  detailsOpen.value = false;
  formAdd.value = false;
  formNote.value = { ...item };
  formOpen.value = true;
}

function openDetails(item) {
  selected.value = item;
  detailsOpen.value = true;
}

function openDelete(item) {
  pendingDelete.value = item;
}

function showToast(message) {
  toast.value = message || "";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = "";
  }, 3000);
}

async function onSaved(data) {
  formOpen.value = false;

  if (props.draft) {
    const note = {
      id: data?.id || localId++,
      reason: data?.reason ?? "",
      text: data?.text ?? "",
      request_id: data?.request_id ?? null,
      maintenance_request: data?.maintenance_request === true,
      date: data?.date || today(),
      contributors: data?.contributors || [],
      images: data?.images || [],
    };

    if (formAdd.value) {
      items.value = [note, ...items.value];
    } else {
      items.value = items.value.map((item) => (item.id === formNote.value.id ? { ...item, ...note, id: item.id } : item));
    }

    publishDrafts();
    return;
  }

  showToast(data?.message);
  await reload();
}

async function confirmDelete() {
  const target = pendingDelete.value;
  pendingDelete.value = null;

  if (!target) {
    return;
  }

  if (props.draft) {
    items.value = items.value.filter((item) => item.id !== target.id);
    publishDrafts();
    return;
  }

  if (props.scope === "maintenance") {
    await apiClient.post("/vehicle-t3/vehicle-service-logs/", {
      vehicle_id: props.vehicleId || "",
      date: today(),
      type: "maintenance",
      value: target.text,
    });
  }

  await apiClient.delete(`/vehicle-t3/notes/note/${target.id}`);
  await reload();
}

defineExpose({ openAdd });

function onDocumentClick(event) {
  if (detailsOpen.value && event.target?.classList?.contains("v-overlay__scrim")) {
    detailsOpen.value = false;
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (!props.draft) {
      return;
    }

    items.value = Array.isArray(value) ? value.map((item) => ({ ...item })) : [];
  }
);

onMounted(async () => {
  document.addEventListener("click", onDocumentClick);
  if (props.draft) {
    items.value = props.modelValue.map((item) => ({ ...item }));
  } else {
    await loadMore();
  }
  if (sentinel.value && typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore();
      }
    });
    observer.observe(sentinel.value);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  document.removeEventListener("click", onDocumentClick);
  clearTimeout(toastTimer);
});
</script>

<template>
  <section class="notes-list">
    <h2 v-if="title" class="text-h6 mb-2">{{ title }}</h2>
    <v-text-field v-if="mode === 'list'" v-model="search" label="Search" />
    <v-btn
      v-if="mode === 'embed' && allowCreate && showCreate"
      color="primary"
      variant="elevated"
      class="oc-cta mb-3"
      type="button"
      @click="openAdd"
    >
      + New Note
    </v-btn>
    <v-alert v-if="errorMessage" type="error" class="mb-3">{{ errorMessage }}</v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />
    <p v-if="!loading && visible.length === 0">No notes.</p>
    <div class="v-list notes-scroll">
      <v-card
        v-for="item in visible"
        :key="item.id"
        class="note-card mb-2"
        rounded="lg"
        @click="openDetails(item)"
      >
        <v-card-text>
          <div class="d-flex align-center">
            <div>
              <div>#{{ item.id }}</div>
              <div v-if="item.request_id != null && item.request_id !== ''">R: {{ item.request_id }}</div>
              <div>{{ preview(item.reason) }}</div>
              <div>{{ item.text }}</div>
            </div>
            <v-spacer />
            <v-btn icon size="small" variant="text" type="button" aria-label="Edit" @click.stop="openEdit(item)">
              <v-icon icon="mdi-pencil" />
            </v-btn>
            <v-btn icon size="small" variant="text" type="button" aria-label="Delete" @click.stop="openDelete(item)">
              <v-icon icon="mdi-delete" />
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
      <div ref="sentinel" class="notes-sentinel"></div>
    </div>

    <NoteForm
      v-if="formOpen"
      :is-add-mode="formAdd"
      :model-value="formNote"
      :maintenance-request="maintenanceRequest"
      :local="draft"
      @saved="onSaved"
      @close="formOpen = false"
    />

    <div v-if="detailsOpen && selected" class="note-dialog" @click.stop>
      <div class="v-overlay__scrim" @click.stop="detailsOpen = false"></div>
      <v-card class="note-dialog-card" rounded="lg">
        <v-card-item>
          <v-card-title>Note</v-card-title>
        </v-card-item>
        <v-card-text>
          <p>Request ID: {{ selected.request_id }}</p>
          <p>{{ earliest(selected) }}</p>
          <p>{{ selected.reason }}</p>
          <p>{{ selected.text }}</p>
          <ImagesContainer
            v-if="draft"
            :key="`draft-${selected.id}`"
            type="note"
            :model-value="selected.images || []"
            :allow-add="false"
            :allow-delete="false"
            readonly
          />
          <ImagesContainer
            v-else
            :key="selected.id"
            type="note"
            :parent-id="selected.id"
            :allow-add="false"
            :allow-delete="false"
            readonly
          />
          <p>Last updated on {{ latest(selected) }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click.stop="detailsOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <div v-if="pendingDelete" class="note-dialog" @click.stop>
      <div class="note-dialog-card delete-card">
        <v-card rounded="lg">
          <v-card-item>
            <v-card-title>Delete</v-card-title>
          </v-card-item>
          <v-card-text>Delete this note?</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="secondary" variant="text" type="button" @click.stop="pendingDelete = null">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              class="oc-cta"
              type="button"
              @click.stop="confirmDelete"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </div>

    <div v-if="toast" class="note-toast">{{ toast }}</div>
  </section>
</template>

<style scoped>
.note-dialog {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.note-dialog .v-overlay__scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.note-dialog-card {
  position: relative;
  z-index: 1;
  width: min(720px, 100%);
}

.notes-scroll {
  max-height: 320px;
  overflow-y: auto;
}

.note-card {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  cursor: pointer;
}

.image-frame {
  border: 1px dashed rgba(0, 0, 0, 0.38);
  border-radius: 8px;
  margin: 12px 0;
  padding: 24px;
  text-align: center;
}

.note-toast {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 3000;
  background: #2e7d32;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
