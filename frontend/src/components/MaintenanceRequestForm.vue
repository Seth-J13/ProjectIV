<script setup>
import { computed, reactive, ref } from "vue";

const props = defineProps({
  form: { type: Object, required: true },
  vehicles: { type: Array, required: true },
});

const filters = reactive({ make: "", model: "", license: "" });
const vehicleOpen = ref(false);

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

function pickVehicle(item) {
  props.form.vehicleId = item.vehicleId;
  vehicleOpen.value = false;
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

  <v-text-field v-model="form.startDate" label="Start date" type="date" />
  <v-text-field v-model="form.startTime" label="Start time" type="time" />
</template>
