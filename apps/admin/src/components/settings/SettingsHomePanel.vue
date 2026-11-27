<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { icons } from '@/icons'
import { api } from '@/api/client'
import type { FeatureStatus, HomeBlockStatus } from '@/api/types'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/apiError'

const toast = useToast()

const homeBlocks = ref<HomeBlockStatus[]>([])
const features = ref<FeatureStatus[]>([])
const loading = ref(false)
const reordering = ref(false)
const homeReady = ref(false)
const shopReady = ref(false)
const togglingKeys = ref<Set<string>>(new Set())
const dragKey = ref<string | null>(null)
const dropTargetKey = ref<string | null>(null)

const sectionEdgesFeature = computed(
  () => features.value.find((row) => row.key === 'SECTION_EDGES') ?? null,
)

function contentTag(key: string) {
  if (key === 'CATALOG') return 'каталог'
  if (key === 'NEWS') return 'новости'
  if (key === 'REVIEW') return 'отзывы'
  if (key === 'GALLERY') return 'галерея'
  if (key === 'COACHES') return 'тренеры'
  return key.toLowerCase()
}

async function loadFeatures(options: { silent?: boolean } = {}) {
  shopReady.value = false
  try {
    features.value = await api<FeatureStatus[]>('/api/admin/settings/features')
  } catch (e) {
    if (!options.silent) {
      toast.error(getErrorMessage(e, 'Не удалось загрузить функции'))
    }
  } finally {
    requestAnimationFrame(() => {
      shopReady.value = true
    })
  }
}

async function loadHomeBlocks(options: { silent?: boolean } = {}) {
  if (!options.silent) loading.value = true
  homeReady.value = false
  try {
    homeBlocks.value = await api<HomeBlockStatus[]>('/api/admin/settings/home-blocks')
  } catch (e) {
    if (!options.silent) {
      toast.error(getErrorMessage(e, 'Не удалось загрузить блоки'))
    }
  } finally {
    loading.value = false
    requestAnimationFrame(() => {
      homeReady.value = true
    })
  }
}

async function onFeatureToggle(feature: FeatureStatus, enabled: boolean) {
  if (!shopReady.value) return
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
    await loadFeatures({ silent: true })
  } finally {
    const next = new Set(togglingKeys.value)
    next.delete(feature.key)
    togglingKeys.value = next
  }
}

async function onHomeToggle(block: HomeBlockStatus, enabled: boolean) {
  if (!homeReady.value) return
  if (enabled === block.enabled) return
  if (togglingKeys.value.has(block.key)) return

  togglingKeys.value = new Set(togglingKeys.value).add(block.key)
  try {
    homeBlocks.value = await api<HomeBlockStatus[]>(`/api/admin/settings/home-blocks/${block.key}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    })
    toast.success(enabled ? 'Блок включён' : 'Блок скрыт')
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось обновить'))
    await loadHomeBlocks({ silent: true })
  } finally {
    const next = new Set(togglingKeys.value)
    next.delete(block.key)
    togglingKeys.value = next
  }
}

function onHomeDragStart(block: HomeBlockStatus, event: DragEvent) {
  dragKey.value = block.key
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', block.key)
  }
}

function onHomeDragOver(block: HomeBlockStatus, event: DragEvent) {
  event.preventDefault()
  if (!dragKey.value || dragKey.value === block.key) return
  dropTargetKey.value = block.key
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onHomeDragLeave(block: HomeBlockStatus) {
  if (dropTargetKey.value === block.key) dropTargetKey.value = null
}

function onHomeDragEnd() {
  dragKey.value = null
  dropTargetKey.value = null
}

async function persistHomeOrder(next: HomeBlockStatus[]) {
  const prev = homeBlocks.value
  homeBlocks.value = next
  reordering.value = true
  try {
    homeBlocks.value = await api<HomeBlockStatus[]>('/api/admin/settings/home-blocks/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ keys: next.map((row) => row.key) }),
    })
  } catch (e) {
    homeBlocks.value = prev
    toast.error(getErrorMessage(e, 'Не удалось сохранить порядок'))
  } finally {
    reordering.value = false
    dragKey.value = null
    dropTargetKey.value = null
  }
}

async function onHomeDrop(target: HomeBlockStatus, event: DragEvent) {
  event.preventDefault()
  const sourceKey = dragKey.value || event.dataTransfer?.getData('text/plain')
  dropTargetKey.value = null
  if (!sourceKey || sourceKey === target.key || reordering.value) {
    dragKey.value = null
    return
  }

  const from = homeBlocks.value.findIndex((row) => row.key === sourceKey)
  const to = homeBlocks.value.findIndex((row) => row.key === target.key)
  if (from < 0 || to < 0) {
    dragKey.value = null
    return
  }

  const next = [...homeBlocks.value]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  await persistHomeOrder(next)
}

onMounted(async () => {
  await Promise.all([loadHomeBlocks(), loadFeatures({ silent: true })])
})
</script>

<template>
  <div v-loading="loading || reordering">
    <div
      v-if="sectionEdgesFeature"
      class="settings-feature-row mb-4"
      :class="{ 'is-off': !sectionEdgesFeature.enabled }"
    >
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-slate-800">{{ sectionEdgesFeature.label }}</p>
        <p class="mt-0.5 text-xs text-slate-500">{{ sectionEdgesFeature.description }}</p>
      </div>
      <el-switch
        :model-value="sectionEdgesFeature.enabled"
        :disabled="togglingKeys.has(sectionEdgesFeature.key)"
        @change="(value: boolean) => sectionEdgesFeature && onFeatureToggle(sectionEdgesFeature, value)"
      />
    </div>

    <ul class="space-y-2">
      <li
        v-for="(block, index) in homeBlocks"
        :key="block.key"
        class="settings-home-block"
        :class="{
          'is-dragging': dragKey === block.key,
          'is-drop-target': dropTargetKey === block.key,
          'is-off': !block.enabled,
        }"
        draggable="true"
        @dragstart="onHomeDragStart(block, $event)"
        @dragover="onHomeDragOver(block, $event)"
        @dragleave="onHomeDragLeave(block)"
        @drop="onHomeDrop(block, $event)"
        @dragend="onHomeDragEnd"
      >
        <span class="settings-home-block__handle" title="Перетащить">
          <el-icon :size="22"><component :is="icons['drag-move']" /></el-icon>
          <span class="settings-home-block__index">{{ index + 1 }}</span>
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-semibold text-slate-800">{{ block.label }}</p>
            <el-tag v-if="block.contentKey" size="small" effect="plain" type="info">
              {{ contentTag(block.contentKey) }}
            </el-tag>
            <el-tag
              v-if="block.enabled && !block.visible"
              size="small"
              type="warning"
              effect="light"
            >
              нет контента
            </el-tag>
          </div>
          <p class="mt-0.5 text-xs text-slate-500">{{ block.description }}</p>
        </div>

        <el-switch
          :model-value="block.enabled"
          @change="(value: boolean) => onHomeToggle(block, value)"
        />
      </li>
    </ul>
  </div>
</template>
