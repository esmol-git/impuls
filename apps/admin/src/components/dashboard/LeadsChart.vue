<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { StatsSeries } from '@/api/types'

echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  series: StatsSeries | null
  loading?: boolean
}>()

const el = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const option = computed(() => {
  const points = props.series?.points ?? []
  return {
    color: ['#253863', '#b0191b', '#5a7aad'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['Всего', 'Новые', 'Обработанные'],
      top: 0,
      textStyle: { color: '#64748b' },
    },
    grid: {
      left: 16,
      right: 16,
      top: 40,
      bottom: 8,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: points.map((p) => p.label),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b', hideOverlap: true },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: { color: '#94a3b8' },
    },
    series: [
      {
        name: 'Всего',
        type: 'bar',
        barMaxWidth: 28,
        data: points.map((p) => p.total),
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'Новые',
        type: 'line',
        smooth: true,
        symbol: false,
        data: points.map((p) => p.new),
      },
      {
        name: 'Обработанные',
        type: 'line',
        smooth: true,
        symbol: false,
        data: points.map((p) => p.done),
      },
    ],
  }
})

function render() {
  if (!el.value) return
  if (!chart) chart = echarts.init(el.value)
  chart.setOption(option.value, true)
}

function onResize() {
  chart?.resize()
}

watch(option, () => render(), { deep: true })

onMounted(() => {
  render()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div v-loading="loading" class="relative min-h-[320px] w-full">
    <div ref="el" class="h-[320px] w-full" />
    <p
      v-if="!loading && series && series.totals.total === 0"
      class="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400"
    >
      За выбран нет заявок
    </p>
  </div>
</template>
