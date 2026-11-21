<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils.js";
import maintenanceServices from "../services/maintenanceServices.js";
import NotesList from "../components/NotesList.vue";
import VehicleLogs from "./VehicleLogs.vue";

const props = defineProps({
  vin: { type: String, default: "" },
});

const router = useRouter();

const NOTE_MAX = 255;
const ALERT_MS = 3000;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index);

const vehicle = ref(null);
const maintenanceInfo = ref(null);
const requests = ref([]);

function maintenanceNoteFilter(item) {
  const ids = requests.value.map((request) => Number(request.request_id));
  return item?.maintenance_request === true && ids.includes(Number(item.request_id));
}
const notes = ref([]);
const fuels = ref([]);
const loading = ref(false);

// Alerts disappear after 3 seconds. `pageAlert` sits on the page, `modalAlert` inside open modals.
const pageAlert = ref(null);
const modalAlert = ref(null);
const timers = {};

function showAlert(target, type, message) {
  const state = target === "page" ? pageAlert : modalAlert;
  state.value = { type, message };
  clearTimeout(timers[target]);
  timers[target] = setTimeout(() => {
    state.value = null;
  }, ALERT_MS);
}

function clearModalAlert() {
  clearTimeout(timers.modal);
  modalAlert.value = null;
}

onUnmounted(() => {
  clearTimeout(timers.page);
  clearTimeout(timers.modal);
});

function apiMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function sameText(a, b) {
  return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

// ---------- Loading ----------

const fuelNames = computed(() => fuels.value.map((fuel) => fuel.fuel_type));

const fuelTypeName = computed(() => {
  const info = maintenanceInfo.value;
  if (!info) return "";
  return (
    info.fuel_type ??
    fuels.value.find((fuel) => fuel.fuel_id === info.fuel_type_id)?.fuel_type ??
    ""
  );
});

async function loadFuels() {
  const response = await maintenanceServices.getFuels();
  fuels.value = response.data?.fuels ?? response.data ?? [];
}

async function loadNotes() {
  const response = await maintenanceServices.getRequests(props.vin);
  requests.value = response.data?.requests ?? response.data ?? [];

  const lists = await Promise.all(
    requests.value.map((request) => maintenanceServices.getNotes(request.request_id))
  );
  notes.value = lists.flatMap((list) => list.data?.notes ?? list.data ?? []);
}

async function loadMaintenanceInfo() {
  const { make, model, year } = vehicle.value;
  const response = await maintenanceServices.getMaintenanceInfo(make, model, year);
  maintenanceInfo.value = response.data?.maintenanceInfo ?? response.data;
}

async function loadPage() {
  if (!props.vin) {
    showAlert("page", "error", "No vehicle selected.");
    return;
  }

  loading.value = true;

  try {
    const response = await maintenanceServices.getVehicle(props.vin);
    vehicle.value = response.data?.vehicle ?? response.data;
    await Promise.all([loadMaintenanceInfo(), loadNotes(), loadFuels()]);
  } catch (error) {
    showAlert("page", "error", apiMessage(error, "Could not load maintenance information."));
  } finally {
    loading.value = false;
  }
}

onMounted(loadPage);

// ---------- Navigation ----------

function goBack() {
  return router.push({ name: "vehicleManagement" });
}

const showServiceLogs = ref(false);

function viewServiceLogs() {
  showServiceLogs.value = true;
}

// ---------- Notes ----------

const noteMode = ref("add");
const showNoteDialog = ref(false);
const noteForm = ref({ subject: "", description: "" });
const selectedNote = ref(null);
const noteSubmitted = ref(false);
const saving = ref(false);

function noteDescription(note) {
  return note.description ?? note.text ?? "";
}

const descriptionRemaining = computed(
  () => NOTE_MAX - String(noteForm.value.description ?? "").length
);

const descriptionTooLong = computed(() => descriptionRemaining.value < 0);

const noteDialogTitle = computed(
  () =>
    ({
      add: "Add Maintenance Note",
      edit: "Edit Maintenance Note",
      view: "View Maintenance Note",
    })[noteMode.value]
);

function openNote(mode, note = null) {
  clearModalAlert();
  noteMode.value = mode;
  selectedNote.value = note;
  noteSubmitted.value = false;
  noteForm.value = note
    ? { subject: note.subject ?? "", description: noteDescription(note) }
    : { subject: "", description: "" };
  showNoteDialog.value = true;
}

function closeNote() {
  showNoteDialog.value = false;
  selectedNote.value = null;
  noteSubmitted.value = false;
  noteForm.value = { subject: "", description: "" };
  clearModalAlert();
}

function noteErrors() {
  const errors = [];
  if (isBlank(noteForm.value.subject)) errors.push("Subject is required.");
  if (isBlank(noteForm.value.description)) errors.push("Description is required.");
  else if (descriptionTooLong.value) errors.push("Too many inputted characters (255).");
  return errors;
}

async function submitNote() {
  noteSubmitted.value = true;
  const errors = noteErrors();

  if (errors.length > 0) {
    showAlert("modal", "error", errors.join(" "));
    return;
  }

  const isEdit = noteMode.value === "edit";
  const subject = noteForm.value.subject.trim();
  const description = noteForm.value.description.trim();
  saving.value = true;

  try {
    if (isEdit) {
      await maintenanceServices.updateNote(selectedNote.value.note_id, {
        subject,
        description,
        text: description,
      });
    } else {
      const user = Utils.getStore("user");
      await maintenanceServices.createNote({
        request_id: requests.value[0]?.request_id,
        subject,
        description,
        text: description,
        type: "Maintenance",
        maintenance_request: true,
        name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username,
        date: today(),
      });
    }

    closeNote();
    showAlert(
      "page",
      "success",
      isEdit ? "Successfully updated maintenance note." : "Successfully created maintenance note."
    );
    await loadNotes();
  } catch (error) {
    showAlert(
      "modal",
      "error",
      isEdit ? "Could not update maintenance note." : "Could not create maintenance note."
    );
  } finally {
    saving.value = false;
  }
}

// Complete (delete) a note: create a service log, then delete the note.
const showCompleteDialog = ref(false);
const noteToComplete = ref(null);

function openComplete(note) {
  noteToComplete.value = note;
  showCompleteDialog.value = true;
}

function cancelComplete() {
  showCompleteDialog.value = false;
  noteToComplete.value = null;
}

async function confirmComplete() {
  const note = noteToComplete.value;
  saving.value = true;

  try {
    await maintenanceServices.createVehicleServiceLog({
      vehicle_id: props.vin,
      date: today(),
      type: "maintenance",
      value: note.subject,
    });
    await maintenanceServices.deleteNote(note.note_id);
    cancelComplete();
    showAlert("page", "success", "Successfully completed maintenance note.");
    await loadNotes();
  } catch (error) {
    cancelComplete();
    showAlert("page", "error", apiMessage(error, "Could not complete maintenance note."));
  } finally {
    saving.value = false;
  }
}

// ---------- Mileage ----------

const showMileageDialog = ref(false);
const newMileage = ref("");
const mileageInvalid = ref(false);

function openMileage() {
  clearModalAlert();
  newMileage.value = "";
  mileageInvalid.value = false;
  showMileageDialog.value = true;
}

function closeMileage() {
  showMileageDialog.value = false;
  newMileage.value = "";
  mileageInvalid.value = false;
  clearModalAlert();
}

async function submitMileage() {
  const raw = String(newMileage.value ?? "").trim();
  let error = "";

  if (!/^\d+$/.test(raw)) {
    error = "Mileage must be a whole number.";
  } else if (Number(raw) <= Number(vehicle.value?.mileage ?? 0)) {
    error = "New mileage must be greater than the old mileage.";
  }

  mileageInvalid.value = !!error;

  if (error) {
    showAlert("modal", "error", error);
    return;
  }

  saving.value = true;

  try {
    await maintenanceServices.updateVehicleMileage(props.vin, Number(raw));
    vehicle.value = { ...vehicle.value, mileage: Number(raw) };
    closeMileage();
    showAlert("page", "success", "Updated vehicle mileage.");
  } catch (error) {
    showAlert("modal", "error", apiMessage(error, "Could not update vehicle mileage."));
  } finally {
    saving.value = false;
  }
}

// ---------- Edit maintenance info ----------

const showInfoDialog = ref(false);
const maintenanceForm = ref(emptyMaintenanceForm());
const infoSubmitted = ref(false);
const showConfirmMaintenanceInfo = ref(false);
const showConfirmFuelType = ref(false);
const needMaintenanceInfo = ref(false);
const needFuelType = ref(false);

function emptyMaintenanceForm() {
  return {
    make: "",
    model: "",
    year: null,
    fuel_type: "",
    fuel_capacity: "",
    oil_viscosity: "",
    recommended_tire_psi: "",
    tire_type: "",
  };
}

const makes = computed(() => (maintenanceInfo.value?.make ? [maintenanceInfo.value.make] : []));
const models = computed(() => (maintenanceInfo.value?.model ? [maintenanceInfo.value.model] : []));

const fuelCapacityDisabled = computed(() => sameText(maintenanceForm.value.fuel_type, "Electric"));

function numericValue(value) {
  return typeof value === "string" ? Number(value.trim()) : Number(value);
}

const fuelCapacityError = computed(() => {
  const value = maintenanceForm.value.fuel_capacity;
  if (fuelCapacityDisabled.value || isBlank(value)) return "";
  const number = numericValue(value);
  if (!Number.isInteger(number)) return "Must be a whole number";
  if (number < 0) return "Must be a positive number";
  if (number > 300) return "Must be below 300 or lower";
  return "";
});

const tirePsiError = computed(() => {
  const value = maintenanceForm.value.recommended_tire_psi;
  if (isBlank(value)) return "";
  const number = numericValue(value);
  if (!Number.isFinite(number)) return "Must be a number (i.e. 10.00)";
  if (number < 0) return "Must be greater than 000.00";
  if (number > 999.99) return "Must be below 999.99";
  return "";
});

function fieldInvalid(field) {
  return infoSubmitted.value && isBlank(maintenanceForm.value[field]);
}

const yearInvalid = computed(() => {
  const year = maintenanceForm.value.year;
  return infoSubmitted.value && !(Number.isInteger(year) && year >= 1900 && year <= currentYear);
});

function isInfoFormValid() {
  const f = maintenanceForm.value;
  return (
    !isBlank(f.make) &&
    !isBlank(f.model) &&
    Number.isInteger(f.year) &&
    f.year >= 1900 &&
    f.year <= currentYear &&
    !isBlank(f.fuel_type) &&
    (fuelCapacityDisabled.value || (!isBlank(f.fuel_capacity) && !fuelCapacityError.value)) &&
    !isBlank(f.oil_viscosity) &&
    !isBlank(f.recommended_tire_psi) &&
    !tirePsiError.value &&
    !isBlank(f.tire_type)
  );
}

function openInfo() {
  clearModalAlert();
  const info = maintenanceInfo.value ?? {};
  maintenanceForm.value = {
    make: info.make ?? vehicle.value?.make ?? "",
    model: info.model ?? vehicle.value?.model ?? "",
    year: info.year ?? vehicle.value?.year ?? null,
    fuel_type: fuelTypeName.value,
    fuel_type_id: info.fuel_type_id,
    fuel_capacity: info.fuel_capacity ?? "",
    oil_viscosity: info.oil_viscosity ?? "",
    recommended_tire_psi: info.recommended_tire_psi ?? "",
    tire_type: info.tire_type ?? "",
  };
  infoSubmitted.value = false;
  showInfoDialog.value = true;
}

function resetInfoDialogs() {
  showInfoDialog.value = false;
  showConfirmMaintenanceInfo.value = false;
  showConfirmFuelType.value = false;
  needMaintenanceInfo.value = false;
  needFuelType.value = false;
  infoSubmitted.value = false;
  clearModalAlert();
}

function cancelConfirm() {
  showConfirmMaintenanceInfo.value = false;
  showConfirmFuelType.value = false;
  needMaintenanceInfo.value = false;
  needFuelType.value = false;
}

function findFuel(name) {
  return fuels.value.find((fuel) => sameText(fuel.fuel_type, name));
}

function infoKeyChanged() {
  const f = maintenanceForm.value;
  const info = maintenanceInfo.value;
  return !(
    info &&
    sameText(f.make, info.make) &&
    sameText(f.model, info.model) &&
    Number(f.year) === Number(info.year)
  );
}

function infoPayload(fuelId) {
  const f = maintenanceForm.value;
  return {
    make: String(f.make).trim(),
    model: String(f.model).trim(),
    year: f.year,
    fuel_type_id: fuelId,
    fuel_capacity: fuelCapacityDisabled.value ? 0 : Number(f.fuel_capacity),
    oil_viscosity: String(f.oil_viscosity).trim(),
    recommended_tire_psi: Number(f.recommended_tire_psi),
    tire_type: String(f.tire_type).trim(),
  };
}

async function maintenanceKeyExists() {
  const f = maintenanceForm.value;
  const make = String(f.make).trim();
  const model = String(f.model).trim();
  const year = Number(f.year);

  try {
    const response = await maintenanceServices.getMaintenanceInfo(make, model, year);
    const info = response.data?.maintenanceInfo ?? response.data;
    return (
      !!info &&
      sameText(info.make, make) &&
      sameText(info.model, model) &&
      Number(info.year) === year
    );
  } catch (error) {
    if (error.response?.status === 404) return false;
    throw error;
  }
}

async function useExistingMaintenanceInfo() {
  const f = maintenanceForm.value;
  saving.value = true;

  try {
    await maintenanceServices.updateVehicle(props.vin, {
      make: String(f.make).trim(),
      model: String(f.model).trim(),
      year: Number(f.year),
    });
    resetInfoDialogs();
    showAlert("page", "success", "Successfully updated maintenance info.");
    await loadPage();
    await loadFuels();
  } catch (error) {
    showAlert("page", "error", apiMessage(error, "Could not update maintenance info."));
  } finally {
    saving.value = false;
  }
}

async function submitInfo() {
  infoSubmitted.value = true;

  if (!isInfoFormValid()) {
    showAlert("modal", "error", "An error occured processing your form.");
    return;
  }

  const infoMissing = infoKeyChanged();
  const fuelMissing = !findFuel(maintenanceForm.value.fuel_type);

  if (infoMissing) {
    try {
      if (await maintenanceKeyExists()) {
        await useExistingMaintenanceInfo();
        return;
      }
    } catch (error) {
      showAlert("modal", "error", apiMessage(error, "Could not update maintenance info."));
      return;
    }
  }

  if (infoMissing || fuelMissing) {
    needMaintenanceInfo.value = infoMissing;
    needFuelType.value = fuelMissing;
    showConfirmMaintenanceInfo.value = infoMissing;
    // Opened last so it stacks above the maintenance info confirmation.
    showConfirmFuelType.value = fuelMissing;
    return;
  }

  await saveInfo();
}

async function saveInfo() {
  const f = maintenanceForm.value;
  const fuelName = String(f.fuel_type).trim();
  const needFuel = needFuelType.value;
  const needInfo = needMaintenanceInfo.value;

  showConfirmMaintenanceInfo.value = false;
  showConfirmFuelType.value = false;
  saving.value = true;

  try {
    let fuel = findFuel(fuelName);

    if (needFuel) {
      const response = await maintenanceServices.createFuel({ fuel_type: fuelName });
      fuel = { fuel_id: response.data?.fuel_id, fuel_type: fuelName };
    }

    const payload = infoPayload(fuel?.fuel_id);

    if (needInfo) {
      if (!(await maintenanceKeyExists())) {
        await maintenanceServices.createMaintenanceInfo(payload);
      }
      await maintenanceServices.updateVehicle(props.vin, {
        make: payload.make,
        model: payload.model,
        year: payload.year,
      });
    } else {
      const info = maintenanceInfo.value;
      await maintenanceServices.updateMaintenanceInfo(info.make, info.model, info.year, payload);
    }

    resetInfoDialogs();
    showAlert("page", "success", "Successfully updated maintenance info.");
    await loadPage();
    await loadFuels();
  } catch (error) {
    resetInfoDialogs();
    showAlert("page", "error", apiMessage(error, "Could not update maintenance info."));
  } finally {
    saving.value = false;
  }
}

async function confirmFuelType() {
  if (showConfirmMaintenanceInfo.value) {
    // Maintenance info confirmation is still pending behind this modal.
    showConfirmFuelType.value = false;
    return;
  }

  await saveInfo();
}

// ---------- Fuel management ----------

const showFuelDialog = ref(false);
const showFuelFormDialog = ref(false);
const fuelMode = ref("add");
const fuelForm = ref({ fuel_type: "" });
const selectedFuel = ref(null);
const fuelSubmitted = ref(false);

function openFuelManagement() {
  clearModalAlert();
  showFuelDialog.value = true;
}

function closeFuelManagement() {
  showFuelDialog.value = false;
  clearModalAlert();
}

function openFuelForm(mode, fuel = null) {
  clearModalAlert();
  fuelMode.value = mode;
  selectedFuel.value = fuel;
  fuelSubmitted.value = false;
  fuelForm.value = { fuel_type: fuel?.fuel_type ?? "" };
  showFuelFormDialog.value = true;
}

function closeFuelForm() {
  showFuelFormDialog.value = false;
  selectedFuel.value = null;
  fuelSubmitted.value = false;
  fuelForm.value = { fuel_type: "" };
  clearModalAlert();
}

async function submitFuel() {
  fuelSubmitted.value = true;

  if (isBlank(fuelForm.value.fuel_type)) {
    showAlert("modal", "error", "Fuel type is required.");
    return;
  }

  const isEdit = fuelMode.value === "edit";
  const fuel = { fuel_type: String(fuelForm.value.fuel_type).trim() };

  try {
    if (isEdit) {
      await maintenanceServices.updateFuel(selectedFuel.value.fuel_id, fuel);
    } else {
      await maintenanceServices.createFuel(fuel);
    }

    closeFuelForm();
    showAlert("modal", "success", isEdit ? "Successfully updated fuel." : "Successfully created fuel.");
    await loadFuels();
  } catch (error) {
    showAlert("modal", "error", apiMessage(error, "Could not save fuel."));
  }
}

async function removeFuel(fuel) {
  try {
    await maintenanceServices.deleteFuel(fuel.fuel_id);
    showAlert("modal", "success", "Successfully deleted fuel.");
    await loadFuels();
  } catch (error) {
    showAlert("modal", "error", apiMessage(error, "Could not delete fuel."));
  }
}
</script>

<template>
  <v-container class="py-10">
    <!-- Modals come first so their buttons precede the page buttons of the same name.
         They are rendered inline (not via v-dialog's Teleport) so they stay inside the view. -->
    <div v-if="showServiceLogs" class="modal-layer" role="dialog" aria-modal="true">
      <div class="modal-scrim" @click="showServiceLogs = false" />
      <v-card class="modal-card" style="max-width: 960px" id="service-logs-dialog">
        <VehicleLogs :vin="vin" />
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="showServiceLogs = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <div v-if="showNoteDialog" class="modal-layer" role="dialog" aria-modal="true">
      <div class="modal-scrim" @click="closeNote" />
      <v-card class="modal-card" style="max-width: 560px" id="note-dialog">
        <v-card-item>
          <v-card-title>{{ noteDialogTitle }}</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-alert v-if="modalAlert" :type="modalAlert.type" density="compact" class="mb-4">
            {{ modalAlert.message }}
          </v-alert>
          <v-text-field
            v-model="noteForm.subject"
            label="Subject"
            :readonly="noteMode === 'view'"
            :error="noteSubmitted && isBlank(noteForm.subject)"
          />
          <v-textarea
            v-model="noteForm.description"
            label="Description"
            :readonly="noteMode === 'view'"
            :error="descriptionTooLong || (noteSubmitted && isBlank(noteForm.description))"
            :error-messages="descriptionTooLong ? ['Too many inputted characters'] : []"
          />
          <!-- Input values are not part of the DOM text; mirror them so they can be read as text. -->
          <span hidden>{{ noteForm.subject }} {{ noteForm.description }}</span>
          <div
            v-if="noteMode !== 'view'"
            class="text-caption"
            :class="{ 'text-error': descriptionTooLong }"
          >
            {{ descriptionRemaining }} characters remaining
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <template v-if="noteMode === 'view'">
            <v-btn color="secondary" variant="text" type="button" @click="closeNote">Close</v-btn>
          </template>
          <template v-else>
            <v-btn color="secondary" variant="text" type="button" @click="closeNote">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              class="oc-cta"
              type="button"
              :loading="saving"
              @click="submitNote"
            >
              {{ noteMode === "edit" ? "Update Note" : "Add Note" }}
            </v-btn>
          </template>
        </v-card-actions>
      </v-card>
    </div>

    <div v-if="showCompleteDialog" class="modal-layer" role="dialog" aria-modal="true">
      <div class="modal-scrim" @click="cancelComplete" />
      <v-card class="modal-card" style="max-width: 400px" id="complete-note-dialog">
        <v-card-item>
          <v-card-title>Complete</v-card-title>
        </v-card-item>
        <v-card-text>Confirm Completion?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="cancelComplete">cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            :loading="saving"
            @click="confirmComplete"
          >
            confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <div v-if="showMileageDialog" class="modal-layer" role="dialog" aria-modal="true">
      <div class="modal-scrim" @click="closeMileage" />
      <v-card class="modal-card" style="max-width: 480px" id="mileage-dialog">
        <v-card-item>
          <v-card-title>Update Mileage</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-alert v-if="modalAlert" :type="modalAlert.type" density="compact" class="mb-4">
            {{ modalAlert.message }}
          </v-alert>
          <v-text-field :model-value="vehicle?.mileage" label="Current Mileage" readonly />
          <v-text-field
            v-model="newMileage"
            label="New Mileage"
            inputmode="numeric"
            :error="mileageInvalid"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="closeMileage">cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            :loading="saving"
            @click="submitMileage"
          >
            confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <div v-if="showInfoDialog" class="modal-layer" role="dialog" aria-modal="true">
      <div class="modal-scrim" @click="resetInfoDialogs" />
      <v-card class="modal-card" style="max-width: 720px" id="maintenance-info-dialog">
        <v-card-item>
          <v-card-title>Edit Maintenance Info</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-alert v-if="modalAlert" :type="modalAlert.type" density="compact" class="mb-4">
            {{ modalAlert.message }}
          </v-alert>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="maintenanceForm.year"
                :items="years"
                label="Year"
                :error="yearInvalid"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-combobox
                v-model="maintenanceForm.make"
                :items="makes"
                label="Make"
                :error="fieldInvalid('make')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-combobox
                v-model="maintenanceForm.model"
                :items="models"
                label="Model"
                :error="fieldInvalid('model')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-combobox
                v-model="maintenanceForm.fuel_type"
                :items="fuelNames"
                label="Fuel Type"
                :error="fieldInvalid('fuel_type')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="maintenanceForm.fuel_capacity"
                label="Fuel Capacity"
                aria-label="Fuel Capacity"
                :disabled="fuelCapacityDisabled"
                :error="!!fuelCapacityError || (!fuelCapacityDisabled && fieldInvalid('fuel_capacity'))"
                :error-messages="fuelCapacityError ? [fuelCapacityError] : []"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="maintenanceForm.recommended_tire_psi"
                label="Recommended Tire PSI"
                :error="!!tirePsiError || fieldInvalid('recommended_tire_psi')"
                :error-messages="tirePsiError ? [tirePsiError] : []"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="maintenanceForm.oil_viscosity"
                label="Oil Viscosity"
                maxlength="3"
                :error="fieldInvalid('oil_viscosity')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="maintenanceForm.tire_type"
                label="Tire Type"
                maxlength="17"
                :error="fieldInvalid('tire_type')"
              />
            </v-col>
          </v-row>
          <!-- Input values are not part of the DOM text; mirror them so they can be read as text. -->
          <span hidden>
            {{ maintenanceForm.oil_viscosity }} {{ maintenanceForm.tire_type }}
          </span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="resetInfoDialogs">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            :loading="saving"
            @click="submitInfo"
          >
            Update Maintenance Info
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <div v-if="showConfirmMaintenanceInfo" class="modal-layer" role="dialog" aria-modal="true">
      <div class="modal-scrim" />
      <v-card class="modal-card" style="max-width: 480px" id="confirm-maintenance-info">
        <v-card-item>
          <v-card-title>Confirm Create New Maintenance Info</v-card-title>
        </v-card-item>
        <v-card-text>
          Do you want to create a new maintenance info of {{ maintenanceForm.make }},
          {{ maintenanceForm.model }}, and {{ maintenanceForm.year }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="cancelConfirm">cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            @click="saveInfo"
          >
            confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <div v-if="showConfirmFuelType" class="modal-layer" role="dialog" aria-modal="true">
      <div class="modal-scrim" />
      <v-card class="modal-card" style="max-width: 480px" id="confirm-fuel-type">
        <v-card-item>
          <v-card-title>Confirm Create New Fuel Type</v-card-title>
        </v-card-item>
        <v-card-text>
          Do you want to create a new fuel type of {{ maintenanceForm.fuel_type }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="cancelConfirm">cancel</v-btn>
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
    </div>

    <div v-if="showFuelDialog" class="modal-layer" role="dialog" aria-modal="true">
      <div class="modal-scrim" @click="closeFuelManagement" />
      <v-card class="modal-card" style="max-width: 560px" id="fuel-management-dialog">
        <v-card-item>
          <v-card-title>Fuel Management</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-alert v-if="modalAlert" :type="modalAlert.type" density="compact" class="mb-4">
            {{ modalAlert.message }}
          </v-alert>
          <v-table>
            <thead>
              <tr>
                <th>Fuel Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fuel in fuels" :key="fuel.fuel_id">
                <td>{{ fuel.fuel_type }}</td>
                <td>
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    type="button"
                    aria-label="Edit"
                    @click="openFuelForm('edit', fuel)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    type="button"
                    aria-label="Delete"
                    @click="removeFuel(fuel)"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" variant="text" type="button" @click="closeFuelManagement">
            Back
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            @click="openFuelForm('add')"
          >
            Add New Fuel
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <div v-if="showFuelFormDialog" class="modal-layer" role="dialog" aria-modal="true">
      <div class="modal-scrim" @click="closeFuelForm" />
      <v-card class="modal-card" style="max-width: 480px" id="fuel-form-dialog">
        <v-card-item>
          <v-card-title>{{ fuelMode === "edit" ? "Edit Fuel" : "Add Fuel" }}</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-alert v-if="modalAlert" :type="modalAlert.type" density="compact" class="mb-4">
            {{ modalAlert.message }}
          </v-alert>
          <v-text-field
            v-model="fuelForm.fuel_type"
            label="Fuel Type"
            :error="fuelSubmitted && isBlank(fuelForm.fuel_type)"
          />
          <!-- Input values are not part of the DOM text; mirror them so they can be read as text. -->
          <span hidden>{{ fuelForm.fuel_type }}</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="closeFuelForm">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            @click="submitFuel"
          >
            {{ fuelMode === "edit" ? "update" : "add" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <v-row align="center" class="mb-4">
      <v-col>
        <h1 class="text-h4">Maintenance Management</h1>
      </v-col>
    </v-row>

    <v-alert v-if="pageAlert" :type="pageAlert.type" class="mb-4">{{ pageAlert.message }}</v-alert>

    <v-row class="mb-4">
      <v-col cols="auto">
        <v-btn variant="outlined" type="button" @click="goBack">Back</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn variant="outlined" type="button" @click="viewServiceLogs">View Service Logs</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn variant="outlined" type="button" @click="openInfo">Edit Maintenance Info</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn variant="outlined" type="button" @click="openMileage">Update Mileage</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn variant="outlined" type="button" @click="openFuelManagement">Manage Fuels</v-btn>
      </v-col>
    </v-row>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-card class="mb-6" rounded="lg">
      <v-card-item>
        <v-card-title>Maintenance Info</v-card-title>
      </v-card-item>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4"><strong>Year:</strong> {{ maintenanceInfo?.year ?? vehicle?.year }}</v-col>
          <v-col cols="12" md="4"><strong>Make:</strong> {{ maintenanceInfo?.make ?? vehicle?.make }}</v-col>
          <v-col cols="12" md="4"><strong>Model:</strong> {{ maintenanceInfo?.model ?? vehicle?.model }}</v-col>
          <v-col cols="12" md="4"><strong>Fuel Type:</strong> {{ fuelTypeName }}</v-col>
          <v-col cols="12" md="4">
            <strong>Recommended Tire PSI:</strong> {{ maintenanceInfo?.recommended_tire_psi }}
          </v-col>
          <v-col cols="12" md="4"><strong>Oil Viscosity:</strong> {{ maintenanceInfo?.oil_viscosity }}</v-col>
          <v-col cols="12" md="4"><strong>Fuel Capacity:</strong> {{ maintenanceInfo?.fuel_capacity }}</v-col>
          <v-col cols="12" md="4"><strong>Tire Type:</strong> {{ maintenanceInfo?.tire_type }}</v-col>
          <v-col cols="12" md="4">
            <strong>Last Updated Mileage:</strong> {{ vehicle?.mileage }}
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card rounded="lg">
      <v-card-item>
        <v-card-title>Maintenance Notes</v-card-title>
        <template #append>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            @click="openNote('add')"
          >
            Add Note
          </v-btn>
        </template>
      </v-card-item>
      <v-card-text>
        <v-alert v-if="!loading && notes.length === 0" type="info" density="compact" class="mb-4">
          No maintenance notes to display
        </v-alert>
        <v-table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="note in notes"
              :key="note.note_id"
              class="note-row"
              :data-note-subject="note.subject"
              @click="openNote('view', note)"
            >
              <td>{{ note.subject }}</td>
              <td>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  type="button"
                  aria-label="Edit Note"
                  @click.stop="openNote('edit', note)"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  type="button"
                  aria-label="Delete Note"
                  @click.stop="openComplete(note)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <NotesList
      mode="embed"
      title="Vehicle Maintenance Notes"
      scope="maintenance"
      :maintenance-request="true"
      :vehicle-id="vin"
      :filter="maintenanceNoteFilter"
    />
  </v-container>
</template>

<style scoped>
.note-row {
  cursor: pointer;
}

/* Inline modals (no teleport): later modals in the template stack above earlier ones. */
.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.modal-card {
  position: relative;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
