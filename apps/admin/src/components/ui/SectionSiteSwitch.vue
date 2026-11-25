<script setup lang="ts">
import type { SectionStatus } from '@/api/types'

defineProps<{
  section: SectionStatus | null
  saving?: boolean
  /** Кастомный tooltip, когда раздел нельзя включить */
  disabledHint?: string
}>()

defineEmits<{
  change: [enabled: boolean]
}>()
</script>

<template>
  <div
    class="section-switch"
    :class="{ 'is-disabled': !section?.canEnable }"
    :title="
      section?.canEnable
        ? 'Показывать раздел на сайте'
        : disabledHint || 'Добавьте контент, чтобы включить раздел'
    "
  >
    <span class="section-switch__label">На сайте</span>
    <el-switch
      :model-value="Boolean(section?.enabled && section?.canEnable)"
      :disabled="!section?.canEnable || saving"
      :loading="saving"
      @change="(v: string | number | boolean) => $emit('change', Boolean(v))"
    />
  </div>
</template>
