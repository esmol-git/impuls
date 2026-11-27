<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { icons } from '@/icons'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import TablePager from '@/components/ui/TablePager.vue'
import { api } from '@/api/client'
import type {
  CallResult,
  Lead,
  LeadActivity,
  LeadAssignee,
  LeadCallbackFilter,
  LeadPurchaseItem,
  LeadSortField,
  LeadStatus,
  LeadsPage,
} from '@/api/types'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import {
  assigneeLabel,
  formatDateTime,
  isCallbackOverdue,
  isCallbackToday,
  leadAgeLabel,
  leadSourceInfo,
  leadStatusLabel,
  LEAD_LOST_REASONS,
  LEAD_STATUS_OPTIONS,
} from '@/utils/format'

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

function statusClass(status: LeadStatus) {
  return `lead-status lead-status--${status.toLowerCase()}`
}

function activityAuthor(activity: LeadActivity) {
  return assigneeLabel(activity.user as LeadAssignee | null | undefined)
}

function activityTypeLabel(type: LeadActivity['type']) {
  if (type === 'STATUS') return 'Статус'
  if (type === 'ASSIGNEE') return 'Менеджер'
  if (type === 'NOTE') return 'Заметка'
  if (type === 'CALL') return 'Звонок'
  if (type === 'CALLBACK') return 'Перезвон'
  return 'Система'
}

const toast = useToast()
const { confirm } = useConfirm()
const auth = useAuthStore()
const notifications = useNotificationsStore()
const route = useRoute()
const router = useRouter()

const leads = ref<Lead[]>([])
const assignees = ref<LeadAssignee[]>([])
const status = ref<LeadStatus | 'ALL'>('ALL')
const assigneeFilter = ref<'ALL' | 'me' | string>('ALL')
const callbackFilter = ref<LeadCallbackFilter | 'ALL'>('ALL')
const searchInput = ref('')
const search = ref('')
const page = ref(1)
const pageSize = ref(20)
const sort = ref<LeadSortField>('createdAt')
const order = ref<'asc' | 'desc'>('desc')
const loading = ref(false)
const selected = ref<Lead | null>(null)
const detailOpen = ref(false)
const detailNote = ref('')
const detailCallback = ref<Date | null>(null)
const detailLostReason = ref('')
const savingNote = ref(false)
const loggingCall = ref(false)
const showLostReason = ref(false)
const detailTab = ref<'work' | 'history'>('work')
/** После звонка: предложить перезвон или исход */
const postCall = ref<'callback' | 'outcome' | null>(null)
const pageSizes = [5, 10, 20, 50]
const total = ref(0)
let searchTimer: ReturnType<typeof setTimeout> | null = null
let sortBeforeQueue: { sort: LeadSortField; order: 'asc' | 'desc' } | null = null

const sortProp = computed(() => sort.value)
const sortOrder = computed(() => (order.value === 'asc' ? 'ascending' : 'descending'))

const quickFilter = computed(() => {
  if (callbackFilter.value === 'today') return 'today'
  if (callbackFilter.value === 'overdue') return 'overdue'
  if (assigneeFilter.value === 'me' && status.value === 'ALL' && callbackFilter.value === 'ALL') return 'mine'
  if (status.value === 'NEW' && assigneeFilter.value === 'ALL' && callbackFilter.value === 'ALL') return 'new'
  if (status.value === 'IN_PROGRESS' && assigneeFilter.value === 'ALL' && callbackFilter.value === 'ALL') {
    return 'progress'
  }
  if (status.value === 'ALL' && assigneeFilter.value === 'ALL' && callbackFilter.value === 'ALL') return 'all'
  return 'custom'
})

const nextAction = computed(() => {
  const lead = selected.value
  if (!lead) return null
  if (lead.status === 'NEW') return { status: 'IN_PROGRESS' as const, label: 'Взять в работу' }
  if (lead.status === 'IN_PROGRESS') return { status: 'PROCESSED' as const, label: 'Обработана' }
  if (lead.status === 'PROCESSED') return { status: 'TRIAL' as const, label: 'Пробное' }
  if (lead.status === 'TRIAL') return { status: 'ENROLLED' as const, label: 'Записать' }
  return null
})

const selectedMeta = computed(() => {
  const lead = selected.value
  if (!lead) return [] as { label: string; value: string }[]
  const rows: { label: string; value: string }[] = []
  if (lead.source) {
    const source = leadSourceInfo(lead.source)
    rows.push({ label: 'Раздел', value: source.groupLabel })
    rows.push({ label: 'Откуда', value: source.label })
  }
  if (lead.childName) rows.push({ label: 'Ребёнок', value: lead.childName })
  if (lead.age) rows.push({ label: 'ДР', value: leadAgeLabel(lead.age) })
  if (lead.program) rows.push({ label: 'Группа', value: lead.program })
  if (lead.location) rows.push({ label: 'Площадка', value: lead.location })
  if (lead.lostReason) rows.push({ label: 'Отказ', value: lead.lostReason })
  if (lead.handledAt) rows.push({ label: 'Закрыта', value: formatDateTime(lead.handledAt) })
  return rows
})

const noteDirty = computed(() => {
  if (!selected.value) return false
  return detailNote.value.trim() !== (selected.value.note ?? '').trim()
})

const purchaseTotal = computed(() => {
  if (!selected.value) return 0
  return leadItems(selected.value).reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
})

const activities = computed(() => selected.value?.activities ?? [])
const relatedLeads = computed(() => selected.value?.relatedLeads ?? [])

function applyQueueSort(enable: boolean) {
  if (enable) {
    if (!sortBeforeQueue) {
      sortBeforeQueue = { sort: sort.value, order: order.value }
    }
    sort.value = 'nextContactAt'
    order.value = 'asc'
    return
  }
  if (sortBeforeQueue) {
    sort.value = sortBeforeQueue.sort
    order.value = sortBeforeQueue.order
    sortBeforeQueue = null
  } else if (sort.value === 'nextContactAt') {
    sort.value = 'createdAt'
    order.value = 'desc'
  }
}

function setQuickFilter(key: 'all' | 'new' | 'progress' | 'mine' | 'today' | 'overdue') {
  page.value = 1
  if (key === 'all') {
    status.value = 'ALL'
    assigneeFilter.value = 'ALL'
    callbackFilter.value = 'ALL'
    applyQueueSort(false)
  } else if (key === 'new') {
    status.value = 'NEW'
    assigneeFilter.value = 'ALL'
    callbackFilter.value = 'ALL'
    applyQueueSort(false)
  } else if (key === 'progress') {
    status.value = 'IN_PROGRESS'
    assigneeFilter.value = 'ALL'
    callbackFilter.value = 'ALL'
    applyQueueSort(false)
  } else if (key === 'mine') {
    status.value = 'ALL'
    assigneeFilter.value = 'me'
    callbackFilter.value = 'ALL'
    applyQueueSort(false)
  } else if (key === 'today') {
    status.value = 'ALL'
    assigneeFilter.value = 'ALL'
    callbackFilter.value = 'today'
    applyQueueSort(true)
  } else {
    status.value = 'ALL'
    assigneeFilter.value = 'ALL'
    callbackFilter.value = 'overdue'
    applyQueueSort(true)
  }
}

function buildQuery() {
  const params = new URLSearchParams()
  params.set('page', String(page.value))
  params.set('limit', String(pageSize.value))
  params.set('sort', sort.value)
  params.set('order', order.value)
  if (status.value !== 'ALL') params.set('status', status.value)
  if (assigneeFilter.value !== 'ALL') params.set('assigneeId', assigneeFilter.value)
  if (callbackFilter.value !== 'ALL') params.set('callback', callbackFilter.value)
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

async function loadAssignees() {
  try {
    assignees.value = await api<LeadAssignee[]>('/api/admin/leads/assignees')
  } catch {
    assignees.value = []
  }
}

function syncDetailFields(lead: Lead) {
  detailNote.value = lead.note ?? ''
  detailCallback.value = lead.nextContactAt ? new Date(lead.nextContactAt) : null
  detailLostReason.value = lead.lostReason ?? ''
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
    if (selected.value) {
      const fresh = data.items.find((item) => item.id === selected.value?.id)
      if (fresh && !detailOpen.value) {
        selected.value = fresh
      }
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

  try {
    await openLeadById(focusId)
  } catch {
    toast.error('Заявка не найдена')
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

async function openLeadById(id: string) {
  const lead = await api<Lead>(`/api/admin/leads/${id}`)
  selected.value = lead
  showLostReason.value = lead.status === 'LOST'
  detailTab.value = 'work'
  postCall.value = null
  syncDetailFields(lead)
  detailOpen.value = true
}

async function openLead(lead: Lead) {
  try {
    await openLeadById(lead.id)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось открыть заявку')
  }
}

function onRowClick(row: Lead, _column: unknown, event: Event) {
  const target = event.target as HTMLElement | null
  if (target?.closest('a, button, .admin-table__actions')) return
  void openLead(row)
}

function applyLeadLocally(updated: Lead) {
  const index = leads.value.findIndex((item) => item.id === updated.id)
  if (index >= 0) {
    const { activities: _a, relatedLeads: _r, ...listFields } = updated
    leads.value[index] = { ...leads.value[index], ...listFields }
  }
  if (selected.value?.id === updated.id) {
    selected.value = updated
    if (!noteDirty.value) detailNote.value = updated.note ?? ''
    detailCallback.value = updated.nextContactAt ? new Date(updated.nextContactAt) : null
    detailLostReason.value = updated.lostReason ?? ''
  }
}

async function patchLead(lead: Lead, body: Record<string, unknown>, successMessage?: string) {
  try {
    const updated = await api<Lead>(`/api/admin/leads/${lead.id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    applyLeadLocally(updated)
    await notifications.refresh()
    await load({ silent: true })
    if (successMessage) toast.success(successMessage)
    return updated
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось обновить заявку')
    return null
  }
}

async function setStatus(lead: Lead, next: LeadStatus) {
  if (lead.status === next) return

  if (next === 'LOST') {
    const reason = detailLostReason.value.trim() || lead.lostReason?.trim()
    if (!reason) {
      showLostReason.value = true
      toast.error('Укажите причину отказа')
      return
    }
    showLostReason.value = false
    await patchLead(lead, { status: next, lostReason: reason }, 'Отказ зафиксирован')
    return
  }

  const messages: Partial<Record<LeadStatus, string>> = {
    NEW: 'Заявка возвращена в новые',
    IN_PROGRESS: 'Заявка взята в работу',
    PROCESSED: 'Заявка отмечена обработанной',
    TRIAL: 'Назначено пробное',
    ENROLLED: 'Клиент записан',
    DONE: 'Заявка завершена',
  }
  await patchLead(lead, { status: next }, messages[next])
}

async function setAssignee(lead: Lead, assigneeId: string | null) {
  await patchLead(
    lead,
    { assigneeId },
    assigneeId ? 'Менеджер назначен' : 'Назначение снято',
  )
}

async function saveNote(options: { silent?: boolean } = {}) {
  if (!selected.value || !noteDirty.value) return
  savingNote.value = true
  try {
    await patchLead(
      selected.value,
      { note: detailNote.value.trim() || null },
      options.silent ? undefined : 'Заметка сохранена',
    )
  } finally {
    savingNote.value = false
  }
}

async function saveCallback() {
  if (!selected.value) return
  const next = detailCallback.value ? detailCallback.value.toISOString() : null
  const prev = selected.value.nextContactAt ?? null
  if (next === prev) return
  await patchLead(
    selected.value,
    { nextContactAt: next },
    next ? 'Перезвон запланирован' : 'Перезвон снят',
  )
}

async function saveLostReason() {
  if (!selected.value) return
  const next = detailLostReason.value.trim() || null
  if (!next) return
  if (selected.value.status === 'LOST') {
    if (next === (selected.value.lostReason ?? null)) return
    await patchLead(selected.value, { lostReason: next })
    return
  }
  if (showLostReason.value) {
    showLostReason.value = false
    await patchLead(
      selected.value,
      { status: 'LOST', lostReason: next },
      'Отказ зафиксирован',
    )
  }
}

async function logCall(result: CallResult, nextContactAt?: Date | null) {
  if (!selected.value) return
  loggingCall.value = true
  try {
    const body: Record<string, unknown> = {
      type: 'CALL',
      callResult: result,
    }
    if (result === 'callback' || nextContactAt) {
      const when = nextContactAt ?? detailCallback.value ?? defaultCallbackDate(2)
      detailCallback.value = when
      body.nextContactAt = when.toISOString()
    }
    const updated = await api<Lead>(`/api/admin/leads/${selected.value.id}/activities`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    applyLeadLocally(updated)
    await notifications.refresh()
    await load({ silent: true })
    toast.success(
      result === 'answered'
        ? 'Дозвон записан'
        : result === 'no_answer'
          ? 'Недозвон записан'
          : result === 'busy'
            ? 'Занято записано'
            : 'Перезвон запланирован',
    )

    if (result === 'answered') {
      postCall.value = 'outcome'
      detailTab.value = 'work'
    } else if (result === 'no_answer' || result === 'busy') {
      postCall.value = 'callback'
      detailTab.value = 'work'
    } else {
      postCall.value = null
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось записать звонок')
  } finally {
    loggingCall.value = false
  }
}

function defaultCallbackDate(hoursAhead = 2) {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + hoursAhead)
  return d
}

function tomorrowAt(hour: number) {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(hour, 0, 0, 0)
  return d
}

async function scheduleCallbackPreset(when: Date) {
  if (!selected.value) return
  detailCallback.value = when
  postCall.value = null
  await logCall('callback', when)
}

async function applyPostCallOutcome(next: 'TRIAL' | 'ENROLLED' | 'LOST') {
  if (!selected.value) return
  if (next === 'LOST') {
    showLostReason.value = true
    postCall.value = null
    toast.info('Укажите причину отказа')
    return
  }
  postCall.value = null
  await setStatus(selected.value, next)
}

async function onDetailClose() {
  if (noteDirty.value) await saveNote({ silent: true })
}

async function copyPhone(phone: string) {
  try {
    await navigator.clipboard.writeText(phone)
    toast.success('Телефон скопирован')
  } catch {
    toast.error('Не удалось скопировать')
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

function rowQuickAction(lead: Lead) {
  if (lead.status === 'NEW') return { status: 'IN_PROGRESS' as const, label: 'В работу' }
  if (lead.status === 'IN_PROGRESS') return { status: 'PROCESSED' as const, label: 'Обработана' }
  if (lead.status === 'PROCESSED') return { status: 'TRIAL' as const, label: 'Пробное' }
  if (lead.status === 'TRIAL') return { status: 'ENROLLED' as const, label: 'Записать' }
  return null
}

function applyQueueFromRoute() {
  const queue = typeof route.query.queue === 'string' ? route.query.queue : ''
  if (queue === 'today' || queue === 'overdue') {
    setQuickFilter(queue)
  }
}

onMounted(async () => {
  applyQueueFromRoute()
  await Promise.all([loadAssignees(), load()])
})

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

watch([status, assigneeFilter, callbackFilter], () => {
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

watch(
  () => route.query.queue,
  () => applyQueueFromRoute(),
)
</script>

<template>
  <div class="leads-page">
    <PageHeader title="Заявки" description="CRM: звонки, перезвоны, история и воронка до записи.">
      <template #actions>
        <el-tag v-if="notifications.newLeads" type="warning" effect="light" round>
          Новых: {{ notifications.newLeads }}
        </el-tag>
        <el-tag
          v-if="notifications.dueNow || notifications.callbacksOverdue"
          type="danger"
          effect="light"
          round
          class="cursor-pointer"
          @click="setQuickFilter(notifications.callbacksOverdue ? 'overdue' : 'today')"
        >
          {{ notifications.callbacksOverdue ? `Просрочено: ${notifications.callbacksOverdue}` : `Пора звонить: ${notifications.dueNow}` }}
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
      </template>
    </PageHeader>

    <div class="leads-toolbar">
      <div class="leads-chips" role="tablist" aria-label="Быстрый фильтр">
        <button type="button" class="leads-chip" :class="{ 'is-active': quickFilter === 'all' }" @click="setQuickFilter('all')">
          Все
        </button>
        <button type="button" class="leads-chip" :class="{ 'is-active': quickFilter === 'new' }" @click="setQuickFilter('new')">
          Новые
          <span v-if="notifications.newLeads" class="leads-chip__count">{{ notifications.newLeads }}</span>
        </button>
        <button type="button" class="leads-chip" :class="{ 'is-active': quickFilter === 'progress' }" @click="setQuickFilter('progress')">
          В работе
        </button>
        <button type="button" class="leads-chip" :class="{ 'is-active': quickFilter === 'mine' }" @click="setQuickFilter('mine')">
          Мои
        </button>
        <button type="button" class="leads-chip" :class="{ 'is-active': quickFilter === 'today' }" @click="setQuickFilter('today')">
          На сегодня
          <span
            v-if="notifications.callbacksToday"
            class="leads-chip__count"
            :class="{ 'is-due': notifications.dueNow }"
          >{{ notifications.callbacksToday }}</span>
        </button>
        <button type="button" class="leads-chip leads-chip--warn" :class="{ 'is-active': quickFilter === 'overdue' }" @click="setQuickFilter('overdue')">
          Просрочено
          <span v-if="notifications.callbacksOverdue" class="leads-chip__count is-overdue">{{ notifications.callbacksOverdue }}</span>
        </button>
      </div>

      <div class="leads-toolbar__filters">
        <el-select v-model="status" class="w-40" placeholder="Статус">
          <el-option label="Все статусы" value="ALL" />
          <el-option
            v-for="option in LEAD_STATUS_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-select v-model="assigneeFilter" class="w-44" filterable placeholder="Менеджер">
          <el-option label="Все менеджеры" value="ALL" />
          <el-option label="Мои заявки" value="me" />
          <el-option
            v-for="person in assignees"
            :key="person.id"
            :label="assigneeLabel(person)"
            :value="person.id"
          />
        </el-select>
      </div>
    </div>

    <el-card shadow="never" class="leads-card">
      <el-table
        v-loading="loading"
        :data="leads"
        stripe
        class="leads-table"
        row-class-name="leads-table__row"
        :empty-text="search ? 'Ничего не найдено' : 'Заявок пока нет'"
        :default-sort="{ prop: sortProp, order: sortOrder as 'ascending' | 'descending' }"
        @sort-change="onSortChange"
        @row-click="onRowClick"
      >
        <el-table-column prop="createdAt" label="Дата" width="108" sortable="custom">
          <template #default="{ row }">
            <div class="leads-date">
              <span>{{ formatDateTime(row.createdAt).split(',')[0] }}</span>
              <span class="leads-date__time">{{ formatDateTime(row.createdAt).split(',')[1]?.trim() }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Клиент" min-width="160" sortable="custom">
          <template #default="{ row }">
            <p class="leads-name">{{ row.name }}</p>
            <p v-if="row.childName" class="leads-sub">Ребёнок: {{ row.childName }}</p>
            <p v-else-if="itemsSummary(row)" class="leads-sub leads-sub--accent">{{ itemsSummary(row) }}</p>
            <p v-else-if="row.message" class="leads-sub">{{ row.message }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="Телефон" width="158" sortable="custom">
          <template #default="{ row }">
            <a :href="`tel:${row.phone}`" class="leads-phone" @click.stop>{{ row.phone }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="Источник" min-width="160" sortable="custom">
          <template #default="{ row }">
            <div
              v-for="info in [leadSourceInfo(row.source)]"
              :key="row.id"
              class="leads-source"
              :data-group="info.group"
            >
              <span class="leads-source__group">{{ info.groupLabel }}</span>
              <span class="leads-source__place">{{ info.label }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Статус" width="118" sortable="custom">
          <template #default="{ row }">
            <span :class="statusClass(row.status)">{{ leadStatusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="nextContactAt" label="Перезвон" width="120" sortable="custom">
          <template #default="{ row }">
            <span
              v-if="row.nextContactAt"
              class="leads-callback"
              :class="{
                'is-overdue': isCallbackOverdue(row.nextContactAt),
                'is-today': isCallbackToday(row.nextContactAt),
              }"
            >
              {{ formatDateTime(row.nextContactAt) }}
            </span>
            <span v-else class="leads-assignee">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Менеджер" min-width="110">
          <template #default="{ row }">
            <span class="leads-assignee">{{ row.assignee ? assigneeLabel(row.assignee) : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="" width="176" align="right" fixed="right">
          <template #default="{ row }">
            <div class="admin-table__actions leads-row-actions" @click.stop>
              <span class="leads-row-actions__cta">
                <button
                  v-if="rowQuickAction(row)"
                  type="button"
                  class="leads-row-cta"
                  @click="setStatus(row, rowQuickAction(row)!.status)"
                >
                  {{ rowQuickAction(row)!.label }}
                </button>
              </span>
              <button
                v-if="auth.isAdmin"
                type="button"
                class="admin-table__action admin-table__action--danger"
                title="Удалить"
                aria-label="Удалить"
                @click="removeLead(row)"
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
    </el-card>

    <el-dialog
      v-model="detailOpen"
      width="920px"
      align-center
      destroy-on-close
      class="lead-dialog"
      @closed="onDetailClose"
    >
      <template #header>
        <div v-if="selected" class="lead-dialog__header">
          <div class="min-w-0">
            <h2 class="lead-dialog__title">{{ selected.name }}</h2>
            <p class="lead-dialog__when">{{ formatDateTime(selected.createdAt) }}</p>
          </div>
          <span :class="statusClass(selected.status)">{{ leadStatusLabel(selected.status) }}</span>
        </div>
      </template>

      <div v-if="selected" class="lead-dialog__body">
        <section class="lead-hero">
          <div class="lead-hero__phone">
            <span class="lead-hero__label">Телефон</span>
            <a :href="`tel:${selected.phone}`" class="lead-hero__number">{{ selected.phone }}</a>
          </div>
          <div class="lead-hero__actions">
            <a :href="`tel:${selected.phone}`" class="lead-hero__call">Позвонить</a>
            <button type="button" class="lead-hero__copy" @click="copyPhone(selected.phone)">Копировать</button>
          </div>
          <div class="lead-hero__outcomes" :aria-busy="loggingCall">
            <button type="button" class="lead-out is-ok" :disabled="loggingCall" @click="logCall('answered')">Дозвон</button>
            <button type="button" class="lead-out is-mute" :disabled="loggingCall" @click="logCall('no_answer')">Недозвон</button>
            <button type="button" class="lead-out is-busy" :disabled="loggingCall" @click="logCall('busy')">Занято</button>
            <button type="button" class="lead-out is-cb" :disabled="loggingCall" @click="logCall('callback')">Перезвонить</button>
          </div>
        </section>

        <div v-if="postCall === 'callback'" class="lead-prompt lead-prompt--callback">
          <div class="lead-prompt__head">
            <p class="lead-prompt__title">Когда перезвонить?</p>
            <button type="button" class="lead-prompt__close" @click="postCall = null">Скрыть</button>
          </div>
          <div class="lead-prompt__actions">
            <button type="button" class="lead-prompt__btn" :disabled="loggingCall" @click="scheduleCallbackPreset(defaultCallbackDate(1))">
              Через 1 ч
            </button>
            <button type="button" class="lead-prompt__btn" :disabled="loggingCall" @click="scheduleCallbackPreset(defaultCallbackDate(2))">
              Через 2 ч
            </button>
            <button type="button" class="lead-prompt__btn" :disabled="loggingCall" @click="scheduleCallbackPreset(tomorrowAt(10))">
              Завтра 10:00
            </button>
            <button type="button" class="lead-prompt__btn" :disabled="loggingCall" @click="scheduleCallbackPreset(tomorrowAt(18))">
              Завтра 18:00
            </button>
          </div>
        </div>

        <div v-else-if="postCall === 'outcome'" class="lead-prompt lead-prompt--outcome">
          <div class="lead-prompt__head">
            <p class="lead-prompt__title">Дозвон — что дальше?</p>
            <button type="button" class="lead-prompt__close" @click="postCall = null">Скрыть</button>
          </div>
          <div class="lead-prompt__actions">
            <button type="button" class="lead-prompt__btn is-trial" @click="applyPostCallOutcome('TRIAL')">
              Пробное
            </button>
            <button type="button" class="lead-prompt__btn is-ok" @click="applyPostCallOutcome('ENROLLED')">
              Записать
            </button>
            <button type="button" class="lead-prompt__btn is-lost" @click="applyPostCallOutcome('LOST')">
              Отказ
            </button>
            <button type="button" class="lead-prompt__btn" @click="postCall = 'callback'">
              Перезвонить позже
            </button>
          </div>
        </div>

        <div class="lead-tabs" role="tablist" aria-label="Разделы заявки">
          <button
            type="button"
            role="tab"
            class="lead-tabs__btn"
            :class="{ 'is-active': detailTab === 'work' }"
            :aria-selected="detailTab === 'work'"
            @click="detailTab = 'work'"
          >
            Работа
          </button>
          <button
            type="button"
            role="tab"
            class="lead-tabs__btn"
            :class="{ 'is-active': detailTab === 'history' }"
            :aria-selected="detailTab === 'history'"
            @click="detailTab = 'history'"
          >
            История
            <span v-if="activities.length" class="lead-tabs__count">{{ activities.length }}</span>
          </button>
        </div>

        <div v-show="detailTab === 'work'" class="lead-pane" role="tabpanel">
          <div class="lead-layout">
            <section class="lead-block lead-block--info">
              <h3 class="lead-block__title">О заявке</h3>
              <div v-if="selectedMeta.length" class="lead-meta">
                <div v-for="item in selectedMeta" :key="item.label" class="lead-meta__item">
                  <span class="lead-meta__label">{{ item.label }}</span>
                  <span class="lead-meta__value">{{ item.value }}</span>
                </div>
              </div>
              <p v-else class="lead-block__empty">Нет дополнительных данных</p>

              <p v-if="selected.message" class="lead-message">{{ selected.message }}</p>

              <div v-if="leadItems(selected).length" class="lead-cart">
                <div class="lead-cart__head">
                  <span>Состав корзины</span>
                  <span>{{ purchaseTotal.toLocaleString('ru-RU') }} ₽</span>
                </div>
                <ul class="lead-cart__list">
                  <li v-for="item in leadItems(selected)" :key="`${item.mediaId}-${item.title}`">
                    <span class="lead-cart__title">{{ item.title }}</span>
                    <span class="lead-cart__qty">×{{ item.qty }}</span>
                    <span class="lead-cart__price">{{ itemLineTotal(item) }} ₽</span>
                  </li>
                </ul>
              </div>

              <div v-if="relatedLeads.length" class="lead-related">
                <p class="lead-block__subtitle">Другие заявки с номера</p>
                <button
                  v-for="item in relatedLeads"
                  :key="item.id"
                  type="button"
                  class="lead-related__item"
                  @click="openLeadById(item.id)"
                >
                  <span class="lead-related__name">{{ item.name }}</span>
                  <span :class="statusClass(item.status)">{{ leadStatusLabel(item.status) }}</span>
                  <span class="lead-related__date">{{ formatDateTime(item.createdAt) }}</span>
                </button>
              </div>
            </section>

            <section class="lead-block lead-block--work">
              <h3 class="lead-block__title">Ведение</h3>

              <div class="lead-field">
                <span class="lead-field__label">Статус</span>
                <div class="lead-pipeline" role="group" aria-label="Статус заявки">
                  <button
                    v-for="option in LEAD_STATUS_OPTIONS"
                    :key="option.value"
                    type="button"
                    class="lead-pipeline__step"
                    :class="[
                      `is-${option.value.toLowerCase()}`,
                      { 'is-active': selected.status === option.value },
                    ]"
                    @click="setStatus(selected, option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <div
                v-if="selected.status === 'LOST' || showLostReason || detailLostReason"
                class="lead-field lead-field--danger"
              >
                <label class="lead-field__label" for="lead-lost">Причина отказа</label>
                <el-select
                  id="lead-lost"
                  v-model="detailLostReason"
                  class="w-full"
                  filterable
                  allow-create
                  default-first-option
                  placeholder="Выберите или введите причину"
                  @change="saveLostReason"
                >
                  <el-option v-for="reason in LEAD_LOST_REASONS" :key="reason" :label="reason" :value="reason" />
                </el-select>
              </div>

              <div
                class="lead-field lead-field--callback"
                :class="{ 'has-value': !!detailCallback }"
              >
                <label class="lead-field__label" for="lead-callback">Перезвон</label>
                <el-date-picker
                  id="lead-callback"
                  v-model="detailCallback"
                  type="datetime"
                  class="!w-full"
                  placeholder="Когда перезвонить"
                  format="DD.MM.YYYY HH:mm"
                  clearable
                  @change="saveCallback"
                />
              </div>

              <div class="lead-field">
                <label class="lead-field__label" for="lead-assignee">Менеджер</label>
                <el-select
                  id="lead-assignee"
                  :model-value="selected.assigneeId ?? ''"
                  class="w-full"
                  clearable
                  filterable
                  placeholder="Не назначен"
                  @clear="setAssignee(selected, null)"
                  @change="(value: string) => setAssignee(selected!, value || null)"
                >
                  <el-option
                    v-for="person in assignees"
                    :key="person.id"
                    :label="assigneeLabel(person)"
                    :value="person.id"
                  />
                </el-select>
              </div>

              <div class="lead-field lead-field--note">
                <div class="lead-field__row">
                  <label class="lead-field__label" for="lead-note">Заметка</label>
                  <span v-if="savingNote" class="lead-field__hint">Сохранение…</span>
                  <span v-else-if="noteDirty" class="lead-field__hint lead-field__hint--warn">Не сохранено</span>
                </div>
                <el-input
                  id="lead-note"
                  v-model="detailNote"
                  type="textarea"
                  :rows="5"
                  maxlength="2000"
                  resize="none"
                  placeholder="Что обещали, когда перезвонить…"
                  @blur="saveNote({ silent: true })"
                />
              </div>
            </section>
          </div>
        </div>

        <div v-show="detailTab === 'history'" class="lead-pane lead-pane--history" role="tabpanel">
          <div class="lead-timeline">
            <ul v-if="activities.length" class="lead-timeline__list">
              <li v-for="item in activities" :key="item.id" class="lead-timeline__item" :data-type="item.type">
                <div class="lead-timeline__top">
                  <span class="lead-timeline__type">{{ activityTypeLabel(item.type) }}</span>
                  <span class="lead-timeline__when">{{ formatDateTime(item.createdAt) }}</span>
                </div>
                <p class="lead-timeline__body">{{ item.body || '—' }}</p>
                <p v-if="item.user" class="lead-timeline__who">{{ activityAuthor(item) }}</p>
              </li>
            </ul>
            <p v-else class="lead-timeline__empty">Пока нет событий</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div v-if="selected" class="lead-dialog__footer">
          <button
            v-if="auth.isAdmin"
            type="button"
            class="lead-dialog__danger"
            @click="removeLead(selected)"
          >
            Удалить
          </button>
          <span v-else class="lead-dialog__spacer" />
          <div class="lead-dialog__footer-actions">
            <el-button v-if="selected.status !== 'NEW'" @click="setStatus(selected, 'NEW')">
              В новые
            </el-button>
            <el-button
              v-if="selected.status !== 'LOST'"
              @click="setStatus(selected, 'LOST')"
            >
              Отказ
            </el-button>
            <el-button
              v-if="nextAction"
              type="primary"
              @click="setStatus(selected, nextAction.status)"
            >
              {{ nextAction.label }}
            </el-button>
            <el-button v-else type="primary" @click="detailOpen = false">
              Готово
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.leads-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.leads-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.leads-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 2rem;
  padding: 0 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.leads-chip:hover {
  border-color: #cbd5e1;
  color: #334155;
}

.leads-chip.is-active {
  border-color: #1d4ed8;
  background: #eff4ff;
  color: #1d4ed8;
}

.leads-chip--warn.is-active {
  border-color: #c2410c;
  background: #fff7ed;
  color: #c2410c;
}

.leads-chip__count {
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: #f59e0b;
  color: #fff;
  font-size: 0.68rem;
  line-height: 1.15rem;
  text-align: center;
}

.leads-chip__count.is-due {
  background: #2563eb;
}

.leads-chip__count.is-overdue {
  background: #ea580c;
}

.leads-toolbar__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.leads-card :deep(.el-card__body) {
  padding-top: 0.5rem;
}

.leads-table :deep(.leads-table__row) {
  cursor: pointer;
}

.leads-date {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-size: 0.8125rem;
  color: #334155;
  line-height: 1.25;
}

.leads-date__time {
  color: #94a3b8;
  font-size: 0.75rem;
}

.leads-name {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
  color: #0f172a;
}

.leads-sub {
  margin: 0.2rem 0 0;
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  color: #94a3b8;
}

.leads-sub--accent {
  color: #1d4ed8;
  font-weight: 600;
}

.leads-phone {
  font-size: 0.875rem;
  font-weight: 560;
  color: #1d4ed8;
  text-decoration: none;
}

.leads-phone:hover {
  text-decoration: underline;
}

.leads-source {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  line-height: 1.25;
}

.leads-source__group {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #94a3b8;
}

.leads-source[data-group='shop'] .leads-source__group { color: #b45309; }
.leads-source[data-group='nav'] .leads-source__group { color: #1d4ed8; }
.leads-source[data-group='home'] .leads-source__group { color: #0f766e; }
.leads-source[data-group='programs'] .leads-source__group { color: #7c3aed; }
.leads-source[data-group='contacts'] .leads-source__group { color: #0369a1; }
.leads-source[data-group='pages'] .leads-source__group { color: #475569; }
.leads-source[data-group='other'] .leads-source__group { color: #a16207; }

.leads-source__place {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

.leads-assignee {
  font-size: 0.8125rem;
  color: #64748b;
}

.leads-callback {
  font-size: 0.75rem;
  font-weight: 650;
  color: #475569;
}

.leads-callback.is-today {
  color: #1d4ed8;
}

.leads-callback.is-overdue {
  color: #c2410c;
}

.leads-row-actions {
  display: grid;
  grid-template-columns: 6.75rem 1.9rem;
  align-items: center;
  justify-content: stretch;
  width: 100%;
  gap: 4px;
}

.leads-row-actions__cta {
  display: flex;
  min-width: 0;
  justify-content: flex-end;
}

.leads-row-cta {
  width: 100%;
  height: 1.85rem;
  padding: 0 0.45rem;
  overflow: hidden;
  border: none;
  border-radius: 0.45rem;
  background: #eff4ff;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.leads-row-cta:hover {
  background: #dbe5fa;
}

.lead-status {
  display: inline-flex;
  align-items: center;
  height: 1.5rem;
  padding: 0 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.lead-status--new { background: #fff7ed; color: #c2410c; }
.lead-status--in_progress { background: #eff6ff; color: #1d4ed8; }
.lead-status--processed { background: #ecfdf5; color: #047857; }
.lead-status--trial { background: #f5f3ff; color: #6d28d9; }
.lead-status--enrolled { background: #ecfdf5; color: #065f46; }
.lead-status--lost { background: #fef2f2; color: #b91c1c; }
.lead-status--done { background: #f1f5f9; color: #64748b; }

.lead-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding-right: 1.5rem;
}

.lead-dialog__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.lead-dialog__when {
  margin: 0.2rem 0 0;
  font-size: 0.78rem;
  color: #94a3b8;
}

.lead-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.lead-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) auto;
  grid-template-areas:
    'phone actions'
    'outcomes outcomes';
  gap: 0.75rem 1rem;
  padding: 0.95rem 1.05rem;
  border-radius: 1rem;
  background:
    linear-gradient(135deg, #0f766e 0%, #0e7490 48%, #1d4ed8 100%);
  color: #fff;
}

.lead-hero__phone { grid-area: phone; min-width: 0; }
.lead-hero__actions {
  grid-area: actions;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.lead-hero__outcomes {
  grid-area: outcomes;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.4rem;
}

.lead-hero__label {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.72;
}

.lead-hero__number {
  display: block;
  margin-top: 0.15rem;
  font-size: 1.35rem;
  font-weight: 780;
  letter-spacing: -0.02em;
  color: #fff;
  text-decoration: none;
  line-height: 1.15;
}

.lead-hero__number:hover { opacity: 0.9; }

.lead-hero__call,
.lead-hero__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.2rem;
  padding: 0 0.9rem;
  border-radius: 0.55rem;
  font-size: 0.8125rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.lead-hero__call {
  border: none;
  background: #fff;
  color: #0f766e;
}

.lead-hero__call:hover { background: #ecfeff; }

.lead-hero__copy {
  border: 1px solid rgb(255 255 255 / 0.35);
  background: rgb(255 255 255 / 0.12);
  color: #fff;
}

.lead-hero__copy:hover { background: rgb(255 255 255 / 0.2); }

.lead-out {
  height: 2.15rem;
  border: none;
  border-radius: 0.55rem;
  font-size: 0.75rem;
  font-weight: 750;
  cursor: pointer;
}

.lead-out:disabled {
  opacity: 0.55;
  cursor: wait;
}

.lead-out.is-ok { background: #d1fae5; color: #065f46; }
.lead-out.is-ok:hover:not(:disabled) { background: #a7f3d0; }
.lead-out.is-mute { background: #e2e8f0; color: #334155; }
.lead-out.is-mute:hover:not(:disabled) { background: #cbd5e1; }
.lead-out.is-busy { background: #fee2e2; color: #991b1b; }
.lead-out.is-busy:hover:not(:disabled) { background: #fecaca; }
.lead-out.is-cb { background: #fef3c7; color: #92400e; }
.lead-out.is-cb:hover:not(:disabled) { background: #fde68a; }

.lead-prompt {
  padding: 0.85rem 0.95rem;
  border-radius: 0.85rem;
  border: 1px solid transparent;
}

.lead-prompt--callback {
  background: #fffbeb;
  border-color: #fde68a;
}

.lead-prompt--outcome {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.lead-prompt__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
}

.lead-prompt__title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 750;
  color: #0f172a;
}

.lead-prompt__close {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 650;
  cursor: pointer;
}

.lead-prompt__close:hover { color: #0f172a; }

.lead-prompt__actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.4rem;
}

.lead-prompt__btn {
  min-height: 2.2rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.55rem;
  background: #fff;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 750;
  cursor: pointer;
}

.lead-prompt__btn:hover:not(:disabled) {
  border-color: #94a3b8;
}

.lead-prompt__btn:disabled {
  opacity: 0.55;
  cursor: wait;
}

.lead-prompt__btn.is-trial {
  border-color: #c4b5fd;
  background: #f5f3ff;
  color: #6d28d9;
}

.lead-prompt__btn.is-ok {
  border-color: #6ee7b7;
  background: #ecfdf5;
  color: #047857;
}

.lead-prompt__btn.is-lost {
  border-color: #fca5a5;
  background: #fef2f2;
  color: #b91c1c;
}

.lead-tabs {
  display: inline-flex;
  width: fit-content;
  gap: 0.2rem;
  padding: 0.2rem;
  border-radius: 0.7rem;
  background: #eef2f7;
}

.lead-tabs__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-width: 7.5rem;
  height: 2rem;
  padding: 0 0.9rem;
  border: none;
  border-radius: 0.55rem;
  background: transparent;
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
}

.lead-tabs__btn:hover { color: #1e293b; }

.lead-tabs__btn.is-active {
  background: #fff;
  color: #0f766e;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.08);
}

.lead-tabs__count {
  min-width: 1.2rem;
  height: 1.2rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: #dbe4ee;
  color: #475569;
  font-size: 0.68rem;
  line-height: 1.2rem;
  text-align: center;
}

.lead-tabs__btn.is-active .lead-tabs__count {
  background: #ccfbf1;
  color: #0f766e;
}

.lead-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 1fr);
  gap: 0.85rem;
  align-items: stretch;
}

.lead-block {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-width: 0;
  padding: 0.95rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.lead-block--info {
  background: linear-gradient(180deg, #f8fafc 0%, #fff 42%);
}

.lead-block--work {
  background: linear-gradient(180deg, #f0fdfa 0%, #fff 38%);
  border-color: #99f6e4;
}

.lead-block__title {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
}

.lead-block__subtitle {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #94a3b8;
}

.lead-block__empty {
  margin: 0;
  font-size: 0.875rem;
  color: #94a3b8;
}

.lead-pane--history {
  min-height: 16rem;
  padding: 0.85rem;
  border-radius: 0.9rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.lead-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.lead-meta__item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.65rem 0.7rem;
  border-radius: 0.65rem;
  background: #fff;
  border: 1px solid #e8eef5;
}

.lead-meta__label {
  font-size: 0.65rem;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #94a3b8;
}

.lead-meta__value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lead-message {
  margin: 0;
  padding: 0.75rem 0.85rem;
  border-radius: 0.65rem;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #9a3412;
}

.lead-cart {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #fff;
}

.lead-cart__head {
  display: flex;
  justify-content: space-between;
  padding: 0.55rem 0.85rem;
  background: #eff6ff;
  font-size: 0.78rem;
  font-weight: 700;
  color: #1d4ed8;
}

.lead-cart__list {
  margin: 0;
  padding: 0.35rem 0;
  list-style: none;
}

.lead-cart__list li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 0.5rem;
  align-items: baseline;
  padding: 0.4rem 0.85rem;
  font-size: 0.8125rem;
}

.lead-cart__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #0f172a;
  font-weight: 600;
}

.lead-cart__qty { color: #94a3b8; }
.lead-cart__price { font-weight: 650; color: #334155; }

.lead-pipeline {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.35rem;
}

.lead-pipeline__step {
  min-height: 2.35rem;
  padding: 0.35rem 0.3rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.55rem;
  background: #fff;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 750;
  line-height: 1.15;
  cursor: pointer;
}

.lead-pipeline__step:hover {
  border-color: #94a3b8;
  color: #0f172a;
}

.lead-pipeline__step.is-new.is-active {
  border-color: #fdba74;
  background: #fff7ed;
  color: #c2410c;
}
.lead-pipeline__step.is-in_progress.is-active {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}
.lead-pipeline__step.is-processed.is-active {
  border-color: #6ee7b7;
  background: #ecfdf5;
  color: #047857;
}
.lead-pipeline__step.is-trial.is-active {
  border-color: #c4b5fd;
  background: #f5f3ff;
  color: #6d28d9;
}
.lead-pipeline__step.is-enrolled.is-active {
  border-color: #34d399;
  background: #d1fae5;
  color: #065f46;
}
.lead-pipeline__step.is-lost.is-active {
  border-color: #fca5a5;
  background: #fef2f2;
  color: #b91c1c;
}
.lead-pipeline__step.is-done.is-active {
  border-color: #cbd5e1;
  background: #f1f5f9;
  color: #475569;
}

.lead-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.lead-field--callback {
  padding: 0.65rem 0.7rem;
  border-radius: 0.7rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
}

.lead-field--callback.has-value {
  background: #fef3c7;
  border-color: #fbbf24;
}

.lead-field--danger {
  padding: 0.65rem 0.7rem;
  border-radius: 0.7rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.lead-field--note :deep(.el-textarea__inner) {
  background: #f8fafc;
}

.lead-field__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.lead-field__label {
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
}

.lead-field__hint { font-size: 0.72rem; color: #94a3b8; }
.lead-field__hint--warn { color: #d97706; }

.lead-related {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.lead-related__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 0.5rem;
  align-items: center;
  padding: 0.55rem 0.7rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.6rem;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.lead-related__item:hover {
  border-color: #5eead4;
  background: #f0fdfa;
}

.lead-related__name {
  font-size: 0.8125rem;
  font-weight: 650;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lead-related__date {
  font-size: 0.7rem;
  color: #94a3b8;
}

.lead-timeline__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  max-height: min(22rem, 48vh);
  overflow: auto;
}

.lead-timeline__item {
  padding: 0.65rem 0.8rem;
  border-radius: 0.65rem;
  background: #fff;
  border: 1px solid #e8eef5;
  border-left: 3px solid #94a3b8;
}

.lead-timeline__item[data-type='CALL'] { border-left-color: #0f766e; }
.lead-timeline__item[data-type='STATUS'] { border-left-color: #1d4ed8; }
.lead-timeline__item[data-type='NOTE'] { border-left-color: #d97706; }
.lead-timeline__item[data-type='CALLBACK'] { border-left-color: #b45309; }
.lead-timeline__item[data-type='ASSIGNEE'] { border-left-color: #7c3aed; }
.lead-timeline__item[data-type='SYSTEM'] { border-left-color: #64748b; }

.lead-timeline__top {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.lead-timeline__type {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #64748b;
}

.lead-timeline__when {
  font-size: 0.7rem;
  color: #94a3b8;
}

.lead-timeline__body {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: #334155;
  line-height: 1.4;
}

.lead-timeline__who {
  margin: 0.2rem 0 0;
  font-size: 0.7rem;
  color: #94a3b8;
}

.lead-timeline__empty {
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: #94a3b8;
}

.lead-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
}

.lead-dialog__spacer {
  display: block;
  width: 1px;
}

.lead-dialog__footer-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-left: auto;
}

.lead-dialog__danger {
  border: none;
  background: transparent;
  color: #dc2626;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.35rem 0.25rem;
}

.lead-dialog__danger:hover { color: #b91c1c; }

@media (max-width: 820px) {
  .lead-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .lead-hero {
    grid-template-columns: 1fr;
    grid-template-areas:
      'phone'
      'actions'
      'outcomes';
  }

  .lead-hero__actions { width: 100%; }
  .lead-hero__call,
  .lead-hero__copy { flex: 1; }
  .lead-hero__outcomes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lead-meta { grid-template-columns: 1fr; }
  .lead-pipeline { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lead-tabs { width: 100%; }
  .lead-tabs__btn { flex: 1; }
  .lead-prompt__actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>

<style>
.lead-dialog.el-dialog {
  border-radius: 1rem;
  overflow: hidden;
  max-width: calc(100vw - 2rem);
}

.lead-dialog .el-dialog__header {
  margin: 0;
  padding: 1.15rem 1.35rem 0.75rem;
}

.lead-dialog .el-dialog__body {
  padding: 0.5rem 1.35rem 0.35rem;
}

.lead-dialog .el-dialog__footer {
  padding: 0.85rem 1.35rem 1.15rem;
  border-top: 1px solid #eef2f7;
}
</style>
