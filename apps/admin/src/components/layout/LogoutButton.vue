<script setup lang="ts">
import { SwitchButton } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useConfirm } from '@/composables/useConfirm'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const props = withDefaults(
  defineProps<{
    placement?: 'top' | 'bottom' | 'right'
    title?: string
  }>(),
  { placement: 'top' },
)

const auth = useAuthStore()
const notifications = useNotificationsStore()
const router = useRouter()
const { confirm } = useConfirm()

async function onLogout() {
  const ok = await confirm({
    title: 'Выйти из админки?',
    message: 'Сессия будет завершена на этом устройстве.',
    confirmLabel: 'Выйти',
  })
  if (!ok) return

  notifications.stop()
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <el-tooltip :content="props.title || 'Выход'" :placement="props.placement">
    <el-button
      link
      type="danger"
      :icon="SwitchButton"
      class="shrink-0 !text-base"
      aria-label="Выход"
      @click="onLogout"
    />
  </el-tooltip>
</template>
