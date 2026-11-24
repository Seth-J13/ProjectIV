<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import TripRequestForm from "../components/TripRequestForm.vue";
import MaintenanceRequestForm from "../components/MaintenanceRequestForm.vue";
import NotesList from "../components/NotesList.vue";
import requestServices from "../services/requestServices.js";
import apiClient from "../services/services.js";
import Utils from "../config/utils.js";

const router = useRouter();
const user = Utils.getStore("user");
const isAdmin = user?.role === "admin";
const isStaff = ["admin", "maintenance"].includes(user?.role);

const vehicles = ref([]);
const requests = ref([]);
const drivers = ref([]);
const destinations = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const formError = ref("");
const successMessage = ref("");
const maintenanceMode = ref(false);

function blankForm() {
  return {
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

const tripForm = reactive(blankForm());
const maintenanceForm = reactive(blankForm());
const tripNotes = ref([]);
const maintenanceNotes = ref([]);

function messageFrom(error, fallback) {
  return error?.response?.data?.message || fallback;
}

async function load() {
  loading.value = true;

  try {
    const [vehicleResult, requestResult, driverResult, destinationResult] = await Promise.all([
      requestServices.findVehicles(),
      requestServices.findAll(),
      requestServices.findDrivers(),
      requestServices.findDestinations(),
    ]);

    vehicles.value = vehicleResult.data;
    requests.value = requestResult.data;
    drivers.value = driverResult.data;
    destinations.value = destinationResult.data;
    errorMessage.value = "";
  } catch (error) {
    errorMessage.value = messageFrom(error, "Unable to load the vehicles.");
  } finally {
    loading.value = false;
  }
}

// A request counts only while it is in use. A vehicle booked for next month stays available.
const inUseRequests = computed(() => requests.value.filter((row) => row.currentlyActive));

function vehicleFor(row) {
  return (
    vehicles.value.find((item) => String(item.vehicleId) === String(row.vehicleId)) ?? {
      ...row.vehicle,
      vehicleId: String(row.vehicleId),
    }
  );
}

function uniqueVehicles(rows) {
  const seen = new Map();

  for (const row of rows) {
    const vehicle = vehicleFor(row);

    if (!seen.has(vehicle.vehicleId)) {
      seen.set(vehicle.vehicleId, vehicle);
    }
  }

  return [...seen.values()];
}

const availableVehicles = computed(() =>
  vehicles.value.filter((vehicle) => vehicle.available && !vehicle.inUse)
);

const yourReservedVehicles = computed(() =>
  uniqueVehicles(inUseRequests.value.filter((row) => row.requesterId === user?.id))
);

const vehiclesInService = computed(() =>
  uniqueVehicles(inUseRequests.value.filter((row) => row.requestType === "maintenance"))
);

const reservedVehicles = computed(() => uniqueVehicles(inUseRequests.value));

function fillVehicle(vehicle) {
  tripForm.vehicleId = String(vehicle.vehicleId);
  maintenanceForm.vehicleId = String(vehicle.vehicleId);
}

function openRequests(vehicle) {
  router.push({ name: "requests", query: { vehicleId: String(vehicle.vehicleId) } });
}

function openMaintenance(vehicle) {
  router.push({ name: "maintenance", params: { vin: String(vehicle.vehicleId) } });
}

const sections = computed(() =>
  [
    {
      key: "available",
      title: "Available Vehicles",
      rows: availableVehicles.value,
      empty: "No vehicles are available.",
      visible: true,
      onRow: fillVehicle,
    },
    {
      key: "your-reserved",
      title: "Your Reserved Vehicles",
      rows: yourReservedVehicles.value,
      empty: "You have no reserved vehicles.",
      visible: true,
      onRow: openRequests,
    },
    {
      key: "in-service",
      title: "Vehicles In Service",
      rows: vehiclesInService.value,
      empty: "No vehicles are in service.",
      visible: isStaff,
      onRow: openMaintenance,
      onInfo: openMaintenance,
    },
    {
      key: "reserved",
      title: "Reserved Vehicles",
      rows: reservedVehicles.value,
      empty: "No vehicles are reserved.",
      visible: isAdmin,
      onInfo: openRequests,
    },
  ].filter((section) => section.visible)
);

function tripPayload() {
  return {
    requestType: "trip",
    vehicleId: tripForm.vehicleId,
    driverId: tripForm.driverId,
    destId: tripForm.destId,
    startDate: tripForm.startDate,
    startTime: tripForm.startTime || null,
    endDate: tripForm.endDate,
    endTime: tripForm.endTime || null,
    numPeople: Number(tripForm.numPeople),
  };
}

function maintenancePayload() {
  return {
    requestType: "maintenance",
    vehicleId: maintenanceForm.vehicleId,
    driverId: null,
    destId: null,
    numPeople: null,
    startDate: maintenanceForm.startDate,
    startTime: maintenanceForm.startTime || null,
    endDate: maintenanceForm.endDate || null,
    endTime: maintenanceForm.endTime || null,
  };
}

async function saveDraftNotes(requestId, notes) {
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
      noteError = messageFrom(error, "Unable to save a note.");
    }
  }

  return noteError;
}

async function submit(type) {
  formError.value = "";
  successMessage.value = "";
  const maintenance = type === "maintenance";

  try {
    const created = await requestServices.create(maintenance ? maintenancePayload() : tripPayload());
    const notes = (maintenance ? maintenanceNotes.value : tripNotes.value).map((note) => ({ ...note }));
    const noteError = await saveDraftNotes(created.data?.requestId, notes);

    Object.assign(maintenance ? maintenanceForm : tripForm, blankForm());
    if (maintenance) {
      maintenanceNotes.value = [];
    } else {
      tripNotes.value = [];
    }
    successMessage.value = "Request created.";
    if (noteError) {
      errorMessage.value = noteError;
    }
    await load();
  } catch (error) {
    formError.value = messageFrom(error, "Unable to save the request.");
  }
}

function toggleForm() {
  formError.value = "";
  successMessage.value = "";
}

onMounted(load);
</script>

<template>
  <v-container class="py-6">
    <h1 class="text-h4 text-primary font-weight-bold mb-4">Vehicle Management System</h1>

    <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4">
      {{ errorMessage }}
    </v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row>
      <v-col v-for="section in sections" :key="section.key" cols="12" lg="6">
        <v-card rounded="lg" elevation="2" :data-testid="`section-${section.key}`">
          <v-card-item>
            <h2 class="text-h6 text-primary font-weight-bold">{{ section.title }}</h2>
          </v-card-item>
          <v-table density="comfortable">
            <thead>
              <tr>
                <th>License</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Image</th>
                <th v-if="section.onInfo">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="vehicle in section.rows"
                :key="vehicle.vehicleId"
                :class="{ 'cursor-pointer': section.onRow }"
                :tabindex="section.onRow ? 0 : undefined"
                @click="section.onRow?.(vehicle)"
                @keydown.enter="section.onRow?.(vehicle)"
              >
                <td>{{ vehicle.license }}</td>
                <td>{{ vehicle.make }}</td>
                <td>{{ vehicle.model }}</td>
                <td>{{ vehicle.year }}</td>
                <td>
                  <v-img
                    v-if="vehicle.image"
                    :src="vehicle.image"
                    :alt="`${vehicle.make} ${vehicle.model}`"
                    width="64"
                    height="40"
                    cover
                  />
                  <v-icon v-else icon="mdi-car" color="outline" aria-label="No image" />
                </td>
                <td v-if="section.onInfo">
                  <v-btn
                    icon="mdi-information-outline"
                    size="small"
                    variant="text"
                    color="primary"
                    aria-label="Info"
                    @click.stop="section.onInfo(vehicle)"
                  />
                </td>
              </tr>
              <tr v-if="!section.rows.length">
                <td :colspan="section.onInfo ? 6 : 5" class="text-medium-emphasis">
                  {{ section.empty }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="lg" elevation="2" class="mt-6">
      <v-card-item>
        <h2 class="text-h6 text-primary font-weight-bold">
          {{ maintenanceMode ? "Maintenance Request Form" : "Vehicle Request Form" }}
        </h2>
        <template v-if="isStaff" #append>
          <div class="d-flex align-center ga-2">
            <span>Request</span>
            <v-switch
              v-model="maintenanceMode"
              color="primary"
              density="compact"
              hide-details
              inset
              role="switch"
              aria-label="Switch between request and maintenance forms"
              @update:model-value="toggleForm"
            />
            <span>Maintenance</span>
          </div>
        </template>
      </v-card-item>
      <v-card-text>
        <v-alert v-if="successMessage" type="success" density="compact" class="mb-4">
          {{ successMessage }}
        </v-alert>
        <v-form v-if="isStaff && maintenanceMode" @submit.prevent="submit('maintenance')">
          <MaintenanceRequestForm :form="maintenanceForm" :vehicles="vehicles" :error="formError" />
          <NotesList
            v-model="maintenanceNotes"
            class="mt-4"
            mode="embed"
            title=""
            draft
            :maintenance-request="true"
          />
          <v-btn class="oc-cta mt-2" color="primary" variant="elevated" type="submit">Submit</v-btn>
        </v-form>
        <v-form v-else @submit.prevent="submit('trip')">
          <TripRequestForm
            :form="tripForm"
            :vehicles="vehicles"
            :drivers="drivers"
            :destinations="destinations"
            :error="formError"
          />
          <NotesList
            v-model="tripNotes"
            class="mt-4"
            mode="embed"
            title=""
            draft
          />
          <v-btn class="oc-cta mt-2" color="primary" variant="elevated" type="submit">Submit</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
