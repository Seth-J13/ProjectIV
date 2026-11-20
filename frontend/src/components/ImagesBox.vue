<script>
export default { name: "ImagesBox" };
</script>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import apiClient from "../services/services.js";
import ImagesDetails from "./ImagesDetails.vue";

const props = defineProps({
  type: { type: String, default: "" },
  parentId: { type: [Number, String], default: null },
  logo: { type: String, default: null },
});

const images = ref([]);
const loading = ref(false);
const showsLogo = computed(() => props.logo != null);

function logoSrc(value) {
  if (!value) {
    return "";
  }

  return String(value).startsWith("data:") ? String(value) : `data:image/png;base64,${value}`;
}

async function load() {
  if (showsLogo.value || props.parentId == null || props.parentId === "") {
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
  <v-card class="images-box oc-cta" :class="{ 'logo-box': showsLogo }" rounded="lg">
    <v-card-item>
      <v-card-title class="text-center">{{ showsLogo ? "Logo" : "Image(s)" }}</v-card-title>
    </v-card-item>
    <v-card-text>
      <div v-if="showsLogo" class="logo-frame">
        <img v-if="logoSrc(logo)" :src="logoSrc(logo)" alt="Logo" />
      </div>
      <template v-else>
        <v-progress-linear v-if="loading" indeterminate color="primary" />
        <ImagesDetails :type="type" :parent-id="parentId" host="box" :images="images" />
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.images-box {
  border: 1px dashed rgb(var(--v-theme-outline));
  background: rgb(var(--v-theme-surface));
}

.logo-frame {
  width: 100%;
  aspect-ratio: 1;
}

.logo-frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
