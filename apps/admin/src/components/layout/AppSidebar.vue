<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import LogoutButton from '@/components/layout/LogoutButton.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useNavMenu } from '@/composables/useNavMenu'
import { useAuthStore } from '@/stores/auth'

const STORAGE_KEY = 'admin-sidebar-collapsed'

const auth = useAuthStore()
const { menu, activePath } = useNavMenu()
const isNarrow = useMediaQuery('(max-width: 1279px)')
const collapsed = ref(false)

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === '1' || saved === '0') {
    collapsed.value = saved === '1'
  } else {
    collapsed.value = isNarrow.value
  }
})

watch(isNarrow, (narrow) => {
  if (localStorage.getItem(STORAGE_KEY) != null) return
  collapsed.value = narrow
})

function toggleCollapsed() {
  collapsed.value = !collapsed.value
  localStorage.setItem(STORAGE_KEY, collapsed.value ? '1' : '0')
}
</script>

<template>
  <aside class="admin-sidebar" :class="{ 'admin-sidebar--mini': collapsed }">
    <div class="admin-sidebar__brand">
      <div v-if="collapsed" class="admin-sidebar__brand-mini">
        <p class="admin-sidebar__mark" title="Импульс">И</p>
        <button
          type="button"
          class="admin-sidebar__toggle"
          title="Развернуть меню"
          aria-label="Развернуть меню"
          @click="toggleCollapsed"
        >
          <el-icon :size="16"><DArrowRight /></el-icon>
        </button>
      </div>
      <div v-else class="admin-sidebar__brand-full">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wider text-brand-500">Импульс</p>
          <h1 class="mt-1 text-lg font-extrabold text-brand-700">Админка</h1>
        </div>
        <button
          type="button"
          class="admin-sidebar__toggle"
          title="Свернуть меню"
          aria-label="Свернуть меню"
          @click="toggleCollapsed"
        >
          <el-icon :size="16"><DArrowLeft /></el-icon>
        </button>
      </div>
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
        <el-icon><component :is="item.icon" /></el-icon>
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
