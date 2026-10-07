<script setup lang="ts">
import { site } from '~/data/site'

usePageSeo(`${site.name} — ${site.tagline}`, site.description)

const { blocks } = await useHomeBlocks()
</script>

<template>
  <div>
    <component
      :is="block.component"
      v-for="block in blocks"
      :key="block.key"
      v-bind="block.key === 'cta' ? { source: 'home-bottom' } : {}"
    />
  </div>
</template>
