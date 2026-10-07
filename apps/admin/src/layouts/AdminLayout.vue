<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useNotificationsStore } from '@/stores/notifications'

const notifications = useNotificationsStore()

onMounted(() => notifications.start())
onUnmounted(() => notifications.stop())
</script>

<template>
  <div class="admin-shell">
    <AppSidebar />
    <div class="admin-content">
      <AppHeader />
      <main class="admin-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>
