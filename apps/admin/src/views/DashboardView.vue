<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import LeadsChart from '@/components/dashboard/LeadsChart.vue'
import { api } from '@/api/client'
import type { DashboardStats, StatsRange, StatsSeries } from '@/api/types'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const stats = ref<DashboardStats | null>(null)
const series = ref<StatsSeries | null>(null)
const loading = ref(true)
const chartLoading = ref(false)
const range = ref<StatsRange>('week')

const rangeOptions: { label: string, value: StatsRange }[] = [
  { label: 'День', value: 'day' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
  { label: 'Год', value: 'year' },
  { label: 'Всё время', value: 'all' },
]

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

watch(range, () => {
  void loadSeries()
})

onMounted(async () => {
  await Promise.all([loadStats(), loadSeries()])
})
</script>

<template>
  <div>
    <PageHeader
      title="Дашборд"
      :description="`Добро пожаловать${auth.user?.email ? `, ${auth.user.email}` : ''}. Краткий обзор системы.`"
    />

    <div v-loading="loading" class="grid min-h-40 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer"
        @click="router.push('/leads')"
      >
        <p class="text-sm text-slate-500">Новые заявки</p>
        <p class="mt-2 text-3xl font-extrabold text-brand-700">{{ stats.newLeads }}</p>
      </el-card>
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer"
        @click="router.push('/catalog')"
      >
        <p class="text-sm text-slate-500">Каталог</p>
        <p class="mt-2 text-3xl font-extrabold text-brand-700">{{ stats.media.catalog }}</p>
      </el-card>
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer"
        @click="router.push('/news')"
      >
        <p class="text-sm text-slate-500">Новости</p>
        <p class="mt-2 text-3xl font-extrabold text-brand-700">{{ stats.media.news }}</p>
      </el-card>
      <el-card
        v-if="stats"
        shadow="hover"
        class="cursor-pointer"
        @click="router.push('/reviews')"
      >
        <p class="text-sm text-slate-500">Отзывы</p>
        <p class="mt-2 text-3xl font-extrabold text-brand-700">{{ stats.media.reviews }}</p>
      </el-card>
    </div>

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
  </div>
</template>
