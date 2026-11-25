<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { icons } from '@/icons'
import { api } from '@/api/client'
import type { TaxonomyItem, TaxonomyKind } from '@/api/types'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/apiError'

const props = defineProps<{
  kind: TaxonomyKind
  placeholder?: string
}>()

const toast = useToast()
const { confirm } = useConfirm()

const items = ref<TaxonomyItem[]>([])
const loading = ref(false)
const saving = ref(false)
const newName = ref('')

async function load() {
  loading.value = true
  try {
    items.value = await api<TaxonomyItem[]>(`/api/admin/taxonomies?kind=${props.kind}`)
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось загрузить'))
  } finally {
    loading.value = false
  }
}

async function addItem() {
  const name = newName.value.trim()
  if (!name) {
    toast.error('Введите название')
    return
  }
  saving.value = true
  try {
    const created = await api<TaxonomyItem>('/api/admin/taxonomies', {
      method: 'POST',
      body: JSON.stringify({ kind: props.kind, name }),
    })
    items.value = [...items.value, created].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'),
    )
    newName.value = ''
    toast.success('Добавлено')
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось добавить'))
  } finally {
    saving.value = false
  }
}

async function renameItem(item: TaxonomyItem, name: string) {
  const next = name.trim()
  if (!next || next === item.name) return
  try {
    const updated = await api<TaxonomyItem>(`/api/admin/taxonomies/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: next }),
    })
    const idx = items.value.findIndex((row) => row.id === updated.id)
    if (idx >= 0) items.value[idx] = updated
    toast.success('Сохранено')
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось сохранить'))
    await load()
  }
}

async function removeItem(item: TaxonomyItem) {
  const ok = await confirm({
    title: 'Удалить?',
    message: `«${item.name}» будет удалено из справочника.`,
    confirmLabel: 'Удалить',
    danger: true,
  })
  if (!ok) return

  try {
    await api(`/api/admin/taxonomies/${item.id}`, { method: 'DELETE' })
    items.value = items.value.filter((row) => row.id !== item.id)
    toast.success('Удалено')
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось удалить'))
  }
}

watch(
  () => props.kind,
  () => {
    newName.value = ''
    void load()
  },
)

onMounted(() => {
  void load()
})
</script>

<template>
  <div>
    <form class="mb-5 flex flex-col gap-2 sm:flex-row" @submit.prevent="addItem">
      <el-input
        v-model="newName"
        :placeholder="placeholder"
        maxlength="60"
        show-word-limit
        class="sm:max-w-md"
      />
      <el-button type="primary" :icon="Plus" :loading="saving" native-type="submit">
        Добавить
      </el-button>
    </form>

    <div v-loading="loading">
      <el-empty
        v-if="!loading && !items.length"
        description="Список пуст — добавьте первое значение"
      />

      <ul v-else class="space-y-2">
        <li
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
        >
          <el-input
            :model-value="item.name"
            class="min-w-0 flex-1"
            @change="(value: string) => renameItem(item, value)"
          />
          <el-button
            text
            type="danger"
            :icon="icons.trash"
            title="Удалить"
            @click="removeItem(item)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
