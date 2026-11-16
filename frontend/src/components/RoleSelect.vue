<script>
export default {
  name: "VSelect",
};
</script>

<script setup>
defineProps({
  label: { type: String, required: true },
  modelValue: { type: String, required: true },
  items: { type: Array, required: true },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="role-select">
    <label class="text-body-2 d-block mb-1">{{ label }}</label>
    <select
      class="role-select__control"
      :value="modelValue"
      @change="emit('update:modelValue', $event.target.value)"
    >
      <option v-for="item in items" :key="item" :value="item">{{ item }}</option>
    </select>
  </div>
</template>

<style scoped>
.role-select__control {
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid rgb(var(--v-theme-outline));
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  font: inherit;
}
</style>
