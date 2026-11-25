<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '@/api/client'
import type { ThemeMode, ThemeStatus } from '@/api/types'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/apiError'

const toast = useToast()

const mode = ref<ThemeMode>('system')
const ready = ref(false)
const saving = ref(false)

const options: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
  { value: 'system', label: 'Системная' },
]

async function load(optionsSilent: { silent?: boolean } = {}) {
  ready.value = false
  try {
    const status = await api<ThemeStatus>('/api/admin/settings/theme')
    mode.value = status.mode
  } catch (e) {
    if (!optionsSilent.silent) {
      toast.error(getErrorMessage(e, 'Не удалось загрузить тему'))
    }
  } finally {
    requestAnimationFrame(() => {
      ready.value = true
    })
  }
}

async function onChange(next: ThemeMode | string | number | boolean | undefined) {
  if (!ready.value || saving.value) return
  if (typeof next !== 'string') return
  if (next !== 'light' && next !== 'dark' && next !== 'system') return
  if (next === mode.value) return

  saving.value = true
  try {
    const status = await api<ThemeStatus>('/api/admin/settings/theme', {
      method: 'PATCH',
      body: JSON.stringify({ mode: next }),
    })
    mode.value = status.mode
    toast.success(
      status.mode === 'light'
        ? 'Светлая тема'
        : status.mode === 'dark'
          ? 'Тёмная тема'
          : 'Системная тема',
    )
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось обновить тему'))
    await load({ silent: true })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="settings-feature-row mb-4 !items-start sm:!items-center">
    <div class="min-w-0 flex-1">
      <p class="font-semibold text-slate-800">Тема сайта</p>
      <p class="mt-0.5 text-sm text-slate-500">
        Светлая, тёмная или как на устройстве посетителя. Базовые поверхности уже переключаются.
      </p>
    </div>
    <el-radio-group
      :model-value="mode"
      :disabled="!ready || saving"
      class="shrink-0"
      @change="onChange"
    >
      <el-radio-button
        v-for="opt in options"
        :key="opt.value"
        :label="opt.value"
      >
        {{ opt.label }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>
