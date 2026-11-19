<script setup>
import { computed, reactive, ref, watch } from "vue";

const props = defineProps({
  form: { type: Object, required: true },
  vehicles: { type: Array, required: true },
  drivers: { type: Array, required: true },
  destinations: { type: Array, required: true },
  error: { type: String, default: "" },
});

const filters = reactive({ make: "", model: "", license: "" });
const vehicleOpen = ref(false);
const driverOpen = ref(false);
const destinationOpen = ref(false);

const filteredVehicles = computed(() =>
  props.vehicles.filter((item) => {
    const make = filters.make.trim().toLowerCase();
    const model = filters.model.trim().toLowerCase();
    const license = filters.license.trim().toLowerCase();

    return (
      (!make || String(item.make).toLowerCase().includes(make)) &&
      (!model || String(item.model).toLowerCase().includes(model)) &&
      (!license || String(item.license).toLowerCase().includes(license))
    );
  })
);

const selectedVehicle = computed(() =>
  props.vehicles.find((item) => String(item.vehicleId) === String(props.form.vehicleId))
);

const selectedDriver = computed(() =>
  props.drivers.find((item) => item.driverId === props.form.driverId)
);

const selectedDestination = computed(() =>
  props.destinations.find((item) => item.destId === props.form.destId)
);

const vehicleLabel = computed(() =>
  selectedVehicle.value
    ? `${selectedVehicle.value.license} ${selectedVehicle.value.make} ${selectedVehicle.value.model}`
    : ""
);

// A vehicle set from outside the form (a Landing click, an edit dialog, a reset)
// fills or clears the Make/Model/License boxes. Picking from the menu leaves them alone.
let pickedHere = false;

watch(() => selectedVehicle.value?.vehicleId, () => {
  if (pickedHere) {
    pickedHere = false;
    return;
  }

  const vehicle = selectedVehicle.value;

  filters.make = vehicle ? String(vehicle.make) : "";
  filters.model = vehicle ? String(vehicle.model) : "";
  filters.license = vehicle ? String(vehicle.license) : "";
});

function pickVehicle(item) {
  pickedHere = String(props.form.vehicleId) !== String(item.vehicleId);
  props.form.vehicleId = String(item.vehicleId);
  vehicleOpen.value = false;
}

function pickDriver(item) {
  props.form.driverId = item.driverId;
  driverOpen.value = false;
}

function pickDestination(item) {
  props.form.destId = item.destId;
  destinationOpen.value = false;
}
</script>

<template>
  <v-alert v-if="error" type="error" class="mb-4 flex-grow-0 flex-shrink-0">{{ error }}</v-alert>
  <v-row>
    <v-col cols="12" md="4">
      <v-text-field v-model="filters.make" label="Make" />
    </v-col>
    <v-col cols="12" md="4">
      <v-text-field v-model="filters.model" label="Model" />
    </v-col>
    <v-col cols="12" md="4">
      <v-text-field v-model="filters.license" label="License" />
    </v-col>

    <v-col cols="12" md="6">
      <v-menu v-model="vehicleOpen" :close-on-content-click="true">
        <template #activator="{ props: menuProps }">
          <v-text-field
            v-bind="menuProps"
            :model-value="vehicleLabel"
            label="Vehicle"
            readonly
          />
        </template>
        <v-list density="comfortable">
          <v-list-item
            v-for="item in filteredVehicles"
            :key="item.vehicleId"
            role="option"
            :title="`${item.license} ${item.make} ${item.model}`"
            @click="pickVehicle(item)"
          />
        </v-list>
      </v-menu>
    </v-col>

    <v-col cols="12" md="6">
      <v-menu v-model="driverOpen" :close-on-content-click="true">
        <template #activator="{ props: menuProps }">
          <v-text-field
            v-bind="menuProps"
            :model-value="selectedDriver ? selectedDriver.name : ''"
            label="Driver"
            readonly
          />
        </template>
        <v-list density="comfortable">
          <v-list-item
            v-for="item in drivers"
            :key="item.driverId"
            role="option"
            :title="item.name"
            @click="pickDriver(item)"
          />
        </v-list>
      </v-menu>
    </v-col>

    <v-col cols="12" md="6">
      <v-menu v-model="destinationOpen" :close-on-content-click="true">
        <template #activator="{ props: menuProps }">
          <v-text-field
            v-bind="menuProps"
            :model-value="selectedDestination ? selectedDestination.name : ''"
            label="Destination"
            readonly
          />
        </template>
        <v-list density="comfortable">
          <v-list-item
            v-for="item in destinations"
            :key="item.destId"
            role="option"
            :title="item.name"
            @click="pickDestination(item)"
          />
        </v-list>
      </v-menu>
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field v-model="form.startDate" label="Start date" type="date" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="form.startTime" label="Start time" type="time" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="form.endDate" label="End date" type="date" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="form.endTime" label="End time" type="time" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="form.numPeople" label="Number of people" type="number" />
    </v-col>
  </v-row>
</template>
