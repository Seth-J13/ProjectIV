<script>
export default { name: "ImagesBox" };
</script>

<script setup>
import { onMounted, ref, watch } from "vue";
import apiClient from "../services/services.js";
import ImagesDetails from "./ImagesDetails.vue";

const props = defineProps({
  type: { type: String, required: true },
  parentId: { type: [Number, String], default: null },
});

const images = ref([]);
const loading = ref(false);

async function load() {
  if (props.parentId == null || props.parentId === "") {
    images.value = [];
    return;
  }

  loading.value = true;

  try {
    const response = await apiClient.get(`/vehicle-t3/${props.type}image/${props.type}/${props.parentId}`);
    images.value = Array.isArray(response?.data) ? response.data : [];
  } catch {
    images.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => props.parentId, load);
</script>

<template>
  <v-card class="images-box oc-cta" rounded="lg">
    <v-card-item>
      <v-card-title class="text-center">Image(s)</v-card-title>
    </v-card-item>
    <v-card-text>
      <v-progress-linear v-if="loading" indeterminate color="primary" />
      <ImagesDetails :type="type" :parent-id="parentId" host="box" :images="images" />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.images-box {
  border: 1px dashed rgb(var(--v-theme-outline));
  background: rgb(var(--v-theme-surface));
}
</style>
