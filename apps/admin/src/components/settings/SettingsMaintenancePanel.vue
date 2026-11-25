<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '@/api/client'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/utils/apiError'

const auth = useAuthStore()
const toast = useToast()

const enabled = ref(false)
const ready = ref(false)
const saving = ref(false)

async function load(options: { silent?: boolean } = {}) {
  if (!auth.isSuperAdmin) return
  ready.value = false
  try {
    const status = await api<{ enabled: boolean }>('/api/admin/settings/maintenance')
    enabled.value = status.enabled
  } catch (e) {
    if (!options.silent) {
      toast.error(getErrorMessage(e, 'Не удалось загрузить режим обслуживания'))
    }
  } finally {
    requestAnimationFrame(() => {
      ready.value = true
    })
  }
}

async function onToggle(next: boolean) {
  if (!auth.isSuperAdmin || !ready.value || saving.value) return
  if (next === enabled.value) return

  saving.value = true
  try {
    const status = await api<{ enabled: boolean }>('/api/admin/settings/maintenance', {
      method: 'PATCH',
      body: JSON.stringify({ enabled: next }),
    })
    enabled.value = status.enabled
    toast.success(next ? 'Заглушка включена' : 'Сайт снова открыт')
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось обновить'))
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
  <div
    v-if="auth.isSuperAdmin"
    class="settings-feature-row mb-4"
    :class="{ 'is-off': !enabled, 'is-maintenance-on': enabled }"
  >
    <div class="min-w-0 flex-1">
      <p class="font-semibold text-slate-800">Режим обслуживания</p>
      <p class="mt-0.5 text-sm text-slate-500">
        Посетители увидят заглушку вместо сайта. Админка останется доступной.
      </p>
    </div>
    <el-switch
      :model-value="enabled"
      :loading="saving"
      :disabled="!ready"
      @change="(value: boolean) => onToggle(value)"
    />
  </div>
</template>
