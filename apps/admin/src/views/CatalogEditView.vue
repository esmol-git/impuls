<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { icons } from '@/icons'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import EditPageActions from '@/components/ui/EditPageActions.vue'
import MultiImageUpload, { type GalleryImage } from '@/components/ui/MultiImageUpload.vue'
import CatalogCardPreview from '@/components/catalog/CatalogCardPreview.vue'
import { api } from '@/api/client'
import type { MediaItem, TaxonomyItem } from '@/api/types'
import { useSavingIndicator } from '@/composables/useSavingIndicator'
import { useToast } from '@/composables/useToast'
import { rules } from '@/utils/rules'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { saving, showSaving, startSaving, stopSaving } = useSavingIndicator()

const productId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' && id !== 'new' ? id : null
})
const isCreate = computed(() => !productId.value)

const loading = ref(false)
const formRef = ref<FormInstance>()
const salePriceManual = ref(false)
const skuManual = ref(false)
const catalogCategories = ref<string[]>([])
const current = ref<MediaItem | null>(null)

function generateSku() {
  const stamp = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `IMP-${stamp}${rand}`.slice(0, 64)
}

function enableSkuManual() {
  skuManual.value = true
}

const form = reactive({
  title: '',
  category: '',
  sku: '',
  quantity: null as number | null,
  description: '',
  price: null as number | null,
  discount: null as number | null,
  salePrice: null as number | null,
  published: true,
  gallery: [] as GalleryImage[],
})

const formRules = computed<FormRules>(() => ({
  title: [
    { required: true, message: 'Введите название', trigger: 'blur' },
    { min: 2, message: 'Слишком короткое название', trigger: 'blur' },
    { max: 40, message: 'Максимум 40 символов', trigger: 'blur' },
  ],
  category: rules.required('Категория'),
  sku: rules.required('Артикул'),
  description: [
    { max: 200, message: 'Максимум 200 символов', trigger: 'blur' },
  ],
  price: rules.price,
  gallery: [
    {
      validator: (_rule, value: GalleryImage[], callback) => {
        if (!value?.length) {
          callback(new Error('Добавьте хотя бы одно фото'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
}))

const pageTitle = computed(() =>
  isCreate.value ? 'Новый товар' : current.value?.title || 'Редактирование товара',
)

const pageDescription = computed(() =>
  isCreate.value
    ? 'Заполните карточку — справа сразу видно, как товар будет выглядеть на сайте.'
    : 'Редактирование товара. Справа — превью карточки каталога.',
)

const previewItem = computed(() => ({
  id: productId.value || 'preview',
  title: form.title.trim(),
  category: form.category.trim() || null,
  description: form.description.trim() || null,
  price: form.price,
  discount: form.discount,
  salePrice: form.salePrice,
  imageUrls: form.gallery.map((image) => image.url).filter(Boolean),
}))

async function loadCategories() {
  try {
    const list = await api<TaxonomyItem[]>('/api/admin/taxonomies?kind=CATALOG_CATEGORY')
    catalogCategories.value = list.map((item) => item.name)
  } catch {
    catalogCategories.value = []
  }
}

function galleryFromItem(item: MediaItem): GalleryImage[] {
  const urls = item.imageUrls?.length ? item.imageUrls : item.imageUrl ? [item.imageUrl] : []
  return urls.map((url, index) => ({
    key: `${item.id}-${index}`,
    url,
  }))
}

function resetGallery() {
  for (const image of form.gallery) {
    if (image.url.startsWith('blob:')) URL.revokeObjectURL(image.url)
  }
  form.gallery = []
}

function recalcSalePrice() {
  if (salePriceManual.value) return
  if (form.price == null || form.discount == null || form.discount <= 0) {
    form.salePrice = null
    return
  }
  form.salePrice = Math.round((form.price * (100 - form.discount)) / 100)
}

async function load() {
  loading.value = true
  try {
    await loadCategories()
    if (!productId.value) {
      if (!catalogCategories.value.length) {
        toast.error('Сначала добавьте категории в разделе «Настройки»')
        await router.replace({ name: 'catalog' })
      }
      skuManual.value = false
      form.sku = generateSku()
      return
    }

    const item = await api<MediaItem>(`/api/admin/media/${productId.value}`)
    if (item.type !== 'CATALOG') {
      toast.error('Это не товар каталога')
      await router.replace({ name: 'catalog' })
      return
    }

    current.value = item
    form.title = item.title
    form.category = item.category || ''
    form.sku = item.sku || ''
    form.quantity = item.quantity ?? null
    form.description = item.description || ''
    form.price = item.price ?? null
    form.discount = item.discount ?? null
    form.salePrice = item.salePrice ?? null
    form.published = item.published
    form.gallery = galleryFromItem(item)
    skuManual.value = false
    salePriceManual.value = Boolean(item.salePrice != null && item.discount == null)
    if (form.category && !catalogCategories.value.includes(form.category)) {
      catalogCategories.value = [...catalogCategories.value, form.category]
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось загрузить')
    await router.replace({ name: 'catalog' })
  } finally {
    loading.value = false
  }
}

async function uploadFile(file: File) {
  const body = new FormData()
  body.append('file', file)
  const uploaded = await api<{ url: string }>('/api/admin/media/upload', {
    method: 'POST',
    body,
  })
  return uploaded.url
}

async function uploadGallery(): Promise<string[]> {
  const urls: string[] = []
  for (const image of form.gallery) {
    if (image.file) urls.push(await uploadFile(image.file))
    else if (image.url) urls.push(image.url)
  }
  return urls
}

async function save() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  startSaving()
  try {
    const imageUrls = await uploadGallery()
    const imageUrl = imageUrls[0] || ''
    if (!imageUrl) {
      toast.error('Нужна хотя бы одна картинка')
      return
    }

    const payload = {
      type: 'CATALOG' as const,
      title: form.title.trim(),
      category: form.category.trim(),
      sku: form.sku.trim(),
      quantity: form.quantity,
      description: form.description.trim(),
      imageUrl,
      imageUrls,
      price: form.price,
      discount: form.discount,
      salePrice: form.salePrice,
      published: form.published,
    }

    if (productId.value) {
      const updated = await api<MediaItem>(`/api/admin/media/${productId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      current.value = updated
      toast.success('Сохранено')
    } else {
      const created = await api<MediaItem>('/api/admin/media', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      current.value = created
      form.sku = created.sku || form.sku
      skuManual.value = false
      toast.success('Товар создан')
      await router.replace({ name: 'catalog-edit', params: { id: created.id } })
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось сохранить')
  } finally {
    await stopSaving()
  }
}

function goBack() {
  router.push({ name: 'catalog' })
}

watch(
  () => [form.price, form.discount] as const,
  () => recalcSalePrice(),
)

watch(productId, (id) => {
  if (id && current.value?.id === id) return

  resetGallery()
  current.value = null
  form.title = ''
  form.category = ''
  form.sku = ''
  form.quantity = null
  form.description = ''
  form.price = null
  form.discount = null
  form.salePrice = null
  form.published = true
  salePriceManual.value = false
  skuManual.value = false
  void load()
})

onMounted(load)
onUnmounted(resetGallery)
</script>

<template>
  <div v-loading="loading" class="edit-page catalog-edit">
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

          <el-form-item label="Название" prop="title">
            <el-input
              v-model="form.title"
              placeholder="Название товара"
              maxlength="40"
              show-word-limit
            />
          </el-form-item>

          <div class="catalog-edit__meta-row">
            <el-form-item label="Артикул" prop="sku">
              <div class="flex w-full items-center gap-2">
                <el-input
                  v-model="form.sku"
                  placeholder="Уникальный код товара"
                  maxlength="64"
                  :show-word-limit="skuManual"
                  :readonly="!skuManual"
                  :class="{ 'sku-input--locked': !skuManual }"
                />
                <el-button
                  v-if="!skuManual"
                  :icon="icons.edit"
                  title="Изменить артикул"
                  aria-label="Изменить артикул"
                  @click="enableSkuManual"
                />
              </div>
            </el-form-item>
            <el-form-item label="Количество">
              <el-input-number
                v-model="form.quantity"
                :min="0"
                :step="1"
                :controls="false"
                class="!w-full"
                placeholder="Необязательно"
              />
            </el-form-item>
            <el-form-item label="Публикация">
              <div class="edit-page__publish catalog-edit__publish-inline">
                <el-switch v-model="form.published" />
                <span class="text-sm font-semibold text-slate-800">
                  {{ form.published ? 'Опубликован' : 'Скрыт' }}
                </span>
              </div>
            </el-form-item>
          </div>

          <el-form-item label="Категория" prop="category">
            <el-select
              v-model="form.category"
              filterable
              placeholder="Выберите категорию"
              class="w-full"
              :disabled="!catalogCategories.length"
            >
              <el-option
                v-for="category in catalogCategories"
                :key="category"
                :label="category"
                :value="category"
              />
            </el-select>
            <p v-if="!catalogCategories.length" class="mt-1 text-xs text-slate-500">
              Сначала добавьте категории в разделе «Настройки».
            </p>
          </el-form-item>

          <el-form-item label="Описание" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              maxlength="200"
              show-word-limit
              placeholder="Краткое описание товара"
            />
          </el-form-item>
        </section>

        <section class="edit-page__section">
          <p class="edit-page__section-title">Цена</p>
          <div class="catalog-edit__price-row">
            <el-form-item label="Цена" prop="price">
              <div class="unit-field">
                <el-input-number
                  v-model="form.price"
                  :min="0"
                  :step="100"
                  :controls="false"
                  class="!w-full"
                />
                <span class="unit-field__suffix" aria-hidden="true">₽</span>
              </div>
            </el-form-item>
            <el-form-item label="Скидка">
              <div class="unit-field">
                <el-input-number
                  v-model="form.discount"
                  :min="0"
                  :max="100"
                  :controls="false"
                  class="!w-full"
                  @change="salePriceManual = false"
                />
                <span class="unit-field__suffix" aria-hidden="true">%</span>
              </div>
            </el-form-item>
            <el-form-item label="Цена со скидкой">
              <div class="unit-field">
                <el-input-number
                  v-model="form.salePrice"
                  :min="0"
                  :step="100"
                  :controls="false"
                  class="!w-full"
                  @change="salePriceManual = true"
                />
                <span class="unit-field__suffix" aria-hidden="true">₽</span>
              </div>
            </el-form-item>
          </div>
        </section>

        <section class="edit-page__section">
          <p class="edit-page__section-title">Фотографии</p>
          <el-form-item prop="gallery">
            <MultiImageUpload
              v-model="form.gallery"
              @update:model-value="formRef?.validateField('gallery')"
            />
          </el-form-item>
        </section>
      </el-form>

      <aside class="admin-panel edit-page__preview">
        <p class="edit-page__preview-label">Превью на сайте</p>
        <p class="edit-page__preview-hint">Как карточка в каталоге</p>
        <CatalogCardPreview :item="previewItem" />
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

<style scoped>
.catalog-edit__meta-row,
.catalog-edit__price-row {
  display: grid;
  gap: 1rem;
}

/* Поля раньше в столбик — превью-карточку не трогаем */
@media (min-width: 1200px) {
  .catalog-edit__meta-row {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(160px, 1fr);
    align-items: start;
  }

  .catalog-edit__price-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.catalog-edit__publish-inline {
  min-height: 42px;
  height: 42px;
  padding-top: 0;
  padding-bottom: 0;
}

.sku-input--locked :deep(.el-input__wrapper) {
  background: rgb(248 250 252);
}

.unit-field {
  position: relative;
  width: 100%;
}

.unit-field :deep(.el-input__wrapper) {
  padding-right: 2rem !important;
}

.unit-field__suffix {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 600;
  pointer-events: none;
  line-height: 1;
}
</style>
