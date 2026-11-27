<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import EditPublishSwitch from '@/components/ui/EditPublishSwitch.vue'
import NewsCardPreview from '@/components/news/NewsCardPreview.vue'
import AdminDateTimePicker from '@/components/ui/AdminDateTimePicker.vue'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { api } from '@/api/client'
import type { MediaItem, TaxonomyItem } from '@/api/types'
import { icons } from '@/icons'
import { useSavingIndicator } from '@/composables/useSavingIndicator'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/apiError'
import { formatDateTime } from '@/utils/format'
import { rules } from '@/utils/rules'
import { uploadMediaFile } from '@/utils/uploadMedia'

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')
  || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://impuls.esmolakov.ru')

const CYRILLIC: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function previewSlug(input: string) {
  const base = input
    .trim()
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return base || 'news'
}

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
const current = ref<MediaItem | null>(null)

const form = reactive({
  title: '',
  topic: '',
  description: '',
  body: '',
  published: true,
  publishAt: null as string | null,
  unpublishAt: null as string | null,
  file: null as File | null,
  preview: '',
  existingImageUrl: '',
})

const slugPreview = computed(() => current.value?.slug || previewSlug(form.title))
const siteNewsUrl = computed(() => `${SITE_URL}/news/${slugPreview.value}`)
const canOpenOnSite = computed(() => Boolean(current.value?.slug && form.published))

const previewItem = computed(() => ({
  title: form.title,
  topic: form.topic,
  description: form.description,
  imageUrl: form.preview || form.existingImageUrl || null,
  date: form.publishAt || current.value?.createdAt || new Date().toISOString(),
}))

/** Опорная дата создания: у существующей новости — createdAt, у новой — сейчас */
const createdAtAnchor = computed(() => {
  if (current.value?.createdAt) {
    const date = new Date(current.value.createdAt)
    if (!Number.isNaN(date.getTime())) return date
  }
  return new Date()
})

const publishAtMax = computed(() => {
  const max = new Date(createdAtAnchor.value)
  max.setFullYear(max.getFullYear() + 1)
  return max
})

const unpublishAtMin = computed(() => {
  if (form.publishAt) {
    const date = new Date(form.publishAt)
    if (!Number.isNaN(date.getTime())) return date
  }
  return createdAtAnchor.value
})

function isPublishAtInRange(date: Date) {
  const time = date.getTime()
  return time >= createdAtAnchor.value.getTime() && time <= publishAtMax.value.getTime()
}

watch(
  () => form.publishAt,
  (value) => {
    if (!value || !form.unpublishAt) return
    const start = new Date(value).getTime()
    const end = new Date(form.unpublishAt).getTime()
    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
      form.unpublishAt = null
    }
  },
)

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
  publishAt: [
    {
      validator: (_rule, value: string | null, callback) => {
        if (!value) {
          callback()
          return
        }
        const date = new Date(value)
        if (Number.isNaN(date.getTime()) || !isPublishAtInRange(date)) {
          callback(new Error('Не раньше создания и не позже чем через год'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
}))

const pageTitle = computed(() =>
  isCreate.value ? 'Новая новость' : current.value?.title || 'Редактирование новости',
)

const pageDescription = computed(() =>
  isCreate.value
    ? 'Обложка слева, заголовок и тема справа — затем текст новости.'
    : 'Обложка, заголовок, тема и публикация в одном блоке.',
)

function resetForm() {
  if (form.preview && form.preview.startsWith('blob:')) URL.revokeObjectURL(form.preview)
  form.title = ''
  form.topic = ''
  form.description = ''
  form.body = ''
  form.published = true
  form.publishAt = null
  form.unpublishAt = null
  form.file = null
  form.preview = ''
  form.existingImageUrl = ''
  current.value = null
}

async function load() {
  loading.value = true
  try {
    await loadTopics()
    if (!newsId.value) {
      if (!newsTopics.value.length) {
        toast.error('Сначала добавьте темы в разделе «Настройки»')
        await router.replace({ name: 'news' })
      }
      return
    }
    const item = await api<MediaItem>(`/api/admin/media/${newsId.value}`)
    if (item.type !== 'NEWS') {
      toast.error('Это не новость')
      await router.replace({ name: 'news' })
      return
    }
    current.value = item
    form.title = item.title
    form.topic = item.topic || ''
    form.description = item.description || ''
    form.body = item.body || ''
    form.published = item.published
    form.publishAt = item.publishAt || null
    form.unpublishAt = item.unpublishAt || null
    form.existingImageUrl = item.imageUrl
    form.preview = item.imageUrl
    form.file = null
    if (form.topic && !newsTopics.value.includes(form.topic)) {
      newsTopics.value = [...newsTopics.value, form.topic]
    }
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось загрузить'))
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
  form.preview = ''
  form.existingImageUrl = ''
  formRef.value?.validateField('file')
}

async function uploadIfNeeded() {
  if (!form.file) return form.existingImageUrl
  return uploadMediaFile(form.file)
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
      description: form.description.trim() || null,
      body: form.body,
      imageUrl,
      published: form.published,
      publishAt: form.publishAt,
      unpublishAt: form.unpublishAt,
    }

    if (newsId.value) {
      const updated = await api<MediaItem>(`/api/admin/media/${newsId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      current.value = updated
      form.existingImageUrl = updated.imageUrl
      form.preview = updated.imageUrl
      form.file = null
      toast.success('Сохранено')
    } else {
      const created = await api<MediaItem>('/api/admin/media', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      current.value = created
      form.existingImageUrl = created.imageUrl
      form.preview = created.imageUrl
      form.file = null
      toast.success('Новость создана')
      await router.replace({ name: 'news-edit', params: { id: created.id } })
    }
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось сохранить'))
  } finally {
    await stopSaving()
  }
}

function goBack() {
  router.push({ name: 'news' })
}

function openOnSite() {
  if (!canOpenOnSite.value) return
  window.open(siteNewsUrl.value, '_blank', 'noopener,noreferrer')
}

watch(newsId, (id) => {
  if (id && current.value?.id === id) return
  resetForm()
  void load()
})

onMounted(load)
onUnmounted(() => {
  if (form.preview && form.preview.startsWith('blob:')) URL.revokeObjectURL(form.preview)
})
</script>

<template>
  <div v-loading="loading" class="edit-page news-edit">
    <PageHeader :title="pageTitle" :description="pageDescription">
      <template #actions>
        <div class="edit-page__actions">
          <el-button
            v-if="canOpenOnSite"
            :icon="icons.global"
            :disabled="saving"
            @click="openOnSite"
          >
            На сайте
          </el-button>
          <el-button :icon="icons['arrow-left']" :disabled="saving" @click="goBack">
            К списку
          </el-button>
          <el-button
            type="primary"
            class="edit-page__save"
            :loading="showSaving"
            :disabled="saving && !showSaving"
            @click="save"
          >
            Сохранить
          </el-button>
        </div>
      </template>
    </PageHeader>

    <div
      class="edit-page__layout edit-page__layout--with-preview"
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

          <div class="news-edit__grid">
            <el-form-item prop="file" class="news-edit__cover" label="Обложка">
              <ImageUpload
                :preview="form.preview"
                aspect="card"
                fit="cover"
                tip="Как на сайте — 4:3. До 20 МБ → WebP."
                @change="onFileChange"
                @remove="onFileRemove"
              />
            </el-form-item>

            <div class="news-edit__side">
              <el-form-item label="Заголовок" prop="title">
                <el-input
                  v-model="form.title"
                  type="textarea"
                  :autosize="{ minRows: 3, maxRows: 5 }"
                  placeholder="Заголовок новости"
                />
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

              <el-form-item label="Анонс">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  maxlength="160"
                  show-word-limit
                  placeholder="Короткий текст для карточки и SEO (до 160 символов)"
                />
              </el-form-item>

              <el-form-item label="Публикация">
                <EditPublishSwitch v-model="form.published" />
              </el-form-item>

              <p class="news-edit__slug">
                Адрес: <code>/news/{{ slugPreview }}</code>
              </p>
              <p v-if="current?.createdAt" class="news-edit__created">
                Создано: <time :datetime="current.createdAt">{{ formatDateTime(current.createdAt) }}</time>
              </p>
            </div>
          </div>
        </section>

        <section class="edit-page__section">
          <p class="edit-page__section-title">Расписание</p>
          <p class="news-edit__hint">
            Публикация — от даты создания и не дальше года. Без дат: сразу при «Опубликовано».
          </p>
          <div class="news-edit__schedule">
            <el-form-item label="Дата публикации" prop="publishAt">
              <AdminDateTimePicker
                v-model="form.publishAt"
                placeholder="Сразу — ДД.ММ.ГГГГ ЧЧ:ММ"
                :min-date="createdAtAnchor"
                :max-date="publishAtMax"
              />
            </el-form-item>
            <el-form-item label="Снять с публикации" class="!mb-0">
              <AdminDateTimePicker
                v-model="form.unpublishAt"
                placeholder="Не снимать — ДД.ММ.ГГГГ ЧЧ:ММ"
                :min-date="unpublishAtMin"
              />
            </el-form-item>
          </div>
        </section>

        <section class="edit-page__section">
          <p class="edit-page__section-title">Текст</p>
          <el-form-item prop="body" class="!mb-0">
            <RichTextEditor v-model="form.body" placeholder="Текст новости…" />
          </el-form-item>
        </section>
      </el-form>

      <aside class="admin-panel edit-page__preview">
        <p class="edit-page__preview-label">Превью на сайте</p>
        <p class="edit-page__preview-hint">Как карточка в ленте новостей</p>
        <NewsCardPreview :item="previewItem" />
      </aside>
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
