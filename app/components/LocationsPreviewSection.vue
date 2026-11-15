<script setup lang="ts">
import { sections } from '~/data/sections'
import { locations } from '~/data/locations'

const config = sections.locations
const total = locations.length

/** По одной площадке из разных районов, затем добор до 8 */
const preview = computed(() => {
  const seen = new Set<string>()
  const diverse: typeof locations = []
  const rest: typeof locations = []
  for (const loc of locations) {
    if (!seen.has(loc.name)) {
      seen.add(loc.name)
      diverse.push(loc)
    }
    else {
      rest.push(loc)
    }
  }
  return [...diverse, ...rest].slice(0, 8)
})

const moreCount = computed(() => Math.max(0, total - preview.value.length))
</script>

<template>
  <BaseSection id="locations">
    <template #default="{ headingId }">
      <SectionHeader
        v-bind="config"
        :title-id="headingId"
      />

      <ScrollReveal>
        <p class="mt-6 text-sm text-brand-500 sm:mt-8">
          <span class="font-semibold text-brand-600">{{ total }} площадок</span>
          по Ярославлю и области — выберите удобную рядом с домом
        </p>

        <ul class="locations-preview-grid mt-6 sm:mt-8">
          <li
            v-for="loc in preview"
            :key="loc.id"
          >
            <LocationCard
              :location="loc"
              compact
            />
          </li>
        </ul>

        <div class="locations-preview-cta mt-8 sm:mt-10">
          <div class="locations-preview-cta__copy">
            <p class="text-sm font-semibold text-brand-600 sm:text-base">
              Все филиалы на карте
            </p>
            <p class="mt-1 text-sm text-brand-500">
              <template v-if="moreCount">
                Ещё {{ moreCount }} {{ moreCount === 1 ? 'адрес' : moreCount < 5 ? 'адреса' : 'адресов' }}
                и запись на пробное занятие
              </template>
              <template v-else>
                Точки на карте и запись на пробное занятие
              </template>
            </p>
          </div>
          <NuxtLink
            to="/contacts"
            class="btn-primary locations-preview-cta__btn w-full sm:w-auto"
          >
            Открыть адреса
          </NuxtLink>
        </div>
      </ScrollReveal>
    </template>
  </BaseSection>
</template>

<style scoped>
.locations-preview-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 640px) {
  .locations-preview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .locations-preview-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.locations-preview-cta {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  padding: 1.25rem 1.35rem;
  border-radius: 1.25rem;
  border: 1px solid rgb(37 56 99 / 0.12);
  background:
    linear-gradient(135deg, rgb(37 56 99 / 0.06), rgb(255 42 42 / 0.05)),
    rgb(255 255 255 / 0.7);
}

@media (min-width: 640px) {
  .locations-preview-cta {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 1.35rem 1.75rem;
  }
}

.locations-preview-cta__btn {
  box-shadow: 0 10px 24px rgb(37 56 99 / 0.14);
}

:global(html.dark .locations-preview-cta) {
  border-color: rgb(200 214 235 / 0.14);
  background:
    linear-gradient(135deg, rgb(200 214 235 / 0.08), rgb(255 92 92 / 0.08)),
    rgb(20 28 48 / 0.55);
}
</style>
