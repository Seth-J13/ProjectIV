<script setup>
import { ref } from "vue";

defineProps({
  requests: { type: Array, required: true },
  empty: { type: Boolean, required: true },
  query: { type: String, required: true },
  activeOnly: { type: Boolean, required: true },
  typeFilter: { type: String, required: true },
});

const emit = defineEmits(["update:query", "update:activeOnly", "update:typeFilter", "edit", "delete"]);
const typeOpen = ref(false);

function selectType(value) {
  emit("update:typeFilter", value);
  typeOpen.value = false;
}
</script>

<template>
  <v-text-field
    :model-value="query"
    label="Search"
    @update:model-value="emit('update:query', $event)"
  />

  <div class="v-selection-control" @click="emit('update:activeOnly', !activeOnly)">Active only</div>

  <div class="v-input">
    <label class="v-label">Request type</label>
    <input readonly :value="typeFilter" @click="typeOpen = true" />
    <template v-if="typeOpen">
      <div role="option" class="v-list-item" @click="selectType('all')">All</div>
      <div role="option" class="v-list-item" @click="selectType('trip')">Trip</div>
      <div role="option" class="v-list-item" @click="selectType('maintenance')">Maintenance</div>
    </template>
  </div>

  <p v-if="empty">No requests yet. Create a request.</p>

  <v-list v-else>
    <v-list-item v-for="row in requests" :key="row.requestId">
      {{ row.requestId }} {{ row.requestType }} {{ row.vehicle?.license }} {{ row.startDate }} {{ row.endDate }}
      {{ row.numPeople }}
      <button type="button" aria-label="Edit request" @click="emit('edit', row)">Edit</button>
      <button type="button" aria-label="Delete request" @click="emit('delete', row)">Delete</button>
    </v-list-item>
  </v-list>
</template>
