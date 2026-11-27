<script setup lang="ts">
import LogoutButton from '@/components/layout/LogoutButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import logoUrl from '@/assets/img/logo.png'
import { useRouter } from 'vue-router'
import { useNavMenu } from '@/composables/useNavMenu'
import { useSidebarMini } from '@/composables/useSidebarMini'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const { menu, activePath } = useNavMenu()
const { mini, toggle } = useSidebarMini()

function go(path: string) {
  if (router.currentRoute.value.path !== path) {
    void router.push(path)
  }
}
</script>

<template>
  <aside class="admin-sidebar" :class="{ 'is-mini': mini }">
    <div class="admin-sidebar__brand">
      <RouterLink to="/" class="admin-sidebar__brand-link" :title="mini ? 'ФК «Импульс»' : undefined">
        <img
          :src="logoUrl"
          alt="ФК Импульс"
          class="admin-sidebar__logo"
          width="40"
          height="40"
        >
        <span class="admin-sidebar__brand-text">
          <span class="admin-sidebar__tagline">Детская футбольная школа</span>
          <span class="admin-sidebar__name">ФК «Импульс» Ярославль</span>
        </span>
      </RouterLink>
    </div>

    <el-menu
      :default-active="activePath"
      class="admin-sidebar__menu"
    >
      <el-menu-item
        v-for="item in menu"
        :key="item.path"
        :index="item.path"
        :title="mini ? item.label : undefined"
        @click="go(item.path)"
      >
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
      <div class="admin-sidebar__user min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-slate-800">{{ auth.user?.email }}</p>
        <p v-if="auth.roleLabel" class="mt-0.5 truncate text-xs text-slate-500">
          {{ auth.roleLabel }}
        </p>
      </div>
      <LogoutButton title="Выход" placement="top" />
    </div>

    <button
      type="button"
      class="admin-sidebar__collapse"
      :title="mini ? 'Развернуть меню' : 'Свернуть меню'"
      :aria-label="mini ? 'Развернуть меню' : 'Свернуть меню'"
      :aria-pressed="mini"
      @click="toggle"
    >
      <el-icon :size="16">
        <AppIcon :name="mini ? 'menu-unfold' : 'menu-fold'" :size="16" />
      </el-icon>
    </button>
  </aside>
</template>
