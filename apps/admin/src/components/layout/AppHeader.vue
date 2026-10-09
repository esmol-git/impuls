<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LogoutButton from '@/components/layout/LogoutButton.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useNavMenu } from '@/composables/useNavMenu'

const route = useRoute()
const router = useRouter()
const { menu, activePath } = useNavMenu()

const now = ref(new Date())
/** На wrap 59→0 отключаем transition, иначе кольцо «отматывается» назад */
const ringSnap = ref(false)
let rafId = 0
let lastSecond = -1
let lastPaint = 0

function tickClock(ts: number) {
  const d = new Date()
  const sec = d.getSeconds()

  if (lastSecond === 59 && sec === 0) {
    ringSnap.value = true
    now.value = d
    lastSecond = sec
    lastPaint = ts
    rafId = requestAnimationFrame((nextTs) => {
      ringSnap.value = false
      tickClock(nextTs)
    })
    return
  }

  lastSecond = sec
  // ~25 fps достаточно для гладкого кольца
  if (ts - lastPaint >= 40) {
    now.value = d
    lastPaint = ts
  }
  rafId = requestAnimationFrame(tickClock)
}

onMounted(() => {
  lastSecond = now.value.getSeconds()
  rafId = requestAnimationFrame(tickClock)
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
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

const secondsLabel = computed(() =>
  String(now.value.getSeconds()).padStart(2, '0'),
)

/** Доля минуты с учётом мс — кольцо идёт плавно */
const secondProgress = computed(() => {
  const d = now.value
  return (d.getSeconds() * 1000 + d.getMilliseconds()) / 60_000
})

const RING_R = 26
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
      <div class="admin-header__mobile-nav md:hidden">
        <el-dropdown trigger="click" @command="onMobileNav">
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
      </div>

      <div
        class="admin-header__clock"
        :title="`${dateLabel} · ${timeLabel}:${secondsLabel}`"
      >
        <div class="admin-header__clock-disk" aria-hidden="true">
          <svg class="admin-header__ring" viewBox="0 0 60 60">
            <defs>
              <linearGradient id="admin-clock-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6" />
                <stop offset="100%" stop-color="#1d4ed8" />
              </linearGradient>
            </defs>
            <circle class="admin-header__ring-track" cx="30" cy="30" :r="RING_R" />
            <circle
              class="admin-header__ring-progress"
              :class="{ 'is-snap': ringSnap }"
              cx="30"
              cy="30"
              :r="RING_R"
              :stroke-dasharray="RING_C"
              :stroke-dashoffset="ringOffset"
            />
          </svg>
          <time class="admin-header__time" :datetime="now.toISOString()">{{ timeLabel }}</time>
        </div>
        <div class="admin-header__meta">
          <span class="admin-header__date">{{ dateLabel }}</span>
        </div>
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
  gap: 0.7rem;
}

.admin-header__clock-disk {
  position: relative;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 28%, #ffffff 0%, #f8fafc 48%, #eef2ff 100%);
  box-shadow:
    0 0 0 1px rgb(191 219 254 / 70%),
    0 6px 14px -6px rgb(29 78 216 / 28%);
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
  stroke-width: 3;
}

.admin-header__ring-track {
  stroke: rgb(148 163 184 / 22%);
}

.admin-header__ring-progress {
  stroke: url(#admin-clock-ring);
  stroke-linecap: round;
  transition: stroke-dashoffset 80ms linear;
}

.admin-header__ring-progress.is-snap {
  transition: none;
}

.admin-header__time {
  position: relative;
  z-index: 1;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  color: #0f172a;
  line-height: 1;
}

.admin-header__meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  line-height: 1.15;
}

.admin-header__date {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: capitalize;
  color: #475569;
}

.admin-header__seconds {
  font-size: 0.7rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #94a3b8;
  letter-spacing: 0.04em;
}
</style>
