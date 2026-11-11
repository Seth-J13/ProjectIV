<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import MenuBar from "./components/MenuBar.vue";

const route = useRoute();
const showMenu = computed(() => route.name !== "login");
const snackbar = ref(false);

function onLoginSuccess() {
  snackbar.value = true;
}

onMounted(() => {
  window.addEventListener("login-successful", onLoginSuccess);
});

onUnmounted(() => {
  window.removeEventListener("login-successful", onLoginSuccess);
});
</script>

<template>
  <v-app>
    <MenuBar v-if="showMenu" />
    <v-main>
      <router-view />
    </v-main>
    <v-snackbar v-model="snackbar" color="success" :timeout="3000">Login successful!</v-snackbar>
  </v-app>
</template>

<style>
/* OC Academic Edition — typography (see ui-style-system.mdc) */
.v-application {
  font-family: Inter, sans-serif !important;
  font-size: 16px;
  font-weight: 400;
}

.v-application :is(h1, h2, h3, h4, h5, h6) {
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

/* Primary labeled CTAs — shared size for peer buttons */
.v-btn.oc-cta {
  font-size: 0.875rem !important;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-transform: none;
}
</style>
