<script setup lang="ts">
import { programsSection } from '~/data/programs'
</script>

<template>
  <BaseSection id="programs" alt container-class="max-w-5xl" v-slot="{ headingId }">
    <ScrollReveal>
      <h2
        :id="headingId"
        class="text-center text-2xl font-extrabold tracking-tight text-brand-600 sm:text-3xl"
      >
        {{ programsSection.titleBefore }}
        <span class="text-accent-500">{{ programsSection.titleAccent }}</span>
      </h2>
    </ScrollReveal>

    <ProgramsTabsContent source="programs-section" tab-id-prefix="home-program" />
  </BaseSection>
</template>
