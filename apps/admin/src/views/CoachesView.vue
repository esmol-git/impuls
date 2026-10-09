<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { icons } from '@/icons'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import TablePager from '@/components/ui/TablePager.vue'
import { api } from '@/api/client'
import type { Coach, CoachSortField, CoachesPage } from '@/api/types'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const { confirm } = useConfirm()
const router = useRouter()

const items = ref<Coach[]>([])
const loading = ref(false)

const page = ref(1)
const pageSize = ref(10)
const pageSizes = [5, 10, 20, 50]
const total = ref(0)
const sort = ref<CoachSortField>('sortOrder')
const order = ref<'asc' | 'desc'>('asc')

function buildQuery() {
  const params = new URLSearchParams({
    page: String(page.value),
    limit: String(pageSize.value),
    sort: sort.value,
    order: order.value,
  })
  return params.toString()
}

async function load(options: { silent?: boolean } = {}) {
  if (!options.silent) loading.value = true
  try {
    const data = await api<CoachesPage>(`/api/admin/coaches?${buildQuery()}`)
    items.value = data.items
    total.value = data.meta.total
    if (page.value > data.meta.totalPages) {
      page.value = data.meta.totalPages
    }
  } catch (e) {
    if (!options.silent) {
      toast.error(e instanceof Error ? e.message : 'Ошибка загрузки')
    }
  } finally {
    loading.value = false
  }
}

function onSortChange(payload: { prop: string; order: string | null }) {
  if (!payload.order) {
    sort.value = 'sortOrder'
    order.value = 'asc'
  } else {
    sort.value = payload.prop as CoachSortField
    order.value = payload.order === 'ascending' ? 'asc' : 'desc'
  }
  if (page.value !== 1) page.value = 1
  else void load()
}

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
    const idx = items.value.findIndex((row) => row.id === item.id)
    if (idx >= 0) items.value[idx] = updated
    toast.success(updated.published ? 'Опубликовано' : 'Скрыто')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось обновить')
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
    if (items.value.length === 1 && page.value > 1) {
      page.value -= 1
    } else {
      await load({ silent: true })
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось удалить')
  }
}

watch(pageSize, () => {
  if (page.value !== 1) page.value = 1
  else void load()
})

watch(page, () => {
  void load()
})

onMounted(() => {
  void load()
})
</script>

<template>
  <div>
    <PageHeader title="Тренеры" description="Состав на странице /coaches и в блоке на главной.">
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="openCreate">
          Добавить тренера
        </el-button>
      </template>
    </PageHeader>

    <div class="admin-panel">
      <el-table
        v-loading="loading"
        :data="items"
        row-key="id"
        class="admin-table"
        empty-text="Пока нет тренеров — добавьте первого."
        @sort-change="onSortChange"
      >
        <el-table-column label="Фото" width="72">
          <template #default="{ row }">
            <img
              v-if="row.imageUrl"
              :src="row.imageUrl"
              :alt="row.imageAlt || row.name"
              class="h-10 w-10 rounded-lg object-cover"
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
    </div>
  </div>
</template>
