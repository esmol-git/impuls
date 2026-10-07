<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import EditPageActions from '@/components/ui/EditPageActions.vue'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { api } from '@/api/client'
import type { MediaItem, TaxonomyItem } from '@/api/types'
import { useSavingIndicator } from '@/composables/useSavingIndicator'
import { useToast } from '@/composables/useToast'
import { rules } from '@/utils/rules'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { saving, showSaving, startSaving, stopSaving } = useSavingIndicator()

const newsId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' && id !== 'new' ? id : null
})
const isCreate = computed(() => !newsId.value)

const loading = ref(false)
const formRef = ref<FormInstance>()
const newsTopics = ref<string[]>([])

const form = reactive({
  title: '',
  topic: '',
  body: '',
  published: true,
  file: null as File | null,
  preview: '',
  existingImageUrl: '',
})

async function loadTopics() {
  try {
    const list = await api<TaxonomyItem[]>('/api/admin/taxonomies?kind=NEWS_TOPIC')
    newsTopics.value = list.map((item) => item.name)
  } catch {
    newsTopics.value = []
  }
}

const formRules = computed<FormRules>(() => ({
  title: rules.title,
  topic: rules.required('Тема'),
  body: rules.richText('Текст'),
  file: rules.imageOptionalWhenExisting(() => Boolean(form.existingImageUrl)),
}))

const pageTitle = computed(() => (isCreate.value ? 'Новая новость' : 'Редактирование новости'))

async function load() {
  loading.value = true
  try {
    await loadTopics()
    if (!newsId.value) return
    const item = await api<MediaItem>(`/api/admin/media/${newsId.value}`)
    if (item.type !== 'NEWS') {
      toast.error('Это не новость')
      await router.replace({ name: 'news' })
      return
    }
    form.title = item.title
    form.topic = item.topic || ''
    form.body = item.body || ''
    form.published = item.published
    form.existingImageUrl = item.imageUrl
    form.preview = item.imageUrl
    if (form.topic && !newsTopics.value.includes(form.topic)) {
      newsTopics.value = [...newsTopics.value, form.topic]
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось загрузить')
    await router.replace({ name: 'news' })
  } finally {
    loading.value = false
  }
}

function onFileChange(file: File | null) {
  form.file = file
  if (form.preview && form.preview.startsWith('blob:')) URL.revokeObjectURL(form.preview)
  form.preview = file ? URL.createObjectURL(file) : form.existingImageUrl
  formRef.value?.validateField('file')
}

function onFileRemove() {
  form.file = null
  if (form.preview && form.preview.startsWith('blob:')) URL.revokeObjectURL(form.preview)
  form.preview = form.existingImageUrl
  formRef.value?.validateField('file')
}

async function uploadIfNeeded() {
  if (!form.file) return form.existingImageUrl
  const body = new FormData()
  body.append('file', form.file)
  const uploaded = await api<{ url: string }>('/api/admin/media/upload', {
    method: 'POST',
    body,
  })
  return uploaded.url
}

async function save() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  startSaving()
  try {
    const imageUrl = await uploadIfNeeded()
    if (!imageUrl) {
      toast.error('Нужна обложка')
      return
    }

    const payload = {
      type: 'NEWS' as const,
      title: form.title.trim(),
      topic: form.topic.trim(),
      body: form.body,
      imageUrl,
      published: form.published,
    }

    if (newsId.value) {
      await api<MediaItem>(`/api/admin/media/${newsId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      toast.success('Сохранено')
    } else {
      await api<MediaItem>('/api/admin/media', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      toast.success('Новость создана')
    }

    await router.push({ name: 'news' })
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось сохранить')
  } finally {
    await stopSaving()
  }
}

function goBack() {
  router.push({ name: 'news' })
}

onMounted(load)
onUnmounted(() => {
  if (form.preview && form.preview.startsWith('blob:')) URL.revokeObjectURL(form.preview)
})
</script>

<template>
  <div v-loading="loading" class="edit-page news-edit">
    <PageHeader :title="pageTitle" description="Заполните поля и текст — обложка слева для быстрого превью.">
      <template #actions>
        <EditPageActions
          :saving="saving"
          :show-saving="showSaving"
          @back="goBack"
          @save="save"
        />
      </template>
    </PageHeader>

    <div
      class="edit-page__layout"
      :class="{
        'edit-page__layout--busy': saving,
        'edit-page__layout--saving': showSaving,
      }"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        class="admin-panel edit-page__form"
        require-asterisk-position="right"
      >
        <section class="edit-page__section">
          <p class="edit-page__section-title">Основное</p>
          <div class="news-edit__meta">
            <el-form-item label="Обложка" prop="file" class="news-edit__cover">
              <ImageUpload
                :preview="form.preview"
                aspect="wide"
                @change="onFileChange"
                @remove="onFileRemove"
              />
            </el-form-item>

            <div class="news-edit__fields">
              <el-form-item label="Заголовок" prop="title">
                <el-input v-model="form.title" placeholder="Заголовок новости" />
              </el-form-item>

              <el-form-item label="Тема" prop="topic">
                <el-select
                  v-model="form.topic"
                  filterable
                  placeholder="Выберите тему"
                  class="w-full"
                  :disabled="!newsTopics.length"
                >
                  <el-option
                    v-for="topic in newsTopics"
                    :key="topic"
                    :label="topic"
                    :value="topic"
                  />
                </el-select>
                <p v-if="!newsTopics.length" class="mt-1 text-xs text-slate-500">
                  Сначала добавьте темы в разделе «Настройки».
                </p>
              </el-form-item>

              <el-form-item label="Публикация" class="!mb-0">
                <div class="edit-page__publish">
                  <el-switch v-model="form.published" />
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-800">
                      {{ form.published ? 'Опубликовано' : 'Скрыто' }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ form.published ? 'Новость видна на сайте' : 'Только в админке' }}
                    </p>
                  </div>
                </div>
              </el-form-item>
            </div>
          </div>
        </section>

        <section class="edit-page__section">
          <p class="edit-page__section-title">Текст</p>
          <el-form-item prop="body" class="!mb-0">
            <RichTextEditor v-model="form.body" placeholder="Текст новости…" />
          </el-form-item>
        </section>
      </el-form>
    </div>

    <footer class="edit-page__bar">
      <el-button
        type="primary"
        class="edit-page__save"
        :loading="showSaving"
        :disabled="saving && !showSaving"
        @click="save"
      >
        Сохранить
      </el-button>
    </footer>
  </div>
</template>
