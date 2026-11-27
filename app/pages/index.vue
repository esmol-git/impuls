<script setup lang="ts">
import { site } from '~/data/site'
import {
  SECTION_NO_EDGE,
  surfaceForVisibleIndex,
  type SectionSurfaceProps,
} from '~/utils/sectionSurface'

usePageSeo(`${site.name} — ${site.tagline}`, site.description)

const { blocks } = await useHomeBlocks()
const { enabled: features } = await useSiteFeatures()

const laidOutBlocks = computed(() => {
  const edgesOn = features.value.sectionEdges
  let edgeIndex = 0
  let skipWave = false
  return blocks.value.map((block) => {
    let surface: SectionSurfaceProps
    if (SECTION_NO_EDGE.has(block.key)) {
      surface = { wave: false }
      skipWave = true
    }
    else {
      const base = surfaceForVisibleIndex(edgeIndex)
      edgeIndex += 1
      const withEdges = edgesOn ? base : { ...base, wave: false }
      surface = skipWave ? { ...withEdges, wave: false } : withEdges
      skipWave = false
    }
    return { ...block, surface }
  })
})
</script>

<template>
  <div>
    <component
      :is="block.component"
      v-for="block in laidOutBlocks"
      :key="block.key"
      v-bind="{
        ...block.surface,
        ...(block.key === 'cta' ? { source: 'home-bottom' } : {}),
      }"
    />
  </div>
</template>
