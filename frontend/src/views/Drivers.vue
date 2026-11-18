<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import driverServices from "../services/driverServices.js";
import userServices from "../services/userServices.js";

const drivers = ref([]);
const users = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const query = ref("");
const createOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);
const pendingDelete = ref(null);

const emptyForm = () => ({
  driver_id: null,
  name: "",
  license_status: "",
  license_exp_date: "",
  availability: "",
});

const form = ref(emptyForm());
const editForm = ref(emptyForm());
const errors = ref({});
const editErrors = ref({});
const createError = ref("");
const createErrorAlert = ref(null);

watch(createError, async (message) => {
  if (!message) {
    return;
  }

  await nextTick();
  const alert = createErrorAlert.value?.$el ?? createErrorAlert.value;
  const card = alert?.closest?.(".v-card");

  if (!alert || !card) {
    return;
  }

  const hidden = alert.getBoundingClientRect().bottom - card.getBoundingClientRect().bottom;

  if (hidden > 0) {
    card.scrollTop += hidden + 16;
  }
});

function fullName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

function titleCase(value) {
  return String(value ?? "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const licenseStatuses = ["expired", "active", "suspended"];
const availabilityOptions = ["available", "not available", "on call"];

const userOptions = computed(() =>
  users.value
    .filter((user) => user?.id != null)
    .map((user) => {
      const id = String(user.id);
      return {
        id,
        label: `${fullName(user)} (${id})`,
      };
    })
);

function userById(value) {
  const id = String(selectedDriverId(value) ?? "").trim();

  if (!/^[0-9]+$/.test(id)) {
    return null;
  }

  return users.value.find((user) => String(user.id) === id) ?? null;
}

const nameLocked = computed(() => Boolean(userById(form.value.driver_id)));

watch(
  () => form.value.driver_id,
  (value) => {
    const user = userById(value);

    if (!user) {
      return;
    }

    const id = String(user.id);

    if (String(selectedDriverId(value) ?? "").trim() !== id) {
      form.value.driver_id = id;
    }

    form.value.name = fullName(user);
  }
);

const visibleDrivers = computed(() => {
  const needle = query.value.trim().toLowerCase();

  if (!needle) {
    return drivers.value;
  }

  return drivers.value.filter((driver) =>
    [
      driver.driver_id,
      driver.name,
      driver.license_status,
      driver.license_exp_date,
      driver.availability,
    ]
      .filter((value) => value !== undefined && value !== null)
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
});

function selectedDriverId(value) {
  if (value && typeof value === "object") {
    return value.id ?? "";
  }

  return value;
}

function validate(source, { requireName }) {
  const nextErrors = {};
  const name = source.name?.trim() ?? "";
  const licenseStatus = source.license_status?.trim() ?? "";
  const expiration = source.license_exp_date?.trim() ?? "";
  const availability = source.availability?.trim() ?? "";
  const driverId = String(selectedDriverId(source.driver_id) ?? "").trim();

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
  const driverId = String(selectedDriverId(source.driver_id) ?? "").trim();

  if (driverId) {
    body.driver_id = Number(driverId);
  }

  return body;
}

function openCreate() {
  form.value = emptyForm();
  errors.value = {};
  createError.value = "";
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

async function loadUsers() {
  try {
    const response = await userServices.listUsers();
    users.value = Array.isArray(response.data) ? response.data : [];
  } catch {
    users.value = [];
  }
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
  createError.value = "";
  errors.value = validate(form.value, { requireName: true });

  if (Object.keys(errors.value).length > 0) {
    return;
  }

  try {
    const response = await driverServices.create(payloadFrom(form.value));
    drivers.value = [...drivers.value, response.data];
    createOpen.value = false;
  } catch (error) {
    createError.value = error.response?.data?.message || "Unable to create the driver.";
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

onMounted(() => {
  loadDrivers();
  loadUsers();
});
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

    <v-table v-else>
      <thead>
        <tr>
          <th>Driver ID</th>
          <th>Name</th>
          <th>License Status</th>
          <th>License Expiration</th>
          <th>Availability</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="drivers.length === 0">
          <td colspan="6">No drivers yet. Create a driver.</td>
        </tr>
        <tr v-for="driver in visibleDrivers" :key="driver.driver_id">
          <td>{{ driver.driver_id }}</td>
          <td>{{ titleCase(driver.name) }}</td>
          <td>{{ titleCase(driver.license_status) }}</td>
          <td>{{ driver.license_exp_date }}</td>
          <td>{{ titleCase(driver.availability) }}</td>
          <td>
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              type="button"
              aria-label="Edit driver"
              @click="openEdit(driver)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              type="button"
              aria-label="Delete driver"
              @click="openDelete(driver)"
            />
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="createOpen" max-width="520">
      <v-card v-if="createOpen" class="pa-4">
        <v-card-title>New driver</v-card-title>
        <v-combobox
          v-model="form.driver_id"
          :items="userOptions"
          item-title="id"
          item-value="id"
          :return-object="false"
          :filter-keys="['raw.label', 'id']"
          clearable
          label="Driver id"
          :error-messages="errors.driver_id"
        >
          <template #item="{ item, props: itemProps }">
            <v-list-item v-bind="itemProps" :title="item.label" />
          </template>
        </v-combobox>
        <v-text-field
          v-model="form.name"
          label="Driver name"
          :readonly="nameLocked"
          :error-messages="errors.name"
        />
        <v-select
          v-model="form.license_status"
          :items="licenseStatuses"
          label="License status"
          :error-messages="errors.license_status"
        />
        <v-text-field
          v-model="form.license_exp_date"
          label="License expiration date"
          :error-messages="errors.license_exp_date"
        />
        <v-select
          v-model="form.availability"
          :items="availabilityOptions"
          label="Availability"
          :error-messages="errors.availability"
        />
        <v-alert
          v-if="createError"
          ref="createErrorAlert"
          type="error"
          density="compact"
          class="mb-4 flex-grow-0 flex-shrink-0"
        >
          {{ createError }}
        </v-alert>
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
        <v-select
          v-model="editForm.license_status"
          :items="licenseStatuses"
          label="License status"
          :error-messages="editErrors.license_status"
        />
        <v-text-field
          v-model="editForm.license_exp_date"
          label="License expiration date"
          :error-messages="editErrors.license_exp_date"
        />
        <v-select
          v-model="editForm.availability"
          :items="availabilityOptions"
          label="Availability"
          :error-messages="editErrors.availability"
        />
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
