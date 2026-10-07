<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { ModalPayload } from '~/data/modals'
import { modalCopy } from '~/data/modals'
import { formatRub } from '~/utils/catalog'
import { cartLineTotal, cartTotal, formatCartTotal } from '~/utils/commerce'

const props = withDefaults(defineProps<{
  variant?: 'full' | 'compact'
  source?: string
  payload?: ModalPayload
  submitLabel?: string
}>(), {
  variant: 'full',
})

const emit = defineEmits<{ success: [] }>()

const { loading, error, submit } = useLeadSubmit()
const { ensure: ensureGuestId } = useGuestId()
const { clear: clearCart } = useGuestCart()

const form = reactive({
  name: '',
  phone: '',
  age: '',
  message: '',
  consent: false,
})

const submitted = ref(false)
const isMock = ref(false)
const errors = reactive<Record<string, string>>({})

const purchaseItems = computed(() => props.payload?.items ?? [])
const isCheckout = computed(() => purchaseItems.value.length > 0)
const orderTotalLabel = computed(() => formatCartTotal(purchaseItems.value))

function validate() {
  errors.name = form.name.trim() ? '' : 'Введите имя'
  errors.phone = isValidRuPhone(form.phone) ? '' : 'Введите телефон в формате +7 (999) 999-99-99'
  if (props.variant === 'full') {
    errors.consent = form.consent ? '' : 'Необходимо согласие'
  } else {
    errors.consent = ''
  }
  return !Object.values(errors).some(Boolean)
}

function onPhoneInput(e: Event) {
  const input = e.target as HTMLInputElement
  form.phone = formatPhoneInput(input.value)
  input.value = form.phone
  errors.phone = ''
}

function onPhonePaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text') || ''
  form.phone = formatPhoneInput(text)
  errors.phone = ''
}

function onPhoneFocus() {
  if (!form.phone) form.phone = '+7'
}

async function onSubmit() {
  if (!validate()) return

  try {
    const result = await submit({
      name: form.name.trim(),
      phone: form.phone,
      age: isCheckout.value ? undefined : (form.age || undefined),
      message: form.message || undefined,
      source: props.payload?.source || props.source,
      location: props.payload?.location,
      program: props.payload?.program,
      variant: props.variant,
      guestToken: ensureGuestId() || undefined,
      items: isCheckout.value ? purchaseItems.value : undefined,
    })
    isMock.value = !!result.mock
    submitted.value = true
    if (isCheckout.value && props.payload?.source === 'cart') {
      clearCart()
    }
    emit('success')
  } catch {
    // error set in composable
  }
}

defineExpose({ reset: () => { submitted.value = false } })
</script>

<template>
  <div v-if="submitted" class="py-4 text-center">
    <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-500">
      <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <p class="font-semibold text-brand-600">
      {{ isCheckout ? 'Заявка на покупку отправлена' : 'Заявка отправлена' }}
    </p>
    <p v-if="isMock" class="mt-2 text-sm text-brand-600/60">
      Telegram не настроен — заявка сохранена локально (mock).
    </p>
  </div>

  <form v-else class="space-y-4" @submit.prevent="onSubmit">
    <p v-if="payload?.location" class="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-600">
      Площадка: <strong>{{ payload.location }}</strong>
    </p>

    <div
      v-if="isCheckout"
      class="space-y-2 rounded-xl border border-brand-100 bg-brand-50/50 p-3"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-brand-400">Состав заявки</p>
      <ul class="space-y-2">
        <li
          v-for="line in purchaseItems"
          :key="line.mediaId"
          class="flex items-start justify-between gap-3 text-sm text-brand-700"
        >
          <span class="min-w-0">
            <span class="font-semibold">{{ line.title }}</span>
            <span v-if="line.sku" class="mt-0.5 block text-xs text-brand-400">арт. {{ line.sku }}</span>
            <span v-if="line.category" class="mt-0.5 block text-xs text-brand-400">{{ line.category }}</span>
            <span class="text-brand-400"> × {{ line.qty }}</span>
          </span>
          <span class="shrink-0 font-semibold">{{ formatRub(cartLineTotal(line)) }}</span>
        </li>
      </ul>
      <div class="flex items-baseline justify-between border-t border-brand-100 pt-2 text-sm">
        <span class="text-brand-600/70">Итого</span>
        <span class="font-extrabold text-brand-700">{{ orderTotalLabel }}</span>
      </div>
      <p class="text-[11px] text-brand-400">
        Сумма: {{ cartTotal(purchaseItems).toLocaleString('ru-RU') }} ₽ · без оплаты на сайте
      </p>
    </div>

    <div>
      <label class="mb-1.5 block text-sm font-medium text-brand-600">Имя</label>
      <input
        v-model="form.name"
        type="text"
        class="input-field"
        :class="{ 'input-field--error': errors.name }"
        placeholder="Как к вам обращаться"
        :disabled="loading"
        @input="errors.name = ''"
      >
      <p v-if="errors.name" class="mt-1 text-xs text-accent-500">{{ errors.name }}</p>
    </div>

    <div>
      <label class="mb-1.5 block text-sm font-medium text-brand-600">Телефон</label>
      <input
        :value="form.phone"
        type="tel"
        inputmode="numeric"
        autocomplete="tel"
        maxlength="18"
        spellcheck="false"
        class="input-field"
        :class="{ 'input-field--error': errors.phone }"
        placeholder="+7 (___) ___-__-__"
        :disabled="loading"
        @focus="onPhoneFocus"
        @keydown="onPhoneKeydown"
        @paste="onPhonePaste"
        @input="onPhoneInput"
      >
      <p v-if="errors.phone" class="mt-1 text-xs text-accent-500">{{ errors.phone }}</p>
    </div>

    <template v-if="variant === 'full'">
      <div v-if="!isCheckout">
        <label class="mb-1.5 block text-sm font-medium text-brand-600">Возраст ребёнка</label>
        <input
          v-model="form.age"
          type="text"
          class="input-field"
          placeholder="Необязательно"
          :disabled="loading"
        >
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-brand-600">Комментарий</label>
        <textarea
          v-model="form.message"
          rows="2"
          class="input-field resize-none"
          :placeholder="isCheckout ? 'Пожелания по заказу (необязательно)' : 'Необязательно'"
          :disabled="loading"
        />
      </div>
      <label
        class="consent"
        :class="{ 'consent--error': errors.consent }"
      >
        <input
          v-model="form.consent"
          type="checkbox"
          class="consent__input"
          :disabled="loading"
          @change="errors.consent = ''"
        >
        <span class="consent__box" aria-hidden="true">
          <svg class="consent__check" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8.5 6.5 11.5 12.5 4.5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="consent__text">
          Согласие на обработку персональных данных (текст политики будет добавлен)
        </span>
      </label>
      <p v-if="errors.consent" class="text-xs text-accent-500">{{ errors.consent }}</p>
    </template>

    <p v-if="error" class="text-sm text-accent-500">{{ error }}</p>

    <button type="submit" class="btn-primary w-full" :disabled="loading">
      {{ loading ? 'Отправка…' : (submitLabel || modalCopy.lead.submit) }}
    </button>
  </form>
</template>

<style scoped>
.input-field {
  @apply w-full rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 disabled:opacity-60;
}

.input-field--error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgb(239 68 68 / 12%);
}

.input-field--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgb(239 68 68 / 16%);
}

.consent {
  display: flex;
  cursor: pointer;
  align-items: flex-start;
  gap: 0.75rem;
}

.consent__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.consent__box {
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin-top: 0.1rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 0.35rem;
  background: #fff;
  color: #fff;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.consent__check {
  width: 0.85rem;
  height: 0.85rem;
  opacity: 0;
  transform: scale(0.85);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.consent__input:checked + .consent__box {
  border-color: #b0191b;
  background: #b0191b;
}

.consent__input:checked + .consent__box .consent__check {
  opacity: 1;
  transform: scale(1);
}

.consent__input:focus-visible + .consent__box {
  box-shadow: 0 0 0 3px rgb(176 25 27 / 18%);
}

.consent--error .consent__box {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgb(239 68 68 / 12%);
}

.consent__text {
  font-size: 0.75rem;
  line-height: 1.5;
  color: rgb(37 56 99 / 70%);
}

.consent__input:disabled + .consent__box,
.consent__input:disabled ~ .consent__text {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
