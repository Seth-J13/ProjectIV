<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import ListRequestForm from "../components/ListRequestForm.vue";
import TripRequestForm from "../components/TripRequestForm.vue";
import MaintenanceRequestForm from "../components/MaintenanceRequestForm.vue";
import requestServices from "../services/requestServices.js";
import NotesList from "../components/NotesList.vue";
import apiClient from "../services/services.js";
import Utils from "../config/utils.js";

const rows = ref([]);
const vehicles = ref([]);
const drivers = ref([]);
const destinations = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const formError = ref("");
const query = ref("");
const activeOnly = ref(false);
const typeFilter = ref("all");
const createOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);
const editingId = ref(null);
const deletingId = ref(null);
const draftNotes = ref([]);

function blankForm() {
  return {
    requestType: "",
    vehicleId: null,
    driverId: null,
    destId: null,
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    numPeople: "",
  };
}

const form = reactive(blankForm());

const canCreateMaintenance = computed(() =>
  ["admin", "maintenance"].includes(Utils.getStore("user")?.role)
);

const visibleRequests = computed(() => {
  const needle = query.value.trim().toLowerCase();

  return rows.value.filter((row) => {
    if (activeOnly.value && !row.currentlyActive) {
      return false;
    }

    if (typeFilter.value !== "all" && row.requestType !== typeFilter.value) {
      return false;
    }

    if (!needle) {
      return true;
    }

    const haystack = [
      row.requestId,
      row.requestType,
      row.vehicle?.license,
      row.vehicle?.make,
      row.vehicle?.model,
      row.driver?.name,
      row.destination?.name,
      row.startDate,
      row.endDate,
      row.numPeople,
    ]
      .filter((part) => part !== null && part !== undefined)
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });
});

function resetForm() {
  Object.assign(form, blankForm());
}

function messageFrom(error) {
  return error?.response?.data?.message || "Unable to save the request.";
}

function validate(value) {
  if (!value.requestType) {
    return "request type is required.";
  }

  if (value.vehicleId == null) {
    return "vehicle is required.";
  }

  if (value.requestType === "maintenance") {
    if (!value.startDate) {
      return "start date is required.";
    }

    return "";
  }

  if (value.driverId == null) {
    return "driver is required.";
  }

  if (value.destId == null) {
    return "destination is required.";
  }

  if (!value.startDate) {
    return "start date is required.";
  }

  if (!value.endDate) {
    return "end date is required.";
  }

  if (value.numPeople === "" || value.numPeople == null) {
    return "number of people is required.";
  }

  return "";
}

function payload(value) {
  if (value.requestType === "maintenance") {
    return {
      requestType: "maintenance",
      vehicleId: value.vehicleId,
      driverId: null,
      destId: null,
      numPeople: null,
      startDate: value.startDate,
      startTime: value.startTime || null,
      endDate: value.endDate || null,
      endTime: value.endTime || null,
    };
  }

  return {
    requestType: "trip",
    vehicleId: value.vehicleId,
    driverId: value.driverId,
    destId: value.destId,
    startDate: value.startDate,
    startTime: value.startTime || null,
    endDate: value.endDate,
    endTime: value.endTime || null,
    numPeople: Number(value.numPeople),
  };
}

async function load() {
  loading.value = true;

  try {
    const [requestResult, vehicleResult, driverResult, destinationResult] = await Promise.all([
      requestServices.findAll(),
      requestServices.findVehicles(),
      requestServices.findDrivers(),
      requestServices.findDestinations(),
    ]);

    rows.value = requestResult.data;
    vehicles.value = vehicleResult.data;
    drivers.value = driverResult.data;
    destinations.value = destinationResult.data;
  } catch (error) {
    errorMessage.value = messageFrom(error);
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  resetForm();
  draftNotes.value = [];
  formError.value = "";
  createOpen.value = true;
}

function openEdit(row) {
  editingId.value = row.requestId;
  form.requestType = row.requestType;
  form.vehicleId = row.vehicle?.vehicleId == null ? null : String(row.vehicle.vehicleId);
  form.driverId = row.driver?.driverId ?? null;
  form.destId = row.destination?.destId ?? null;
  form.startDate = row.startDate || "";
  form.startTime = row.startTime || "";
  form.endDate = row.endDate || "";
  form.endTime = row.endTime || "";
  form.numPeople = row.numPeople ?? "";
  formError.value = "";
  editOpen.value = true;
}

function openDelete(row) {
  deletingId.value = row.requestId;
  deleteOpen.value = true;
}

async function createRequest() {
  formError.value = "";
  const problem = validate(form);

  if (problem) {
    formError.value = problem;
    return;
  }

  try {
    const created = await requestServices.create(payload(form));
    const requestId = created.data?.requestId;
    const notes = draftNotes.value.map((note) => ({ ...note }));
    let noteError = "";

    for (const note of notes) {
      try {
        const createdNote = await apiClient.post("/vehicle-t3/notes/", {
          reason: note.reason,
          text: note.text,
          request_id: requestId,
          maintenance_request: note.maintenance_request === true,
        });
        const noteId = createdNote.data?.note_id ?? createdNote.data?.id;

        for (const item of note.images || []) {
          await apiClient.post("/vehicle-t3/noteimage/", {
            image: item.image,
            note_id: noteId,
          });
        }
      } catch (error) {
        noteError = messageFrom(error);
      }
    }

    createOpen.value = false;
    draftNotes.value = [];
    resetForm();
    await load();
    if (noteError) {
      errorMessage.value = noteError;
    }
  } catch (error) {
    formError.value = messageFrom(error);
  }
}

async function saveRequest() {
  formError.value = "";
  const problem = validate(form);

  if (problem) {
    formError.value = problem;
    return;
  }

  try {
    await requestServices.update(editingId.value, payload(form));
    editOpen.value = false;
    resetForm();
    await load();
  } catch (error) {
    formError.value = messageFrom(error);
  }
}

async function confirmDelete() {
  try {
    await requestServices.remove(deletingId.value);
    deleteOpen.value = false;
    await load();
  } catch (error) {
    errorMessage.value = messageFrom(error);
  }
}

watch(activeOnly, (checked) => {
  if (checked) {
    load();
  }
});

onMounted(load);
</script>

<template>
  <v-container>
    <h1>Requests</h1>
    <v-btn class="oc-cta" @click="openCreate">+ New request</v-btn>
    <v-progress-linear v-if="loading" indeterminate />
    <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>

    <ListRequestForm
      v-model:query="query"
      v-model:active-only="activeOnly"
      v-model:type-filter="typeFilter"
      :requests="visibleRequests"
      :empty="!loading && rows.length === 0"
      @edit="openEdit"
      @delete="openDelete"
    />

    <v-dialog v-if="createOpen" :model-value="true" persistent max-width="720">
      <v-card>
        <v-card-title>New request</v-card-title>
        <v-card-text>
          <div class="d-flex ga-4 mb-4">
            <v-btn @click="form.requestType = 'trip'">Trip</v-btn>
            <v-btn v-if="canCreateMaintenance" @click="form.requestType = 'maintenance'">Maintenance</v-btn>
          </div>
          <v-alert v-if="formError && !form.requestType" type="error" class="mb-4 flex-grow-0 flex-shrink-0">
            {{ formError }}
          </v-alert>
          <TripRequestForm
            v-if="form.requestType === 'trip'"
            :form="form"
            :vehicles="vehicles"
            :drivers="drivers"
            :destinations="destinations"
            :error="formError"
          />
          <MaintenanceRequestForm
            v-if="form.requestType === 'maintenance'"
            :form="form"
            :vehicles="vehicles"
            :error="formError"
          />
          <NotesList
            v-model="draftNotes"
            class="mt-4"
            mode="embed"
            title=""
            draft
            :maintenance-request="form.requestType === 'maintenance'"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="createOpen = false">Cancel</v-btn>
          <v-btn class="oc-cta" @click="createRequest">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-if="editOpen" :model-value="true" persistent max-width="720">
      <v-card>
        <v-card-title>Edit request</v-card-title>
        <v-card-text>
          <TripRequestForm
            v-if="form.requestType === 'trip'"
            :form="form"
            :vehicles="vehicles"
            :drivers="drivers"
            :destinations="destinations"
            :error="formError"
          />
          <MaintenanceRequestForm
            v-else
            :form="form"
            :vehicles="vehicles"
            :error="formError"
          />
          <NotesList
            class="mt-4"
            mode="embed"
            title=""
            scope="request"
            :request-id="editingId"
            :maintenance-request="form.requestType === 'maintenance'"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="editOpen = false">Cancel</v-btn>
          <v-btn class="oc-cta" @click="saveRequest">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteOpen" persistent>
      <v-card>
        <v-card-text>Delete this request?</v-card-text>
        <v-card-actions>
          <v-btn @click="deleteOpen = false">Cancel</v-btn>
          <v-btn @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
