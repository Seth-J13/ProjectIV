<script>
export default { name: "NoteForm" };
</script>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import apiClient from "../services/services.js";
import ImagesContainer from "./ImagesContainer.vue";

const props = defineProps({
  isAddMode: { type: Boolean, default: true },
  modelValue: { type: Object, default: () => ({}) },
  maintenanceRequest: { type: Boolean, default: false },
  local: { type: Boolean, default: false },
});

const emit = defineEmits(["saved", "close"]);

const open = ref(true);
const subject = ref("");
const description = ref("");
const notifyMaintenance = ref(false);
const subjectError = ref("");
const descriptionError = ref("");
const saving = ref(false);
const panel = ref(null);
const pendingImages = ref([...(props.modelValue?.images ?? [])]);
const imageEditor = ref(null);

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

function applyModel(value) {
  subject.value = value?.reason ?? "";
  description.value = value?.text ?? "";
  notifyMaintenance.value =
    typeof value?.maintenance_request === "boolean" ? value.maintenance_request : props.maintenanceRequest === true;
  pendingImages.value = [...(value?.images ?? [])];
}

applyModel(props.modelValue);
watch(() => props.modelValue, applyModel);

const requestId = computed(() => props.modelValue?.request_id ?? "");

const contributionDates = computed(() => {
  const dates = (props.modelValue?.contributors ?? []).map((entry) => entry.date).filter(Boolean);
  if (!dates.length && props.modelValue?.date) {
    dates.push(props.modelValue.date);
  }

  return [...dates].sort();
});

const earliest = computed(() => formatDate(contributionDates.value[0]));
const latest = computed(() => formatDate(contributionDates.value[contributionDates.value.length - 1]));

function close() {
  subject.value = "";
  description.value = "";
  subjectError.value = "";
  descriptionError.value = "";
  open.value = false;
  emit("close");
}

function onPointerDown(event) {
  if (!open.value) {
    return;
  }

  const root = panel.value;
  if (root && root.contains(event.target)) {
    return;
  }

  close();
}

onMounted(() => {
  document.addEventListener("pointerdown", onPointerDown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onPointerDown);
});

function validate() {
  const value = subject.value.trim();
  subjectError.value = "";
  descriptionError.value = "";

  if (!value) {
    subjectError.value = "Required";
  } else if (value.length > 254) {
    subjectError.value = "Subject must be 254 characters or fewer";
  }

  if (!description.value.trim()) {
    descriptionError.value = "Required";
  }

  return !subjectError.value && !descriptionError.value;
}

async function submit() {
  if (!validate()) {
    return;
  }

  const payload = {
    reason: subject.value.trim(),
    text: description.value.trim(),
    request_id: props.modelValue?.request_id,
    maintenance_request: notifyMaintenance.value,
  };

  if (props.local) {
    emit("saved", {
      id: props.modelValue?.id ?? null,
      reason: payload.reason,
      text: payload.text,
      request_id: payload.request_id,
      maintenance_request: payload.maintenance_request,
      date: props.modelValue?.date,
      contributors: props.modelValue?.contributors,
      images: pendingImages.value.map((item) => ({ image: item.image, date: item.date })),
    });
    close();
    return;
  }

  saving.value = true;

  try {
    const response = props.isAddMode
      ? await apiClient.post("/vehicle-t3/notes/", payload)
      : await apiClient.put(`/vehicle-t3/notes/note/${props.modelValue.id}`, payload);
    const noteId = response.data?.note_id ?? response.data?.id ?? props.modelValue?.id;

    if (noteId != null) {
      await imageEditor.value?.commit(noteId);
    }

    emit("saved", response.data);
    close();
  } catch (error) {
    subjectError.value = error.response?.data?.message || "Could not save the note.";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div v-if="open" class="note-form-layer">
    <div class="v-overlay__scrim" @click="close"></div>
    <v-card class="note-form-card" rounded="lg">
      <div ref="panel">
        <v-card-item>
          <v-card-title>{{ isAddMode ? "Add Note" : "Edit Note" }}</v-card-title>
        </v-card-item>
        <v-card-text>
          <p>Request ID: {{ requestId }}</p>
          <p v-if="earliest">{{ earliest }}</p>
          <p v-if="!isAddMode && latest">Last updated on {{ latest }}</p>
          <v-text-field
            v-model="subject"
            label="Subject"
            :error-messages="subjectError ? [subjectError] : []"
          />
          <v-textarea
            v-model="description"
            label="Description"
            :error-messages="descriptionError ? [descriptionError] : []"
          />
          <v-switch v-model="notifyMaintenance" color="primary" label="Notify maintenance" hide-details />
          <ImagesContainer
            ref="imageEditor"
            v-model="pendingImages"
            defer
            type="note"
            :parent-id="local || modelValue?.id == null ? null : modelValue.id"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="close">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            :loading="saving"
            @click="submit"
          >
            {{ isAddMode ? "Add" : "Save" }}
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.note-form-layer {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.v-overlay__scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.note-form-card {
  position: relative;
  z-index: 1;
  width: min(720px, 100%);
  max-height: 90vh;
  overflow: auto;
}

.image-frame {
  border: 1px dashed rgba(0, 0, 0, 0.38);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
}
</style>
