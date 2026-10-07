<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { heroBenefits, heroContent } from '~/data/home'

const contentRef = ref<HTMLElement>()
const imageRef = ref<HTMLElement>()

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  if (contentRef.value) {
    tl.from(contentRef.value.querySelectorAll('.hero-animate'), {
      y: 24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
    })
  }

  if (imageRef.value) {
    tl.from(imageRef.value, {
      x: 32,
      opacity: 0,
      duration: 0.7,
    }, '-=0.3')
  }
})
</script>

<template>
  <section
    class="relative overflow-hidden bg-gradient-to-b from-white via-white to-brand-50/50 pt-[var(--header-h)]"
    aria-label="Главный экран"
  >
    <div
      class="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-accent-50/80 blur-3xl"
      aria-hidden="true"
    />

    <div class="container-site relative grid items-center gap-8 py-10 sm:gap-10 sm:py-12 lg:min-h-[calc(100svh-var(--header-h)-8rem)] lg:grid-cols-2 lg:gap-12 lg:py-14">
      <div ref="contentRef" class="max-w-xl lg:max-w-none">
        <h1 class="hero-animate text-[1.75rem] font-extrabold leading-[1.2] tracking-tight text-brand-600 xs:text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
          {{ heroContent.titleBefore }}
          <span class="text-accent-500">{{ heroContent.titleAccent }}</span>
          {{ heroContent.titleAfter }}
        </h1>

        <p class="hero-animate mt-5 max-w-md text-base leading-relaxed text-brand-600/65 sm:mt-6 sm:text-lg">
          {{ heroContent.subtitle }}
        </p>

        <ul class="hero-animate mt-8 space-y-4 sm:mt-9 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5 sm:space-y-0">
          <li
            v-for="benefit in heroBenefits"
            :key="benefit.title"
            class="flex gap-3.5"
          >
            <span
              class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center text-accent-500"
              aria-hidden="true"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div class="min-w-0">
              <p class="font-semibold leading-snug text-brand-600">
                {{ benefit.title }}
              </p>
              <p class="mt-1 text-sm leading-relaxed text-brand-600/55">
                {{ benefit.description }}
              </p>
            </div>
          </li>
        </ul>

        <div class="hero-animate mt-8 flex flex-col gap-4 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
          <ModalTrigger
            type="lead"
            :payload="{ source: 'hero' }"
            class="btn-primary w-full sm:w-auto"
          >
            {{ heroContent.ctaPrimary }}
          </ModalTrigger>

          <NuxtLink
            :to="heroContent.ctaVideoTo"
            class="group inline-flex items-center justify-center gap-3 text-sm font-semibold text-brand-600 transition hover:text-accent-500 sm:justify-start"
          >
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brand-200 text-brand-600 transition group-hover:border-accent-500 group-hover:text-accent-500">
              <svg class="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span class="max-w-[14rem] text-left leading-snug sm:max-w-none">
              {{ heroContent.ctaVideo }}
            </span>
          </NuxtLink>
        </div>
      </div>

      <div ref="imageRef" class="relative flex items-end justify-center lg:justify-end">
        <div v-if="heroContent.imageSrc" class="relative w-full max-w-lg">
          <NuxtImg
            :src="heroContent.imageSrc"
            :alt="heroContent.imageAlt"
            class="w-full object-contain"
            sizes="(max-width: 1024px) 90vw, 520px"
            preload
          />
        </div>
        <div
          v-else
          class="flex w-full max-w-lg flex-col items-center justify-center px-6 py-10 text-center sm:py-12 lg:py-14"
        >
          <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 text-brand-300">
            <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.25">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="mt-4 text-sm text-brand-400">Фото команды</p>
        </div>
      </div>
    </div>

    <div
      class="relative z-10 h-1 bg-gradient-to-r from-brand-700 via-brand-500 to-accent-500 sm:h-1.5"
      aria-hidden="true"
    />
  </section>
</template>
