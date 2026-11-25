<script setup lang="ts">
import { icons } from '@/icons'
import AdminSurface from '@/components/ui/AdminSurface.vue'
import TablePager from '@/components/ui/TablePager.vue'
import type { MediaItem } from '@/api/types'
import { formatDate } from '@/utils/format'

defineProps<{
  items: MediaItem[]
  loading: boolean
  emptyText: string
  total: number
  pageSizes: number[]
}>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const emit = defineEmits<{
  edit: [item: MediaItem]
  togglePublished: [item: MediaItem]
  remove: [item: MediaItem]
  sortChange: [payload: { prop: string; order: string | null }]
}>()

function onRowClick(row: MediaItem) {
  emit('edit', row)
}

function onSortChange(payload: { prop: string; order: string | null }) {
  emit('sortChange', payload)
}
</script>

<template>
  <AdminSurface>
    <el-table
      v-loading="loading"
      :data="items"
      stripe
      :empty-text="emptyText"
      class="news-table"
      :default-sort="{ prop: 'createdAt', order: 'descending' }"
      @row-click="onRowClick"
      @sort-change="onSortChange"
    >
      <el-table-column label="Обложка" width="96">
        <template #default="{ row }">
          <div class="news-table__thumb">
            <img :src="row.imageUrl" :alt="row.title">
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="title" label="Новость" min-width="200" sortable="custom">
        <template #default="{ row }">
          <button type="button" class="news-table__title" @click.stop="$emit('edit', row)">
            {{ row.title }}
          </button>
        </template>
      </el-table-column>

      <el-table-column prop="topic" label="Тема" width="160" sortable="custom">
        <template #default="{ row }">
          <el-tag v-if="row.topic" size="small" type="danger" effect="light">
            {{ row.topic }}
          </el-tag>
          <span v-else class="text-slate-400">—</span>
        </template>
      </el-table-column>

      <el-table-column prop="published" label="Статус" width="130" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="row.published ? 'success' : 'info'" size="small">
            {{ row.published ? 'Опубликовано' : 'Скрыто' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="Дата" width="140" sortable="custom">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="Действия" width="136" align="right" fixed="right">
        <template #default="{ row }">
          <div class="admin-table__actions" @click.stop>
            <button
              type="button"
              class="admin-table__action"
              title="Изменить"
              aria-label="Изменить"
              @click="$emit('edit', row)"
            >
              <el-icon :size="18"><component :is="icons.edit" /></el-icon>
            </button>
            <button
              type="button"
              class="admin-table__action"
              :title="row.published ? 'Скрыть' : 'Показать'"
              :aria-label="row.published ? 'Скрыть' : 'Показать'"
              @click="$emit('togglePublished', row)"
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
              @click="$emit('remove', row)"
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
</template>

<style scoped>
.news-table {
  --el-table-row-hover-bg-color: rgb(248 250 252);
}

.news-table :deep(.el-table__row) {
  cursor: pointer;
}

.news-table__thumb {
  width: 64px;
  height: 48px;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(241 245 249);
}

.news-table__thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-table__title {
  border: 0;
  background: transparent;
  padding: 0;
  color: #0b2a5b;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.news-table__title:hover {
  color: var(--el-color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
