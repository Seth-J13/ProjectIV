<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils.js";
import authServices from "../services/authServices.js";

const router = useRouter();
const user = ref(Utils.getStore("user"));

function loadUser() {
  user.value = Utils.getStore("user");
}

onMounted(() => {
  window.addEventListener("user-logged-in", loadUser);
  window.addEventListener("user-logged-out", loadUser);
});

onUnmounted(() => {
  window.removeEventListener("user-logged-in", loadUser);
  window.removeEventListener("user-logged-out", loadUser);
});

const initials = computed(() => {
  const first = user.value?.firstName?.trim()?.[0] || "";
  const last = user.value?.lastName?.trim()?.[0] || "";
  return `${first}${last}`.toUpperCase();
});

const displayName = computed(() =>
  [user.value?.firstName, user.value?.lastName].filter(Boolean).join(" ")
);

function openUserManagement() {
  // Show the page with the click. A later history guard must not leave the route unchanged.
  router.currentRoute.value = router.resolve({ name: "users" });
  return router.push({ name: "users" });
}

async function logout() {
  try {
    await authServices.logoutUser();
  } catch {
    // The local session still ends when the server session is already gone.
  }

  Utils.removeItem("user");
  user.value = null;
  window.dispatchEvent(new CustomEvent("user-logged-out"));
  await router.push({ name: "login" });
}
</script>

<template>
  <v-app-bar v-if="user" color="surface" flat>
    <v-btn
      v-if="user?.role === 'admin'"
      variant="text"
      type="button"
      @click.stop.prevent="openUserManagement"
    >
      User Management
    </v-btn>
    <v-spacer />
    <v-menu>
      <template #activator="{ props }">
        <v-btn v-bind="props" icon variant="text" aria-label="Account menu">
          <v-avatar color="primary" size="40">
            <span>{{ initials }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-list>
        <v-list-item :title="displayName" :subtitle="user.email" />
        <v-list-item title="Logout" @click="logout" />
      </v-list>
    </v-menu>
  </v-app-bar>
</template>
