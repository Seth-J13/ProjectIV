<script>
export default { name: "DestinationForm" };
</script>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { createDestination, updateDestination } from "../services/destinationServices.js";

const ZIP_ERROR = "Zip code must be formatted like ##### or #####-####";
const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

const props = defineProps({
  isAddMode: { type: Boolean, default: true },
  modelValue: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["saved", "closed"]);

const open = ref(true);
const saving = ref(false);
const formError = ref("");
const form = ref(null);
const card = ref(null);

const destName = ref("");
const addrLine1 = ref("");
const addrLine2 = ref("");
const city = ref("");
const state = ref("");
const zip = ref("");

const requiredRule = (value) => !!String(value ?? "").trim() || "Required";
const lengthRule = (value) => String(value ?? "").trim().length <= 254 || "Use 254 characters or fewer.";
const zipRules = [
  requiredRule,
  (value) => ZIP_PATTERN.test(String(value ?? "")) || ZIP_ERROR,
];
const textRules = [requiredRule, lengthRule];

function formatZip(value) {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 9);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function applyModel(value) {
  destName.value = value?.dest_name ?? "";
  addrLine1.value = value?.addr_line_1 ?? "";
  addrLine2.value = value?.addr_line_2 ?? "";
  city.value = value?.city ?? "";
  state.value = value?.state ?? "";
  zip.value = formatZip(value?.zip ?? "");
}

function clearFields() {
  destName.value = "";
  addrLine1.value = "";
  addrLine2.value = "";
  city.value = "";
  state.value = "";
  zip.value = "";
  formError.value = "";
}

if (!props.isAddMode) {
  applyModel(props.modelValue);
}

function cardElement() {
  return card.value?.$el ?? card.value ?? null;
}

function dismiss() {
  clearFields();
  open.value = false;
  emit("closed");
}

function onDocumentClick(event) {
  if (!open.value) {
    return;
  }

  const root = cardElement();

  // The card is not in the document yet, or this click is the button that opened it.
  if (!root || root.contains(event.target) || event.target?.closest?.("[data-destination-opener]")) {
    return;
  }

  dismiss();
}

let alive = true;
let listening = false;

onMounted(() => {
  // The click that opened this form is still bubbling. Wait until it finishes
  // before treating outside clicks as a close.
  nextTick(() => {
    if (!alive || !open.value) {
      return;
    }

    document.addEventListener("click", onDocumentClick);
    listening = true;
  });
});

onUnmounted(() => {
  alive = false;

  if (listening) {
    document.removeEventListener("click", onDocumentClick);
  }
});

function missingFieldNames() {
  return [
    ["Name", destName.value],
    ["Street Address", addrLine1.value],
    ["City", city.value],
    ["State", state.value],
    ["Zip Code", zip.value],
  ]
    .filter(([, value]) => !String(value ?? "").trim())
    .map(([label]) => label);
}

async function submit() {
  const missing = missingFieldNames();
  formError.value = missing.length ? `Missing fields: ${missing.join(", ")}` : "";

  const result = await form.value?.validate();

  if (missing.length || result === false || result?.valid === false) {
    return;
  }

  const payload = {
    dest_name: destName.value.trim(),
    addr_line_1: addrLine1.value.trim(),
    addr_line_2: addrLine2.value.trim() || null,
    city: city.value.trim(),
    state: state.value.trim(),
    zip: zip.value.trim(),
  };

  saving.value = true;

  try {
    const response = props.isAddMode
      ? await createDestination(payload)
      : await updateDestination(props.modelValue?.id, payload);

    emit("saved", response.data?.message || "");
    open.value = false;
  } catch (error) {
    formError.value = error.response?.data?.message || "Could not save destination.";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <v-card v-if="open" ref="card" max-width="560">
      <v-card-title>{{ isAddMode ? "Add Destination" : "Edit Destination" }}</v-card-title>
      <v-card-text>
        <v-alert v-if="formError" type="error" class="mb-4">{{ formError }}</v-alert>
        <v-form ref="form" @submit.prevent="submit">
          <v-text-field v-model="destName" label="Name" :rules="textRules" maxlength="254" />
          <v-text-field v-model="addrLine1" label="Street Address" :rules="textRules" maxlength="254" />
          <v-text-field v-model="addrLine2" label="Address Line 2" :rules="[lengthRule]" maxlength="254" />
          <v-text-field v-model="city" label="City" :rules="textRules" maxlength="254" />
          <v-text-field v-model="state" label="State" :rules="textRules" maxlength="254" />
          <v-text-field
            :model-value="zip"
            label="Zip Code"
            :rules="zipRules"
            maxlength="10"
            @update:model-value="zip = formatZip($event)"
          />
          <v-card-actions class="px-0">
            <v-btn type="button" @click="dismiss">Cancel</v-btn>
            <v-btn class="oc-cta" type="submit" :loading="saving">{{ isAddMode ? "Add" : "Save" }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
  </v-card>
</template>
