<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FaqItem, SectionHeading } from '~/types'
import { faqItems as defaultItems } from '~/data/faq'
import { sections } from '~/data/sections'

const props = withDefaults(defineProps<{
  items?: FaqItem[]
  heading?: SectionHeading
  sectionId?: string
  alt?: boolean
}>(), {
  items: () => defaultItems,
  sectionId: 'faq',
  alt: true,
})

const config = computed(() => props.heading ?? sections.faq)
const openId = ref<string | null>(props.items[0]?.id ?? null)

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <BaseSection :id="sectionId" :alt="alt" v-slot="{ headingId }">
    <SectionHeader
      v-bind="config"
      :title-id="headingId"
    />

    <div class="mt-8 space-y-3 sm:mt-10">
      <ScrollReveal v-for="item in items" :key="item.id">
        <div
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
      </ScrollReveal>
    </div>
  </BaseSection>
</template>
