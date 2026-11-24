<script setup>
import { computed, reactive, ref, watch } from "vue";
import ImagesBox from "./ImagesBox.vue";

const props = defineProps({
  form: { type: Object, required: true },
  vehicles: { type: Array, required: true },
  error: { type: String, default: "" },
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
  props.vehicles.find((item) => String(item.vehicleId) === String(props.form.vehicleId))
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
      <v-text-field v-model="form.startDate" label="Start date" type="date" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="form.startTime" label="Start time" type="time" />
    </v-col>
    <v-col v-if="form.vehicleId" cols="12">
      <ImagesBox type="vehicle" :parent-id="form.vehicleId" />
    </v-col>
  </v-row>
</template>
