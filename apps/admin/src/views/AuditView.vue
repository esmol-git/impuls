<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import TablePager from '@/components/ui/TablePager.vue'
import { api } from '@/api/client'
import type { AuditLog, AuditPage } from '@/api/types'
import { useToast } from '@/composables/useToast'
import { formatDateTime } from '@/utils/format'

const toast = useToast()

const items = ref<AuditLog[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const pageSizes = [10, 20, 30, 50, 100]
const total = ref(0)
const actorEmail = ref('')
const entity = ref('')

const entityOptions = [
  { label: 'Все', value: '' },
  { label: 'Пользователи', value: 'user' },
  { label: 'Каталог / медиа', value: 'media' },
  { label: 'Заявки', value: 'lead' },
  { label: 'Настройки', value: 'settings' },
  { label: 'Справочники', value: 'taxonomy' },
  { label: 'Вход', value: 'auth' },
]

function buildQuery() {
  const params = new URLSearchParams({
    page: String(page.value),
    limit: String(pageSize.value),
    sort: 'createdAt',
    order: 'desc',
  })
  if (actorEmail.value.trim()) params.set('actorEmail', actorEmail.value.trim())
  if (entity.value) params.set('entity', entity.value)
  return params.toString()
}

async function load(options: { silent?: boolean } = {}) {
  if (!options.silent) loading.value = true
  try {
    const data = await api<AuditPage>(`/api/admin/audit?${buildQuery()}`)
    items.value = data.items
    total.value = data.meta.total
    if (page.value > data.meta.totalPages && data.meta.totalPages > 0) {
      page.value = data.meta.totalPages
    }
  } catch (e) {
    if (!options.silent) {
      toast.error(e instanceof Error ? e.message : 'Не удалось загрузить журнал')
    }
  } finally {
    loading.value = false
  }
}

watch([page, pageSize], () => load())
watch([actorEmail, entity], () => {
  if (page.value !== 1) page.value = 1
  else void load()
})

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="Журнал действий"
      description="Кто и что менял в админке: пользователи, товары, заявки, настройки."
    />

    <el-card shadow="never" v-loading="loading">
      <div class="mb-4 flex flex-wrap gap-3">
        <el-input
          v-model="actorEmail"
          clearable
          placeholder="Email автора"
          class="w-56"
        />
        <el-select v-model="entity" class="w-52" placeholder="Раздел">
          <el-option
            v-for="option in entityOptions"
            :key="option.value || 'all'"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>

      <el-table :data="items" stripe empty-text="Пока нет записей">
        <el-table-column label="Когда" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Кто" min-width="180">
          <template #default="{ row }">
            {{ row.actorEmail || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="Действие" min-width="260">
          <template #default="{ row }">
            <p class="font-medium text-slate-800">{{ row.summary }}</p>
            <p class="text-xs text-slate-400">{{ row.action }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Раздел" width="120">
          <template #default="{ row }">
            {{ row.entity || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="IP" width="140">
          <template #default="{ row }">
            <span class="text-xs text-slate-500">{{ row.ip || '—' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <TablePager
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
      />
    </el-card>
  </div>
</template>
