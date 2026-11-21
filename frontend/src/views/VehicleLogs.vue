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
const createError = ref("");
const editError = ref("");
const people = ref([]);
const selectedOwnerId = ref(null);

const completedChoices = [
  { title: "Yes", value: true },
  { title: "No", value: false },
];

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

const editWritable = computed(() => canChange(editForm.value));
const visibleLogs = computed(() => {
  if (!props.vin) {
    return logs.value;
  }

  return logs.value.filter((log) => log.vin === props.vin);
});

function completedLabel(value) {
  return value ? "Yes" : "No";
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

function ownerValue(value) {
  if (value && typeof value === "object") {
    return value.id ?? "";
  }

  return value ?? "";
}

function ownersText(ids) {
  return (ids || [])
    .map((id) => {
      const person = people.value.find((user) => Number(user.id) === Number(id));
      return person ? personLabel(person) : String(id);
    })
    .join(", ");
}

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
    completed: source.completed,
  };
}

function incomplete(source) {
  return !source.serviceDate || !source.vin.trim() || !source.description.trim() || source.completed === null;
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
    completed: log.completed,
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
    const response = await vehicleLogServices.updateLog(editForm.value.id, payloadFrom(editForm.value));
    logs.value = logs.value.map((log) => (log.id === response.data.id ? response.data : log));
    closeEdit();
  } catch (error) {
    editError.value = error.response?.data?.message || "Unable to update the vehicle log.";
    errorMessage.value = editError.value;
  } finally {
    saving.value = false;
  }
}

async function deleteLog() {
  saving.value = true;
  editError.value = "";

  try {
    await vehicleLogServices.removeLog(editForm.value.id);
    logs.value = logs.value.filter((log) => log.id !== editForm.value.id);
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

async function addOwner() {
  const userId = chosenOwnerId();

  if (!Number.isInteger(userId) || userId <= 0) {
    editError.value = "Vehicle log is incomplete!";
    return;
  }

  saving.value = true;
  editError.value = "";

  try {
    const response = await vehicleLogServices.addOwner(editForm.value.id, userId);
    editForm.value = {
      ...editForm.value,
      ownerIds: response.data.ownerIds,
    };
    logs.value = logs.value.map((log) => (log.id === response.data.id ? response.data : log));
    selectedOwnerId.value = null;
  } catch (error) {
    editError.value = error.response?.data?.message || "Unable to add the owner.";
    errorMessage.value = editError.value;
  } finally {
    saving.value = false;
  }
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
          <v-select v-model="createForm.completed" label="Completed" :items="completedChoices" />
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
          <v-text-field v-model="editForm.serviceDate" label="Service date" type="date" :readonly="!editWritable" />
          <v-text-field v-model="editForm.vin" label="Vehicle" :readonly="!editWritable" />
          <v-text-field v-model="editForm.description" label="Description" :readonly="!editWritable" />
          <v-select
            v-model="editForm.completed"
            label="Completed"
            :items="completedChoices"
            :readonly="!editWritable"
          />
          <div v-if="ownersText(editForm.ownerIds)" class="mb-4">
            Owners: {{ ownersText(editForm.ownerIds) }}
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
        <v-card-actions v-if="editWritable">
          <v-btn color="secondary" variant="text" type="button" :loading="saving" @click="deleteLog">
            Delete
          </v-btn>
          <v-btn color="secondary" variant="text" type="button" :loading="saving" @click="addOwner">
            Add owner
          </v-btn>
          <v-spacer />
          <v-btn color="primary" variant="elevated" class="oc-cta" type="button" :loading="saving" @click="saveEdit">
            Save
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
</style>
