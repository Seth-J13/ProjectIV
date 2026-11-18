<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils.js";
import DestinationForm from "./DestinationForm.vue";
import { deleteDestination, listDestinations } from "../services/destinationServices.js";

const router = useRouter();
const user = Utils.getStore("user");
const allowed = ref(user?.role === "admin");

if (!allowed.value) {
  router.replace({ name: router.hasRoute("home") ? "home" : "landing" });
}

const destinations = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const search = ref("");
const searchAttribute = ref(null);
const sortKey = ref("");
const sortDir = ref("asc");
const showTop = ref(false);
const toast = ref("");
const showForm = ref(false);
const isAddMode = ref(true);
const editing = ref({});
const deleteOpen = ref(false);
const deleting = ref(false);
const pendingDelete = ref(null);
const sentinel = ref(null);
const deleteCard = ref(null);
const offset = ref(0);
const done = ref(false);

const searchAttributes = ["Name", "Street Address", "Address Line 2", "City", "State", "Zip Code"];

let listObserver;
let toastTimer;
let skipOutsideClick = false;

const attributeKeys = {
  City: "city",
  State: "state",
  "Zip Code": "zip",
  "Street Address": "addr_line_1",
  "Address Line 2": "addr_line_2",
  Name: "dest_name",
};

const visibleRows = computed(() => {
  const query = search.value.trim().toLowerCase();
  let rows = destinations.value;

  if (query) {
    const key = attributeKeys[searchAttribute.value] || "dest_name";
    rows = rows.filter((row) => String(row[key] ?? "").toLowerCase().includes(query));
  }

  if (!sortKey.value) {
    return rows;
  }

  const direction = sortDir.value === "asc" ? 1 : -1;

  return [...rows].sort(
    (left, right) =>
      String(left[sortKey.value] ?? "").localeCompare(String(right[sortKey.value] ?? ""), undefined, {
        sensitivity: "base",
      }) * direction
  );
});

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
    return;
  }

  sortKey.value = key;
  sortDir.value = "asc";
}

function updateTop() {
  showTop.value = (document.documentElement.scrollTop || window.scrollY || 0) > 0;
}

function toTop() {
  window.scrollTo({ top: 0 });
}

function clearToast() {
  toast.value = "";
  window.clearTimeout(toastTimer);
}

function showToast(message) {
  toast.value = message;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(clearToast, 3000);
}

async function reload() {
  done.value = false;
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await listDestinations(0);
    const batch = Array.isArray(response.data) ? response.data : [];
    destinations.value = batch;
    offset.value = batch.length;
    done.value = batch.length < 5;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Could not load destinations.";
    destinations.value = [];
    done.value = true;
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (loading.value || done.value) {
    return;
  }

  loading.value = true;

  try {
    const response = await listDestinations(offset.value);
    const batch = Array.isArray(response.data) ? response.data : [];
    destinations.value = destinations.value.concat(batch);
    offset.value += batch.length;

    if (batch.length < 5) {
      done.value = true;
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Could not load destinations.";
    done.value = true;
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  editing.value = {};
  isAddMode.value = true;
  showForm.value = true;
}

function openEdit(row) {
  editing.value = { ...row };
  isAddMode.value = false;
  showForm.value = true;
}

async function onSaved(message) {
  showForm.value = false;
  showToast(message);
  await reload();
}

function openDelete(row) {
  pendingDelete.value = row;
  deleteOpen.value = true;
  skipOutsideClick = true;
  nextTick(() => {
    skipOutsideClick = false;
  });
}

function closeDelete() {
  deleteOpen.value = false;
  pendingDelete.value = null;
}

function onDocumentClick(event) {
  if (!deleteOpen.value || skipOutsideClick) {
    return;
  }

  if (event.target?.closest?.("[data-destination-opener]")) {
    return;
  }

  const root = deleteCard.value?.$el ?? deleteCard.value;

  if (!root || root.contains(event.target)) {
    return;
  }

  closeDelete();
}

async function confirmDelete() {
  const id = pendingDelete.value?.id;
  deleting.value = true;

  try {
    await deleteDestination(id);
    closeDelete();
    showToast("Successfully deleted Destination!");
    await reload();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Could not delete destination.";
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  window.addEventListener("scroll", updateTop);
  document.documentElement.addEventListener("scroll", updateTop);
  document.addEventListener("click", onDocumentClick);
  updateTop();

  if (!allowed.value) {
    return;
  }

  await reload();
  await nextTick();

  listObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      loadMore();
    }
  });

  if (sentinel.value) {
    listObserver.observe(sentinel.value);
  }
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateTop);
  document.documentElement.removeEventListener("scroll", updateTop);
  document.removeEventListener("click", onDocumentClick);
  listObserver?.disconnect();
  window.clearTimeout(toastTimer);
});
</script>

<template>
  <v-container v-if="allowed" class="py-10">
    <v-row align="center" class="mb-4">
      <v-col>
        <h1 class="text-h4">Manage Destinations</h1>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          variant="elevated"
          class="oc-cta"
          data-destination-opener
          type="button"
          @click.stop="openAdd"
        >
          + New Destination
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="destinations.length">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" label="Search" clearable />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="searchAttribute"
          :items="searchAttributes"
          label="Search by"
          clearable
        />
      </v-col>
    </v-row>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />
    <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>
    <v-alert v-if="!loading && destinations.length === 0" type="info" class="mb-4">
      No destinations yet. Add a destination to view its details.
    </v-alert>

    <v-table v-if="destinations.length">
      <thead>
        <tr>
          <th @click="toggleSort('dest_name')">Name</th>
          <th>Street Address</th>
          <th>Address Line 2</th>
          <th @click="toggleSort('city')">City</th>
          <th @click="toggleSort('state')">State</th>
          <th @click="toggleSort('zip')">Zip Code</th>
          <th>Visited</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in visibleRows" :key="row.id">
          <td>{{ row.dest_name }}</td>
          <td>{{ row.addr_line_1 }}</td>
          <td>{{ row.addr_line_2 || "" }}</td>
          <td>{{ row.city }}</td>
          <td>{{ row.state }}</td>
          <td>{{ row.zip }}</td>
          <td>{{ row.last_visited || "not visited" }}</td>
          <td>
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              type="button"
              data-destination-opener
              aria-label="Edit"
              @click.stop="openEdit(row)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              type="button"
              data-destination-opener
              aria-label="Delete"
              @click.stop="openDelete(row)"
            />
          </td>
        </tr>
      </tbody>
    </v-table>

    <div ref="sentinel" />
    <v-btn v-if="showTop" class="mt-4" @click="toTop">Top ↑</v-btn>

    <div
      v-if="toast"
      class="elevation-8 text-body-2"
      style="position: fixed; bottom: 16px; left: 16px; z-index: 40; padding: 12px"
    >
      {{ toast }}
      <v-btn size="small" icon aria-label="Close" @click="clearToast">×</v-btn>
    </div>

    <v-dialog v-model="showForm" max-width="560" persistent>
      <DestinationForm
        v-if="showForm"
        :is-add-mode="isAddMode"
        :model-value="editing"
        @saved="onSaved"
        @closed="showForm = false"
      />
    </v-dialog>

    <v-dialog v-if="deleteOpen" :model-value="true" max-width="420" persistent>
      <v-card ref="deleteCard">
        <v-card-title>Delete Destination</v-card-title>
        <v-card-actions>
          <v-btn @click="closeDelete">Cancel</v-btn>
          <v-btn class="oc-cta" :loading="deleting" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
