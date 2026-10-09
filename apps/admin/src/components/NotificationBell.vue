<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useNotificationsStore } from '@/stores/notifications'
import { formatDateTime, leadSourceLabel } from '@/utils/format'

const notifications = useNotificationsStore()
const router = useRouter()

function openLead(id: string) {
  router.push({ name: 'leads', query: { focus: id } })
}

function openAll() {
  router.push({ name: 'leads' })
}
</script>

<template>
  <el-popover placement="bottom-end" :width="360" trigger="click">
    <template #reference>
      <el-badge :value="notifications.badgeLabel || undefined" :hidden="!notifications.badgeLabel">
        <el-button circle>
          <el-icon :size="22"><AppIcon name="bell-2" :size="22" /></el-icon>
        </el-button>
      </el-badge>
    </template>

    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="text-sm font-bold text-slate-800">Уведомления</p>
        <p class="text-xs text-slate-500">
          {{ notifications.newLeads ? `Новых заявок: ${notifications.newLeads}` : 'Новых заявок нет' }}
        </p>
      </div>
      <el-button text type="primary" @click="openAll">Все</el-button>
    </div>

    <el-empty
      v-if="!notifications.latest.length"
      description="Пока тихо. Позже подключим алерты в Telegram и на почту."
      :image-size="64"
    />

    <div v-else class="max-h-80 space-y-1 overflow-y-auto">
      <button
        v-for="item in notifications.latest"
        :key="item.id"
        type="button"
        class="w-full rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50"
        @click="openLead(item.id)"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="font-semibold text-slate-800">{{ item.name }}</p>
          <el-tag size="small" type="warning">Новая</el-tag>
        </div>
        <p class="mt-1 text-sm text-brand-600">{{ item.phone }}</p>
        <p class="mt-1 text-xs text-slate-500">
          {{ formatDateTime(item.createdAt) }}
          <span v-if="item.source"> · {{ leadSourceLabel(item.source) }}</span>
        </p>
      </button>
    </div>
  </el-popover>
</template>
