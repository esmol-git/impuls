<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <RouterView />
  <div
    v-if="!auth.ready"
    class="admin-boot"
    aria-busy="true"
    aria-live="polite"
  >
    <img class="admin-boot__logo" src="/logo.png" alt="Импульс" width="48" height="48" />
    <p class="admin-boot__text">Загрузка…</p>
  </div>
</template>
