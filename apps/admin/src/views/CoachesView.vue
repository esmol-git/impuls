<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { icons } from '@/icons'
import { useRouter } from 'vue-router'
import AdminSurface from '@/components/ui/AdminSurface.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionSiteSwitch from '@/components/ui/SectionSiteSwitch.vue'
import TablePager from '@/components/ui/TablePager.vue'
import { api } from '@/api/client'
import type { Coach, CoachSortField, CoachesPage } from '@/api/types'
import { useConfirm } from '@/composables/useConfirm'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch'
import { usePagedResource } from '@/composables/usePagedResource'
import { usePublishedFilter } from '@/composables/usePublishedFilter'
import { useSectionVisibility } from '@/composables/useSectionVisibility'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/apiError'

const toast = useToast()
const { confirm } = useConfirm()
const router = useRouter()

const reordering = ref(false)
const dragId = ref<string | null>(null)
const dropTargetId = ref<string | null>(null)
const { searchInput, search, onSearchInput, clearSearch } = useDebouncedSearch()
const { publishedFilter, publishedFilterOptions, applyPublishedParam } = usePublishedFilter()
const { section, sectionSaving, loadSection, onSectionToggle } = useSectionVisibility(() => 'COACHES')

const {
  items,
  loading,
  page,
  pageSize,
  pageSizes,
  total,
  sort,
  order,
  load,
  onSortChange,
  afterDelete,
  replaceItem,
} = usePagedResource<Coach, CoachSortField>({
  defaultSort: 'sortOrder',
  defaultOrder: 'asc',
  onLoadSideEffect: () => loadSection(),
  fetchPage: async ({ page: p, limit, sort: s, order: o }) => {
    const params = new URLSearchParams({
      page: String(p),
      limit: String(limit),
      sort: s,
      order: o,
    })
    if (search.value) params.set('q', search.value)
    applyPublishedParam(params)
    const data = await api<CoachesPage>(`/api/admin/coaches?${params}`)
    return { items: data.items, meta: data.meta }
  },
})

watch([search, publishedFilter], () => {
  if (page.value !== 1) page.value = 1
  else void load()
})

const canReorder = computed(() => sort.value === 'sortOrder' && order.value === 'asc')
const pageOffset = computed(() => (page.value - 1) * pageSize.value)

function openCreate() {
  router.push({ name: 'coaches-create' })
}

function openEdit(item: Coach) {
  router.push({ name: 'coaches-edit', params: { id: item.id } })
}

async function togglePublished(item: Coach) {
  try {
    const updated = await api<Coach>(`/api/admin/coaches/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ published: !item.published }),
    })
    replaceItem(item.id, updated, (row) => row.id)
    await loadSection()
    toast.success(updated.published ? 'Опубликовано' : 'Скрыто')
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось обновить'))
  }
}

async function removeItem(item: Coach) {
  const ok = await confirm({
    title: 'Удалить тренера?',
    message: `«${item.name}» будет удалён с сайта.`,
    confirmLabel: 'Удалить',
    danger: true,
  })
  if (!ok) return

  try {
    await api(`/api/admin/coaches/${item.id}`, { method: 'DELETE' })
    toast.success('Удалено')
    await afterDelete()
    await loadSection()
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось удалить'))
  }
}

function rowClassName({ row }: { row: Coach }) {
  return [
    canReorder.value ? 'is-reorderable' : '',
    dragId.value === row.id ? 'is-dragging' : '',
    dropTargetId.value === row.id ? 'is-drop-target' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function onDragStart(item: Coach, event: DragEvent) {
  if (!canReorder.value || reordering.value) {
    event.preventDefault()
    return
  }
  dragId.value = item.id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.id)
  }
}

function onDragOver(item: Coach, event: DragEvent) {
  if (!canReorder.value || !dragId.value) return
  event.preventDefault()
  if (dragId.value === item.id) return
  dropTargetId.value = item.id
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onDragLeave(item: Coach) {
  if (dropTargetId.value === item.id) dropTargetId.value = null
}

async function persistOrder(next: Coach[]) {
  const prev = items.value
  items.value = next
  reordering.value = true
  try {
    await api<{ ok: boolean }>('/api/admin/coaches/reorder', {
      method: 'PATCH',
      body: JSON.stringify({
        ids: next.map((row) => row.id),
        offset: pageOffset.value,
      }),
    })
    await load({ silent: true })
  } catch (e) {
    items.value = prev
    toast.error(getErrorMessage(e, 'Не удалось сохранить порядок'))
  } finally {
    reordering.value = false
    dragId.value = null
    dropTargetId.value = null
  }
}

async function applyMove(sourceId: string, targetId: string) {
  if (!sourceId || sourceId === targetId || reordering.value || !canReorder.value) return

  const from = items.value.findIndex((row) => row.id === sourceId)
  const to = items.value.findIndex((row) => row.id === targetId)
  if (from < 0 || to < 0) return

  const next = [...items.value]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  await persistOrder(next)
}

async function onDrop(target: Coach, event: DragEvent) {
  event.preventDefault()
  const sourceId = dragId.value || event.dataTransfer?.getData('text/plain') || ''
  const targetId = dropTargetId.value || target.id
  dragId.value = null
  dropTargetId.value = null
  await applyMove(sourceId, targetId)
}

async function onTableDrop(event: DragEvent) {
  event.preventDefault()
  const sourceId = dragId.value || event.dataTransfer?.getData('text/plain') || ''
  const targetId = dropTargetId.value
  dragId.value = null
  dropTargetId.value = null
  if (sourceId && targetId) {
    await applyMove(sourceId, targetId)
  }
}

function onDragEnd() {
  dragId.value = null
  dropTargetId.value = null
}

function onCellMouseEnter(row: Coach) {
  if (!canReorder.value || !dragId.value || dragId.value === row.id) return
  dropTargetId.value = row.id
}

</script>

<template>
  <div>
    <PageHeader title="Тренеры" description="Состав на странице /coaches и в блоке на главной.">
      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <el-input
            :model-value="searchInput"
            class="w-56 sm:w-64"
            clearable
            placeholder="Имя, роль, опыт…"
            :prefix-icon="icons.search"
            @update:model-value="onSearchInput"
            @clear="clearSearch"
          />
          <el-select v-model="publishedFilter" class="w-36">
            <el-option
              v-for="option in publishedFilterOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <SectionSiteSwitch
            :section="section"
            :saving="sectionSaving"
            disabled-hint="Добавьте тренера, чтобы включить раздел"
            @change="onSectionToggle"
          />
          <el-button type="primary" :icon="Plus" @click="openCreate">
            Добавить тренера
          </el-button>
        </div>
      </template>
    </PageHeader>

    <p v-if="canReorder" class="mb-3 text-xs text-slate-400">
      Перетащите строку за ручку слева — такой порядок будет на сайте и в слайдере.
    </p>
    <p v-else class="mb-3 text-xs text-amber-600">
      Чтобы менять порядок перетаскиванием, сбросьте сортировку колонок (порядок по умолчанию).
    </p>

    <AdminSurface
      :class="{ 'is-reordering': reordering }"
      @dragover.prevent
      @drop="onTableDrop"
    >
      <el-table
        v-loading="loading || reordering"
        :data="items"
        row-key="id"
        class="admin-table coaches-table"
        :empty-text="search || publishedFilter !== 'ALL' ? 'Ничего не найдено' : 'Пока нет тренеров — добавьте первого.'"
        :row-class-name="rowClassName"
        @sort-change="onSortChange"
        @cell-mouse-enter="onCellMouseEnter"
      >
        <el-table-column label="" width="52" align="center">
          <template #default="{ row }">
            <span
              class="coach-drag"
              :class="{ 'is-disabled': !canReorder }"
              :draggable="canReorder && !reordering"
              :title="canReorder ? 'Перетащить' : 'Сбросьте сортировку колонок'"
              @dragstart="onDragStart(row, $event)"
              @dragover="onDragOver(row, $event)"
              @dragleave="onDragLeave(row)"
              @drop="onDrop(row, $event)"
              @dragend="onDragEnd"
              @click.stop
            >
              <el-icon :size="18"><component :is="icons['drag-move']" /></el-icon>
            </span>
          </template>
        </el-table-column>

        <el-table-column label="Фото" width="72">
          <template #default="{ row }">
            <img
              v-if="row.imageUrl"
              :src="row.imageUrl"
              :alt="row.imageAlt || row.name"
              class="h-10 w-10 rounded-lg object-cover"
              draggable="false"
            >
            <div
              v-else
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-400"
            >
              —
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="Имя" min-width="160" sortable="custom" />
        <el-table-column prop="role" label="Роль" min-width="180" sortable="custom" />
        <el-table-column prop="experience" label="Стаж" width="110" />

        <el-table-column prop="published" label="Статус" width="120" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="row.published ? 'success' : 'info'" size="small" effect="plain">
              {{ row.published ? 'На сайте' : 'Скрыт' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Действия" width="140" align="right" fixed="right">
          <template #default="{ row }">
            <div class="admin-table__actions" @click.stop>
              <button
                type="button"
                class="admin-table__action"
                :title="row.published ? 'Скрыть' : 'Показать'"
                :aria-label="row.published ? 'Скрыть' : 'Показать'"
                @click="togglePublished(row)"
              >
                <el-icon :size="18">
                  <component :is="row.published ? icons.lock : icons.unlock" />
                </el-icon>
              </button>
              <button
                type="button"
                class="admin-table__action"
                title="Редактировать"
                aria-label="Редактировать"
                @click="openEdit(row)"
              >
                <el-icon :size="18"><component :is="icons.edit" /></el-icon>
              </button>
              <button
                type="button"
                class="admin-table__action admin-table__action--danger"
                title="Удалить"
                aria-label="Удалить"
                @click="removeItem(row)"
              >
                <el-icon :size="18"><component :is="icons.trash" /></el-icon>
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <TablePager
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
      />
    </AdminSurface>
  </div>
</template>

<style scoped>
.coach-drag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  color: #94a3b8;
  cursor: grab;
  user-select: none;
  transition: color 0.15s ease, background 0.15s ease;
}

.coach-drag:hover:not(.is-disabled) {
  color: #253863;
  background: #f1f5f9;
}

.coach-drag:active:not(.is-disabled) {
  cursor: grabbing;
}

.coach-drag.is-disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.coaches-table :deep(.el-table__row.is-dragging) {
  opacity: 0.45;
}

.coaches-table :deep(.el-table__row.is-drop-target) > td {
  background: rgb(176 25 27 / 0.06) !important;
}

.coaches-table :deep(.el-table__row.is-reorderable) {
  cursor: default;
}
</style>
