<script setup lang="ts">
import { sections } from '~/data/sections'
import { locations } from '~/data/locations'

const config = sections.locations
</script>

<template>
  <BaseSection id="locations" v-slot="{ headingId }">
    <SectionHeader
      v-bind="config"
      :title-id="headingId"
    />

    <div class="mt-8 sm:mt-12">
      <ScrollReveal>
        <LocationsSlider :items="locations" source="location-preview" />
      </ScrollReveal>
    </div>

    <ScrollReveal>
      <div class="mt-6 text-center sm:mt-8">
        <NuxtLink to="/contacts" class="btn-outline w-full sm:w-auto">
          Смотреть на карте
        </NuxtLink>
      </div>
    </ScrollReveal>
  </BaseSection>
</template>
