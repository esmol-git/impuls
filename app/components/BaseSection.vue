<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  id?: string
  alt?: boolean
  pageTop?: boolean
  containerClass?: string
  ariaLabel?: string
}>(), {
  alt: false,
  pageTop: false,
})

const headingId = computed(() => (props.id ? `${props.id}-title` : undefined))
const labelledBy = computed(() => (props.ariaLabel ? undefined : headingId.value))
</script>

<template>
  <section
    :id="id"
    class="section-padding"
    :class="{
      'section-alt': alt,
      'page-top': pageTop,
    }"
    :aria-label="ariaLabel"
    :aria-labelledby="labelledBy"
  >
    <div class="container-site" :class="containerClass">
      <slot :heading-id="headingId" />
    </div>
  </section>
</template>
