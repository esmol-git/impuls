<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LogoutButton from '@/components/layout/LogoutButton.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import { useNavMenu } from '@/composables/useNavMenu'

const route = useRoute()
const router = useRouter()
const { menu, activePath } = useNavMenu()

const current = computed(() => menu.value.find((item) => item.path === activePath.value))

function onMobileNav(path: string) {
  if (route.path !== path) router.push(path)
}
</script>

<template>
  <header class="admin-header">
    <div class="min-w-0 md:hidden">
      <el-dropdown trigger="click" @command="onMobileNav">
        <button type="button" class="admin-header__nav-btn">
          <el-icon v-if="current" :size="18">
            <component :is="current.icon" />
          </el-icon>
          <span class="truncate">{{ current?.label || 'Меню' }}</span>
          <el-badge
            v-if="current?.badge"
            :value="current.badge"
            type="danger"
            class="menu-badge"
          />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in menu"
              :key="item.path"
              :command="item.path"
              :class="{ 'is-active': item.path === activePath }"
            >
              <span class="inline-flex items-center gap-2">
                <el-icon :size="16"><component :is="item.icon" /></el-icon>
                {{ item.label }}
                <el-badge
                  v-if="item.badge"
                  :value="item.badge"
                  type="danger"
                  class="menu-badge"
                />
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="hidden min-w-0 md:block">
      <p class="text-sm font-semibold text-slate-800">Панель управления</p>
      <p class="text-xs text-slate-500">Заявки обновляются автоматически</p>
    </div>

    <div class="ml-auto flex items-center gap-2">
      <NotificationBell />
      <LogoutButton class="md:hidden" placement="bottom" />
    </div>
  </header>
</template>

<style scoped>
.admin-header__nav-btn {
  display: inline-flex;
  max-width: 14rem;
  align-items: center;
  gap: 0.45rem;
  min-height: 40px;
  padding: 0 0.75rem;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  background: #fff;
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.admin-header__nav-btn:hover {
  border-color: var(--el-border-color-hover);
}
</style>
