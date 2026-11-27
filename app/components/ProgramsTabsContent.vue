<script setup lang="ts">
import { computed, ref } from 'vue'
import { agePrograms, ageTabs } from '~/data/programs'
import fieldBg from '~/assets/img/hero/field-ground.webp'
import ballDeco from '~/assets/img/ball/ball-01.svg'

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
    <div
      class="programs-tabs mt-6 sm:mt-8"
      role="tablist"
      aria-label="Возрастные группы"
    >
      <button
        v-for="(tab, index) in ageTabs"
        :id="`${tabIdPrefix}-tab-${index}`"
        :key="tab"
        type="button"
        role="tab"
        class="tab-btn programs-tabs__btn"
        :aria-selected="activeTab === index"
        :aria-controls="`${tabIdPrefix}-panel-${index}`"
        :class="activeTab === index ? 'tab-btn--on' : 'tab-btn--off'"
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
        <div :key="activeTab" class="programs-block mt-5 sm:mt-6">
          <div class="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between lg:mb-1">
            <div class="min-w-0 max-w-2xl">
              <h3 class="text-lg font-bold text-brand-600 sm:text-xl">
                {{ activeProgram.groupLabel }}
              </h3>
              <p class="mt-1.5 text-sm leading-relaxed text-brand-600/70">
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

          <div
            class="programs-panel relative rounded-2xl p-3 sm:p-4 lg:p-5"
            :style="{ '--programs-field': `url(${fieldBg})`, '--programs-ball': `url(${ballDeco})` }"
          >
            <div class="programs-panel__field" aria-hidden="true" />
            <div class="programs-panel__wash" aria-hidden="true" />
            <div class="programs-panel__deco programs-panel__deco--ball" aria-hidden="true" />

            <div class="programs-levels relative grid gap-3 sm:gap-4 lg:grid-cols-[1fr_minmax(12rem,15rem)_1fr] lg:items-end lg:gap-1 xl:grid-cols-[1fr_minmax(13.5rem,17rem)_1fr] xl:gap-2">
              <ProgramLevelCard
                class="programs-levels__card"
                :level="activeProgram.levels[0]"
                :age-label="activeProgram.tabLabel"
              />

              <div
                v-if="activeProgram.figureSrc"
                class="programs-figure hidden lg:flex"
              >
                <img
                  :src="activeProgram.figureSrc"
                  :alt="activeProgram.figureAlt || ''"
                  class="programs-figure__img"
                  loading="lazy"
                  decoding="async"
                >
              </div>

              <ProgramLevelCard
                class="programs-levels__card"
                :level="activeProgram.levels[1]"
                :age-label="activeProgram.tabLabel"
              />
            </div>
          </div>

          <div
            v-if="showDetails"
            class="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4"
          >
            <div class="card p-4 sm:p-5">
              <p class="text-xs font-semibold uppercase tracking-wider text-accent-500">Расписание</p>
              <p class="mt-2 text-sm leading-relaxed text-brand-600/80 sm:text-base">
                {{ activeProgram.schedule }}
              </p>
            </div>
            <div class="card p-4 sm:p-5">
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

<style scoped>
/* На мобилке 2×2 — без горизонтального скролла и «прилипания» к краю */
.programs-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.programs-tabs__btn {
  min-width: 0;
  width: 100%;
  justify-content: center;
}

@media (min-width: 640px) {
  .programs-tabs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .programs-tabs__btn {
    width: auto;
    min-width: 5.5rem;
  }
}

.programs-block {
  overflow: visible;
}

.programs-panel {
  overflow: visible;
  isolation: isolate;
  background: #dfe8f2;
}

.programs-panel__field {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background-image: var(--programs-field);
  background-size: cover;
  background-position: center 62%;
  opacity: 0.58;
  pointer-events: none;
}

.programs-panel__wash {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background:
    linear-gradient(180deg, rgb(236 244 252 / 0.72) 0%, rgb(228 238 248 / 0.38) 45%, rgb(200 220 236 / 0.58) 100%);
  pointer-events: none;
}

.programs-panel__deco {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  opacity: 0.12;
}

.programs-panel__deco--ball {
  right: 4%;
  bottom: 6%;
  width: min(28%, 9rem);
  aspect-ratio: 1;
  background-color: #253863;
  -webkit-mask-image: var(--programs-ball);
  mask-image: var(--programs-ball);
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

@media (min-width: 1024px) {
  .programs-panel {
    margin-top: 3.5rem;
    padding-top: 1.5rem;
    padding-bottom: 1.35rem;
  }
}

.programs-levels {
  z-index: 1;
}

.programs-levels__card {
  position: relative;
  z-index: 1;
}

.programs-levels__card :deep(.program-card) {
  background: rgb(255 255 255 / 0.86);
  border-color: rgb(255 255 255 / 0.82);
  box-shadow: 0 12px 28px rgb(37 56 99 / 0.1);
  backdrop-filter: blur(14px);
}

:global(html.dark) .programs-levels__card :deep(.program-card) {
  background: rgb(18 28 48 / 0.78);
  border-color: rgb(255 255 255 / 0.1);
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.28);
}

.programs-figure {
  position: relative;
  z-index: 4;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
  align-self: end;
  margin-top: -9.5rem;
  margin-bottom: -1.15rem;
  min-height: 28rem;
}

.programs-figure__img {
  display: block;
  width: auto;
  max-width: none;
  height: clamp(26rem, 48vw, 33rem);
  object-fit: contain;
  object-position: bottom center;
  filter: drop-shadow(0 22px 34px rgb(16 28 48 / 0.34));
  user-select: none;
  -webkit-user-drag: none;
}

@media (min-width: 1280px) {
  .programs-panel {
    margin-top: 4.5rem;
  }

  .programs-figure {
    margin-top: -11rem;
    min-height: 32rem;
  }

  .programs-figure__img {
    height: clamp(29rem, 44vw, 36rem);
  }
}

:global(html.dark .programs-panel) {
  background: #15233c;
}

:global(html.dark .programs-panel__field) {
  opacity: 0.28;
}

:global(html.dark .programs-panel__wash) {
  background:
    linear-gradient(180deg, rgb(21 35 60 / 0.78) 0%, rgb(21 35 60 / 0.55) 50%, rgb(16 28 48 / 0.8) 100%);
}

:global(html.dark .programs-panel__deco--ball) {
  background-color: #c8d6eb;
  opacity: 0.16;
}

.tab-btn--on {
  background: var(--color-brand-600, #253863);
  color: #fff;
  box-shadow: 0 4px 14px rgb(37 56 99 / 0.28);
}

.tab-btn--off {
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  color: var(--header-fg);
}

.tab-btn--off:hover {
  filter: brightness(0.97);
}

:global(html.dark .tab-btn--off:hover) {
  filter: brightness(1.12);
}

:global(html.dark .tab-btn--on) {
  background: #ff3333 !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: none;
}
</style>
