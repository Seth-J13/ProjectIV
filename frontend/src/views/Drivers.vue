<script setup>
import { computed, onMounted, ref } from "vue";
import driverServices from "../services/driverServices.js";

const drivers = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const query = ref("");
const createOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);
const pendingDelete = ref(null);

const emptyForm = () => ({
  driver_id: "",
  name: "",
  license_status: "",
  license_exp_date: "",
  availability: "",
});

const form = ref(emptyForm());
const editForm = ref(emptyForm());
const errors = ref({});
const editErrors = ref({});

const visibleDrivers = computed(() => {
  const needle = query.value.trim().toLowerCase();

  if (!needle) {
    return drivers.value;
  }

  return drivers.value.filter((driver) =>
    [driver.driver_id, driver.name, driver.license_status]
      .filter((value) => value !== undefined && value !== null)
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
});

function validate(source, { requireName }) {
  const nextErrors = {};
  const name = source.name?.trim() ?? "";
  const licenseStatus = source.license_status?.trim() ?? "";
  const expiration = source.license_exp_date?.trim() ?? "";
  const availability = source.availability?.trim() ?? "";
  const driverId = String(source.driver_id ?? "").trim();

  if (requireName && !name) {
    nextErrors.name = "Driver name is required.";
  }

  if (!licenseStatus) {
    nextErrors.license_status = "license status is required.";
  }

  if (!expiration) {
    nextErrors.license_exp_date = "license expiration date is required.";
  }

  if (!availability) {
    nextErrors.availability = "availability is required.";
  }

  if (driverId && !/^[0-9]+$/.test(driverId)) {
    nextErrors.driver_id = "driver id is improperly formatted.";
  }

  return nextErrors;
}

function payloadFrom(source) {
  const body = {
    license_status: source.license_status.trim(),
    license_exp_date: source.license_exp_date.trim(),
    availability: source.availability.trim(),
  };
  const name = source.name?.trim() ?? "";

  if (name) {
    body.name = name;
  }
  const driverId = String(source.driver_id ?? "").trim();

  if (driverId) {
    body.driver_id = Number(driverId);
  }

  return body;
}

function openCreate() {
  form.value = emptyForm();
  errors.value = {};
  errorMessage.value = "";
  createOpen.value = true;
}

function openEdit(driver) {
  editForm.value = {
    driver_id: driver.driver_id,
    name: driver.name || "",
    license_status: driver.license_status,
    license_exp_date: driver.license_exp_date,
    availability: driver.availability,
  };
  editErrors.value = {};
  errorMessage.value = "";
  editOpen.value = true;
}

function openDelete(driver) {
  pendingDelete.value = driver;
  deleteOpen.value = true;
}

async function loadDrivers() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await driverServices.findAll();
    drivers.value = response.data ?? [];
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Unable to load drivers.";
  } finally {
    loading.value = false;
  }
}

async function createDriver() {
  errors.value = validate(form.value, { requireName: true });

  if (Object.keys(errors.value).length > 0) {
    return;
  }

  try {
    const response = await driverServices.create(payloadFrom(form.value));
    drivers.value = [...drivers.value, response.data];
    createOpen.value = false;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Unable to create the driver.";
  }
}

async function saveDriver() {
  editErrors.value = validate(editForm.value, { requireName: false });

  if (Object.keys(editErrors.value).length > 0) {
    return;
  }

  try {
    const response = await driverServices.update(editForm.value.driver_id, payloadFrom(editForm.value));
    drivers.value = drivers.value.map((driver) =>
      String(driver.driver_id) === String(editForm.value.driver_id) ? response.data : driver
    );
    editOpen.value = false;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Unable to update the driver.";
  }
}

async function confirmDelete() {
  const driverId = pendingDelete.value?.driver_id;

  try {
    await driverServices.remove(driverId);
    drivers.value = drivers.value.filter((driver) => String(driver.driver_id) !== String(driverId));
    deleteOpen.value = false;
    pendingDelete.value = null;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Unable to delete the driver.";
  }
}

onMounted(loadDrivers);
</script>

<template>
  <v-container>
    <h1 class="text-h4 mb-4">Drivers</h1>

    <v-btn class="oc-cta mb-4" color="primary" @click="openCreate">+ New driver</v-btn>

    <v-alert v-if="errorMessage" type="error" class="mb-4" density="compact">
      {{ errorMessage }}
    </v-alert>

    <v-text-field v-model="query" label="Find" density="comfortable" class="mb-2" />

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <p v-else-if="drivers.length === 0">No drivers yet. Create a driver.</p>

    <v-list v-else>
      <v-list-item v-for="driver in visibleDrivers" :key="driver.driver_id">
        <div>
          {{ driver.driver_id }}
          {{ driver.name }}
          {{ driver.license_status }}
          {{ driver.license_exp_date }}
          {{ driver.availability }}
        </div>
        <template #append>
          <v-btn icon size="small" aria-label="Edit driver" @click="openEdit(driver)">
            <v-icon icon="mdi-pencil" />
          </v-btn>
          <v-btn icon size="small" aria-label="Delete driver" @click="openDelete(driver)">
            <v-icon icon="mdi-delete" />
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="createOpen" max-width="520">
      <v-card v-if="createOpen" class="pa-4">
        <v-card-title>New driver</v-card-title>
        <v-text-field v-model="form.name" label="Driver name" :error-messages="errors.name" />
        <v-text-field v-model="form.driver_id" label="Driver id" :error-messages="errors.driver_id" />
        <v-text-field v-model="form.license_status" label="License status" :error-messages="errors.license_status" />
        <v-text-field
          v-model="form.license_exp_date"
          label="License expiration date"
          :error-messages="errors.license_exp_date"
        />
        <v-text-field v-model="form.availability" label="Availability" :error-messages="errors.availability" />
        <v-card-actions>
          <v-btn class="oc-cta" color="primary" @click="createDriver">Create</v-btn>
          <v-btn variant="text" @click="createOpen = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editOpen" max-width="520">
      <v-card v-if="editOpen" class="pa-4">
        <v-card-title>Edit driver</v-card-title>
        <v-text-field v-model="editForm.name" label="Driver name" :error-messages="editErrors.name" />
        <v-text-field v-model="editForm.license_status" label="License status" :error-messages="editErrors.license_status" />
        <v-text-field
          v-model="editForm.license_exp_date"
          label="License expiration date"
          :error-messages="editErrors.license_exp_date"
        />
        <v-text-field v-model="editForm.availability" label="Availability" :error-messages="editErrors.availability" />
        <v-card-actions>
          <v-btn class="oc-cta" color="primary" @click="saveDriver">Save</v-btn>
          <v-btn variant="text" @click="editOpen = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteOpen" max-width="420">
      <v-card v-if="deleteOpen" class="pa-4">
        <v-card-title>Delete driver</v-card-title>
        <v-card-text>Delete this driver?</v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="confirmDelete">Delete</v-btn>
          <v-btn variant="text" @click="deleteOpen = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
