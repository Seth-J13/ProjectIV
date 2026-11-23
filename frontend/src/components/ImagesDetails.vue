<script>
export default { name: "ImagesDetails" };
</script>

<script setup>
import { onMounted, ref, watch } from "vue";
import apiClient from "../services/services.js";

const props = defineProps({
  type: { type: String, required: true },
  parentId: { type: [Number, String], default: null },
  host: { type: String, default: "container" },
  images: { type: Array, default: undefined },
  allowDelete: { type: Boolean, default: true },
  defer: { type: Boolean, default: false },
});

const emit = defineEmits(["update:images"]);

const items = ref([]);
const loading = ref(false);
const expandedIndex = ref(-1);

const deletable = () => props.host === "container" && props.allowDelete;

function source(item) {
  const value = item?.image ?? "";

  if (typeof value === "string" && value.startsWith("data:")) {
    return value;
  }

  return value ? `data:image/png;base64,${value}` : "";
}

async function load() {
  if (props.parentId == null || props.parentId === "") {
    items.value = [];
    return;
  }

  loading.value = true;

  try {
    const response = await apiClient.get(`/vehicle-t3/${props.type}image/${props.type}/${props.parentId}`);
    items.value = Array.isArray(response?.data) ? response.data : [];
  } catch {
    items.value = [];
  } finally {
    loading.value = false;
  }
}

async function remove(item) {
  if (props.defer || props.parentId == null || props.parentId === "" || item.local) {
    const next = items.value.filter((entry) => entry.id !== item.id);
    items.value = next;
    emit("update:images", next);
    return;
  }

  await apiClient.delete(`/vehicle-t3/${props.type}image/${item.id}`);
  await load();
}

function expand(index) {
  expandedIndex.value = index;
}

function closeExpand() {
  expandedIndex.value = -1;
}

function step(delta) {
  const next = expandedIndex.value + delta;

  if (next < 0 || next >= items.value.length) {
    return;
  }

  expandedIndex.value = next;
}

onMounted(() => {
  if (props.images !== undefined) {
    items.value = [...props.images];
    return;
  }

  load();
});

watch(
  () => props.images,
  (value) => {
    if (value !== undefined) {
      items.value = [...value];
    }
  }
);
</script>

<template>
  <section class="images-details oc-cta">
    <v-progress-linear v-if="loading" indeterminate color="primary" />
    <p v-if="!loading && items.length === 0">No images</p>
    <div class="image-grid" style="display: flex; flex-wrap: wrap; gap: 25px; overflow-y: auto; max-height: 240px">
      <div v-for="(item, index) in items" :key="item.id" class="image-cell">
        <div class="thumb">
          <img
            :src="source(item)"
            alt="Image Content"
            aria-label="Image Content"
            @click="expand(index)"
            @contextmenu.prevent
          />
          <button
            v-if="deletable()"
            type="button"
            class="thumb-x"
            aria-label="X"
            style="filter: invert(1)"
            @click.stop="remove(item)"
          >
            X
          </button>
        </div>
        <span class="thumb-date">{{ item.date }}</span>
      </div>
    </div>

    <div v-if="expandedIndex >= 0" class="image-overlay" role="dialog" @click.self="closeExpand">
      <div class="v-overlay__scrim" @click="closeExpand"></div>
      <div class="image-overlay-card">
        <p class="expanded-date">{{ items[expandedIndex]?.date }}</p>
        <button type="button" class="overlay-x" aria-label="X" style="filter: invert(1)" @click="closeExpand">X</button>
        <button type="button" class="nav prev" style="filter: invert(1)" @click="step(-1)">&lt;</button>
        <img
          class="expanded-image"
          :src="source(items[expandedIndex])"
          alt="Image Content"
          aria-label="Image Content"
          @contextmenu.prevent
        />
        <button type="button" class="nav next" style="filter: invert(1)" @click="step(1)">&gt;</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.images-details {
  border: 1px dashed rgb(var(--v-theme-outline));
  border-radius: 8px;
  padding: 8px;
}

.thumb {
  position: relative;
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}

.thumb img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  display: block;
}

.thumb-x,
.overlay-x {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

.thumb-date {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface));
}

.image-overlay {
  position: fixed;
  inset: 0;
  z-index: 2900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-overlay-card {
  position: relative;
  z-index: 1;
  max-width: min(90vw, 840px);
  padding: 16px;
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
}

.expanded-date {
  text-align: center;
  margin: 0 0 8px;
}

.expanded-image {
  display: block;
  max-width: 70vw;
  max-height: 70vh;
  object-fit: contain;
}

.nav {
  position: absolute;
  top: 50%;
  z-index: 1;
}

.prev {
  left: 8px;
}

.next {
  right: 8px;
}
</style>
