<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { icons } from '@/icons'
import { useRouter } from 'vue-router'
import AdminSurface from '@/components/ui/AdminSurface.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionSiteSwitch from '@/components/ui/SectionSiteSwitch.vue'
import TablePager from '@/components/ui/TablePager.vue'
import { api } from '@/api/client'
import type { MediaItem, MediaPage, MediaSortField } from '@/api/types'
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

const copyingId = ref<string | null>(null)
const { searchInput, search, onSearchInput, clearSearch } = useDebouncedSearch()
const { publishedFilter, publishedFilterOptions, applyPublishedParam } = usePublishedFilter()
const { section, sectionSaving, loadSection, onSectionToggle } = useSectionVisibility(() => 'CATALOG')

const {
  items,
  loading,
  page,
  pageSize,
  pageSizes,
  total,
  load,
  onSortChange,
  afterDelete,
  replaceItem,
} = usePagedResource<MediaItem, MediaSortField>({
  defaultSort: 'createdAt',
  defaultOrder: 'desc',
  onLoadSideEffect: () => loadSection(),
  fetchPage: async ({ page: p, limit, sort, order }) => {
    const params = new URLSearchParams({
      type: 'CATALOG',
      page: String(p),
      limit: String(limit),
      sort,
      order,
    })
    if (search.value) params.set('q', search.value)
    applyPublishedParam(params)
    const media = await api<MediaPage>(`/api/admin/media?${params}`)
    return { items: media.items, meta: media.meta }
  },
})

watch([search, publishedFilter], () => {
  if (page.value !== 1) page.value = 1
  else void load()
})

function formatPrice(value?: number | null) {
  if (value == null) return '—'
  return `${value.toLocaleString('ru-RU')} ₽`
}

function photoCount(item: MediaItem) {
  if (item.imageUrls?.length) return item.imageUrls.length
  return item.imageUrl ? 1 : 0
}

function openCreate() {
  router.push({ name: 'catalog-create' })
}

function openEdit(item: MediaItem) {
  router.push({ name: 'catalog-edit', params: { id: item.id } })
}

async function togglePublished(item: MediaItem) {
  try {
    const updated = await api<MediaItem>(`/api/admin/media/${item.id}`, {
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

async function copyItem(item: MediaItem) {
  const ok = await confirm({
    title: 'Создать копию?',
    message: `Будет создан скрытый товар «${item.title} (копия)» с теми же фото и ценой.`,
    confirmLabel: 'Создать копию',
  })
  if (!ok) return

  copyingId.value = item.id
  try {
    const gallery = item.imageUrls?.length ? item.imageUrls : item.imageUrl ? [item.imageUrl] : []
    const baseSku = (item.sku || 'SKU').trim()
    const created = await api<MediaItem>('/api/admin/media', {
      method: 'POST',
      body: JSON.stringify({
        type: 'CATALOG',
        title: `${item.title} (копия)`,
        category: item.category,
        sku: `${baseSku}-copy-${Date.now().toString(36)}`.slice(0, 64),
        quantity: item.quantity,
        description: item.description,
        imageUrl: gallery[0] || item.imageUrl,
        imageUrls: gallery,
        price: item.price,
        discount: item.discount,
        salePrice: item.salePrice,
        published: false,
      }),
    })
    toast.success('Копия создана')
    await router.push({ name: 'catalog-edit', params: { id: created.id } })
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось создать копию'))
  } finally {
    copyingId.value = null
  }
}

async function removeItem(item: MediaItem) {
  const ok = await confirm({
    title: 'Удалить товар?',
    message: `«${item.title}» будет удалён из каталога.`,
    confirmLabel: 'Удалить',
    danger: true,
  })
  if (!ok) return

  try {
    await api(`/api/admin/media/${item.id}`, { method: 'DELETE' })
    toast.success('Удалено')
    await afterDelete()
    await loadSection()
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось удалить'))
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Каталог"
      description="Товары в таблице. Откройте карточку для просмотра и редактирования."
    >
      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <el-input
            :model-value="searchInput"
            class="w-56 sm:w-64"
            clearable
            placeholder="Название, артикул, категория…"
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
            disabled-hint="Добавьте товар, чтобы включить раздел"
            @change="onSectionToggle"
          />
          <el-button type="primary" :icon="Plus" @click="openCreate">Добавить товар</el-button>
        </div>
      </template>
    </PageHeader>

    <AdminSurface>
      <el-table
        v-loading="loading"
        :data="items"
        stripe
        :empty-text="search || publishedFilter !== 'ALL' ? 'Ничего не найдено' : 'Каталог пуст — добавьте первый товар'"
        class="catalog-table"
        :default-sort="{ prop: 'createdAt', order: 'descending' }"
        @row-click="openEdit"
        @sort-change="onSortChange"
      >
        <el-table-column label="Фото" width="88">
          <template #default="{ row }">
            <div class="catalog-table__thumb">
              <img :src="row.imageUrl" :alt="row.title">
              <span v-if="photoCount(row) > 1" class="catalog-table__badge">
                {{ photoCount(row) }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="Товар" min-width="200" sortable="custom">
          <template #default="{ row }">
            <button type="button" class="catalog-table__title" @click.stop="openEdit(row)">
              {{ row.title }}
            </button>
            <p v-if="row.sku" class="mt-0.5 text-xs font-medium text-slate-500">арт. {{ row.sku }}</p>
            <p v-if="row.description" class="mt-0.5 line-clamp-1 text-xs text-slate-500">
              {{ row.description }}
            </p>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="Категория" width="140" sortable="custom">
          <template #default="{ row }">
            <el-tag v-if="row.category" size="small" effect="plain">{{ row.category }}</el-tag>
            <span v-else class="text-slate-400">—</span>
          </template>
        </el-table-column>

        <el-table-column prop="price" label="Цена" width="150" sortable="custom">
          <template #default="{ row }">
            <div class="flex flex-col gap-0.5">
              <span
                v-if="row.salePrice != null"
                class="text-sm font-semibold text-slate-800"
              >
                {{ formatPrice(row.salePrice) }}
              </span>
              <span
                class="text-sm"
                :class="row.salePrice != null ? 'text-slate-400 line-through' : 'font-semibold text-slate-800'"
              >
                {{ formatPrice(row.price) }}
              </span>
              <el-tag v-if="row.discount" size="small" type="danger" class="w-fit">
                −{{ row.discount }}%
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="published" label="Статус" width="130" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="row.published ? 'success' : 'info'" size="small">
              {{ row.published ? 'Опубликован' : 'Скрыт' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Действия" width="168" align="right" fixed="right">
          <template #default="{ row }">
            <div class="admin-table__actions" @click.stop>
              <button
                type="button"
                class="admin-table__action"
                title="Открыть"
                aria-label="Открыть"
                @click="openEdit(row)"
              >
                <el-icon :size="18"><component :is="icons.edit" /></el-icon>
              </button>
              <button
                type="button"
                class="admin-table__action"
                title="Создать копию"
                aria-label="Создать копию"
                :disabled="copyingId === row.id"
                @click="copyItem(row)"
              >
                <el-icon :size="18"><component :is="icons.copy" /></el-icon>
              </button>
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
.catalog-table {
  --el-table-row-hover-bg-color: rgb(248 250 252);
}

.catalog-table :deep(.el-table__row) {
  cursor: pointer;
}

.catalog-table__thumb {
  position: relative;
  width: 56px;
  height: 42px;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(241 245 249);
}

.catalog-table__thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.catalog-table__badge {
  position: absolute;
  right: 3px;
  bottom: 3px;
  min-width: 1.1rem;
  padding: 0 4px;
  border-radius: 4px;
  background: rgb(15 23 42 / 72%);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
}

.catalog-table__title {
  border: 0;
  background: transparent;
  padding: 0;
  color: #0b2a5b;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.catalog-table__title:hover {
  color: var(--el-color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
