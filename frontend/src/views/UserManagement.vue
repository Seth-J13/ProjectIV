<script>
import Utils from "../config/utils.js";

export default {
  beforeRouteEnter(to, from, next) {
    const user = Utils.getStore("user");

    if (!user) {
      next({ name: "login" });
      return;
    }

    if (user.role !== "admin") {
      next({ name: "landing" });
      return;
    }

    next();
  },
};
</script>

<script setup>
import { nextTick, onMounted, ref } from "vue";
import RoleSelect from "../components/RoleSelect.vue";
import userServices from "../services/userServices.js";

const users = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const dialog = ref(false);
const saving = ref(false);
const dialogError = ref("");
const snackbar = ref(false);
const editDialog = ref(null);
const form = ref(emptyForm());

const roles = ["user", "driver", "maintenance", "admin"];
const requiredRules = [(value) => !!String(value ?? "").trim() || "Required"];

function emptyForm() {
  return {
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
  };
}

function byLastName(left, right) {
  return left.lastName.localeCompare(right.lastName, undefined, { sensitivity: "base" });
}

async function loadUsers() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await userServices.listUsers();
    users.value = [...response.data].sort(byLastName);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Could not load users.";
    users.value = [];
  } finally {
    loading.value = false;
  }
}

async function openEdit(account) {
  form.value = {
    id: account.id,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    role: account.role,
  };
  dialogError.value = "";
  dialog.value = true;
  await nextTick();

  if (typeof editDialog.value?.showModal === "function" && !editDialog.value.open) {
    editDialog.value.showModal();
  }
}

function cancelEdit() {
  dialog.value = false;
  dialogError.value = "";

  if (editDialog.value?.open) {
    editDialog.value.close();
  }
}

async function saveUser() {
  if (
    !form.value.firstName.trim() ||
    !form.value.lastName.trim() ||
    !form.value.email.trim() ||
    !roles.includes(form.value.role)
  ) {
    dialogError.value = "First name, last name, email, and a valid role are required.";
    return;
  }

  dialogError.value = "";
  saving.value = true;

  try {
    const response = await userServices.updateUser(form.value.id, {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      email: form.value.email.trim(),
      role: form.value.role,
    });

    users.value = users.value
      .map((account) => (account.id === response.data.id ? response.data : account))
      .sort(byLastName);
    cancelEdit();
    snackbar.value = true;
  } catch (error) {
    dialogError.value = error.response?.data?.message || "Could not update user.";
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <v-container class="py-10">
    <h1 class="text-h4 mb-6">User Management</h1>

    <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4">
      {{ errorMessage }}
    </v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-table v-else>
      <thead>
        <tr>
          <th>First name</th>
          <th>Last name</th>
          <th>Email</th>
          <th>Role</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="users.length === 0">
          <td colspan="5">No users.</td>
        </tr>
        <tr v-for="account in users" :key="account.id">
          <td>{{ account.firstName }}</td>
          <td>{{ account.lastName }}</td>
          <td>{{ account.email }}</td>
          <td>{{ account.role }}</td>
          <td>
            <v-btn size="small" variant="text" type="button" @click="openEdit(account)">Edit</v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <dialog
      ref="editDialog"
      class="edit-user-dialog"
      aria-labelledby="edit-user-title"
      @cancel.prevent="cancelEdit"
    >
      <v-card v-if="dialog" rounded="lg" max-width="480">
        <v-card-item>
          <v-card-title id="edit-user-title">Edit user</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-alert v-if="dialogError" type="error" density="compact" class="mb-4">
            {{ dialogError }}
          </v-alert>
          <v-text-field v-model="form.firstName" label="First name" :rules="requiredRules" />
          <v-text-field v-model="form.lastName" label="Last name" :rules="requiredRules" />
          <v-text-field v-model="form.email" label="Email" type="email" :rules="requiredRules" />
          <RoleSelect v-model="form.role" label="Role" :items="roles" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="text" type="button" @click="cancelEdit">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            type="button"
            :loading="saving"
            @click="saveUser"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </dialog>

    <span v-if="snackbar" class="d-sr-only">User updated.</span>
    <v-snackbar v-model="snackbar" color="success" :timeout="3000">User updated.</v-snackbar>
  </v-container>
</template>

<style scoped>
.edit-user-dialog {
  border: none;
  padding: 0;
  background: transparent;
  max-width: 480px;
  width: calc(100% - 32px);
}

.edit-user-dialog::backdrop {
  background: rgba(0, 0, 0, 0.32);
}
</style>
