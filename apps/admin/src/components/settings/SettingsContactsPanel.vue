<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '@/api/client'
import type { ContactsStatus } from '@/api/types'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/apiError'

const toast = useToast()

const contacts = ref<ContactsStatus>({
  phone: '',
  phoneHours: '',
  email: '',
  socials: { vk: '', telegram: '', youtube: '' },
})
const ready = ref(false)
const saving = ref(false)

async function load(options: { silent?: boolean } = {}) {
  ready.value = false
  try {
    contacts.value = await api<ContactsStatus>('/api/admin/settings/contacts')
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
  saving.value = true
  try {
    contacts.value = await api<ContactsStatus>('/api/admin/settings/contacts', {
      method: 'PATCH',
      body: JSON.stringify(contacts.value),
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
  <div class="admin-panel mb-4 p-5 sm:p-6" v-loading="!ready">
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="font-semibold text-slate-800">Контакты на сайте</p>
        <p class="mt-0.5 text-sm text-slate-500">
          Пустые поля не показываются в шапке, подвале и на странице контактов.
        </p>
      </div>
      <el-button
        type="primary"
        :loading="saving"
        :disabled="!ready"
        @click="save"
      >
        Сохранить контакты
      </el-button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <el-form-item label="Телефон" class="!mb-0">
        <el-input v-model="contacts.phone" placeholder="+7 (920) 130-72-40" clearable />
      </el-form-item>
      <el-form-item label="Подпись к телефону" class="!mb-0">
        <el-input
          v-model="contacts.phoneHours"
          placeholder="Мы на связи с 10:00 до 20:00"
          clearable
        />
      </el-form-item>
      <el-form-item label="Email" class="!mb-0 sm:col-span-2">
        <el-input
          v-model="contacts.email"
          type="email"
          placeholder="info@school.ru"
          clearable
        />
      </el-form-item>
      <el-form-item label="ВКонтакте" class="!mb-0">
        <el-input v-model="contacts.socials.vk" placeholder="https://vk.com/…" clearable />
      </el-form-item>
      <el-form-item label="Telegram" class="!mb-0">
        <el-input v-model="contacts.socials.telegram" placeholder="https://t.me/…" clearable />
      </el-form-item>
      <el-form-item label="YouTube" class="!mb-0 sm:col-span-2">
        <el-input
          v-model="contacts.socials.youtube"
          placeholder="https://youtube.com/…"
          clearable
        />
      </el-form-item>
    </div>
  </div>
</template>
