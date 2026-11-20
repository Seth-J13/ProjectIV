<script>
export default { name: "ImagesTooltip" };
</script>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import apiClient from "../services/services.js";
import ImagesDetails from "./ImagesDetails.vue";

const props = defineProps({
  type: { type: String, required: true },
  parentId: { type: [Number, String], default: null },
  active: { type: Boolean, default: false },
  pointerX: { type: Number, default: null },
  anchorTop: { type: Number, default: null },
});

const root = ref(null);
const images = ref([]);
const visible = ref(false);
const modal = ref(false);
const overTooltip = ref(false);
const left = ref("0px");
const top = ref("0px");

let showTimer;
let hideTimer;

async function load() {
  if (props.parentId == null || props.parentId === "") {
    images.value = [];
    return;
  }

  try {
    const response = await apiClient.get(`/vehicle-t3/${props.type}image/${props.type}/${props.parentId}`);
    images.value = Array.isArray(response?.data) ? response.data : [];
  } catch {
    images.value = [];
  }
}

function source(item) {
  const value = item?.image ?? "";

  if (typeof value === "string" && value.startsWith("data:")) {
    return value;
  }

  return value ? `data:image/png;base64,${value}` : "";
}

function place(clientX) {
  if (top.value === "0px" && props.anchorTop == null) {
    const row = root.value?.querySelector(".list-item");
    top.value = `${row?.getBoundingClientRect?.().top ?? 0}px`;
  }

  if (props.anchorTop != null) {
    top.value = `${props.anchorTop}px`;
  }

  if (clientX != null) {
    left.value = `${clientX}px`;
  }
}

function schedule() {
  clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    if (images.value.length) {
      visible.value = true;
      place(props.pointerX);
    }
  }, 1000);
}

function onEnter() {
  clearTimeout(hideTimer);
  schedule();
}

function onLeave() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (!overTooltip.value) {
      visible.value = false;
    }
  }, 0);
}

function onTooltipEnter() {
  overTooltip.value = true;
  clearTimeout(hideTimer);
}

function onTooltipLeave() {
  overTooltip.value = false;
  visible.value = false;
}

function onMove(event) {
  if (!visible.value) {
    return;
  }

  left.value = `${event.clientX}px`;
}

watch(
  () => props.active,
  (active) => {
    if (active) {
      schedule();
    }
  },
  { immediate: true }
);

watch(
  () => props.pointerX,
  (value) => {
    if (visible.value && value != null) {
      left.value = `${value}px`;
    }
  }
);

watch(() => props.parentId, load);

onMounted(() => {
  load();
  document.addEventListener("mousemove", onMove);
});

onBeforeUnmount(() => {
  clearTimeout(showTimer);
  clearTimeout(hideTimer);
  document.removeEventListener("mousemove", onMove);
});
</script>

<template>
  <div ref="root" class="images-tooltip-host" @mouseenter="onEnter" @mouseleave="onLeave">
    <slot />
    <div
      v-if="visible && images[0]"
      class="images-tooltip oc-cta"
      :style="{
        position: 'fixed',
        left,
        top,
        borderTopWidth: '4px',
        borderTopStyle: 'solid',
        borderTopColor: 'white',
        border: '4px solid white',
      }"
      @mouseenter="onTooltipEnter"
      @mouseleave="onTooltipLeave"
      @click="modal = true"
    >
      <img :src="source(images[0])" alt="" />
      <span>{{ images[0].date }}</span>
    </div>
    <div v-if="modal" class="image-overlay" role="dialog" @click.self="modal = false">
      <div class="v-overlay__scrim" @click="modal = false"></div>
      <v-card class="tooltip-modal" rounded="lg">
        <v-btn class="dialog-x" color="secondary" variant="text" type="button" aria-label="X" @click="modal = false">X</v-btn>
        <ImagesDetails :type="type" :parent-id="parentId" host="box" :images="images" />
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.images-tooltip img {
  display: block;
  width: 120px;
  height: 120px;
  object-fit: contain;
  background: rgb(var(--v-theme-surface));
}

.image-overlay {
  position: fixed;
  inset: 0;
  z-index: 2900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tooltip-modal {
  position: relative;
  z-index: 1;
  width: min(720px, calc(100% - 32px));
  padding: 8px;
}

.dialog-x {
  position: absolute;
  top: 4px;
  right: 4px;
}
</style>
