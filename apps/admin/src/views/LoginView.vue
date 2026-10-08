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
  password: rules.password(8),
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
  <div class="login">
    <div class="login__card">
      <header class="login__header">
        <p class="login__brand">Импульс</p>
        <h1 class="login__title">Вход в админку</h1>
        <p class="login__lead">
          Управление каталогом, новостями, отзывами и заявками.
        </p>
      </header>

      <el-form
        ref="formRef"
        class="login__form"
        :model="form"
        :rules="formRules"
        label-position="top"
        require-asterisk-position="right"
        size="large"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            autocomplete="username"
            placeholder="admin@impuls.local"
          />
        </el-form-item>
        <el-form-item label="Пароль" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="current-password"
            placeholder="••••••••"
          />
        </el-form-item>
        <el-button
          type="primary"
          class="login__submit"
          :loading="loading"
          native-type="submit"
          size="large"
        >
          Войти
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.25rem;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgb(191 219 254 / 0.7), transparent 55%),
    linear-gradient(180deg, #f0f5fb 0%, #f7f8fb 45%, #eef2f7 100%);
}

.login__card {
  width: 100%;
  max-width: 26rem;
  padding: 2.75rem 2.5rem 2.5rem;
  border-radius: 1.5rem;
  background: rgb(255 255 255 / 0.92);
  border: 1px solid rgb(226 232 240 / 0.9);
  box-shadow:
    0 1px 2px rgb(15 23 42 / 0.04),
    0 24px 48px -20px rgb(30 64 175 / 0.14);
  backdrop-filter: blur(8px);
}

.login__header {
  margin-bottom: 2.25rem;
}

.login__brand {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--el-color-primary);
}

.login__title {
  margin: 0.85rem 0 0;
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #1e3a5f;
}

.login__lead {
  margin: 0.85rem 0 0;
  max-width: 22rem;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #64748b;
}

.login__form :deep(.el-form-item) {
  margin-bottom: 1.5rem;
}

.login__form :deep(.el-form-item__label) {
  margin-bottom: 0.45rem !important;
  font-weight: 500;
  color: #475569;
}

.login__form :deep(.el-input__wrapper) {
  height: 2.85rem;
  padding: 0 14px;
  border-radius: 0.75rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  background: #f8fafc;
  transition:
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.login__form :deep(.el-input__inner) {
  height: 100%;
  line-height: 2.85rem;
}

.login__form :deep(.el-input__wrapper:hover) {
  background: #fff;
  box-shadow: 0 0 0 1px #cbd5e1 inset;
}

.login__form :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

.login__submit {
  width: 100%;
  margin-top: 0.5rem;
  height: 2.85rem;
  border-radius: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.login__submit.el-button--large {
  height: 2.85rem;
  padding: 0 1.25rem;
}

@media (max-width: 480px) {
  .login__card {
    padding: 2rem 1.5rem 1.75rem;
    border-radius: 1.25rem;
  }

  .login__title {
    font-size: 1.5rem;
  }
}
</style>
