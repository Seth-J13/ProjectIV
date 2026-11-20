<script>
export default { name: "ImagesTooltip" };
</script>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import apiClient from "../services/services.js";
import ImagesDetails from "./ImagesDetails.vue";

const props = defineProps({
  type: { type: String, required: true },
  parentId: { type: [Number, String], default: null },
  active: { type: Boolean, default: false },
  pointerX: { type: Number, default: null },
  anchorTop: { type: Number, default: null },
  logo: { type: String, default: "" },
});

const emit = defineEmits(["keep", "release"]);

const root = ref(null);
const images = ref([]);
const visible = ref(false);
const modal = ref(false);
const overTooltip = ref(false);
const left = ref("0px");
const top = ref("0px");
const pointer = ref(null);

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

const preview = computed(() => {
  if (props.logo) {
    return { image: props.logo, date: "" };
  }

  return images.value[0] ?? null;
});

function tooltipLeft(x) {
  return `${x - 50}px`;
}

function anchoredTop(value) {
  if (value == null) {
    return null;
  }

  return Math.max(8, value - 160);
}

function place(clientX) {
  const x = clientX ?? pointer.value;
  const lifted = anchoredTop(props.anchorTop);

  if (lifted != null) {
    top.value = `${lifted}px`;
  } else if (top.value === "0px") {
    const row = root.value?.querySelector(".list-item");
    const rowTop = row?.getBoundingClientRect?.().top;

    if (rowTop != null) {
      top.value = `${rowTop}px`;
    }
  }

  if (x != null) {
    left.value = tooltipLeft(x);
  }
}

function schedule() {
  clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    if (preview.value) {
      place(props.pointerX ?? pointer.value);
      visible.value = true;
    }
  }, 1000);
}

function onEnter(event) {
  clearTimeout(hideTimer);
  if (event?.clientX != null) {
    pointer.value = event.clientX;
  }
  schedule();
}

function onLeave() {
  if (modal.value) {
    return;
  }

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (!overTooltip.value && !modal.value) {
      visible.value = false;
    }
  }, 0);
}

function onTooltipEnter() {
  overTooltip.value = true;
  clearTimeout(hideTimer);
  emit("keep");
}

function onTooltipLeave() {
  overTooltip.value = false;

  if (modal.value) {
    return;
  }

  visible.value = false;
  emit("release");
}

function closeModal() {
  modal.value = false;

  if (!overTooltip.value) {
    emit("release");
  }
}

function onMove(event) {
  if (event.clientX != null) {
    pointer.value = event.clientX;
  }

  if (!visible.value || modal.value || overTooltip.value) {
    return;
  }

  left.value = tooltipLeft(event.clientX);
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
    if (value == null) {
      return;
    }

    pointer.value = value;

    if (visible.value && !overTooltip.value && !modal.value) {
      left.value = tooltipLeft(value);
    }
  }
);

watch(
  () => props.anchorTop,
  (value) => {
    const lifted = anchoredTop(value);

    if (lifted != null) {
      top.value = `${lifted}px`;
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
      v-if="visible && preview"
      class="images-tooltip oc-cta"
      :style="{
        position: 'fixed',
        left,
        top,
        borderTopWidth: '4px',
        borderTopStyle: 'solid',
        borderTopColor: 'white',
        border: '4px solid white',
        zIndex: 2600,
      }"
      @mouseenter="onTooltipEnter"
      @mouseleave="onTooltipLeave"
      @click="modal = true"
    >
      <img :src="source(preview)" alt="" />
      <span v-if="preview.date">{{ preview.date }}</span>
    </div>
    <div v-if="modal" class="image-overlay" role="dialog" @click.self="closeModal">
      <div class="v-overlay__scrim" @click="closeModal"></div>
      <v-card class="tooltip-modal" rounded="lg" @click.stop>
        <v-btn class="dialog-x" color="secondary" variant="text" type="button" aria-label="X" @click="closeModal">X</v-btn>
        <img v-if="logo" class="expanded-logo" :src="source({ image: logo })" alt="Logo" />
        <ImagesDetails v-else :type="type" :parent-id="parentId" host="box" :images="images" />
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.images-tooltip-host {
  pointer-events: none;
}

.images-tooltip {
  pointer-events: auto;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.images-tooltip span {
  display: block;
  padding: 4px 8px 6px;
}

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
  pointer-events: auto;
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

.expanded-logo {
  display: block;
  max-width: 70vw;
  max-height: 70vh;
  object-fit: contain;
}
</style>
