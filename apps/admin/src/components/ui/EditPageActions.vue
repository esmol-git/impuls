<script setup lang="ts">
import { icons } from '@/icons'

defineProps<{
  saving?: boolean
  showSaving?: boolean
  backLabel?: string
}>()

defineEmits<{
  back: []
  save: []
}>()
</script>

<template>
  <div class="edit-page__actions">
    <el-button :icon="icons['arrow-left']" :disabled="saving" @click="$emit('back')">
      {{ backLabel || 'К списку' }}
    </el-button>
    <el-button
      type="primary"
      class="edit-page__save"
      :loading="showSaving"
      :disabled="saving && !showSaving"
      @click="$emit('save')"
    >
      Сохранить
    </el-button>
  </div>
</template>
