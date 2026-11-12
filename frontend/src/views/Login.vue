<script setup>
import { nextTick, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import authServices from "../services/authServices.js";
import Utils from "../config/utils.js";

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";

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
const googleChooser = ref(false);
const googleChooserHost = ref(null);

onMounted(() => {
  loadGoogleIdentity().catch(() => {});
});

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

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT}"]`);

    const finish = () => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      reject(new Error("Google Identity Services did not load."));
    };

    if (existing) {
      if (window.google?.accounts?.id) {
        finish();
        return;
      }

      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("Google script failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error("Google script failed"));
    document.head.appendChild(script);
  });
}

async function onGoogleCredential(response) {
  const idToken = response?.credential;

  if (!idToken) {
    errorMessage.value = "Google sign-in failed.";
    return;
  }

  errorMessage.value = "";
  loading.value = true;

  try {
    const result = await authServices.googleLogin(idToken);
    storeSession(result.data);
    window.dispatchEvent(new CustomEvent("login-successful"));
    await router.push({ name: "landing" });
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Google sign-in failed.";
  } finally {
    loading.value = false;
  }
}

function openGoogleChooser(googleId) {
  googleChooser.value = true;

  nextTick(() => {
    if (!googleChooserHost.value || typeof googleId.renderButton !== "function") {
      errorMessage.value = "Google sign-in failed.";
      return;
    }

    googleChooserHost.value.replaceChildren();
    googleId.renderButton(googleChooserHost.value, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: 320,
    });
  });
}

function continueWithGoogle() {
  errorMessage.value = "";
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleId = window.google?.accounts?.id;

  if (!clientId || !googleId) {
    errorMessage.value = "Google sign-in failed.";
    return;
  }

  let pending = null;

  googleId.initialize({
    client_id: clientId,
    callback: (response) => {
      pending = onGoogleCredential(response);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  googleId.prompt((notification) => {
    if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
      openGoogleChooser(googleId);
      return;
    }

    if (!notification?.isDismissedMoment?.()) {
      return;
    }

    const reason = notification.getDismissedReason?.();

    if (reason !== "credential_returned") {
      errorMessage.value = "Google sign-in was cancelled.";
    }
  });

  return pending;
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
              @click="continueWithGoogle"
            >
              Continue with Google
            </v-btn>
            <div v-if="googleChooser" ref="googleChooserHost" class="mt-4"></div>
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
