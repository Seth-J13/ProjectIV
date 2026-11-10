<script setup>
import { nextTick, ref } from "vue";
import { useRouter } from "vue-router";
import authServices from "../services/authServices.js";
import Utils from "../config/utils.js";

const router = useRouter();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const loading = ref(false);
const loginForm = ref(null);

const dialog = ref(false);
const accountDialog = ref(null);
const creating = ref(false);
const createError = ref("");
const createForm = ref(null);
const firstName = ref("");
const lastName = ref("");
const accountEmail = ref("");
const accountPassword = ref("");

const requiredRules = [(value) => !!value?.trim() || "Required"];

function storeSession(data) {
  Utils.setStore("user", data);
  window.dispatchEvent(new CustomEvent("user-logged-in"));
}

async function login() {
  const result = await loginForm.value?.validate();

  if (result === false || result?.valid === false) {
    return;
  }

  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = "Email and password are required.";
    return;
  }

  errorMessage.value = "";
  loading.value = true;

  try {
    const response = await authServices.loginUser(email.value.trim(), password.value);
    storeSession(response.data);
    window.dispatchEvent(new CustomEvent("login-successful"));
    await router.push({ name: "landing" });
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Login failed.";
  } finally {
    loading.value = false;
  }
}

async function openCreateAccount() {
  createError.value = "";
  dialog.value = true;
  await nextTick();

  if (typeof accountDialog.value?.showModal === "function" && !accountDialog.value.open) {
    accountDialog.value.showModal();
  }
}

function closeCreateAccount() {
  dialog.value = false;

  if (accountDialog.value?.open) {
    accountDialog.value.close();
  }
}

async function createAccount() {
  const result = await createForm.value?.validate();

  if (result === false || result?.valid === false) {
    return;
  }

  if (
    !firstName.value.trim() ||
    !lastName.value.trim() ||
    !accountEmail.value.trim() ||
    !accountPassword.value.trim()
  ) {
    createError.value = "First name, last name, email, and password are required.";
    return;
  }

  createError.value = "";
  creating.value = true;

  try {
    const response = await authServices.registerUser({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: accountEmail.value.trim(),
      password: accountPassword.value,
    });
    storeSession(response.data);
    closeCreateAccount();
    await router.push({ name: "landing" });
  } catch (error) {
    createError.value = error.response?.data?.message || "Could not create account.";
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-item>
            <v-card-title>Login</v-card-title>
          </v-card-item>
          <v-card-text>
            <v-form ref="loginForm" @submit.prevent="login">
              <v-text-field v-model="email" label="Email" type="email" :rules="requiredRules" />
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                :rules="requiredRules"
              />
              <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>
              <v-btn
                color="primary"
                variant="elevated"
                class="oc-cta"
                type="submit"
                :loading="loading"
                @click.prevent="login"
              >
                Login
              </v-btn>
            </v-form>
            <v-btn
              class="mt-4"
              color="secondary"
              variant="outlined"
              type="button"
              @click="openCreateAccount"
            >
              Create Account
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <dialog
      ref="accountDialog"
      class="create-account-dialog"
      aria-labelledby="create-account-title"
      @cancel.prevent="closeCreateAccount"
    >
      <v-card v-if="dialog" max-width="480">
        <v-card-item>
          <v-card-title id="create-account-title">Create Account</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-form ref="createForm" @submit.prevent="createAccount">
            <v-text-field v-model="firstName" label="First name" :rules="requiredRules" />
            <v-text-field v-model="lastName" label="Last name" :rules="requiredRules" />
            <v-text-field v-model="accountEmail" label="Email" type="email" :rules="requiredRules" />
            <v-text-field
              v-model="accountPassword"
              label="Password"
              type="password"
              :rules="requiredRules"
            />
            <v-alert v-if="createError" type="error" class="mb-4">{{ createError }}</v-alert>
            <v-btn color="secondary" variant="text" type="button" @click="closeCreateAccount">
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              class="oc-cta"
              type="submit"
              :loading="creating"
              @click.prevent="createAccount"
            >
              Create Account
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </dialog>
  </v-container>
</template>

<style scoped>
.create-account-dialog {
  border: none;
  padding: 0;
  background: transparent;
  max-width: 480px;
  width: calc(100% - 32px);
}

.create-account-dialog::backdrop {
  background: rgba(0, 0, 0, 0.32);
}
</style>
