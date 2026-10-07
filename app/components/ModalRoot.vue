<script setup lang="ts">
import { computed } from 'vue'
import { modalCopy } from '~/data/modals'

const { active, payload, close } = useModal()

const copy = computed(() => {
  if (!active.value) return modalCopy.lead
  return modalCopy[active.value]
})

const formVariant = computed(() => active.value === 'callback' ? 'compact' : 'full')
</script>

<template>
  <UiAppModal
    v-if="active"
    :title="copy.title"
    :description="copy.description"
    size="lg"
    @close="close"
  >
    <LeadForm
      :variant="formVariant"
      :payload="payload"
      :submit-label="copy.submit"
    />
  </UiAppModal>
</template>
