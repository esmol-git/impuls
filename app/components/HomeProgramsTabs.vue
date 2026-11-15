<script setup lang="ts">
import { programsSection } from '~/data/programs'
</script>

<template>
  <BaseSection id="programs" container-class="max-w-5xl" v-slot="{ headingId }">
    <ScrollReveal>
      <h2
        :id="headingId"
        class="programs-heading text-center text-2xl font-extrabold tracking-tight text-brand-600 sm:text-3xl"
      >
        {{ programsSection.titleBefore }}
        <span class="programs-heading__accent text-accent-500">{{ programsSection.titleAccent }}</span>
      </h2>

      <ProgramsTabsContent source="programs-section" tab-id-prefix="home-program" />
    </ScrollReveal>
  </BaseSection>
</template>

<style scoped>
:global(html.dark .programs-heading) {
  color: #ffffff !important;
}

:global(html.dark .programs-heading__accent) {
  color: #ff4242 !important;
}
</style>
