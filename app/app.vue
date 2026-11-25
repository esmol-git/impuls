<script setup lang="ts">
await useSiteTheme()
useSiteBoot()
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
