<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import vehicleServices from "../services/vehicleServices.js";
import areaServices from "../services/areaServices.js";

const FORM_ERROR = "An error occured processing your form.";
// The modal has no tire type field (spec); the API requires one when creating maintenance info.
const DEFAULT_TIRE_TYPE = "Unspecified";

const router = useRouter();

const vehicles = ref([]);
const areas = ref([]);
const fuels = ref([]);
const loading = ref(false);
const errorMessage = ref("");

const filters = ref(emptyFilters());

const showVehicleDialog = ref(false);
const isEditMode = ref(false);
const form = ref(emptyForm());
const formError = ref("");
const saving = ref(false);

const showConfirmMaintenanceInfo = ref(false);
const showConfirmFuelType = ref(false);
const needMaintenanceInfo = ref(false);
const needFuelType = ref(false);

const hoveredVin = ref(null);

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index);

function emptyFilters() {
  return {
    year: null,
    make: "",
    model: "",
    color: "",
    area_id: null,
    license: "",
    fromPurchaseDate: "",
    beforePurchaseDate: "",
  };
}

function emptyForm() {
  return {
    vin: "",
    make: "",
    model: "",
    year: null,
    color: "",
    license_plate_num: "",
    area_id: null,
    purchased_date: "",
    tag_exp_month: "",
    fuel_type: "",
    fuel_capacity: null,
    recommended_tire_psi: null,
    most_recent_dest_id: null,
    available: 1,
    mileage: null,
  };
}

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : "";
}

function contains(value, search) {
  return String(value ?? "")
    .toLowerCase()
    .includes(String(search ?? "").trim().toLowerCase());
}

function distinct(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

const makes = computed(() => distinct(vehicles.value.map((vehicle) => vehicle.make)));
const models = computed(() => distinct(vehicles.value.map((vehicle) => vehicle.model)));
const fuelNames = computed(() => fuels.value.map((fuel) => fuel.fuel_type));

const filteredVehicles = computed(() => {
  const f = filters.value;
  return vehicles.value.filter((vehicle) => {
    const purchased = dateOnly(vehicle.purchased_date);
    return (
      (!f.year || vehicle.year === f.year) &&
      contains(vehicle.make, f.make) &&
      contains(vehicle.model, f.model) &&
      contains(vehicle.color, f.color) &&
      (!f.area_id || vehicle.area_id === f.area_id) &&
      contains(vehicle.license_plate_num, f.license) &&
      (!f.fromPurchaseDate || purchased >= f.fromPurchaseDate) &&
      (!f.beforePurchaseDate || purchased <= f.beforePurchaseDate)
    );
  });
});

function areaName(vehicle) {
  return vehicle.area?.name ?? areas.value.find((area) => area.id === vehicle.area_id)?.name ?? "";
}

const hoveredImage = computed(() => {
  const vehicle = vehicles.value.find((item) => item.vin === hoveredVin.value);
  const image = vehicle?.image || vehicle?.images?.[0];
  const src = image?.url ?? (typeof image === "string" ? image : null);
  // Block file:// URLs — browsers reject them from http:// pages.
  if (!src || String(src).startsWith("file:")) {
    return null;
  }
  return src;
});

function apiMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

async function loadVehicles() {
  loading.value = true;

  try {
    const response = await vehicleServices.getVehicles();
    vehicles.value = response.data.vehicles ?? [];
  } catch (error) {
    errorMessage.value = apiMessage(error, "Could not load vehicles.");
    vehicles.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadAreas() {
  try {
    const response = await areaServices.getAreas();
    areas.value = response.data;
  } catch (error) {
    errorMessage.value = apiMessage(error, "Could not load areas.");
  }
}

async function loadFuels() {
  try {
    const response = await vehicleServices.getFuels();
    fuels.value = response.data;
  } catch (error) {
    errorMessage.value = apiMessage(error, "Could not load fuel types.");
  }
}

function openAdd() {
  isEditMode.value = false;
  form.value = emptyForm();
  formError.value = "";
  showVehicleDialog.value = true;
}

function openEdit(vehicle) {
  isEditMode.value = true;
  form.value = {
    ...emptyForm(),
    vin: vehicle.vin,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color ?? "",
    license_plate_num: vehicle.license_plate_num ?? "",
    area_id: vehicle.area_id,
    purchased_date: dateOnly(vehicle.purchased_date),
    tag_exp_month: dateOnly(vehicle.tag_exp_month),
    most_recent_dest_id: vehicle.most_recent_dest_id ?? null,
    available: vehicle.available ?? 1,
    mileage: vehicle.mileage ?? null,
  };
  formError.value = "";
  showVehicleDialog.value = true;
}

function closeAllDialogs() {
  showVehicleDialog.value = false;
  showConfirmMaintenanceInfo.value = false;
  showConfirmFuelType.value = false;
  needMaintenanceInfo.value = false;
  needFuelType.value = false;
}

function cancelConfirm() {
  showConfirmMaintenanceInfo.value = false;
  showConfirmFuelType.value = false;
  needMaintenanceInfo.value = false;
  needFuelType.value = false;
}

function isBaseFormValid() {
  const f = form.value;
  const make = String(f.make ?? "").trim();
  const model = String(f.model ?? "").trim();
  const license = String(f.license_plate_num ?? "").trim();
  const color = String(f.color ?? "").trim();
  const year = Number(f.year);
  const areaId = f.area_id == null || f.area_id === "" ? null : Number(f.area_id);

  return (
    (isEditMode.value || /^\d{17}$/.test(String(f.vin ?? "").trim())) &&
    make.length > 0 &&
    make.length <= 30 &&
    model.length > 0 &&
    model.length <= 65 &&
    Number.isInteger(year) &&
    year >= 1900 &&
    year <= currentYear &&
    Number.isInteger(areaId) &&
    !!f.purchased_date &&
    f.purchased_date <= today() &&
    !!f.tag_exp_month &&
    license.length <= 8 &&
    color.length <= 20
  );
}

function isMaintenanceInfoFormValid() {
  const f = form.value;
  const fuelCapacity = Number(f.fuel_capacity);
  const tirePsi = Number(f.recommended_tire_psi);
  return (
    String(f.fuel_type ?? "").trim().length > 0 &&
    Number.isFinite(fuelCapacity) &&
    fuelCapacity >= 0 &&
    Number.isFinite(tirePsi) &&
    tirePsi >= 0 &&
    tirePsi <= 300
  );
}

function findFuel(name) {
  const wanted = String(name ?? "").trim().toLowerCase();
  return fuels.value.find((fuel) => String(fuel.fuel_type).toLowerCase() === wanted);
}

async function maintenanceInfoExists() {
  const { make, model, year } = form.value;

  try {
    await vehicleServices.getMaintenanceInfo(make.trim(), model.trim(), year);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }
    throw error;
  }
}

function vehiclePayload() {
  const f = form.value;
  return {
    vin: String(f.vin).trim(),
    make: String(f.make).trim(),
    model: String(f.model).trim(),
    year: Number(f.year),
    purchased_date: f.purchased_date,
    color: String(f.color ?? "").trim() || null,
    license_plate_num: String(f.license_plate_num ?? "").trim() || null,
    tag_exp_month: f.tag_exp_month,
    area_id: Number(f.area_id),
    most_recent_dest_id: f.most_recent_dest_id,
    available: f.available,
    mileage: f.mileage,
  };
}

async function submitVehicle() {
  if (!isBaseFormValid()) {
    formError.value = FORM_ERROR;
    return;
  }

  formError.value = "";
  saving.value = true;
  errorMessage.value = "";

  try {
    const infoMissing = !(await maintenanceInfoExists());

    if (infoMissing && !isMaintenanceInfoFormValid()) {
      formError.value = FORM_ERROR;
      return;
    }

    const fuelName = String(form.value.fuel_type ?? "").trim();
    const fuelMissing = !!fuelName && !findFuel(fuelName);

    if (!infoMissing && !fuelMissing) {
      await saveVehicle();
      return;
    }

    needMaintenanceInfo.value = infoMissing;
    needFuelType.value = fuelMissing;
    showConfirmMaintenanceInfo.value = infoMissing;
    // Opened last so it stacks above the maintenance info confirmation.
    showConfirmFuelType.value = fuelMissing;
  } catch (error) {
    errorMessage.value = apiMessage(error, "Could not save vehicle.");
    closeAllDialogs();
  } finally {
    saving.value = false;
  }
}

async function saveVehicle() {
  const payload = vehiclePayload();

  if (isEditMode.value) {
    await vehicleServices.updateVehicle(payload.vin, payload);
  } else {
    await vehicleServices.createVehicle(payload);
  }

  closeAllDialogs();
  await loadVehicles();
}

async function createAndSave() {
  const fuelName = String(form.value.fuel_type ?? "").trim();
  const needInfo = needMaintenanceInfo.value;
  const needFuel = needFuelType.value;

  showConfirmMaintenanceInfo.value = false;
  showConfirmFuelType.value = false;
  showVehicleDialog.value = false;
  saving.value = true;
  errorMessage.value = "";

  try {
    let fuel = findFuel(fuelName);

    if (needFuel) {
      const response = await vehicleServices.createFuel({ fuel_type: fuelName });
      fuel = { fuel_id: response.data.fuel_id, fuel_type: fuelName };
      fuels.value = [...fuels.value, fuel];
    }

    if (needInfo) {
      await vehicleServices.createMaintenanceInfo({
        make: String(form.value.make).trim(),
        model: String(form.value.model).trim(),
        year: Number(form.value.year),
        fuel_type_id: fuel?.fuel_id,
        fuel_capacity: Number(form.value.fuel_capacity),
        recommended_tire_psi: Number(form.value.recommended_tire_psi),
        tire_type: DEFAULT_TIRE_TYPE,
      });
    }

    await saveVehicle();
  } catch (error) {
    errorMessage.value = apiMessage(error, "Could not save vehicle.");
    closeAllDialogs();
  } finally {
    saving.value = false;
  }
}

async function confirmMaintenanceInfo() {
  await createAndSave();
}

async function confirmFuelType() {
  if (showConfirmMaintenanceInfo.value) {
    // Maintenance info confirmation is still pending behind this modal.
    showConfirmFuelType.value = false;
    return;
  }

  await createAndSave();
}

async function removeVehicle(vehicle) {
  errorMessage.value = "";

  try {
    await vehicleServices.deleteVehicle(vehicle.vin);
    await loadVehicles();
  } catch (error) {
    errorMessage.value = apiMessage(error, "Could not delete vehicle.");
  }
}

function openMaintenance(vehicle) {
  return router.push({ name: "maintenance", params: { vin: vehicle.vin } });
}

onMounted(() => {
  loadVehicles();
  loadAreas();
  loadFuels();
});
</script>

<template>
  <v-container class="py-10">
    <v-row align="center" class="mb-4">
      <v-col>
        <h1 class="text-h4">Vehicle Management</h1>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" variant="elevated" class="oc-cta" type="button" @click="openAdd">
          Add Vehicle
        </v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>

    <v-row>
      <v-col cols="12" md="3">
        <v-select v-model="filters.year" :items="years" label="Year" clearable />
      </v-col>
      <v-col cols="12" md="3">
        <v-combobox v-model="filters.make" :items="makes" label="Make" clearable />
      </v-col>
      <v-col cols="12" md="3">
        <v-combobox v-model="filters.model" :items="models" label="Model" clearable />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field v-model="filters.color" label="Color" clearable />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filters.area_id"
          :items="areas"
          item-title="name"
          item-value="id"
          label="Area"
          clearable
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field v-model="filters.license" label="License" clearable />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field v-model="filters.fromPurchaseDate" type="date" label="From Purchase Date" />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filters.beforePurchaseDate"
          type="date"
          label="Before Purchase Date"
        />
      </v-col>
    </v-row>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />
    <v-alert v-if="!loading && vehicles.length === 0" type="info" class="mb-4">
      No vehicles to display
    </v-alert>

    <v-table>
      <thead>
        <tr>
          <th>License</th>
          <th>Make</th>
          <th>Model</th>
          <th>Year</th>
          <th>Purchase Date</th>
          <th>Color</th>
          <th>Department</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="vehicle in filteredVehicles"
          :key="vehicle.vin"
          @mouseenter="hoveredVin = vehicle.vin"
          @mouseleave="hoveredVin = null"
        >
          <td>{{ vehicle.license_plate_num || "No License Plate" }}</td>
          <td>{{ vehicle.make }}</td>
          <td>{{ vehicle.model }}</td>
          <td>{{ vehicle.year }}</td>
          <td>{{ dateOnly(vehicle.purchased_date) }}</td>
          <td>{{ vehicle.color || "No Color" }}</td>
          <td>{{ areaName(vehicle) }}</td>
          <td>
            <v-btn
              icon="mdi-wrench"
              size="small"
              variant="text"
              type="button"
              aria-label="Maintenance"
              @click="openMaintenance(vehicle)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              type="button"
              aria-label="Edit"
              @click="openEdit(vehicle)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              type="button"
              aria-label="Delete"
              @click="removeVehicle(vehicle)"
            />
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-card v-if="hoveredImage" class="vehicle-image-preview" elevation="4">
      <img :src="hoveredImage" alt="Vehicle" />
    </v-card>

    <v-dialog v-model="showVehicleDialog" max-width="720">
      <v-card id="vehicle-dialog">
        <v-card-item>
          <v-card-title>{{ isEditMode ? "Edit Vehicle" : "Add Vehicle" }}</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-alert v-if="formError" type="error" class="mb-4">{{ formError }}</v-alert>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.vin" label="VIN" :disabled="isEditMode" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.license_plate_num" label="License" />
            </v-col>
            <v-col cols="12" md="6">
              <v-combobox v-model="form.make" :items="makes" label="Make" />
            </v-col>
            <v-col cols="12" md="6">
              <v-combobox v-model="form.model" :items="models" label="Model" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="form.year" :items="years" label="Year" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.color" label="Color" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.area_id"
                :items="areas"
                item-title="name"
                item-value="id"
                label="Area"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.purchased_date"
                type="date"
                label="Purchase Date"
                :max="today()"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.tag_exp_month" type="date" label="Tag Expiration Month" />
            </v-col>
            <v-col cols="12" md="6">
              <v-combobox v-model="form.fuel_type" :items="fuelNames" label="Fuel Type" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.fuel_capacity"
                type="number"
                min="0"
                label="Fuel Capacity"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-number-input
                v-model="form.recommended_tire_psi"
                :min="0"
                :max="300"
                :step="1"
                :precision="2"
                control-variant="stacked"
                label="Recommended Tire PSI"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="showVehicleDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            :loading="saving"
            @click="submitVehicle"
          >
            {{ isEditMode ? "Update Vehicle" : "Add Vehicle" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConfirmMaintenanceInfo" max-width="480">
      <v-card id="confirm-maintenance-info">
        <v-card-item>
          <v-card-title>Confirm Add New Maintenance Info?</v-card-title>
        </v-card-item>
        <v-card-text>
          Do you want to create a new maintenance info of {{ form.make }}, {{ form.model }}, and
          {{ form.year }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="cancelConfirm">
            cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            @click="confirmMaintenanceInfo"
          >
            confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConfirmFuelType" max-width="480">
      <v-card id="confirm-fuel-type">
        <v-card-item>
          <v-card-title>Confirm Add New Fuel Type?</v-card-title>
        </v-card-item>
        <v-card-text>
          Do you want to create a new fuel type of {{ form.fuel_type }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="cancelConfirm">
            cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            @click="confirmFuelType"
          >
            confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.vehicle-image-preview {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: 200px;
  padding: 4px;
  z-index: 10;
}

.vehicle-image-preview img {
  display: block;
  width: 100%;
  border-radius: 4px;
}
</style>
