<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Явный padding 20/24 (журнал с фильтрами) */
    padded?: boolean
    /** Без padding body — редкий full-bleed */
    flush?: boolean
  }>(),
  { padded: false, flush: false },
)
</script>

<template>
  <el-card
    shadow="never"
    class="admin-surface"
    :class="{
      'admin-surface--padded': padded,
      'admin-surface--flush': flush,
    }"
  >
    <slot />
  </el-card>
</template>
