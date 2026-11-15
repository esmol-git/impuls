<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FaqItem, SectionHeading } from '~/types'
import { faqItems as defaultItems } from '~/data/faq'
import { sections } from '~/data/sections'
import { decorFor, decosOf, glowsOf } from '~/data/sectionDecor'
import {
  SECTION_SURFACE,
  type SectionEdge,
  type SectionTone,
} from '~/utils/sectionSurface'

const props = withDefaults(defineProps<{
  items?: FaqItem[]
  heading?: SectionHeading
  sectionId?: string
  alt?: boolean
  tone?: SectionTone
  edge?: SectionEdge
  flipWave?: boolean
  wave?: boolean
}>(), {
  items: () => defaultItems,
  sectionId: 'faq',
  alt: true,
  tone: 'paper',
  edge: 'wave',
  flipWave: false,
  wave: true,
})

const config = computed(() => props.heading ?? sections.faq)
const headingId = computed(() => `${props.sectionId}-title`)
const faqSurface = computed(() => SECTION_SURFACE[props.tone])
const decor = computed(() => decorFor(props.sectionId))
const decos = computed(() => decosOf(decor.value))
const glows = computed(() => glowsOf(decor.value))
const openId = ref<string | null>(props.items[0]?.id ?? null)

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <section
    :id="sectionId"
    class="faq-section section-padding relative"
    :class="{ 'faq-section--edge': wave }"
    :aria-labelledby="headingId"
    :style="{ '--section-surface': faqSurface, backgroundColor: faqSurface }"
  >
    <SectionWave
      v-if="wave"
      :fill="faqSurface"
      :flip="flipWave"
      :variant="edge"
    />
    <SectionAmbient :glows="glows" />
    <SectionWash
      v-if="decor?.wash"
      v-bind="decor.wash"
    />
    <SectionDeco
      v-for="(item, i) in decos"
      :key="i"
      v-bind="item"
    />

    <div class="container-site relative z-[2]">
      <SectionHeader
        v-bind="config"
        :title-id="headingId"
      />

      <ScrollReveal>
        <div class="mt-8 space-y-3 sm:mt-10">
          <div
            v-for="item in items"
            :key="item.id"
            class="card overflow-hidden transition-shadow duration-300"
            :class="openId === item.id ? 'ring-1 ring-brand-200' : undefined"
          >
            <h3>
              <button
                :id="`${sectionId}-trigger-${item.id}`"
                type="button"
                class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                :aria-expanded="openId === item.id"
                :aria-controls="`${sectionId}-panel-${item.id}`"
                @click="toggle(item.id)"
              >
                <span class="font-semibold text-brand-600">{{ item.question }}</span>
                <svg
                  class="h-5 w-5 shrink-0 text-brand-400 transition-transform duration-300 ease-out"
                  :class="{ 'rotate-180': openId === item.id }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </h3>

            <div
              :id="`${sectionId}-panel-${item.id}`"
              role="region"
              :aria-labelledby="`${sectionId}-trigger-${item.id}`"
              :aria-hidden="openId !== item.id"
              class="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              :class="openId === item.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
            >
              <div class="overflow-hidden">
                <div class="border-t border-brand-100 px-5 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4">
                  <p class="text-sm leading-relaxed text-brand-600/70">{{ item.answer }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
</template>

<style scoped>
.faq-section {
  z-index: 0;
  isolation: isolate;
  overflow-x: clip;
  overflow-y: visible;
}

.faq-section--edge {
  padding-bottom: 5rem;
}

@media (min-width: 640px) {
  .faq-section--edge {
    padding-bottom: 6rem;
  }
}

@media (min-width: 768px) {
  .faq-section--edge {
    padding-top: calc(3.25rem + 0.75rem);
    padding-bottom: 6.5rem;
  }
}

@media (min-width: 1024px) {
  .faq-section--edge {
    padding-top: calc(4rem + 1rem);
    padding-bottom: 7.5rem;
  }
}
</style>
