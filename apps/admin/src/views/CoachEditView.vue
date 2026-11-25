<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import EditPageActions from '@/components/ui/EditPageActions.vue'
import EditPublishSwitch from '@/components/ui/EditPublishSwitch.vue'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { api } from '@/api/client'
import type { Coach, TaxonomyItem } from '@/api/types'
import { useSavingIndicator } from '@/composables/useSavingIndicator'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/apiError'
import { formatYears, parseYears, yearsWord } from '@/utils/format'
import { rules } from '@/utils/rules'
import { uploadMediaFile } from '@/utils/uploadMedia'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { saving, showSaving, startSaving, stopSaving } = useSavingIndicator()

const coachId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' && id !== 'new' ? id : null
})
const isCreate = computed(() => !coachId.value)

const loading = ref(false)
const formRef = ref<FormInstance>()
const specialtyOptions = ref<string[]>([])
const current = ref<Coach | null>(null)

const form = reactive({
  name: '',
  role: '',
  experienceYears: null as number | null,
  bio: '',
  specialties: [] as string[],
  imageAlt: '',
  published: true,
  file: null as File | null,
  preview: '',
  existingImageUrl: '',
  clearImage: false,
})

const experienceSuffix = computed(() =>
  form.experienceYears == null ? 'лет' : yearsWord(form.experienceYears),
)

const formRules = computed<FormRules>(() => ({
  name: rules.title,
  experienceYears: [
    {
      validator: (_rule, value: number | null, callback) => {
        if (value == null || Number.isNaN(value as number)) {
          callback()
          return
        }
        if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1 || value > 60) {
          callback(new Error('От 1 до 60 лет'))
          return
        }
        callback()
      },
      trigger: ['blur', 'change'],
    },
  ],
}))

const pageTitle = computed(() =>
  isCreate.value ? 'Новый тренер' : current.value?.name || 'Редактирование тренера',
)

const pageDescription = computed(() =>
  isCreate.value
    ? 'Поля как на карточке тренера на сайте. Фото необязательно.'
    : 'Редактирование тренера. Фото необязательно.',
)

async function loadSpecialties() {
  try {
    const list = await api<TaxonomyItem[]>('/api/admin/taxonomies?kind=COACH_SPECIALTY')
    specialtyOptions.value = list.map((item) => item.name)
  } catch {
    specialtyOptions.value = []
  }
}

function resetForm() {
  if (form.preview && form.preview.startsWith('blob:')) URL.revokeObjectURL(form.preview)
  form.name = ''
  form.role = ''
  form.experienceYears = null
  form.bio = ''
  form.specialties = []
  form.imageAlt = ''
  form.published = true
  form.file = null
  form.preview = ''
  form.existingImageUrl = ''
  form.clearImage = false
  current.value = null
}

function applyCoach(item: Coach) {
  current.value = item
  form.name = item.name
  form.role = item.role || ''
  form.experienceYears = parseYears(item.experience)
  form.bio = item.bio || ''
  form.specialties = [...(item.specialties || [])]
  form.imageAlt = item.imageAlt || ''
  form.published = item.published
  form.existingImageUrl = item.imageUrl || ''
  form.preview = item.imageUrl || ''
  form.file = null
  form.clearImage = false
  for (const tag of form.specialties) {
    if (tag && !specialtyOptions.value.includes(tag)) {
      specialtyOptions.value = [...specialtyOptions.value, tag]
    }
  }
}

async function load() {
  loading.value = true
  try {
    await loadSpecialties()
    if (!coachId.value) return
    const item = await api<Coach>(`/api/admin/coaches/${coachId.value}`)
    applyCoach(item)
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось загрузить'))
    await router.replace({ name: 'coaches' })
  } finally {
    loading.value = false
  }
}

function onFileChange(file: File | null) {
  form.file = file
  form.clearImage = false
  if (form.preview && form.preview.startsWith('blob:')) URL.revokeObjectURL(form.preview)
  form.preview = file ? URL.createObjectURL(file) : form.existingImageUrl
}

function onFileRemove() {
  form.file = null
  if (form.preview && form.preview.startsWith('blob:')) URL.revokeObjectURL(form.preview)
  form.preview = ''
  form.clearImage = true
}

async function uploadIfNeeded() {
  if (!form.file) {
    if (form.clearImage) return null
    return form.existingImageUrl || null
  }
  return uploadMediaFile(form.file)
}

async function save() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  startSaving()
  try {
    const imageUrl = await uploadIfNeeded()
    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      experience: form.experienceYears == null ? '' : formatYears(form.experienceYears),
      bio: form.bio.trim(),
      specialties: form.specialties.map((item) => item.trim()).filter(Boolean),
      imageUrl,
      imageAlt: form.imageAlt.trim() || null,
      published: form.published,
    }

    if (coachId.value) {
      const updated = await api<Coach>(`/api/admin/coaches/${coachId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      applyCoach(updated)
      toast.success('Сохранено')
    } else {
      const created = await api<Coach>('/api/admin/coaches', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      applyCoach(created)
      toast.success('Тренер добавлен')
      await router.replace({ name: 'coaches-edit', params: { id: created.id } })
    }
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось сохранить'))
  } finally {
    await stopSaving()
  }
}

function goBack() {
  router.push({ name: 'coaches' })
}

watch(coachId, (id) => {
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
  <div v-loading="loading" class="edit-page coach-edit">
    <PageHeader :title="pageTitle" :description="pageDescription">
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

          <div class="coach-edit__meta">
            <el-form-item label="Фото" class="coach-edit__cover">
              <ImageUpload
                :preview="form.preview"
                aspect="portrait"
                tip="Портрет 3:4"
                @change="onFileChange"
                @remove="onFileRemove"
              />
            </el-form-item>

            <div class="coach-edit__fields">
              <div class="coach-edit__row">
                <el-form-item label="Имя" prop="name" class="coach-edit__grow">
                  <el-input v-model="form.name" maxlength="120" show-word-limit placeholder="Алексей Морозов" />
                </el-form-item>
                <el-form-item label="Стаж" prop="experienceYears" class="coach-edit__experience-item">
                  <el-input
                    v-model.number="form.experienceYears"
                    type="number"
                    inputmode="numeric"
                    min="1"
                    max="60"
                    step="1"
                    placeholder="—"
                    class="coach-edit__experience"
                    clearable
                  >
                    <template #append>{{ experienceSuffix }}</template>
                  </el-input>
                </el-form-item>
              </div>

              <el-form-item label="Роль" prop="role">
                <el-input v-model="form.role" maxlength="120" show-word-limit placeholder="Главный тренер · U10–U12" />
              </el-form-item>

              <el-form-item label="Подпись к фото">
                <el-input
                  v-model="form.imageAlt"
                  maxlength="200"
                  show-word-limit
                  placeholder="Тренер Алексей Морозов"
                />
              </el-form-item>

              <el-form-item label="Специализации">
                <el-select
                  v-model="form.specialties"
                  multiple
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="Выберите из справочника"
                  class="w-full"
                  :disabled="!specialtyOptions.length"
                >
                  <el-option
                    v-for="tag in specialtyOptions"
                    :key="tag"
                    :label="tag"
                    :value="tag"
                  />
                </el-select>
                <p v-if="!specialtyOptions.length" class="mt-1 text-xs text-slate-500">
                  Сначала добавьте специализации в «Настройки».
                </p>
              </el-form-item>

              <el-form-item label="Публикация" class="!mb-0">
                <EditPublishSwitch v-model="form.published" />
              </el-form-item>
            </div>
          </div>
        </section>

        <section class="edit-page__section">
          <p class="edit-page__section-title">О тренере</p>
          <el-form-item prop="bio" class="!mb-0">
            <RichTextEditor v-model="form.bio" placeholder="Опыт, подход, достижения…" />
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

<style scoped>
.coach-edit__meta {
  display: grid;
  gap: 1rem 1.25rem;
  margin-bottom: 0.25rem;
}

@media (min-width: 800px) {
  .coach-edit__meta {
    grid-template-columns: 200px minmax(0, 1fr);
    align-items: start;
  }
}

.coach-edit__cover :deep(.el-form-item__content) {
  display: block;
}

.coach-edit__fields {
  display: grid;
  gap: 0;
  min-width: 0;
}

.coach-edit__row {
  display: grid;
  gap: 0 0.75rem;
  align-items: start;
}

@media (min-width: 640px) {
  .coach-edit__row {
    grid-template-columns: minmax(0, 1fr) auto;
  }
}

.coach-edit__grow {
  min-width: 0;
}

.coach-edit__experience-item {
  width: 100%;
}

@media (min-width: 640px) {
  .coach-edit__experience-item {
    width: 168px;
  }
}

.coach-edit__experience :deep(.el-input-group__append) {
  min-width: 3.75rem;
  justify-content: center;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.coach-edit__experience :deep(input[type='number']) {
  appearance: textfield;
}

.coach-edit__experience :deep(input[type='number']::-webkit-outer-spin-button),
.coach-edit__experience :deep(input[type='number']::-webkit-inner-spin-button) {
  margin: 0;
  appearance: none;
}
</style>
