<script setup lang="ts" generic="T extends string">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  modelValue: T
  options: { value: T; label: string }[]
  ariaLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const currentLabel = computed(
  () => props.options.find((option) => option.value === props.modelValue)?.label || '',
)

function toggle() {
  open.value = !open.value
}

function select(value: T) {
  emit('update:modelValue', value)
  open.value = false
}

function onPointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="app-select" :class="{ 'is-open': open }">
    <button
      type="button"
      class="app-select__trigger"
      :aria-label="ariaLabel"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span class="app-select__value">{{ currentLabel }}</span>
      <svg class="app-select__chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <ul v-if="open" class="app-select__menu" role="listbox">
      <li v-for="option in options" :key="option.value" role="option" :aria-selected="option.value === modelValue">
        <button
          type="button"
          class="app-select__option"
          :class="{ 'is-active': option.value === modelValue }"
          @click="select(option.value)"
        >
          {{ option.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.app-select {
  position: relative;
  min-width: 10.5rem;
}

.app-select__trigger {
  display: inline-flex;
  width: 100%;
  min-height: 2.25rem;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem 0.7rem 0.4rem 0.85rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.7rem;
  background: #fff;
  color: #0b2a5b;
  font-size: 0.8125rem;
  font-weight: 600;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.app-select__trigger:hover,
.app-select.is-open .app-select__trigger {
  border-color: rgb(147 197 253);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 10%);
}

.app-select__value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-select__chevron {
  width: 0.95rem;
  height: 0.95rem;
  flex-shrink: 0;
  color: rgb(100 116 139);
  transition: transform 0.15s ease;
}

.app-select.is-open .app-select__chevron {
  transform: rotate(180deg);
}

.app-select__menu {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  z-index: 20;
  margin: 0;
  min-width: 100%;
  list-style: none;
  padding: 0.35rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.8rem;
  background: #fff;
  box-shadow: 0 14px 34px rgb(15 23 42 / 12%);
}

.app-select__option {
  display: block;
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: 0;
  border-radius: 0.55rem;
  background: transparent;
  color: #0b2a5b;
  text-align: left;
  font-size: 0.8125rem;
  font-weight: 600;
}

.app-select__option:hover {
  background: rgb(239 246 255);
}

.app-select__option.is-active {
  background: #0b2a5b;
  color: #fff;
}
</style>
