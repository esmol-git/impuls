<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { icons } from '@/icons'
import PageHeader from '@/components/ui/PageHeader.vue'
import { api } from '@/api/client'
import type { FeatureStatus, HomeBlockStatus, TaxonomyItem, TaxonomyKind } from '@/api/types'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'

type TabKey = 'HOME' | 'SHOP' | TaxonomyKind

const toast = useToast()
const { confirm } = useConfirm()

const activeTab = ref<TabKey>('HOME')
const items = ref<TaxonomyItem[]>([])
const homeBlocks = ref<HomeBlockStatus[]>([])
const features = ref<FeatureStatus[]>([])
const loading = ref(false)
const saving = ref(false)
const reordering = ref(false)
const newName = ref('')
const dragKey = ref<string | null>(null)
const dropTargetKey = ref<string | null>(null)
const homeReady = ref(false)
const shopReady = ref(false)
const togglingKeys = ref<Set<string>>(new Set())

const tabs: { key: TabKey; label: string; hint: string; placeholder?: string }[] = [
  {
    key: 'HOME',
    label: 'Главная',
    hint: 'Включайте блоки главной страницы и перетаскивайте строки, чтобы менять порядок на сайте.',
  },
  {
    key: 'SHOP',
    label: 'Каталог',
    hint: 'Включайте и отключайте корзину и избранное на сайте. Без регистрации — данные гостя хранятся в браузере.',
  },
  {
    key: 'NEWS_TOPIC',
    label: 'Темы новостей',
    hint: 'Используются при создании новостей и показываются на сайте как метка темы.',
    placeholder: 'Например: Турниры',
  },
  {
    key: 'CATALOG_CATEGORY',
    label: 'Категории товаров',
    hint: 'Используются при добавлении товаров в каталог.',
    placeholder: 'Например: Форма',
  },
  {
    key: 'COACH_SPECIALTY',
    label: 'Специализации тренеров',
    hint: 'Теги на карточке тренера. Добавляйте здесь, а в карточке только выбирайте.',
    placeholder: 'Например: Техника',
  },
]

const currentTab = computed(() => tabs.find((tab) => tab.key === activeTab.value) || tabs[0])
const isHomeTab = computed(() => activeTab.value === 'HOME')
const isShopTab = computed(() => activeTab.value === 'SHOP')

async function loadTaxonomy() {
  if (activeTab.value === 'HOME' || activeTab.value === 'SHOP') return
  loading.value = true
  try {
    items.value = await api<TaxonomyItem[]>(`/api/admin/taxonomies?kind=${activeTab.value}`)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось загрузить')
  } finally {
    loading.value = false
  }
}

async function loadFeatures(options: { silent?: boolean } = {}) {
  if (!options.silent) loading.value = true
  shopReady.value = false
  try {
    features.value = await api<FeatureStatus[]>('/api/admin/settings/features')
  } catch (e) {
    if (!options.silent) {
      toast.error(e instanceof Error ? e.message : 'Не удалось загрузить функции')
    }
  } finally {
    loading.value = false
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
      toast.error(e instanceof Error ? e.message : 'Не удалось загрузить блоки')
    }
  } finally {
    loading.value = false
    // el-switch иногда эмитит change при гидрации — игнорируем до следующего тика
    requestAnimationFrame(() => {
      homeReady.value = true
    })
  }
}

async function load() {
  if (isHomeTab.value) await loadHomeBlocks()
  else if (isShopTab.value) await loadFeatures()
  else await loadTaxonomy()
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
    toast.error(e instanceof Error ? e.message : 'Не удалось обновить')
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
    toast.error(e instanceof Error ? e.message : 'Не удалось обновить')
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
    toast.error(e instanceof Error ? e.message : 'Не удалось сохранить порядок')
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

async function addItem() {
  const name = newName.value.trim()
  if (!name || activeTab.value === 'HOME' || activeTab.value === 'SHOP') {
    toast.error('Введите название')
    return
  }
  saving.value = true
  try {
    const created = await api<TaxonomyItem>('/api/admin/taxonomies', {
      method: 'POST',
      body: JSON.stringify({ kind: activeTab.value, name }),
    })
    items.value = [...items.value, created].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'),
    )
    newName.value = ''
    toast.success('Добавлено')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось добавить')
  } finally {
    saving.value = false
  }
}

async function renameItem(item: TaxonomyItem, name: string) {
  const next = name.trim()
  if (!next || next === item.name) return
  try {
    const updated = await api<TaxonomyItem>(`/api/admin/taxonomies/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: next }),
    })
    const idx = items.value.findIndex((row) => row.id === updated.id)
    if (idx >= 0) items.value[idx] = updated
    toast.success('Сохранено')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось сохранить')
    await load()
  }
}

async function removeItem(item: TaxonomyItem) {
  const ok = await confirm({
    title: 'Удалить?',
    message: `«${item.name}» будет удалено из справочника.`,
    confirmLabel: 'Удалить',
    danger: true,
  })
  if (!ok) return

  try {
    await api(`/api/admin/taxonomies/${item.id}`, { method: 'DELETE' })
    items.value = items.value.filter((row) => row.id !== item.id)
    toast.success('Удалено')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось удалить')
  }
}

watch(activeTab, () => {
  newName.value = ''
  void load()
})

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="Настройки"
      description="Блоки главной, функции каталога и справочники для новостей, товаров и тренеров."
    />

    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.key"
        :label="tab.label"
        :name="tab.key"
      />
    </el-tabs>

    <div class="admin-panel p-5 sm:p-6">
      <p class="mb-4 text-sm text-slate-500">{{ currentTab.hint }}</p>

      <!-- Home blocks -->
      <div v-if="isHomeTab" v-loading="loading || reordering">
        <p class="mb-4 text-xs text-slate-400">
          Для каталога, новостей и отзывов на главной также нужен контент и свитч «На сайте» в соответствующем разделе.
        </p>

        <ul class="space-y-2">
          <li
            v-for="(block, index) in homeBlocks"
            :key="block.key"
            class="home-block"
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
            <span class="home-block__handle" title="Перетащить">
              <el-icon :size="22"><component :is="icons['drag-move']" /></el-icon>
              <span class="home-block__index">{{ index + 1 }}</span>
            </span>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-semibold text-slate-800">{{ block.label }}</p>
                <el-tag v-if="block.contentKey" size="small" effect="plain" type="info">
                  {{ block.contentKey === 'CATALOG' ? 'каталог' : block.contentKey === 'NEWS' ? 'новости' : 'отзывы' }}
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

      <!-- Shop features -->
      <div v-else-if="isShopTab" v-loading="loading">
        <ul class="space-y-2">
          <li
            v-for="feature in features"
            :key="feature.key"
            class="feature-row"
            :class="{ 'is-off': !feature.enabled }"
          >
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-slate-800">{{ feature.label }}</p>
              <p class="mt-0.5 text-xs text-slate-500">{{ feature.description }}</p>
            </div>
            <el-switch
              :model-value="feature.enabled"
              @change="(value: boolean) => onFeatureToggle(feature, value)"
            />
          </li>
        </ul>
      </div>

      <!-- Taxonomies -->
      <template v-else>
        <form class="mb-5 flex flex-col gap-2 sm:flex-row" @submit.prevent="addItem">
          <el-input
            v-model="newName"
            :placeholder="currentTab.placeholder"
            maxlength="60"
            show-word-limit
            class="sm:max-w-md"
          />
          <el-button type="primary" :icon="Plus" :loading="saving" native-type="submit">
            Добавить
          </el-button>
        </form>

        <div v-loading="loading">
          <el-empty
            v-if="!loading && !items.length"
            description="Список пуст — добавьте первое значение"
          />

          <ul v-else class="space-y-2">
            <li
              v-for="item in items"
              :key="item.id"
              class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <el-input
                :model-value="item.name"
                class="min-w-0 flex-1"
                @change="(value: string) => renameItem(item, value)"
              />
              <el-button
                text
                type="danger"
                :icon="icons.trash"
                title="Удалить"
                @click="removeItem(item)"
              />
            </li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.settings-tabs :deep(.el-tabs__header) {
  margin-bottom: 1rem;
}

.home-block {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.75rem;
  background: #fff;
  cursor: grab;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    opacity 0.15s ease;
}

.home-block:active {
  cursor: grabbing;
}

.home-block.is-dragging {
  opacity: 0.45;
}

.home-block.is-drop-target {
  border-color: var(--el-color-primary);
  background: rgb(239 246 255);
}

.home-block.is-off {
  background: rgb(248 250 252);
}

.home-block__handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 3.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  color: rgb(100 116 139);
  background: rgb(248 250 252);
  flex-shrink: 0;
}

.home-block__index {
  min-width: 1.25rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: rgb(71 85 105);
  text-align: center;
}

.feature-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.75rem;
  background: #fff;
  transition: background 0.15s ease;
}

.feature-row.is-off {
  background: rgb(248 250 252);
}
</style>
