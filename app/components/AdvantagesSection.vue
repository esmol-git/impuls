<script setup lang="ts">
import { advantages } from '~/data/home'
import { sections } from '~/data/sections'

const config = sections.advantages
</script>

<template>
  <BaseSection id="advantages" v-slot="{ headingId }">
    <SectionHeader
      v-bind="config"
      :title-id="headingId"
    />
    <ScrollReveal>
      <div class="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          v-for="item in advantages"
          :key="item.title"
          v-bind="item"
        />
      </div>
    </ScrollReveal>
  </BaseSection>
</template>
