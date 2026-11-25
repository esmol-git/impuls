<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Короткий вид (как в каталоге): switch + одна строка */
    compact?: boolean
  }>(),
  { compact: false },
)

const published = defineModel<boolean>({ required: true })
</script>

<template>
  <div class="edit-page__publish" :class="{ 'edit-page__publish--compact': compact }">
    <el-switch v-model="published" />
    <span v-if="compact" class="text-sm font-semibold text-slate-800">
      {{ published ? 'Опубликован' : 'Скрыт' }}
    </span>
    <div v-else class="min-w-0">
      <p class="text-sm font-semibold text-slate-800">
        {{ published ? 'Опубликовано' : 'Скрыто' }}
      </p>
      <p class="text-xs text-slate-500">
        {{ published ? 'Видно на сайте' : 'Только в админке' }}
      </p>
    </div>
  </div>
</template>
