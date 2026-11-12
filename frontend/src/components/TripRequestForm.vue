<script setup>
import { computed, reactive, ref } from "vue";

const props = defineProps({
  form: { type: Object, required: true },
  vehicles: { type: Array, required: true },
  drivers: { type: Array, required: true },
  destinations: { type: Array, required: true },
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
  props.vehicles.find((item) => item.vehicleId === props.form.vehicleId)
);

const selectedDriver = computed(() =>
  props.drivers.find((item) => item.driverId === props.form.driverId)
);

const selectedDestination = computed(() =>
  props.destinations.find((item) => item.destId === props.form.destId)
);

function pickVehicle(item) {
  props.form.vehicleId = item.vehicleId;
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
  <v-text-field v-model="filters.make" label="Make" />
  <v-text-field v-model="filters.model" label="Model" />
  <v-text-field v-model="filters.license" label="License" />

  <div class="v-input">
    <label class="v-label">Vehicle</label>
    <input
      readonly
      :value="selectedVehicle ? `${selectedVehicle.license} ${selectedVehicle.make} ${selectedVehicle.model}` : ''"
      @click="vehicleOpen = true"
    />
    <div v-if="vehicleOpen">
      <div
        v-for="item in filteredVehicles"
        :key="item.vehicleId"
        role="option"
        class="v-list-item"
        @click="pickVehicle(item)"
      >{{ item.license }} {{ item.make }} {{ item.model }}</div>
    </div>
  </div>
  <p v-if="selectedVehicle">{{ selectedVehicle.license }} {{ selectedVehicle.make }} {{ selectedVehicle.model }}</p>

  <div class="v-input">
    <label class="v-label">Driver</label>
    <input readonly :value="selectedDriver ? selectedDriver.name : ''" @click="driverOpen = true" />
    <div v-if="driverOpen">
      <div
        v-for="item in drivers"
        :key="item.driverId"
        role="option"
        class="v-list-item"
        @click="pickDriver(item)"
      >{{ item.name }}</div>
    </div>
  </div>

  <div class="v-input">
    <label class="v-label">Destination</label>
    <input
      readonly
      :value="selectedDestination ? selectedDestination.name : ''"
      @click="destinationOpen = true"
    />
    <div v-if="destinationOpen">
      <div
        v-for="item in destinations"
        :key="item.destId"
        role="option"
        class="v-list-item"
        @click="pickDestination(item)"
      >{{ item.name }}</div>
    </div>
  </div>

  <v-text-field v-model="form.startDate" label="Start date" type="date" />
  <v-text-field v-model="form.startTime" label="Start time" type="time" />
  <v-text-field v-model="form.endDate" label="End date" type="date" />
  <v-text-field v-model="form.endTime" label="End time" type="time" />
  <v-text-field v-model="form.numPeople" label="Number of people" type="number" />
</template>
