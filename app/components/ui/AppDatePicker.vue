<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { ru } from 'date-fns/locale'
import '@vuepic/vue-datepicker/dist/main.css'

const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    min?: string
    max?: string
    disabled?: boolean
    placeholder?: string
    error?: boolean
  }>(),
  {
    placeholder: 'Необязательно',
  },
)

const emit = defineEmits<{
  change: [value: string]
}>()

/** Только после mount — иначе SSR/клиент расходятся. */
const ready = ref(false)
onMounted(() => {
  ready.value = true
})

const minDate = computed(() => (props.min ? new Date(`${props.min}T00:00:00`) : undefined))
const maxDate = computed(() => (props.max ? new Date(`${props.max}T00:00:00`) : undefined))

const formats = {
  input: 'dd.MM.yyyy',
  preview: 'dd.MM.yyyy',
}

const timeConfig = {
  enableTimePicker: false,
}

const pickerValue = computed({
  get: () => model.value || null,
  set: (value: string | Date | null) => {
    let next = ''
    if (typeof value === 'string') {
      next = value.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || value.slice(0, 10)
    } else if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const y = value.getFullYear()
      const m = String(value.getMonth() + 1).padStart(2, '0')
      const d = String(value.getDate()).padStart(2, '0')
      next = `${y}-${m}-${d}`
    }
    model.value = next
    emit('change', next)
  },
})
</script>

<template>
  <div class="app-date-picker" :class="{ 'is-error': error }">
    <VueDatePicker
      v-if="ready"
      v-model="pickerValue"
      :locale="ru"
      model-type="yyyy-MM-dd"
      :formats="formats"
      :time-config="timeConfig"
      :min-date="minDate"
      :max-date="maxDate"
      :disabled="disabled"
      :placeholder="placeholder"
      :auto-apply="true"
      :clearable="true"
      :teleport="true"
    />
    <div
      v-else
      class="app-date-picker__fallback"
      aria-hidden="true"
    >
      {{ placeholder }}
    </div>
  </div>
</template>

<style scoped>
.app-date-picker {
  width: 100%;
  /* как .input-field: brand-50 / brand-200 */
  --dp-font-family: Manrope, system-ui, sans-serif;
  --dp-border-radius: 0.5rem;
  --dp-background-color: #eef2f8;
  --dp-text-color: #253863;
  --dp-primary-color: #253863;
  --dp-primary-text-color: #fff;
  --dp-hover-color: #dce4f0;
  --dp-hover-text-color: #253863;
  --dp-border-color: #b9c9e1;
  --dp-border-color-hover: #8aa3c9;
  --dp-border-color-focus: #253863;
  --dp-menu-border-color: #dce4f0;
  --dp-icon-color: #5a7aad;
  --dp-input-padding: 0.75rem 1rem;
  --dp-font-size: 0.875rem;
  --dp-input-icon-padding: 2.25rem;
}

.app-date-picker :deep(.dp--theme-light) {
  --dp-background-color: #eef2f8;
  --dp-border-color: #b9c9e1;
  --dp-border-color-hover: #8aa3c9;
  --dp-border-color-focus: #253863;
  --dp-text-color: #253863;
  --dp-icon-color: #5a7aad;
}

.app-date-picker :deep(.dp--input) {
  min-height: 2.75rem;
  border: 1px solid #b9c9e1 !important;
  background-color: #eef2f8 !important;
  box-shadow: none !important;
  color: #253863;
}

.app-date-picker :deep(.dp--input:hover:not(.dp--input-focus)) {
  border-color: #8aa3c9 !important;
}

.app-date-picker :deep(.dp--input-focus) {
  border-color: #253863 !important;
  box-shadow: 0 0 0 2px rgb(37 56 99 / 10%) !important;
}

.app-date-picker :deep(.dp--menu) {
  --dp-background-color: #fff;
  z-index: 120;
  background: #fff !important;
}

.app-date-picker.is-error :deep(.dp--input),
.app-date-picker.is-error .app-date-picker__fallback {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgb(239 68 68 / 12%) !important;
}

.app-date-picker__fallback {
  display: flex;
  width: 100%;
  min-height: 2.75rem;
  align-items: center;
  border-radius: 0.5rem;
  border: 1px solid #b9c9e1;
  background: #eef2f8;
  padding: 0 1rem;
  font-size: 0.875rem;
  color: rgb(37 56 99 / 40%);
}
</style>
