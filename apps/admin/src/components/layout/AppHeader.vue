<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LogoutButton from '@/components/layout/LogoutButton.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useSidebarCollapsed } from '@/composables/useSidebarCollapsed'
import { useNavMenu } from '@/composables/useNavMenu'

const route = useRoute()
const router = useRouter()
const { menu, activePath } = useNavMenu()
const { collapsed, toggleCollapsed } = useSidebarCollapsed()

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const timeLabel = computed(() =>
  new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now.value),
)

const dateLabel = computed(() =>
  new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(now.value),
)

/** Progress ring for seconds (0–1) */
const secondProgress = computed(() => now.value.getSeconds() / 60)

const RING_R = 27
const RING_C = 2 * Math.PI * RING_R
const ringOffset = computed(() => RING_C * (1 - secondProgress.value))

function onMobileNav(path: string) {
  if (route.path !== path) router.push(path)
}
</script>

<template>
  <header class="admin-header">
    <div class="admin-header__left">
      <!-- Mobile: page nav (sidebar hidden below md) -->
      <el-dropdown class="md:hidden" trigger="click" @command="onMobileNav">
        <button
          type="button"
          class="admin-header__icon-btn"
          title="Меню"
          aria-label="Меню разделов"
        >
          <el-icon :size="20"><AppIcon name="menu-2" :size="20" /></el-icon>
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
                <el-icon :size="20"><component :is="item.icon" /></el-icon>
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

      <!-- Desktop: collapse sidebar to mini -->
      <button
        type="button"
        class="admin-header__icon-btn hidden md:inline-flex"
        :title="collapsed ? 'Развернуть меню' : 'Свернуть меню'"
        :aria-label="collapsed ? 'Развернуть меню' : 'Свернуть меню'"
        @click="toggleCollapsed"
      >
        <el-icon :size="20">
          <AppIcon :name="collapsed ? 'menu-unfold' : 'menu-fold'" :size="20" />
        </el-icon>
      </button>

      <div class="admin-header__clock" :title="`${dateLabel} · ${now.toLocaleString('ru-RU')}`">
        <div class="admin-header__clock-disk">
          <svg class="admin-header__ring" viewBox="0 0 60 60" aria-hidden="true">
            <circle class="admin-header__ring-track" cx="30" cy="30" :r="RING_R" />
            <circle
              class="admin-header__ring-progress"
              cx="30"
              cy="30"
              :r="RING_R"
              :stroke-dasharray="RING_C"
              :stroke-dashoffset="ringOffset"
            />
          </svg>
          <time class="admin-header__time" :datetime="now.toISOString()">{{ timeLabel }}</time>
        </div>
        <span class="admin-header__date">{{ dateLabel }}</span>
      </div>
    </div>

    <div class="ml-auto flex items-center gap-2">
      <NotificationBell />
      <LogoutButton class="md:hidden" placement="bottom" />
    </div>
  </header>
</template>

<style scoped>
.admin-header__left {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
}

.admin-header__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid var(--admin-border);
  border-radius: 10px;
  background: #fff;
  color: #334155;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background 0.15s ease;
}

.admin-header__icon-btn:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.admin-header__clock {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.65rem;
}

.admin-header__clock-disk {
  position: relative;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, #fff 0%, #f1f5f9 55%, #e2e8f0 100%);
  box-shadow:
    0 0 0 1px rgb(226 232 240 / 90%),
    0 4px 10px -4px rgb(15 23 42 / 18%);
}

.admin-header__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.admin-header__ring-track,
.admin-header__ring-progress {
  fill: none;
  stroke-width: 2.5;
}

.admin-header__ring-track {
  stroke: rgb(148 163 184 / 28%);
}

.admin-header__ring-progress {
  stroke: #1d4ed8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.35s linear;
}

.admin-header__time {
  position: relative;
  z-index: 1;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
  color: #0f172a;
  line-height: 1;
}

.admin-header__date {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  color: #64748b;
  line-height: 1.2;
}
</style>
