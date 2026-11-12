<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import ListRequestForm from "../components/ListRequestForm.vue";
import TripRequestForm from "../components/TripRequestForm.vue";
import MaintenanceRequestForm from "../components/MaintenanceRequestForm.vue";
import requestServices from "../services/requestServices.js";

const rows = ref([]);
const vehicles = ref([]);
const drivers = ref([]);
const destinations = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const query = ref("");
const activeOnly = ref(false);
const typeFilter = ref("all");
const createOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);
const editingId = ref(null);
const deletingId = ref(null);

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

  if (!value.startTime) {
    return "start time is required.";
  }

  if (!value.endDate) {
    return "end date is required.";
  }

  if (!value.endTime) {
    return "end time is required.";
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
    startTime: value.startTime,
    endDate: value.endDate,
    endTime: value.endTime,
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
  errorMessage.value = "";
  createOpen.value = true;
}

function openEdit(row) {
  editingId.value = row.requestId;
  form.requestType = row.requestType;
  form.vehicleId = row.vehicle?.vehicleId ?? null;
  form.driverId = row.driver?.driverId ?? null;
  form.destId = row.destination?.destId ?? null;
  form.startDate = row.startDate || "";
  form.startTime = row.startTime || "";
  form.endDate = row.endDate || "";
  form.endTime = row.endTime || "";
  form.numPeople = row.numPeople ?? "";
  errorMessage.value = "";
  editOpen.value = true;
}

function openDelete(row) {
  deletingId.value = row.requestId;
  deleteOpen.value = true;
}

async function createRequest() {
  errorMessage.value = "";
  const problem = validate(form);

  if (problem) {
    errorMessage.value = problem;
    return;
  }

  try {
    await requestServices.create(payload(form));
    createOpen.value = false;
    resetForm();
    await load();
  } catch (error) {
    errorMessage.value = messageFrom(error);
  }
}

async function saveRequest() {
  errorMessage.value = "";
  const problem = validate(form);

  if (problem) {
    errorMessage.value = problem;
    return;
  }

  try {
    await requestServices.update(editingId.value, payload(form));
    editOpen.value = false;
    resetForm();
    await load();
  } catch (error) {
    errorMessage.value = messageFrom(error);
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

    <v-dialog v-if="createOpen" :model-value="true" persistent>
      <v-card>
        <v-card-title>New request</v-card-title>
        <v-card-text>
          <v-btn @click="form.requestType = 'trip'">Trip</v-btn>
          <v-btn @click="form.requestType = 'maintenance'">Maintenance</v-btn>
          <TripRequestForm
            v-if="form.requestType === 'trip'"
            :form="form"
            :vehicles="vehicles"
            :drivers="drivers"
            :destinations="destinations"
          />
          <MaintenanceRequestForm
            v-if="form.requestType === 'maintenance'"
            :form="form"
            :vehicles="vehicles"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="createOpen = false">Cancel</v-btn>
          <v-btn class="oc-cta" @click="createRequest">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-if="editOpen" :model-value="true" persistent>
      <v-card>
        <v-card-title>Edit request</v-card-title>
        <v-card-text>
          <TripRequestForm
            v-if="form.requestType === 'trip'"
            :form="form"
            :vehicles="vehicles"
            :drivers="drivers"
            :destinations="destinations"
          />
          <MaintenanceRequestForm
            v-else
            :form="form"
            :vehicles="vehicles"
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
