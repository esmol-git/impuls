<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { icons } from '@/icons'
import AdminSurface from '@/components/ui/AdminSurface.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import TablePager from '@/components/ui/TablePager.vue'
import { api } from '@/api/client'
import type { Gender, Role, User, UserSortField, UsersPage } from '@/api/types'
import { useConfirm } from '@/composables/useConfirm'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch'
import { usePagedResource } from '@/composables/usePagedResource'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/utils/apiError'
import { formatDate } from '@/utils/format'
import { rules } from '@/utils/rules'

const auth = useAuthStore()
const toast = useToast()
const { confirm } = useConfirm()

const saving = ref(false)
const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()
const { searchInput, search, onSearchInput, clearSearch } = useDebouncedSearch()

const {
  items: users,
  loading,
  page,
  pageSize,
  pageSizes,
  total,
  load,
  onSortChange,
  afterDelete,
} = usePagedResource<User, UserSortField>({
  defaultSort: 'createdAt',
  defaultOrder: 'desc',
  fetchPage: async ({ page: p, limit, sort, order }) => {
    const params = new URLSearchParams({
      page: String(p),
      limit: String(limit),
      sort,
      order,
    })
    if (search.value) params.set('q', search.value)
    const data = await api<UsersPage>(`/api/admin/users?${params}`)
    return { items: data.items, meta: data.meta }
  },
})

watch(search, () => {
  if (page.value !== 1) page.value = 1
  else void load()
})

const form = reactive({
  email: '',
  password: '',
  role: 'MANAGER' as Role,
  firstName: '',
  lastName: '',
  gender: null as Gender | null,
  birthDate: null as string | null,
})

const isEdit = computed(() => Boolean(editingId.value))

const formRules = computed<FormRules>(() => ({
  email: rules.email,
  password: isEdit.value
    ? [
        {
          validator: (_rule, value: string, callback) => {
            if (!value) {
              callback()
              return
            }
            if (value.length < 8) {
              callback(new Error('Минимум 8 символов'))
              return
            }
            callback()
          },
          trigger: 'blur',
        },
      ]
    : rules.password(8),
  role: rules.role,
}))

/** Назначаемые роли — суперадмин один в системе (создаётся сидом), через форму не выбирается */
const roleOptions = [
  { label: 'Менеджер', value: 'MANAGER' as Role },
  { label: 'Админ', value: 'ADMIN' as Role },
]

const genderOptions = [
  { label: 'Мужской', value: 'MALE' as Gender },
  { label: 'Женский', value: 'FEMALE' as Gender },
]

function genderLabel(gender?: Gender | null) {
  if (gender === 'MALE') return 'Мужской'
  if (gender === 'FEMALE') return 'Женский'
  return '—'
}

function fullName(user: User) {
  const name = [user.lastName, user.firstName].filter(Boolean).join(' ')
  return name || '—'
}

function canManage(user: User) {
  if (user.role === 'SUPERADMIN' && !auth.isSuperAdmin) return false
  return true
}

function canChangeRole(user: User) {
  if (user.role === 'SUPERADMIN') return false
  return canManage(user)
}

function resetForm() {
  form.email = ''
  form.password = ''
  form.role = 'MANAGER'
  form.firstName = ''
  form.lastName = ''
  form.gender = null
  form.birthDate = null
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogOpen.value = true
}

function openEdit(user: User) {
  if (!canManage(user)) {
    toast.error('Нельзя редактировать суперадмина')
    return
  }
  editingId.value = user.id
  form.email = user.email
  form.password = ''
  form.role = user.role
  form.firstName = user.firstName || ''
  form.lastName = user.lastName || ''
  form.gender = user.gender || null
  form.birthDate = user.birthDate ? user.birthDate.slice(0, 10) : null
  dialogOpen.value = true
}

async function saveUser() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload: Record<string, unknown> = {
      email: form.email.trim(),
      firstName: form.firstName.trim() || null,
      lastName: form.lastName.trim() || null,
      gender: form.gender,
      birthDate: form.birthDate || null,
    }
    if (!isEdit.value || form.role !== 'SUPERADMIN') {
      payload.role = form.role
    }
    if (form.password) payload.password = form.password

    if (editingId.value) {
      const updated = await api<User>(`/api/admin/users/${editingId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      const idx = users.value.findIndex((item) => item.id === editingId.value)
      if (idx >= 0) users.value[idx] = updated
      toast.success('Сохранено')
    } else {
      await api<User>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ ...payload, password: form.password }),
      })
      toast.success('Пользователь создан')
      page.value = 1
      await load({ silent: true })
    }
    dialogOpen.value = false
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось сохранить'))
  } finally {
    saving.value = false
  }
}

async function changeRole(user: User, role: Role) {
  if (user.role === role) return
  if (!canChangeRole(user)) {
    toast.error('Роль суперадмина нельзя изменить')
    return
  }
  try {
    const updated = await api<User>(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
    const idx = users.value.findIndex((item) => item.id === user.id)
    if (idx >= 0) users.value[idx] = updated
    toast.success('Роль обновлена')
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось обновить роль'))
  }
}

async function removeUser(user: User) {
  if (user.id === auth.user?.id) return
  if (!canManage(user)) {
    toast.error('Нельзя удалить суперадмина')
    return
  }
  const ok = await confirm({
    title: 'Удалить пользователя?',
    message: `Аккаунт ${user.email} будет удалён без возможности восстановления.`,
    confirmLabel: 'Удалить',
    danger: true,
  })
  if (!ok) return

  try {
    await api(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    toast.success('Пользователь удалён')
    await afterDelete()
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось удалить'))
  }
}
</script>

<template>
  <div>
    <PageHeader title="Пользователи" description="Суперадмины, админы и менеджеры с доступом в панель.">
      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <el-input
            :model-value="searchInput"
            class="w-56 sm:w-64"
            clearable
            placeholder="Email, имя…"
            :prefix-icon="icons.search"
            @update:model-value="onSearchInput"
            @clear="clearSearch"
          />
          <el-button type="primary" :icon="Plus" @click="openCreate">Добавить</el-button>
        </div>
      </template>
    </PageHeader>

    <AdminSurface v-loading="loading">
      <el-table
        :data="users"
        stripe
        :empty-text="search ? 'Ничего не найдено' : 'Пользователей пока нет'"
        :default-sort="{ prop: 'createdAt', order: 'descending' }"
        @sort-change="onSortChange"
      >
        <el-table-column prop="email" label="Пользователь" min-width="220" sortable="custom">
          <template #default="{ row }">
            <p class="font-medium text-slate-800">{{ fullName(row) }}</p>
            <p class="text-xs text-slate-500">{{ row.email }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Пол" width="110">
          <template #default="{ row }">
            {{ genderLabel(row.gender) }}
          </template>
        </el-table-column>
        <el-table-column label="Дата рождения" width="140">
          <template #default="{ row }">
            {{ row.birthDate ? formatDate(row.birthDate) : '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="role" label="Роль" width="180" sortable="custom">
          <template #default="{ row }">
            <el-select
              :model-value="row.role"
              :disabled="!canChangeRole(row)"
              @change="(value: Role) => changeRole(row, value)"
            >
              <el-option
                v-for="option in roleOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
              <el-option
                v-if="row.role === 'SUPERADMIN'"
                label="Суперадмин"
                value="SUPERADMIN"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Создан" width="140" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Действия" width="128" align="right" fixed="right">
          <template #default="{ row }">
            <div class="admin-table__actions">
              <button
                v-if="canManage(row)"
                type="button"
                class="admin-table__action"
                title="Изменить"
                aria-label="Изменить"
                @click="openEdit(row)"
              >
                <el-icon :size="18"><component :is="icons.edit" /></el-icon>
              </button>
              <button
                v-if="canManage(row)"
                type="button"
                class="admin-table__action admin-table__action--danger"
                title="Удалить"
                aria-label="Удалить"
                :disabled="row.id === auth.user?.id"
                @click="removeUser(row)"
              >
                <el-icon :size="18"><component :is="icons.trash" /></el-icon>
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <TablePager
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
      />
    </AdminSurface>

    <el-dialog
      v-model="dialogOpen"
      :title="isEdit ? 'Редактирование пользователя' : 'Новый пользователь'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-position="top">
        <div class="grid gap-1 sm:grid-cols-2 sm:gap-4">
          <el-form-item label="Имя">
            <el-input v-model="form.firstName" placeholder="Имя" maxlength="80" />
          </el-form-item>
          <el-form-item label="Фамилия">
            <el-input v-model="form.lastName" placeholder="Фамилия" maxlength="80" />
          </el-form-item>
        </div>

        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email" />
        </el-form-item>

        <el-form-item :label="isEdit ? 'Новый пароль' : 'Пароль'" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="isEdit ? 'Оставьте пустым, чтобы не менять' : ''"
          />
        </el-form-item>

        <div class="grid gap-1 sm:grid-cols-2 sm:gap-4">
          <el-form-item label="Пол">
            <el-select v-model="form.gender" clearable placeholder="Не указан" class="w-full">
              <el-option
                v-for="option in genderOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Дата рождения">
            <el-date-picker
              v-model="form.birthDate"
              type="date"
              value-format="YYYY-MM-DD"
              format="DD.MM.YYYY"
              placeholder="Выберите дату"
              class="!w-full"
            />
          </el-form-item>
        </div>

        <el-form-item label="Роль" prop="role">
          <el-select
            v-model="form.role"
            class="w-full"
            :disabled="isEdit && form.role === 'SUPERADMIN'"
          >
            <el-option
              v-for="option in roleOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
            <el-option
              v-if="isEdit && form.role === 'SUPERADMIN'"
              label="Суперадмин"
              value="SUPERADMIN"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogOpen = false">Отмена</el-button>
        <el-button type="primary" :loading="saving" @click="saveUser">
          {{ isEdit ? 'Сохранить' : 'Создать' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
