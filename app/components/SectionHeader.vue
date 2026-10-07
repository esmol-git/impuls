<script setup lang="ts">
import type { SectionAction, SectionAlign } from '~/types'

withDefaults(defineProps<{
  label?: string
  title: string
  description?: string
  align?: SectionAlign
  light?: boolean
  titleId?: string
  action?: SectionAction
  reveal?: boolean
}>(), {
  reveal: true,
})
</script>

<template>
  <component :is="reveal ? 'ScrollReveal' : 'div'">
    <div
      class="flex flex-col gap-4"
      :class="action ? 'sm:flex-row sm:items-end sm:justify-between sm:gap-6' : undefined"
    >
      <SectionTitle
        :label="label"
        :title="title"
        :description="description"
        :align="align"
        :light="light"
        :title-id="titleId"
      />
      <NuxtLink
        v-if="action"
        :to="action.to"
        class="btn-outline w-full shrink-0 sm:w-auto"
      >
        {{ action.label }}
      </NuxtLink>
    </div>
  </component>
</template>
