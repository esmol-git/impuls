<script setup lang="ts">
import type { ModalPayload, ModalType } from '~/data/modals'

const props = withDefaults(defineProps<{
  type?: ModalType
  payload?: ModalPayload
  class?: string
}>(), {
  type: 'lead',
})

const { open } = useModal()

const emit = defineEmits<{ click: [] }>()

function handleClick() {
  emit('click')
  open(props.type, props.payload)
}
</script>

<template>
  <button type="button" :class="props.class" @click="handleClick">
    <slot />
  </button>
</template>
