<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { icons } from '@/icons'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import TablePager from '@/components/ui/TablePager.vue'
import { api } from '@/api/client'
import type { Lead, LeadPurchaseItem, LeadSortField, LeadStatus, LeadsPage } from '@/api/types'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { formatDateTime } from '@/utils/format'

function leadItems(lead: Lead): LeadPurchaseItem[] {
  return Array.isArray(lead.items) ? lead.items : []
}

function itemsSummary(lead: Lead) {
  const items = leadItems(lead)
  if (!items.length) return ''
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
  return `${items.length} поз. · ${total.toLocaleString('ru-RU')} ₽`
}

function itemLineTotal(item: LeadPurchaseItem) {
  return (item.unitPrice * item.qty).toLocaleString('ru-RU')
}

const toast = useToast()
const { confirm } = useConfirm()
const auth = useAuthStore()
const notifications = useNotificationsStore()
const route = useRoute()
const router = useRouter()

const leads = ref<Lead[]>([])
const status = ref<LeadStatus | 'ALL'>('ALL')
const searchInput = ref('')
const search = ref('')
const page = ref(1)
const pageSize = ref(20)
const sort = ref<LeadSortField>('createdAt')
const order = ref<'asc' | 'desc'>('desc')
const loading = ref(false)
const selected = ref<Lead | null>(null)
const detailOpen = ref(false)
const pageSizes = [5, 10, 20, 50]
const total = ref(0)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const statusOptions = [
  { label: 'Все', value: 'ALL' },
  { label: 'Новые', value: 'NEW' },
  { label: 'Обработанные', value: 'DONE' },
]

const sortProp = computed(() => sort.value)
const sortOrder = computed(() => (order.value === 'asc' ? 'ascending' : 'descending'))

function buildQuery() {
  const params = new URLSearchParams()
  params.set('page', String(page.value))
  params.set('limit', String(pageSize.value))
  params.set('sort', sort.value)
  params.set('order', order.value)
  if (status.value !== 'ALL') params.set('status', status.value)
  if (search.value) params.set('q', search.value)
  return params.toString()
}

function onSearchInput(value: string) {
  searchInput.value = value
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    const next = value.trim()
    if (next === search.value) return
    search.value = next
    page.value = 1
  }, 300)
}

function clearSearch() {
  searchInput.value = ''
  if (searchTimer) clearTimeout(searchTimer)
  if (!search.value) return
  search.value = ''
  page.value = 1
}

async function load(options: { silent?: boolean } = {}) {
  if (!options.silent) loading.value = true
  try {
    const data = await api<LeadsPage>(`/api/admin/leads?${buildQuery()}`)
    leads.value = data.items
    total.value = data.meta.total
    if (page.value > data.meta.totalPages) {
      page.value = data.meta.totalPages
      return
    }
    await focusFromQuery()
  } catch (e) {
    if (!options.silent) {
      toast.error(e instanceof Error ? e.message : 'Ошибка загрузки')
    }
  } finally {
    loading.value = false
  }
}

async function focusFromQuery() {
  const focusId = typeof route.query.focus === 'string' ? route.query.focus : ''
  if (!focusId) return

  let lead = leads.value.find((item) => item.id === focusId) || null
  if (!lead) {
    try {
      lead = await api<Lead>(`/api/admin/leads/${focusId}`)
    } catch {
      toast.error('Заявка не найдена')
    }
  }

  if (lead) {
    selected.value = lead
    detailOpen.value = true
  }

  const nextQuery = { ...route.query }
  delete nextQuery.focus
  await router.replace({ query: nextQuery })
}

function onSortChange(payload: { prop: string; order: string | null }) {
  if (!payload.order) {
    sort.value = 'createdAt'
    order.value = 'desc'
  } else {
    sort.value = payload.prop as LeadSortField
    order.value = payload.order === 'ascending' ? 'asc' : 'desc'
  }
  page.value = 1
}

function openLead(lead: Lead) {
  selected.value = lead
  detailOpen.value = true
}

async function setStatus(lead: Lead, next: LeadStatus) {
  try {
    await api<Lead>(`/api/admin/leads/${lead.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: next }),
    })
    if (selected.value?.id === lead.id) {
      selected.value = { ...selected.value, status: next }
    }
    await notifications.refresh()
    await load({ silent: true })
    toast.success(next === 'DONE' ? 'Заявка обработана' : 'Заявка возвращена')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось обновить статус')
  }
}

async function removeLead(lead: Lead) {
  if (!auth.isAdmin) return
  const ok = await confirm({
    title: 'Удалить заявку?',
    message: `Заявка от ${lead.name} (${lead.phone}) будет удалена без восстановления.`,
    confirmLabel: 'Удалить',
    danger: true,
  })
  if (!ok) return

  try {
    await api(`/api/admin/leads/${lead.id}`, { method: 'DELETE' })
    if (selected.value?.id === lead.id) {
      selected.value = null
      detailOpen.value = false
    }
    await notifications.refresh()
    await load({ silent: true })
    toast.success('Заявка удалена')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось удалить')
  }
}

onMounted(() => load())

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

watch(status, () => {
  if (page.value !== 1) page.value = 1
  else void load()
})

watch(pageSize, () => {
  if (page.value !== 1) page.value = 1
  else void load()
})

watch(search, () => {
  void load()
})

watch([page, sort, order], () => load())

watch(
  () => notifications.revision,
  () => load({ silent: true }),
)

watch(
  () => route.query.focus,
  () => focusFromQuery(),
)
</script>

<template>
  <div>
    <PageHeader title="Заявки" description="Заявки с сайта накапливаются здесь и обновляются автоматически.">
      <template #actions>
        <el-tag v-if="notifications.newLeads" type="warning" effect="light">
          Новых: {{ notifications.newLeads }}
        </el-tag>
        <el-input
          :model-value="searchInput"
          class="w-56 sm:w-64"
          clearable
          placeholder="Имя, телефон, источник…"
          :prefix-icon="icons.search"
          @update:model-value="onSearchInput"
          @clear="clearSearch"
        />
        <el-select v-model="status" class="w-44">
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </template>
    </PageHeader>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="leads"
        stripe
        :empty-text="search ? 'Ничего не найдено' : 'Заявок пока нет'"
        :default-sort="{ prop: sortProp, order: sortOrder as 'ascending' | 'descending' }"
        @sort-change="onSortChange"
      >
        <el-table-column prop="createdAt" label="Дата" width="170" sortable="custom">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Имя" min-width="160" sortable="custom">
          <template #default="{ row }">
            <el-button link type="primary" @click="openLead(row)">{{ row.name }}</el-button>
            <p v-if="itemsSummary(row)" class="mt-1 max-w-xs truncate text-xs font-medium text-brand-600">
              {{ itemsSummary(row) }}
            </p>
            <p
              v-if="leadItems(row).length === 1 && leadItems(row)[0]?.sku"
              class="mt-0.5 max-w-xs truncate text-xs text-slate-500"
            >
              арт. {{ leadItems(row)[0].sku }} · {{ leadItems(row)[0].title }}
            </p>
            <p v-else-if="row.message" class="mt-1 max-w-xs truncate text-xs text-slate-500">{{ row.message }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="Телефон" width="170" sortable="custom">
          <template #default="{ row }">
            <a :href="`tel:${row.phone}`" class="text-brand-600 hover:underline">{{ row.phone }}</a>
            <p v-if="row.age" class="text-xs text-slate-500">Возраст: {{ row.age }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="Источник" width="140" sortable="custom">
          <template #default="{ row }">
            <p>{{ row.source || '—' }}</p>
            <p v-if="row.program" class="text-xs text-slate-500">{{ row.program }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Статус" width="120" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="row.status === 'NEW' ? 'warning' : 'success'" size="small">
              {{ row.status === 'NEW' ? 'Новая' : 'Готово' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Действия" width="140" align="right" fixed="right">
          <template #default="{ row }">
            <div class="admin-table__actions">
              <button
                type="button"
                class="admin-table__action"
                title="Открыть"
                aria-label="Открыть"
                @click="openLead(row)"
              >
                <el-icon :size="22"><component :is="icons['zoom-in']" /></el-icon>
              </button>
              <button
                v-if="row.status === 'NEW'"
                type="button"
                class="admin-table__action admin-table__action--success"
                title="Отметить готово"
                aria-label="Отметить готово"
                @click="setStatus(row, 'DONE')"
              >
                <el-icon :size="22"><Check /></el-icon>
              </button>
              <button
                v-else
                type="button"
                class="admin-table__action"
                title="Вернуть в новые"
                aria-label="Вернуть в новые"
                @click="setStatus(row, 'NEW')"
              >
                <el-icon :size="22"><component :is="icons.undo" /></el-icon>
              </button>
              <button
                v-if="auth.isAdmin"
                type="button"
                class="admin-table__action admin-table__action--danger"
                title="Удалить"
                aria-label="Удалить"
                @click="removeLead(row)"
              >
                <el-icon :size="22"><component :is="icons.trash" /></el-icon>
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
    </el-card>

    <el-drawer v-model="detailOpen" title="Заявка" size="420px" destroy-on-close>
      <template v-if="selected">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Дата">{{ formatDateTime(selected.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="Имя">{{ selected.name }}</el-descriptions-item>
          <el-descriptions-item label="Телефон">
            <a :href="`tel:${selected.phone}`" class="text-brand-600">{{ selected.phone }}</a>
          </el-descriptions-item>
          <el-descriptions-item label="Возраст">{{ selected.age || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Источник">{{ selected.source || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Товар / группа">{{ selected.program || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Площадка">{{ selected.location || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Комментарий">
            <span class="whitespace-pre-wrap">{{ selected.message || '—' }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="leadItems(selected).length" class="mt-4">
          <p class="mb-2 text-sm font-semibold text-slate-700">Состав покупки</p>
          <ul class="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <li
              v-for="item in leadItems(selected)"
              :key="`${item.mediaId}-${item.title}`"
              class="flex gap-3 text-sm"
            >
              <div
                v-if="item.imageUrl"
                class="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-200"
              >
                <img :src="item.imageUrl" :alt="item.title" class="h-full w-full object-cover">
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-slate-800">{{ item.title }}</p>
                <p v-if="item.sku" class="mt-0.5 text-xs text-slate-500">Артикул: {{ item.sku }}</p>
                <p v-if="item.category" class="mt-0.5 text-xs text-slate-500">{{ item.category }}</p>
                <p
                  v-if="item.description"
                  class="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500"
                >
                  {{ item.description }}
                </p>
                <div class="mt-1.5 flex items-baseline justify-between gap-2">
                  <span class="text-xs text-slate-400">× {{ item.qty }}</span>
                  <span class="font-medium text-slate-800">{{ itemLineTotal(item) }} ₽</span>
                </div>
              </div>
            </li>
            <li class="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold">
              <span>Итого</span>
              <span>
                {{
                  leadItems(selected)
                    .reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
                    .toLocaleString('ru-RU')
                }} ₽
              </span>
            </li>
          </ul>
        </div>

        <div class="mt-6 flex flex-wrap gap-2">
          <el-button
            v-if="selected.status === 'NEW'"
            type="primary"
            @click="setStatus(selected, 'DONE')"
          >
            Отметить готово
          </el-button>
          <el-button
            v-else
            type="primary"
            @click="setStatus(selected, 'NEW')"
          >
            Вернуть в новые
          </el-button>
          <el-button
            v-if="auth.isAdmin"
            type="danger"
            plain
            @click="removeLead(selected)"
          >
            Удалить
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

