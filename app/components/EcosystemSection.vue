<script setup lang="ts">
import { ecosystemCards, ecosystemSection } from '~/data/ecosystem'
</script>

<template>
  <BaseSection id="ecosystem" container-class="max-w-5xl">
    <div class="eco relative overflow-hidden rounded-2xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
      <div class="eco__base" aria-hidden="true" />
      <div class="eco__glow eco__glow--red" aria-hidden="true" />
      <div class="eco__glow eco__glow--blue" aria-hidden="true" />
      <div class="eco__glow eco__glow--bottom" aria-hidden="true" />
      <div class="eco__ring eco__ring--tl" aria-hidden="true" />
      <div class="eco__ring eco__ring--br" aria-hidden="true" />
      <div class="accent-bloom" aria-hidden="true" />

      <ScrollReveal class="relative z-[1]">
        <h2 class="text-center text-xl font-extrabold leading-snug text-white sm:text-2xl lg:text-3xl">
          {{ ecosystemSection.title }}
        </h2>
        <p class="mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-white/75 sm:mt-4 sm:text-base">
          {{ ecosystemSection.intro }}
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <ul class="relative z-[1] mt-6 grid list-none gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
          <li v-for="card in ecosystemCards" :key="card.id">
            <article class="eco-card flex h-full flex-col rounded-xl p-4 sm:p-5">
              <h3 class="font-bold text-white">{{ card.title }}</h3>
              <ul class="mt-3 flex-1 space-y-2">
                <li
                  v-for="item in card.items"
                  :key="item"
                  class="flex gap-2 text-sm leading-snug text-white/75"
                >
                  <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" aria-hidden="true" />
                  {{ item }}
                </li>
              </ul>
            </article>
          </li>
        </ul>

        <div class="relative z-[1] mt-7 flex justify-center sm:mt-8">
          <ModalTrigger
            type="lead"
            :payload="{ source: 'ecosystem' }"
            class="btn-primary eco-cta w-full max-w-full min-w-0 sm:w-auto"
          >
            Записаться на бесплатное занятие
          </ModalTrigger>
        </div>
      </ScrollReveal>
    </div>
  </BaseSection>
</template>

<style scoped>
.eco {
  background-color: #1e3358;
  box-shadow: 0 18px 48px rgb(16 28 48 / 0.28);
}

.eco__base {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 55% at 12% 8%, rgb(255 50 50 / 0.22) 0%, transparent 55%),
    radial-gradient(ellipse 55% 50% at 92% 88%, rgb(90 140 210 / 0.28) 0%, transparent 58%),
    linear-gradient(155deg, #243a63 0%, #1a2d4d 48%, #15243f 100%);
}

.eco__glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.eco__glow--red {
  top: -8%;
  left: -6%;
  width: min(52%, 20rem);
  height: min(42%, 16rem);
  background: radial-gradient(circle, rgb(255 55 55 / 0.28) 0%, transparent 68%);
}

.eco__glow--blue {
  top: 28%;
  right: -10%;
  width: min(48%, 18rem);
  height: min(48%, 18rem);
  background: radial-gradient(circle, rgb(110 160 220 / 0.22) 0%, transparent 70%);
}

.eco__glow--bottom {
  right: 18%;
  bottom: -12%;
  width: min(60%, 24rem);
  height: 40%;
  background: radial-gradient(ellipse, rgb(255 42 42 / 0.16) 0%, transparent 70%);
}

.eco__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgb(255 255 255 / 0.08);
  pointer-events: none;
}

.eco__ring--tl {
  top: -4rem;
  left: -4rem;
  width: 14rem;
  height: 14rem;
  box-shadow: inset 0 0 40px rgb(255 60 60 / 0.08);
}

.eco__ring--br {
  right: -5rem;
  bottom: -5rem;
  width: 16rem;
  height: 16rem;
  border-color: rgb(120 170 230 / 0.12);
  box-shadow: inset 0 0 48px rgb(90 140 210 / 0.1);
}

.eco-card {
  border: 1px solid rgb(255 255 255 / 0.12);
  background:
    linear-gradient(160deg, rgb(255 255 255 / 0.08) 0%, rgb(255 255 255 / 0.02) 100%),
    rgb(18 32 54 / 0.55);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.06);
  backdrop-filter: blur(8px);
}

.eco-cta {
  box-shadow: 0 12px 28px rgb(255 42 42 / 0.32);
}

:global(html.dark .eco) {
  background-color: #15233c;
}

:global(html.dark .eco__base) {
  background:
    radial-gradient(ellipse 70% 55% at 12% 8%, rgb(255 55 55 / 0.26) 0%, transparent 55%),
    radial-gradient(ellipse 55% 50% at 92% 88%, rgb(90 140 210 / 0.24) 0%, transparent 58%),
    linear-gradient(155deg, #1a2b48 0%, #121e34 48%, #0e1829 100%);
}
</style>
