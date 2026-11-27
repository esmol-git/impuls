<script setup lang="ts">
import { computed } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { ru } from 'date-fns/locale'
import { icons } from '@/icons'
import '@vuepic/vue-datepicker/dist/main.css'

const model = defineModel<string | null>({ default: null })

const props = withDefaults(
  defineProps<{
    minDate?: Date | null
    maxDate?: Date | null
    placeholder?: string
    clearable?: boolean
    disabled?: boolean
  }>(),
  {
    placeholder: 'ДД.ММ.ГГГГ ЧЧ:ММ',
    clearable: true,
    disabled: false,
  },
)

const formats = {
  input: 'dd.MM.yyyy HH:mm',
  preview: 'dd.MM.yyyy HH:mm',
}

const textInput = {
  format: 'dd.MM.yyyy HH:mm',
  maskFormat: 'DD.MM.YYYY hh:mm',
  enterSubmit: true,
  tabSubmit: true,
  openMenu: 'open' as const,
  selectOnFocus: true,
  applyOnBlur: true,
}

const timeConfig = computed(() => {
  const anchor = props.minDate && props.minDate.getTime() > Date.now()
    ? props.minDate
    : new Date()
  return {
    enableTimePicker: true,
    is24: true,
    enableSeconds: false,
    timePickerInline: true,
    startTime: {
      hours: anchor.getHours(),
      minutes: anchor.getMinutes(),
      seconds: 0,
    },
  }
})

/** Календарь открывается на текущей дате (с учётом min/max). */
const startDate = computed(() => {
  const now = new Date()
  if (props.minDate && now < props.minDate) return props.minDate
  if (props.maxDate && now > props.maxDate) return props.maxDate
  return now
})

const pickerValue = computed({
  get: () => {
    if (!model.value) return null
    const date = new Date(model.value)
    return Number.isNaN(date.getTime()) ? null : date
  },
  set: (value: Date | string | null) => {
    if (!value) {
      model.value = null
      return
    }
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) {
      model.value = null
      return
    }
    if (props.minDate && date.getTime() < props.minDate.getTime()) {
      model.value = null
      return
    }
    if (props.maxDate && date.getTime() > props.maxDate.getTime()) {
      model.value = null
      return
    }
    model.value = date.toISOString()
  },
})
</script>

<template>
  <div class="admin-dtp" :class="{ 'is-disabled': disabled }">
    <VueDatePicker
      v-model="pickerValue"
      :locale="ru"
      :formats="formats"
      :text-input="textInput"
      :time-config="timeConfig"
      :min-date="minDate || undefined"
      :max-date="maxDate || undefined"
      :start-date="startDate"
      :disabled="disabled"
      :placeholder="placeholder"
      :clearable="clearable"
      :auto-apply="true"
      :teleport="true"
      :six-weeks="true"
      :week-start="1"
    >
      <template
        #dp-input="{
          value,
          onInput,
          onEnter,
          onTab,
          onClear,
          onBlur,
          onFocus,
          onPaste,
          openMenu,
        }"
      >
        <el-input
          :model-value="value"
          :placeholder="placeholder"
          :disabled="disabled"
          :clearable="clearable"
          class="admin-dtp__input"
          @clear="onClear"
          @focus="() => { onFocus(); openMenu() }"
          @blur="onBlur"
          @keydown.enter="onEnter"
          @keydown.tab="onTab"
          @paste="onPaste"
          @mousedown="openMenu"
          @click="openMenu"
          @update:model-value="onInput"
        >
          <template #prefix>
            <el-icon class="admin-dtp__calendar">
              <component :is="icons.calendar" />
            </el-icon>
          </template>
        </el-input>
      </template>
    </VueDatePicker>
  </div>
</template>

<style scoped>
.admin-dtp {
  width: 100%;
  --dp-font-family: inherit;
  --dp-border-radius: 8px;
  --dp-cell-border-radius: 999px;
  --dp-background-color: #fff;
  --dp-text-color: #303133;
  --dp-hover-color: #ecf2ff;
  --dp-hover-text-color: #1d4ed8;
  --dp-hover-icon-color: #1d4ed8;
  --dp-primary-color: #1d4ed8;
  --dp-primary-text-color: #fff;
  --dp-secondary-color: #f1f5f9;
  --dp-border-color: var(--el-border-color);
  --dp-menu-border-color: #e2e8f0;
  --dp-border-color-hover: var(--el-border-color-hover);
  --dp-border-color-focus: var(--el-color-primary);
  --dp-icon-color: #64748b;
  --dp-disabled-color: #f5f7fa;
  --dp-scroll-bar-background: #e2e8f0;
  --dp-scroll-bar-color: #94a3b8;
  --dp-success-color: #1d4ed8;
  --dp-success-color-disabled: #93c5fd;
  --dp-danger-color: var(--el-color-danger);
  --dp-highlight-color: rgb(29 78 216 / 12%);
  --dp-tooltip-color: #0f172a;
  --dp-font-size: 14px;
  --dp-preview-font-size: 13px;
  --dp-time-font-size: 14px;
  --dp-action-row-padding: 8px 12px;
  --dp-action-buttons-padding: 6px 12px;
  --dp-action-button-height: 28px;
  --dp-row-margin: 2px 0;
  --dp-calendar-header-cell-padding: 0.4rem 0;
  --dp-menu-min-width: 320px;
}

.admin-dtp :deep(.dp--input-wrap) {
  width: 100%;
}

.admin-dtp :deep(.dp--clear-btn),
.admin-dtp :deep(.dp--input-icon),
.admin-dtp :deep(.dp--input-icons) {
  display: none !important;
}

.admin-dtp__input {
  width: 100%;
}

.admin-dtp :deep(.admin-dtp__input .el-input__wrapper) {
  cursor: text;
}

.admin-dtp :deep(.admin-dtp__input .el-input__prefix .el-icon) {
  font-size: 18px;
}

.admin-dtp :deep(.admin-dtp__input .el-input__prefix svg.app-svg-icon),
.admin-dtp :deep(.admin-dtp__input .el-input__prefix .app-icon),
.admin-dtp :deep(.admin-dtp__input .el-input__prefix svg) {
  width: 18px !important;
  height: 18px !important;
}

.admin-dtp__calendar {
  color: #64748b;
}

.admin-dtp :deep(.dp--menu) {
  z-index: 3100;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  box-shadow:
    0 10px 15px -3px rgb(15 23 42 / 8%),
    0 4px 6px -4px rgb(15 23 42 / 6%) !important;
  overflow: hidden;
}

.admin-dtp :deep(.dp--calendar-header-item) {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.admin-dtp :deep(.dp--cell-inner) {
  width: 34px;
  height: 34px;
}

.admin-dtp :deep(.dp--today) {
  border: 1px solid rgb(29 78 216 / 45%);
}

.admin-dtp :deep(.dp--time-picker-inline-container) {
  border-top: 1px solid #e2e8f0;
  margin-top: 4px;
  padding: 10px 12px 12px;
  background: #f8fafc;
}

.admin-dtp :deep(.dp--time-display),
.admin-dtp :deep(.dp--time-display-inline) {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: #0f172a;
}

.admin-dtp :deep(.dp--overlay-cell) {
  border-radius: 8px;
}

.admin-dtp :deep(.dp--overlay-cell-active) {
  background: #1d4ed8 !important;
  color: #fff !important;
}

.admin-dtp :deep(.dp--action-select) {
  background: #1d4ed8 !important;
}

.admin-dtp.is-disabled {
  opacity: 0.65;
  pointer-events: none;
}
</style>
