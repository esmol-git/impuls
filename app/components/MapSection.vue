<script setup lang="ts">
import type { Location } from '~/types'

withDefaults(defineProps<{
  items?: Location[]
  focusId?: string | null
  source?: string
}>(), {
  focusId: null,
  source: 'map',
})

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <ClientOnly>
    <YandexLocationsMap
      :items="items"
      :focus-id="focusId"
      :source="source"
      @select="emit('select', $event)"
    />
    <template #fallback>
      <div class="overflow-hidden rounded-2xl border border-brand-100">
        <UiMediaPlaceholder
          class="!rounded-none"
          label="Карта площадок"
          hint="Загрузка Яндекс.Карт…"
          aspect="auto"
          :rounded="false"
        />
      </div>
    </template>
  </ClientOnly>
</template>
