<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api/client'
import type { FeatureStatus } from '@/api/types'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/apiError'

const toast = useToast()

const features = ref<FeatureStatus[]>([])
const loading = ref(false)
const ready = ref(false)
const togglingKeys = ref<Set<string>>(new Set())

const shopFeatures = computed(() =>
  features.value.filter((row) => row.key === 'CART' || row.key === 'FAVORITES'),
)

async function load(options: { silent?: boolean } = {}) {
  if (!options.silent) loading.value = true
  ready.value = false
  try {
    features.value = await api<FeatureStatus[]>('/api/admin/settings/features')
  } catch (e) {
    if (!options.silent) {
      toast.error(getErrorMessage(e, 'Не удалось загрузить функции'))
    }
  } finally {
    loading.value = false
    requestAnimationFrame(() => {
      ready.value = true
    })
  }
}

async function onToggle(feature: FeatureStatus, enabled: boolean) {
  if (!ready.value) return
  if (enabled === feature.enabled) return
  if (togglingKeys.value.has(feature.key)) return

  togglingKeys.value = new Set(togglingKeys.value).add(feature.key)
  try {
    features.value = await api<FeatureStatus[]>(`/api/admin/settings/features/${feature.key}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    })
    toast.success(enabled ? 'Включено' : 'Отключено')
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось обновить'))
    await load({ silent: true })
  } finally {
    const next = new Set(togglingKeys.value)
    next.delete(feature.key)
    togglingKeys.value = next
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div v-loading="loading">
    <ul class="space-y-2">
      <li
        v-for="feature in shopFeatures"
        :key="feature.key"
        class="settings-feature-row"
        :class="{ 'is-off': !feature.enabled }"
      >
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-slate-800">{{ feature.label }}</p>
          <p class="mt-0.5 text-xs text-slate-500">{{ feature.description }}</p>
        </div>
        <el-switch
          :model-value="feature.enabled"
          :disabled="togglingKeys.has(feature.key)"
          @change="(value: boolean) => onToggle(feature, value)"
        />
      </li>
    </ul>
  </div>
</template>
