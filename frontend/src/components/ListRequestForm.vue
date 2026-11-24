<script setup>
defineProps({
  requests: { type: Array, required: true },
  empty: { type: Boolean, required: true },
  query: { type: String, required: true },
  activeOnly: { type: Boolean, required: true },
  typeFilter: { type: String, required: true },
});

const emit = defineEmits(["update:query", "update:activeOnly", "update:typeFilter", "edit", "delete"]);

const typeOptions = [
  { title: "All", value: "all" },
  { title: "Trip", value: "trip" },
  { title: "Maintenance", value: "maintenance" },
];

function typeLabel(value) {
  if (value === "maintenance") {
    return "Maintenance";
  }

  if (value === "trip") {
    return "Trip";
  }

  return value || "";
}

function vehicleLabel(row) {
  const vehicle = row.vehicle;

  if (!vehicle) {
    return "";
  }

  return [vehicle.license, vehicle.make, vehicle.model].filter(Boolean).join(" ");
}
</script>

<template>
  <v-row>
    <v-col cols="12" md="4">
      <v-text-field
        :model-value="query"
        label="Search"
        @update:model-value="emit('update:query', $event)"
      />
    </v-col>
    <v-col cols="12" md="4">
      <v-select
        :model-value="typeFilter"
        :items="typeOptions"
        item-title="title"
        item-value="value"
        label="Request Type"
        @update:model-value="emit('update:typeFilter', $event)"
      />
    </v-col>
    <v-col cols="12" md="4" class="d-flex align-center">
      <v-checkbox
        :model-value="activeOnly"
        label="Active only"
        hide-details
        @update:model-value="emit('update:activeOnly', Boolean($event))"
      />
    </v-col>
  </v-row>

  <p v-if="empty">No requests yet. Create a request.</p>

  <v-table v-else>
    <thead>
      <tr>
        <th>Request</th>
        <th>Type</th>
        <th>Vehicle</th>
        <th>Driver</th>
        <th>Destination</th>
        <th>Start Date</th>
        <th>End Date</th>
        <th>People</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in requests" :key="row.requestId">
        <td>{{ row.requestId }}</td>
        <td>{{ typeLabel(row.requestType) }}</td>
        <td>{{ vehicleLabel(row) }}</td>
        <td>{{ row.driver?.name }}</td>
        <td>{{ row.destination?.name }}</td>
        <td>{{ row.startDate }}</td>
        <td>{{ row.endDate }}</td>
        <td>{{ row.numPeople }}</td>
        <td>
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            type="button"
            aria-label="Edit request"
            @click="emit('edit', row)"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            type="button"
            aria-label="Delete request"
            @click="emit('delete', row)"
          />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

