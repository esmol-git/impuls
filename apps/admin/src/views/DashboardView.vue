<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import LeadsChart from '@/components/dashboard/LeadsChart.vue'
import { api } from '@/api/client'
import type { CrmKpi, DashboardStats, StatsRange, StatsSeries } from '@/api/types'
import { icons } from '@/icons'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const notifications = useNotificationsStore()
const router = useRouter()
const toast = useToast()
const stats = ref<DashboardStats | null>(null)
const series = ref<StatsSeries | null>(null)
const crm = ref<CrmKpi | null>(null)
const loading = ref(true)
const chartLoading = ref(false)
const crmLoading = ref(false)
const range = ref<StatsRange>('week')
const crmRange = ref<StatsRange>('week')

const rangeOptions: { label: string; value: StatsRange }[] = [
  { label: 'День', value: 'day' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
  { label: 'Год', value: 'year' },
  { label: 'Всё время', value: 'all' },
]

function formatMinutes(value: number | null | undefined) {
  if (value == null) return '—'
  if (value < 60) return `${value} мин`
  const hours = Math.floor(value / 60)
  const mins = value % 60
  if (hours < 48) return mins ? `${hours} ч ${mins} мин` : `${hours} ч`
  const days = Math.floor(hours / 24)
  return `${days} д`
}

const funnelItems = computed(() => {
  const s = crm.value?.summary
  if (!s) return []
  return [
    { label: 'Всего', value: s.total, tone: 'slate' },
    { label: 'Пробное', value: s.trial, tone: 'violet' },
    { label: 'Записан', value: s.enrolled, tone: 'green' },
    { label: 'Отказ', value: s.lost, tone: 'red' },
  ]
})

async function loadStats() {
  loading.value = true
  try {
    stats.value = await api<DashboardStats>('/api/admin/stats')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось загрузить статистику')
  } finally {
    loading.value = false
  }
}

async function loadSeries() {
  chartLoading.value = true
  try {
    series.value = await api<StatsSeries>(`/api/admin/stats/series?range=${range.value}`)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось загрузить график')
  } finally {
    chartLoading.value = false
  }
}

async function loadCrm() {
  crmLoading.value = true
  try {
    crm.value = await api<CrmKpi>(`/api/admin/stats/crm?range=${crmRange.value}`)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось загрузить KPI')
  } finally {
    crmLoading.value = false
  }
}

watch(range, () => {
  void loadSeries()
})

watch(crmRange, () => {
  void loadCrm()
})

const refreshing = computed(
  () => loading.value || chartLoading.value || crmLoading.value,
)

async function refreshAll() {
  if (refreshing.value) return
  await Promise.all([loadStats(), loadSeries(), loadCrm(), notifications.refresh()])
}

onMounted(async () => {
  await Promise.all([loadStats(), loadSeries(), loadCrm()])
})
</script>

<template>
  <div>
    <PageHeader
      title="Дашборд"
      :description="`Добро пожаловать${auth.user?.email ? `, ${auth.user.email}` : ''}. CRM и обзор системы.`"
    >
      <template #actions>
        <el-button
          :icon="icons.redo"
          :loading="refreshing"
          title="Обновить данные"
          @click="refreshAll"
        >
          Обновить
        </el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="grid min-h-28 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer dash-card dash-card--warn"
        @click="router.push({ name: 'leads' })"
      >
        <p class="dash-card__label">Новые заявки</p>
        <p class="dash-card__value">{{ stats.newLeads }}</p>
      </el-card>
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer dash-card dash-card--blue"
        @click="router.push({ name: 'leads' })"
      >
        <p class="dash-card__label">В работе</p>
        <p class="dash-card__value">{{ stats.inProgress ?? 0 }}</p>
      </el-card>
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer dash-card dash-card--teal"
        @click="router.push({ name: 'leads', query: { queue: 'today' } })"
      >
        <p class="dash-card__label">Перезвоны сегодня</p>
        <p class="dash-card__value">{{ stats.callbacksToday ?? 0 }}</p>
      </el-card>
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer dash-card dash-card--danger"
        @click="router.push({ name: 'leads', query: { queue: 'overdue' } })"
      >
        <p class="dash-card__label">Просрочено</p>
        <p class="dash-card__value">{{ stats.callbacksOverdue ?? 0 }}</p>
      </el-card>
    </div>

    <el-card shadow="never" class="mt-6" v-loading="crmLoading">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-800">KPI менеджеров</h2>
          <p class="mt-0.5 text-xs text-slate-500">
            Реакция, конверсия в пробное/запись и очередь перезвонов
          </p>
        </div>
        <el-radio-group v-model="crmRange" size="default">
          <el-radio-button
            v-for="option in rangeOptions"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div v-if="crm" class="kpi-grid">
        <div
          v-for="item in funnelItems"
          :key="item.label"
          class="kpi-tile"
          :data-tone="item.tone"
        >
          <p class="kpi-tile__label">{{ item.label }}</p>
          <p class="kpi-tile__value">{{ item.value }}</p>
        </div>
        <div class="kpi-tile" data-tone="amber">
          <p class="kpi-tile__label">→ Пробное</p>
          <p class="kpi-tile__value">{{ crm.summary.conversionTrial }}%</p>
        </div>
        <div class="kpi-tile" data-tone="green">
          <p class="kpi-tile__label">→ Запись</p>
          <p class="kpi-tile__value">{{ crm.summary.conversionEnrolled }}%</p>
        </div>
        <div class="kpi-tile" data-tone="blue">
          <p class="kpi-tile__label">Ср. реакция</p>
          <p class="kpi-tile__value kpi-tile__value--sm">{{ formatMinutes(crm.summary.avgReactionMinutes) }}</p>
        </div>
        <div class="kpi-tile" data-tone="slate">
          <p class="kpi-tile__label">Медиана реакции</p>
          <p class="kpi-tile__value kpi-tile__value--sm">{{ formatMinutes(crm.summary.medianReactionMinutes) }}</p>
        </div>
      </div>

      <el-table
        v-if="crm?.managers.length"
        :data="crm.managers"
        class="mt-4"
        stripe
        empty-text="Нет назначенных заявок за период"
      >
        <el-table-column prop="name" label="Менеджер" min-width="160" />
        <el-table-column prop="assigned" label="Заявок" width="90" align="center" />
        <el-table-column prop="trial" label="Пробное" width="90" align="center" />
        <el-table-column prop="enrolled" label="Записан" width="90" align="center" />
        <el-table-column prop="lost" label="Отказ" width="80" align="center" />
        <el-table-column label="Конверсия" width="110" align="center">
          <template #default="{ row }">{{ row.conversionEnrolled }}%</template>
        </el-table-column>
        <el-table-column label="Реакция" width="120" align="center">
          <template #default="{ row }">{{ formatMinutes(row.avgReactionMinutes) }}</template>
        </el-table-column>
        <el-table-column label="Просрочено" width="110" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-orange-600 font-semibold': row.overdue > 0 }">{{ row.overdue }}</span>
          </template>
        </el-table-column>
      </el-table>
      <p v-else-if="crm && !crmLoading" class="mt-4 text-sm text-slate-500">
        За период нет назначенных менеджеров — KPI появятся после работы с заявками.
      </p>
    </el-card>

    <el-card shadow="never" class="mt-6">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-800">Заявки по времени</h2>
          <p class="mt-0.5 text-xs text-slate-500">
            <template v-if="series">
              За период: {{ series.totals.total }} всего ·
              {{ series.totals.new }} новых ·
              {{ series.totals.done }} обработанных
            </template>
            <template v-else>
              Динамика поступления и обработки заявок
            </template>
          </p>
        </div>
        <el-radio-group v-model="range" size="default">
          <el-radio-button
            v-for="option in rangeOptions"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <LeadsChart :series="series" :loading="chartLoading" />
    </el-card>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer"
        @click="router.push('/catalog')"
      >
        <p class="text-sm text-slate-500">Каталог</p>
        <p class="mt-2 text-2xl font-extrabold text-slate-800">{{ stats.media.catalog }}</p>
      </el-card>
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer"
        @click="router.push('/news')"
      >
        <p class="text-sm text-slate-500">Новости</p>
        <p class="mt-2 text-2xl font-extrabold text-slate-800">{{ stats.media.news }}</p>
      </el-card>
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer"
        @click="router.push('/reviews')"
      >
        <p class="text-sm text-slate-500">Отзывы</p>
        <p class="mt-2 text-2xl font-extrabold text-slate-800">{{ stats.media.reviews }}</p>
      </el-card>
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer"
        @click="router.push('/coaches')"
      >
        <p class="text-sm text-slate-500">Тренеры</p>
        <p class="mt-2 text-2xl font-extrabold text-slate-800">{{ stats.coaches ?? 0 }}</p>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.dash-card :deep(.el-card__body) {
  padding: 1rem 1.1rem;
}

.dash-card__label {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 650;
  color: #64748b;
}

.dash-card__value {
  margin: 0.45rem 0 0;
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0f172a;
  line-height: 1;
}

.dash-card--warn { border-color: #fdba74; background: linear-gradient(180deg, #fff7ed, #fff); }
.dash-card--warn .dash-card__value { color: #c2410c; }
.dash-card--blue { border-color: #93c5fd; background: linear-gradient(180deg, #eff6ff, #fff); }
.dash-card--blue .dash-card__value { color: #1d4ed8; }
.dash-card--teal { border-color: #5eead4; background: linear-gradient(180deg, #f0fdfa, #fff); }
.dash-card--teal .dash-card__value { color: #0f766e; }
.dash-card--danger { border-color: #fca5a5; background: linear-gradient(180deg, #fef2f2, #fff); }
.dash-card--danger .dash-card__value { color: #b91c1c; }

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
}

.kpi-tile {
  padding: 0.85rem 0.9rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.kpi-tile__label {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
}

.kpi-tile__value {
  margin: 0.35rem 0 0;
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  line-height: 1.1;
}

.kpi-tile__value--sm {
  font-size: 1.15rem;
}

.kpi-tile[data-tone='violet'] { background: #f5f3ff; border-color: #ddd6fe; }
.kpi-tile[data-tone='violet'] .kpi-tile__value { color: #6d28d9; }
.kpi-tile[data-tone='green'] { background: #ecfdf5; border-color: #a7f3d0; }
.kpi-tile[data-tone='green'] .kpi-tile__value { color: #047857; }
.kpi-tile[data-tone='red'] { background: #fef2f2; border-color: #fecaca; }
.kpi-tile[data-tone='red'] .kpi-tile__value { color: #b91c1c; }
.kpi-tile[data-tone='amber'] { background: #fffbeb; border-color: #fde68a; }
.kpi-tile[data-tone='amber'] .kpi-tile__value { color: #b45309; }
.kpi-tile[data-tone='blue'] { background: #eff6ff; border-color: #bfdbfe; }
.kpi-tile[data-tone='blue'] .kpi-tile__value { color: #1d4ed8; }
.kpi-tile[data-tone='slate'] { background: #f8fafc; }

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
