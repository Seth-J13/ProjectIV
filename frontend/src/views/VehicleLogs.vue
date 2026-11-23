<script>
import Utils from "../config/utils.js";

export default {
  beforeRouteEnter(to, from, next) {
    const user = Utils.getStore("user");

    if (!user) {
      next({ name: "login" });
      return;
    }

    if (user.role !== "admin" && user.role !== "maintenance") {
      next({ name: "landing" });
      return;
    }

    next();
  },
};
</script>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import Utils from "../config/utils.js";
import vehicleLogServices from "../services/vehicleLogServices.js";

const props = defineProps({
  vin: { type: String, default: "" },
});

const logs = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const saving = ref(false);
const createOpen = ref(false);
const editOpen = ref(false);
const createDialog = ref(null);
const editDialog = ref(null);
const confirmDialog = ref(null);
const confirmOpen = ref(false);
const createError = ref("");
const editError = ref("");
const people = ref([]);
const selectedOwnerId = ref(null);

const completedChoices = ["Completed", "Not completed"];

function emptyForm() {
  return {
    id: null,
    serviceDate: "",
    vin: "",
    description: "",
    completed: null,
    creatorId: null,
    ownerIds: [],
  };
}

const createForm = ref(emptyForm());
const editForm = ref(emptyForm());
const currentUser = computed(() => Utils.getStore("user"));

function canChange(log) {
  const user = currentUser.value;

  if (!user || !log) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  return (log.ownerIds || []).map(Number).includes(Number(user.id));
}

function canDelete(log) {
  const user = currentUser.value;

  if (!user || !log) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  return Number(user.id) === Number(log.creatorId);
}

const editWritable = computed(() => canChange(editForm.value));
const editDeletable = computed(() => canDelete(editForm.value));
const recordEditable = computed(() => canDelete(editForm.value));
const visibleLogs = computed(() => {
  if (!props.vin) {
    return logs.value;
  }

  return logs.value.filter((log) => log.vin === props.vin);
});

function completedLabel(value) {
  if (value === true || value === "Completed") {
    return "Completed";
  }

  if (value === false || value === "Not completed") {
    return "Not completed";
  }

  return "";
}

function completedValue(value) {
  const label = completedLabel(value);
  if (label === "Completed") {
    return true;
  }
  if (label === "Not completed") {
    return false;
  }
  return null;
}

function personLabel(user) {
  const id = String(user.id);
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name ? `${name} (${id})` : id;
}

const ownerOptions = computed(() =>
  people.value
    .filter((user) => user?.id != null)
    .map((user) => ({
      id: String(user.id),
      label: personLabel(user),
    }))
);

const ownerMenuProps = computed(() => ({
  attach: editDialog.value ?? undefined,
  closeOnContentClick: true,
}));

const createMenuProps = computed(() => ({
  attach: createDialog.value ?? undefined,
  closeOnContentClick: true,
}));

const editMenuProps = computed(() => ({
  attach: editDialog.value ?? undefined,
  closeOnContentClick: true,
}));

function ownerValue(value) {
  if (value && typeof value === "object") {
    return value.id ?? "";
  }

  return value ?? "";
}

function ownerRowsFor(ids) {
  return (ids || []).map((id) => {
    const person = people.value.find((user) => Number(user.id) === Number(id));
    return {
      id: Number(id),
      label: person ? personLabel(person) : String(id),
    };
  });
}

function ownersText(ids) {
  return ownerRowsFor(ids)
    .map((owner) => owner.label)
    .join(", ");
}

const editOwners = computed(() => ownerRowsFor(editForm.value.ownerIds));

watch(selectedOwnerId, (value) => {
  if (!value || typeof value !== "object") {
    return;
  }

  const id = String(value.id ?? "").trim();

  if (id) {
    selectedOwnerId.value = id;
  }
});

function payloadFrom(source) {
  return {
    serviceDate: source.serviceDate,
    vin: source.vin.trim(),
    description: source.description.trim(),
    completed: completedValue(source.completed),
  };
}

function incomplete(source) {
  return (
    !source.serviceDate ||
    !source.vin.trim() ||
    !source.description.trim() ||
    completedValue(source.completed) === null
  );
}

async function loadOwnerChoices() {
  try {
    const response = await vehicleLogServices.listOwnerChoices();
    people.value = Array.isArray(response.data) ? response.data : [];
  } catch {
    people.value = [];
  }
}

async function loadLogs() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await vehicleLogServices.listLogs();
    logs.value = response.data ?? [];
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Unable to load vehicle logs.";
    logs.value = [];
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
  createForm.value = { ...emptyForm(), vin: props.vin || "" };
  createError.value = "";
  errorMessage.value = "";
  createOpen.value = true;
  await showDialog(createDialog);
}

async function openLog(log) {
  editForm.value = {
    id: log.id,
    serviceDate: log.serviceDate,
    vin: log.vin,
    description: log.description,
    completed: completedLabel(log.completed),
    creatorId: log.creatorId,
    ownerIds: log.ownerIds || [],
  };
  selectedOwnerId.value = null;
  editError.value = "";
  errorMessage.value = "";
  editOpen.value = true;
  await showDialog(editDialog);
}

function closeCreate() {
  createOpen.value = false;
  createError.value = "";
  createForm.value = emptyForm();

  if (createDialog.value?.open) {
    createDialog.value.close();
  }
}

function closeEdit() {
  editOpen.value = false;
  editError.value = "";
  editForm.value = emptyForm();
  selectedOwnerId.value = null;

  if (editDialog.value?.open) {
    editDialog.value.close();
  }
}

function onDialogClick(event, close) {
  if (event.target === event.currentTarget) {
    close();
  }
}

async function saveCreate() {
  if (incomplete(createForm.value)) {
    createError.value = "Vehicle log is incomplete!";
    return;
  }

  saving.value = true;
  createError.value = "";

  try {
    const response = await vehicleLogServices.createLog(payloadFrom(createForm.value));
    logs.value = [response.data, ...logs.value.filter((log) => log.id !== response.data.id)];
    closeCreate();
  } catch (error) {
    createError.value = error.response?.data?.message || "Unable to create the vehicle log.";
    errorMessage.value = createError.value;
  } finally {
    saving.value = false;
  }
}

async function saveEdit() {
  if (incomplete(editForm.value)) {
    editError.value = "Vehicle log is incomplete!";
    return;
  }

  saving.value = true;
  editError.value = "";

  try {
    let current = (
      await vehicleLogServices.updateLog(editForm.value.id, payloadFrom(editForm.value))
    ).data;
    const wanted = (editForm.value.ownerIds || []).map(Number);
    const savedIds = (current.ownerIds || []).map(Number);

    for (const userId of wanted) {
      if (!savedIds.includes(userId)) {
        current = (await vehicleLogServices.addOwner(editForm.value.id, userId)).data;
      }
    }

    for (const userId of savedIds) {
      if (!wanted.includes(userId)) {
        current = (await vehicleLogServices.removeOwner(editForm.value.id, userId)).data;
      }
    }

    logs.value = logs.value.map((log) => (log.id === current.id ? current : log));
    closeEdit();
  } catch (error) {
    editError.value = error.response?.data?.message || "Unable to update the vehicle log.";
    errorMessage.value = editError.value;
  } finally {
    saving.value = false;
  }
}

async function askDelete() {
  confirmOpen.value = true;
  await showDialog(confirmDialog);
}

function closeConfirm() {
  confirmOpen.value = false;

  if (confirmDialog.value?.open) {
    confirmDialog.value.close();
  }
}

async function deleteLog() {
  saving.value = true;
  editError.value = "";

  try {
    await vehicleLogServices.removeLog(editForm.value.id);
    logs.value = logs.value.filter((log) => log.id !== editForm.value.id);
    closeConfirm();
    closeEdit();
  } catch (error) {
    editError.value = error.response?.data?.message || "Unable to delete the vehicle log.";
    errorMessage.value = editError.value;
  } finally {
    saving.value = false;
  }
}

function chosenOwnerId() {
  const raw = String(ownerValue(selectedOwnerId.value) ?? "").trim();

  if (!/^\d+$/.test(raw)) {
    return null;
  }

  return Number(raw);
}

function addOwner() {
  const userId = chosenOwnerId();

  if (!Number.isInteger(userId) || userId <= 0) {
    editError.value = "Vehicle log is incomplete!";
    return;
  }

  const ownerIds = (editForm.value.ownerIds || []).map(Number);

  if (!ownerIds.includes(userId)) {
    editForm.value = {
      ...editForm.value,
      ownerIds: [...ownerIds, userId],
    };
  }

  selectedOwnerId.value = null;
  editError.value = "";
}

function removeOwner(userId) {
  editForm.value = {
    ...editForm.value,
    ownerIds: (editForm.value.ownerIds || []).map(Number).filter((id) => id !== Number(userId)),
  };
  editError.value = "";
}

onMounted(() => {
  loadLogs();
  loadOwnerChoices();
});
</script>

<template>
  <v-container class="py-10">
    <h1 class="text-h4 mb-6">Vehicle Service Logs</h1>

    <v-btn class="oc-cta mb-4" color="primary" variant="elevated" type="button" @click="openCreate">
      Create log
    </v-btn>

    <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4">
      {{ errorMessage }}
    </v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-table>
      <thead>
        <tr>
          <th>Service date</th>
          <th>Vehicle</th>
          <th>Description</th>
          <th>Completed</th>
          <th>Creator</th>
          <th>Owners</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in visibleLogs" :key="log.id" @click="openLog(log)">
          <td>{{ log.serviceDate }}</td>
          <td>{{ log.vin }}</td>
          <td>{{ log.description }}</td>
          <td>{{ completedLabel(log.completed) }}</td>
          <td>{{ log.creatorId }}</td>
          <td>{{ ownersText(log.ownerIds) }}</td>
        </tr>
      </tbody>
    </v-table>

    <dialog
      ref="createDialog"
      class="log-dialog"
      @cancel.prevent="closeCreate"
      @click="onDialogClick($event, closeCreate)"
    >
      <v-card v-if="createOpen" rounded="lg" max-width="520">
        <v-card-item>
          <v-card-title>Create log</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-alert v-if="createError" type="error" density="compact" class="mb-4">
            {{ createError }}
          </v-alert>
          <v-text-field v-model="createForm.serviceDate" label="Service date" type="date" />
          <v-text-field v-model="createForm.vin" label="Vehicle" :readonly="Boolean(props.vin)" />
          <v-text-field v-model="createForm.description" label="Description" />
          <v-combobox
            v-model="createForm.completed"
            :items="completedChoices"
            :menu-props="createMenuProps"
            :return-object="false"
            label="Completed"
            clearable
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="closeCreate">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" class="oc-cta" type="button" :loading="saving" @click="saveCreate">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </dialog>

    <dialog
      ref="editDialog"
      class="log-dialog"
      @cancel.prevent="closeEdit"
      @click="onDialogClick($event, closeEdit)"
    >
      <v-card v-if="editOpen" rounded="lg" max-width="520">
        <v-card-item>
          <v-card-title>Vehicle Service Logs</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-alert v-if="editError" type="error" density="compact" class="mb-4">
            {{ editError }}
          </v-alert>
          <div class="locked-field" :class="{ 'locked-field--on': !recordEditable }">
            <v-text-field
              v-model="editForm.serviceDate"
              label="Service date"
              type="date"
              :readonly="!editWritable || !recordEditable"
            />
            <span v-if="!recordEditable" class="locked-tip" role="tooltip">
              Only the original owner and admins can modify this field
            </span>
          </div>
          <div class="locked-field" :class="{ 'locked-field--on': !recordEditable }">
            <v-text-field
              v-model="editForm.vin"
              label="Vehicle"
              :readonly="!editWritable || !recordEditable"
            />
            <span v-if="!recordEditable" class="locked-tip" role="tooltip">
              Only the original owner and admins can modify this field
            </span>
          </div>
          <v-text-field v-model="editForm.description" label="Description" :readonly="!editWritable" />
          <v-combobox
            v-model="editForm.completed"
            :items="completedChoices"
            :menu-props="editMenuProps"
            :return-object="false"
            label="Completed"
            :readonly="!editWritable"
            clearable
          />
          <div v-if="editOwners.length" class="mb-4">
            <div class="mb-2">Owners</div>
            <div v-for="owner in editOwners" :key="owner.id" class="d-flex align-center justify-space-between mb-2">
              <span>{{ owner.label }}</span>
              <v-btn
                v-if="editWritable"
                color="secondary"
                variant="text"
                type="button"
                :loading="saving"
                @click="removeOwner(owner.id)"
              >
                Remove
              </v-btn>
            </div>
          </div>
          <v-combobox
            v-if="editWritable"
            v-model="selectedOwnerId"
            :items="ownerOptions"
            item-title="id"
            item-value="id"
            :return-object="false"
            :filter-keys="['raw.label', 'id']"
            :menu-props="ownerMenuProps"
            clearable
            label="User"
          >
            <template #item="{ item, props: itemProps }">
              <v-list-item v-bind="itemProps" :title="item.label" />
            </template>
          </v-combobox>
        </v-card-text>
        <v-card-actions v-if="editWritable || editDeletable">
          <v-btn
            v-if="editDeletable"
            color="secondary"
            variant="text"
            type="button"
            :loading="saving"
            @click="askDelete"
          >
            Delete
          </v-btn>
          <v-btn v-if="editWritable" color="secondary" variant="text" type="button" :loading="saving" @click="addOwner">
            Add owner
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="editWritable"
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

    <dialog
      ref="confirmDialog"
      class="log-dialog"
      @cancel.prevent="closeConfirm"
      @click="onDialogClick($event, closeConfirm)"
    >
      <v-card v-if="confirmOpen" rounded="lg" max-width="420">
        <v-card-item>
          <v-card-title>Delete log</v-card-title>
        </v-card-item>
        <v-card-text>Delete this vehicle service log?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="closeConfirm">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            :loading="saving"
            @click="deleteLog"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </dialog>
  </v-container>
</template>

<style scoped>
.log-dialog {
  border: none;
  padding: 0;
  background: transparent;
  max-width: 520px;
  width: calc(100% - 32px);
}

.log-dialog::backdrop {
  background: rgba(0, 0, 0, 0.32);
}

.locked-field {
  position: relative;
}

.locked-field--on {
  cursor: not-allowed;
}

.locked-field--on :deep(.v-field) {
  opacity: 0.55;
  pointer-events: none;
}

.locked-tip {
  display: none;
  position: absolute;
  z-index: 2;
  left: 0;
  bottom: 100%;
  max-width: 280px;
  margin-bottom: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgb(var(--v-theme-on-surface));
  color: rgb(var(--v-theme-surface));
  font-size: 0.875rem;
  line-height: 1.35;
}

.locked-field--on:hover .locked-tip,
.locked-field--on:focus-within .locked-tip {
  display: block;
}
</style>
