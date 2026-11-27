<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { api } from '@/api/client'
import type { ContactsStatus } from '@/api/types'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/apiError'
import {
  extractHoursRange,
  formatPhoneHoursLabel,
  hoursRangeError,
} from '@/utils/phoneHours'

const toast = useToast()

const contacts = ref<ContactsStatus>({
  phone: '',
  phoneHours: '',
  phoneHoursFrom: '10:00',
  phoneHoursTo: '20:00',
  email: '',
  socials: { vk: '', telegram: '', youtube: '' },
})
const ready = ref(false)
const saving = ref(false)

function asClock(value: unknown): string {
  if (typeof value === 'string') return value
  if (value instanceof Date) {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
  }
  return ''
}

const hoursFrom = computed({
  get: () => contacts.value.phoneHoursFrom ?? '',
  set: (value: unknown) => {
    contacts.value.phoneHoursFrom = asClock(value)
  },
})

const hoursTo = computed({
  get: () => contacts.value.phoneHoursTo ?? '',
  set: (value: unknown) => {
    contacts.value.phoneHoursTo = asClock(value)
  },
})

const hoursError = computed(() =>
  hoursRangeError(hoursFrom.value, hoursTo.value),
)

const hoursPreview = computed(() => {
  if (hoursError.value || !hoursFrom.value || !hoursTo.value) return ''
  return formatPhoneHoursLabel(hoursFrom.value, hoursTo.value)
})

watch([hoursFrom, hoursTo], ([from, to]) => {
  if (!hoursRangeError(from, to) && from && to) {
    contacts.value.phoneHours = formatPhoneHoursLabel(from, to)
  }
})

async function load(options: { silent?: boolean } = {}) {
  ready.value = false
  try {
    const data = await api<ContactsStatus>('/api/admin/settings/contacts')
    const range = extractHoursRange({
      from: data.phoneHoursFrom,
      to: data.phoneHoursTo,
      text: data.phoneHours,
    })
    contacts.value = {
      ...data,
      phoneHoursFrom: range?.from ?? data.phoneHoursFrom ?? '',
      phoneHoursTo: range?.to ?? data.phoneHoursTo ?? '',
      phoneHours: range
        ? formatPhoneHoursLabel(range.from, range.to)
        : data.phoneHours,
    }
  } catch (e) {
    if (!options.silent) {
      toast.error(getErrorMessage(e, 'Не удалось загрузить контакты'))
    }
  } finally {
    ready.value = true
  }
}

async function save() {
  if (!ready.value || saving.value) return
  if (hoursError.value) {
    toast.error(hoursError.value)
    return
  }
  saving.value = true
  try {
    contacts.value = await api<ContactsStatus>('/api/admin/settings/contacts', {
      method: 'PATCH',
      body: JSON.stringify({
        ...contacts.value,
        phoneHoursFrom: hoursFrom.value,
        phoneHoursTo: hoursTo.value,
        phoneHours: hoursPreview.value || contacts.value.phoneHours,
      }),
    })
    toast.success('Контакты сохранены')
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось сохранить контакты'))
    await load({ silent: true })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="settings-contacts" v-loading="!ready">
    <div class="settings-contacts__head">
      <div>
        <p class="settings-contacts__title">Контакты</p>
        <p class="settings-contacts__hint">Пустые поля не показываются на сайте.</p>
      </div>
      <el-button
        type="primary"
        :loading="saving"
        :disabled="!ready || Boolean(hoursError)"
        @click="save"
      >
        Сохранить
      </el-button>
    </div>

    <div class="settings-fields">
      <label class="settings-field">
        <span>Телефон</span>
        <el-input v-model="contacts.phone" placeholder="+7 (920) 130-72-40" clearable />
      </label>
      <div class="settings-field settings-field--hours">
        <span>Часы связи</span>
        <div class="settings-hours">
          <el-time-picker
            v-model="hoursFrom"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="С"
            :clearable="false"
            class="settings-hours__picker"
          />
          <span class="settings-hours__sep">—</span>
          <el-time-picker
            v-model="hoursTo"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="До"
            :clearable="false"
            class="settings-hours__picker"
          />
        </div>
        <p v-if="hoursError" class="settings-field__error">{{ hoursError }}</p>
        <p v-else-if="hoursPreview" class="settings-field__preview">На сайте: {{ hoursPreview }}</p>
      </div>
      <label class="settings-field">
        <span>Email</span>
        <el-input
          v-model="contacts.email"
          type="email"
          placeholder="info@school.ru"
          clearable
        />
      </label>
    </div>

    <p class="settings-contacts__group">Соцсети</p>
    <div class="settings-fields">
      <label class="settings-field">
        <span>ВКонтакте</span>
        <el-input v-model="contacts.socials.vk" placeholder="https://vk.com/…" clearable />
      </label>
      <label class="settings-field">
        <span>Telegram</span>
        <el-input v-model="contacts.socials.telegram" placeholder="https://t.me/…" clearable />
      </label>
      <label class="settings-field">
        <span>YouTube</span>
        <el-input v-model="contacts.socials.youtube" placeholder="https://youtube.com/…" clearable />
      </label>
    </div>
  </div>
</template>

<style scoped>
.settings-contacts__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.settings-contacts__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 750;
  color: #0f172a;
}

.settings-contacts__hint {
  margin: 0.2rem 0 0;
  font-size: 0.8125rem;
  color: #64748b;
}

.settings-contacts__group {
  margin: 1.15rem 0 0.65rem;
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #94a3b8;
}

.settings-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem 1rem;
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.settings-field span {
  font-size: 0.78rem;
  font-weight: 650;
  color: #475569;
}

.settings-field__error {
  margin: 0;
  font-size: 0.75rem;
  color: #dc2626;
}

.settings-field__preview {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.settings-hours {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.settings-hours__sep {
  color: #94a3b8;
  font-weight: 700;
}

.settings-hours__picker {
  flex: 1;
  min-width: 0;
}

.settings-hours__picker :deep(.el-input) {
  width: 100%;
}

@media (max-width: 820px) {
  .settings-fields {
    grid-template-columns: 1fr;
  }
}
</style>
