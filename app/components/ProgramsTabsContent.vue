<script setup lang="ts">
import { computed, ref } from 'vue'
import { agePrograms, ageTabs } from '~/data/programs'

const props = withDefaults(defineProps<{
  source?: string
  tabIdPrefix?: string
  showDetails?: boolean
}>(), {
  source: 'programs',
  tabIdPrefix: 'program',
  showDetails: false,
})

const activeTab = ref(0)
const activeProgram = computed(() => agePrograms[activeTab.value]!)

const modalPayload = computed(() => ({
  source: props.source,
  program: activeProgram.value.groupLabel,
}))
</script>

<template>
  <div>
    <div class="tabs-scroll mt-6 justify-center sm:mt-8" role="tablist" aria-label="Возрастные группы">
      <button
        v-for="(tab, index) in ageTabs"
        :id="`${tabIdPrefix}-tab-${index}`"
        :key="tab"
        type="button"
        role="tab"
        class="tab-btn min-w-[5.5rem]"
        :aria-selected="activeTab === index"
        :aria-controls="`${tabIdPrefix}-panel-${index}`"
        :class="activeTab === index
          ? 'bg-brand-600 text-white shadow-md'
          : 'border border-brand-200 bg-white text-brand-600 hover:bg-brand-50'"
        @click="activeTab = index"
      >
        {{ tab }}
      </button>
    </div>

    <div
      :id="`${tabIdPrefix}-panel-${activeTab}`"
      role="tabpanel"
      :aria-labelledby="`${tabIdPrefix}-tab-${activeTab}`"
    >
      <Transition
        mode="out-in"
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div :key="activeTab" class="mt-5 sm:mt-6">
          <div class="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <h3 class="text-lg font-bold text-brand-600 sm:text-xl">
                {{ activeProgram.groupLabel }}
              </h3>
              <p v-if="showDetails" class="mt-2 max-w-2xl text-sm leading-relaxed text-brand-600/70 sm:text-base">
                {{ activeProgram.description }}
              </p>
            </div>
            <ModalTrigger
              type="lead"
              :payload="modalPayload"
              class="btn-primary w-full shrink-0 !px-4 !py-2.5 text-xs sm:w-auto sm:text-sm"
            >
              Узнать стоимость
            </ModalTrigger>
          </div>

          <div class="relative overflow-hidden rounded-2xl bg-brand-50/80 p-3 sm:p-4 lg:p-5">
            <div
              class="pointer-events-none absolute inset-0 opacity-[0.07]"
              aria-hidden="true"
              style="background-image: radial-gradient(circle at 20% 50%, #253863 0%, transparent 50%), radial-gradient(circle at 80% 50%, #b0191b 0%, transparent 50%)"
            />

            <div class="relative grid gap-3 sm:gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-5">
              <ProgramLevelCard
                :level="activeProgram.levels[0]"
                :age-label="activeProgram.tabLabel"
              />

              <div class="hidden w-36 shrink-0 lg:block xl:w-44">
                <UiSkeletonImage aspect="auto" class="h-full min-h-[220px] rounded-xl border border-brand-100 xl:min-h-[260px]">
                  <div class="absolute inset-0 flex flex-col items-center justify-center text-brand-300">
                    <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.25">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="mt-2 text-[10px]">Фото</p>
                  </div>
                </UiSkeletonImage>
              </div>

              <ProgramLevelCard
                :level="activeProgram.levels[1]"
                :age-label="activeProgram.tabLabel"
              />
            </div>
          </div>

          <div
            v-if="showDetails"
            class="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4"
          >
            <div class="rounded-xl border border-brand-100 bg-white p-4 sm:p-5">
              <p class="text-xs font-semibold uppercase tracking-wider text-accent-500">Расписание</p>
              <p class="mt-2 text-sm leading-relaxed text-brand-600/80 sm:text-base">
                {{ activeProgram.schedule }}
              </p>
            </div>
            <div class="rounded-xl border border-brand-100 bg-white p-4 sm:p-5">
              <p class="text-xs font-semibold uppercase tracking-wider text-accent-500">Запись</p>
              <p class="mt-2 text-sm leading-relaxed text-brand-600/80 sm:text-base">
                Первое занятие бесплатно. Подберём группу по возрасту и уровню подготовки.
              </p>
              <ModalTrigger
                type="lead"
                :payload="{ source: `${source}-details`, program: activeProgram.groupLabel }"
                class="mt-3 inline-block text-sm font-bold text-brand-600 hover:text-accent-500"
              >
                Записаться на пробное →
              </ModalTrigger>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
