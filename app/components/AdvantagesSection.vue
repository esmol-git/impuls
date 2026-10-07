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
    <div class="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
      <ScrollReveal v-for="item in advantages" :key="item.title">
        <FeatureCard v-bind="item" />
      </ScrollReveal>
    </div>
  </BaseSection>
</template>
