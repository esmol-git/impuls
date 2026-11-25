<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LogoutButton from '@/components/layout/LogoutButton.vue'
import logoUrl from '@/assets/img/logo.png'
import { useNavMenu } from '@/composables/useNavMenu'
import { useAuthStore } from '@/stores/auth'

const open = defineModel<boolean>({ required: true })

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { menu, activePath } = useNavMenu()

watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)

function go(path: string) {
  open.value = false
  if (route.path !== path) void router.push(path)
}
</script>

<template>
  <el-drawer
    v-model="open"
    direction="ltr"
    size="300px"
    :with-header="false"
    class="admin-mobile-drawer"
    append-to-body
  >
    <div class="admin-mobile-drawer__inner">
      <div class="admin-mobile-drawer__brand">
        <RouterLink to="/" class="admin-mobile-drawer__brand-link" @click="open = false">
          <img
            :src="logoUrl"
            alt="ФК Импульс"
            class="admin-mobile-drawer__logo"
            width="40"
            height="40"
          >
          <span class="admin-mobile-drawer__brand-text">
            <span class="admin-mobile-drawer__tagline">Детская футбольная школа</span>
            <span class="admin-mobile-drawer__name">ФК «Импульс» Ярославль</span>
          </span>
        </RouterLink>
        <button
          type="button"
          class="admin-mobile-drawer__close"
          aria-label="Закрыть меню"
          @click="open = false"
        >
          ×
        </button>
      </div>

      <nav class="admin-mobile-drawer__nav" aria-label="Разделы админки">
        <button
          v-for="item in menu"
          :key="item.path"
          type="button"
          class="admin-mobile-drawer__link"
          :class="{ 'is-active': item.path === activePath }"
          @click="go(item.path)"
        >
          <el-icon :size="22"><component :is="item.icon" /></el-icon>
          <span class="min-w-0 flex-1 text-left">{{ item.label }}</span>
          <el-badge
            v-if="item.badge"
            :value="item.badge"
            type="danger"
            class="menu-badge"
          />
        </button>
      </nav>

      <div class="admin-mobile-drawer__footer">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-slate-800">{{ auth.user?.email }}</p>
          <p v-if="auth.roleLabel" class="mt-0.5 truncate text-xs text-slate-500">
            {{ auth.roleLabel }}
          </p>
        </div>
        <LogoutButton placement="top" />
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.admin-mobile-drawer__inner {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.admin-mobile-drawer__brand {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1rem 1rem 0.85rem;
  border-bottom: 1px solid var(--admin-border);
}

.admin-mobile-drawer__brand-link {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
  color: inherit;
}

.admin-mobile-drawer__logo {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  object-fit: contain;
}

.admin-mobile-drawer__brand-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.15rem;
  line-height: 1.25;
}

.admin-mobile-drawer__tagline,
.admin-mobile-drawer__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1e2d4f;
}

.admin-mobile-drawer__close {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: #64748b;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.admin-mobile-drawer__close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.admin-mobile-drawer__nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  padding: 0.75rem 0.65rem;
}

.admin-mobile-drawer__link {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.75rem;
  padding: 0.55rem 0.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: #334155;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
}

.admin-mobile-drawer__link:hover {
  background: #f8fafc;
}

.admin-mobile-drawer__link.is-active {
  background: #eff6ff;
  color: #1d4ed8;
}

.admin-mobile-drawer__footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
  border-top: 1px solid var(--admin-border);
  padding: 1rem 1.15rem;
}
</style>

<style>
.admin-mobile-drawer.el-drawer {
  border-right: 1px solid var(--admin-border, #e2e8f0);
}

.admin-mobile-drawer .el-drawer__body {
  padding: 0;
  height: 100%;
}
</style>
