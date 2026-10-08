<script setup lang="ts">
import LogoutButton from '@/components/layout/LogoutButton.vue'
import logoUrl from '@/assets/img/logo.png'
import { useSidebarCollapsed } from '@/composables/useSidebarCollapsed'
import { useNavMenu } from '@/composables/useNavMenu'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const { menu, activePath } = useNavMenu()
const { collapsed } = useSidebarCollapsed()
</script>

<template>
  <aside class="admin-sidebar" :class="{ 'admin-sidebar--mini': collapsed }">
    <div class="admin-sidebar__brand">
      <div v-if="collapsed" class="admin-sidebar__brand-mini">
        <img
          :src="logoUrl"
          alt="ФК Импульс"
          class="admin-sidebar__logo admin-sidebar__logo--mini"
          width="40"
          height="40"
        >
      </div>
      <RouterLink v-else to="/" class="admin-sidebar__brand-full">
        <img
          :src="logoUrl"
          alt="ФК Импульс"
          class="admin-sidebar__logo"
          width="48"
          height="48"
        >
        <span class="admin-sidebar__brand-text min-w-0">
          <span class="admin-sidebar__tagline">Детская футбольная школа</span>
          <span class="admin-sidebar__name">ФК «Импульс» Ярославль</span>
        </span>
      </RouterLink>
    </div>

    <el-menu
      :key="`${activePath}-${collapsed}`"
      :default-active="activePath"
      :collapse="collapsed"
      :collapse-transition="false"
      router
      class="admin-sidebar__menu"
    >
      <el-menu-item v-for="item in menu" :key="item.path" :index="item.path">
        <el-icon :size="22"><component :is="item.icon" /></el-icon>
        <template #title>
          <span class="inline-flex items-center gap-2">
            {{ item.label }}
            <el-badge
              v-if="item.badge"
              :value="item.badge"
              type="danger"
              class="menu-badge"
            />
          </span>
        </template>
      </el-menu-item>
    </el-menu>

    <div class="admin-sidebar__footer">
      <div v-if="!collapsed" class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-slate-800">{{ auth.user?.email }}</p>
        <p v-if="auth.roleLabel" class="mt-0.5 truncate text-xs text-slate-500">
          {{ auth.roleLabel }}
        </p>
      </div>
      <LogoutButton
        :title="collapsed ? auth.user?.email || 'Выход' : 'Выход'"
        :placement="collapsed ? 'right' : 'top'"
      />
    </div>
  </aside>
</template>
