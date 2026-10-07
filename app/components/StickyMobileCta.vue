<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const { isOpen } = useModal()
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 400
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200"
    enter-from-class="opacity-0 translate-y-full"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0 translate-y-full"
  >
    <div
      v-if="scrolled && !isOpen"
      class="scroll-lock-pad fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/95 px-3 py-3 shadow-lg backdrop-blur-md safe-bottom lg:hidden"
    >
      <div class="mx-auto flex max-w-site items-center gap-2 sm:gap-3">
        <ModalTrigger type="callback" class="btn-outline min-h-[44px] flex-1 !px-3 !py-2.5 text-xs sm:text-sm">
          Перезвонить
        </ModalTrigger>
        <ModalTrigger type="lead" :payload="{ source: 'sticky-mobile' }" class="btn-primary min-h-[44px] flex-1 !px-3 !py-2.5 text-xs sm:text-sm">
          Записаться
        </ModalTrigger>
      </div>
    </div>
  </Transition>
</template>
