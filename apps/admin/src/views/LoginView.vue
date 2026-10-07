<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { rules } from '@/utils/rules'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({
  // Prefill только в dev — в production форма пустая
  email: import.meta.env.DEV ? 'admin@impuls.local' : '',
  password: '',
})

const formRules: FormRules = {
  email: rules.email,
  password: rules.password(4),
}

async function onSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await auth.login(form.email.trim(), form.password)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось войти')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#dbeafe,_#f5f7fb_55%)] px-4">
    <el-card class="w-full max-w-md" shadow="never">
      <p class="text-xs font-semibold uppercase tracking-wider text-brand-500">Импульс</p>
      <h1 class="mt-2 text-2xl font-extrabold text-brand-700">Вход в админку</h1>
      <p class="mt-2 mb-6 text-sm text-slate-500">Управление каталогом, новостями, отзывами и заявками.</p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email" autocomplete="username" />
        </el-form-item>
        <el-form-item label="Пароль" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
        <el-button type="primary" class="w-full" :loading="loading" native-type="submit">
          Войти
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>
