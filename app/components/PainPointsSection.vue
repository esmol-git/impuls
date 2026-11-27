<script setup lang="ts">
import type { PainPointIcon } from '~/types'
import { painPoints, painPointsSection } from '~/data/painPoints'
import iconSearch from '~/assets/icons/pain-search.svg'
import iconHealth from '~/assets/icons/pain-health.svg'
import iconGadget from '~/assets/icons/pain-gadget.svg'
import iconCoach from '~/assets/icons/pain-coach.svg'
import iconQuality from '~/assets/icons/pain-quality.svg'
import iconFriends from '~/assets/icons/pain-friends.svg'

const icons: Record<PainPointIcon, string> = {
  search: iconSearch,
  health: iconHealth,
  gadget: iconGadget,
  coach: iconCoach,
  quality: iconQuality,
  friends: iconFriends,
}

function iconMaskStyle(name: PainPointIcon) {
  const value = `url("${icons[name]}")`
  return {
    maskImage: value,
    WebkitMaskImage: value,
  }
}
</script>

<template>
  <BaseSection id="pain-points" container-class="max-w-5xl">
    <ScrollReveal>
      <h2 class="text-center text-2xl font-extrabold text-brand-600 sm:text-3xl">
        {{ painPointsSection.title }}
      </h2>
    </ScrollReveal>

    <ScrollReveal>
      <ul class="pain-grid mt-6 list-none sm:mt-8">
        <li v-for="(point, index) in painPoints" :key="point.id">
          <article class="pain-card card">
            <span class="pain-badge" aria-hidden="true">
              <span
                class="pain-icon"
                :style="iconMaskStyle(point.icon)"
              />
            </span>
            <p class="pain-text">
              {{ point.text }}
            </p>
            <span class="pain-index" aria-hidden="true">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
          </article>
        </li>
      </ul>
    </ScrollReveal>

    <ScrollReveal>
      <div class="surface-brand relative mt-6 overflow-hidden rounded-2xl bg-brand-600 sm:mt-8">
        <div
          class="absolute inset-0 bg-gradient-to-r from-brand-700/90 via-brand-600/85 to-brand-600/70"
          aria-hidden="true"
        />
        <div class="accent-bloom accent-bloom--corner" aria-hidden="true" />
        <div class="relative z-[1] min-w-0 px-4 py-8 text-center sm:px-8 sm:py-10">
          <h3 class="text-xl font-bold text-white sm:text-2xl">
            {{ painPointsSection.joinTitle }}
          </h3>
          <p class="mt-2 text-sm font-bold uppercase tracking-wider text-accent-300 sm:text-base">
            {{ painPointsSection.joinSubtitle }}
          </p>
          <ModalTrigger
            type="lead"
            :payload="{ source: 'pain-points' }"
            class="btn-primary mx-auto mt-5 w-full max-w-full min-w-0 sm:mt-6 sm:w-auto"
          >
            {{ painPointsSection.joinCta }}
          </ModalTrigger>
        </div>
      </div>
    </ScrollReveal>
  </BaseSection>
</template>

<style scoped>
.pain-grid {
  display: grid;
  gap: 0.875rem;
}

@media (min-width: 640px) {
  .pain-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
}

@media (min-width: 1024px) {
  .pain-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.125rem;
  }
}

.pain-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
  padding: 1.25rem 1.25rem 1.35rem;
  overflow: hidden;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.pain-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, rgb(var(--c-accent-500)), transparent 70%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.pain-card:hover {
  transform: translateY(-3px);
  border-color: rgb(var(--c-accent-500) / 0.28);
}

.pain-card:hover::before {
  opacity: 1;
}

.pain-badge {
  display: flex;
  width: 4.75rem;
  height: 4.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 1.25rem;
  background:
    radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.9), transparent 55%),
    rgb(var(--c-accent-50));
  color: rgb(var(--c-accent-500));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.7),
    0 10px 22px -10px rgb(var(--c-accent-500) / 0.38);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.pain-card:hover .pain-badge {
  transform: scale(1.05);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.7),
    0 14px 26px -10px rgb(var(--c-accent-500) / 0.48);
}

.pain-icon {
  display: block;
  width: 2.75rem;
  height: 2.75rem;
  background-color: currentColor;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}

.pain-text {
  margin: 0;
  padding-right: 1.75rem;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: rgb(var(--c-brand-600) / 0.82);
}

.pain-index {
  position: absolute;
  right: 0.9rem;
  bottom: 0.65rem;
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  color: rgb(var(--c-brand-600) / 0.08);
  pointer-events: none;
  transition: color 0.25s ease;
}

.pain-card:hover .pain-index {
  color: rgb(var(--c-accent-500) / 0.16);
}

@media (min-width: 640px) {
  .pain-card {
    padding: 1.5rem 1.5rem 1.6rem;
    gap: 1.25rem;
  }

  .pain-badge {
    width: 5.25rem;
    height: 5.25rem;
    border-radius: 1.35rem;
  }

  .pain-icon {
    width: 3.1rem;
    height: 3.1rem;
  }

  .pain-text {
    font-size: 1rem;
    line-height: 1.5;
  }

  .pain-index {
    font-size: 2rem;
    right: 1.05rem;
    bottom: 0.8rem;
  }
}
</style>
