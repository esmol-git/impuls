<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { Loading, Plus } from '@element-plus/icons-vue'
import { icons } from '@/icons'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import TablePager from '@/components/ui/TablePager.vue'
import { api } from '@/api/client'
import type { MediaItem, MediaPage, MediaSortField, MediaType, SectionStatus } from '@/api/types'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/format'

const props = defineProps<{
  type: MediaType
  title: string
}>()

const toast = useToast()
const { confirm } = useConfirm()
const router = useRouter()
const usePageEditor = computed(() => props.type === 'NEWS')
/** Отзывы и галерея — сетка с drag&drop и загрузкой файлов */
const isShotGallery = computed(() => props.type === 'REVIEW' || props.type === 'GALLERY')
const isPhoneGallery = computed(() => props.type === 'REVIEW')

const items = ref<MediaItem[]>([])
const loading = ref(false)
const uploading = ref(false)
const reordering = ref(false)
const section = ref<SectionStatus | null>(null)
const sectionSaving = ref(false)
const fileInputKey = ref(0)
const replaceInput = ref<HTMLInputElement | null>(null)
const replaceTargetId = ref<string | null>(null)
/** Карточка, на которой крутится локальный спиннер замены */
const busyItemId = ref<string | null>(null)
const replacing = ref(false)
const dragId = ref<string | null>(null)
const dropTargetId = ref<string | null>(null)

const page = ref(1)
const pageSize = ref(props.type === 'REVIEW' || props.type === 'GALLERY' ? 24 : 10)
const newsPageSizes = [5, 10, 20, 50]
const shotPageSizes = [12, 24, 48]
const pageSizes = computed(() => (isShotGallery.value ? shotPageSizes : newsPageSizes))
const total = ref(0)
const sort = ref<MediaSortField>('createdAt')
const order = ref<'asc' | 'desc'>('desc')
const shotOffset = computed(() => (page.value - 1) * pageSize.value)

const pageCopy = computed(() => {
  if (props.type === 'NEWS') {
    return {
      description: 'Заголовок, тема, текст в редакторе и обложка новости.',
      empty: 'Пока нет новостей — добавьте первую.',
      add: 'Добавить новость',
    }
  }
  if (props.type === 'GALLERY') {
    return {
      description:
        'Фото для раздела «Галерея» на сайте. На главной — первые 6, на /gallery — все. Загрузка порциями; порядок меняйте перетаскиванием в пределах страницы. На сервере — WebP.',
      empty: 'Пока нет фото — нажмите «+», чтобы загрузить.',
      add: 'Добавить фото',
      defaultTitle: 'Фото',
      uploadHint: 'Квадрат или альбом · от 1200 px',
    }
  }
  return {
    description:
      'Скриншоты отзывов — так же будут выглядеть на сайте. Загрузка порциями; порядок — перетаскиванием в пределах страницы. Формат: вертикальный 9:19, от 1080×2280 px. На сервере — WebP.',
    empty: 'Пока нет скриншотов — нажмите «+», чтобы загрузить.',
    add: 'Добавить скриншот',
    defaultTitle: 'Отзыв',
    uploadHint: '9:19 · от 1080×2280',
  }
})

async function loadSection() {
  try {
    const list = await api<SectionStatus[]>('/api/admin/settings/sections')
    section.value = list.find((row) => row.key === props.type) || null
  } catch {
    section.value = null
  }
}

function buildListQuery() {
  const params = new URLSearchParams({
    type: props.type,
    page: String(page.value),
    limit: String(pageSize.value),
    sort: isShotGallery.value ? 'sortOrder' : sort.value,
    order: isShotGallery.value ? 'asc' : order.value,
  })
  return params.toString()
}

/** Игнор устаревших ответов при быстром переключении Галерея ↔ Отзывы */
let loadSeq = 0
/** Пока сбрасываем page/pageSize — не запускать watch → load */
let suppressPagerWatch = false

async function withPagerSuppressed(fn: () => void) {
  suppressPagerWatch = true
  try {
    fn()
  } finally {
    await nextTick()
    suppressPagerWatch = false
  }
}

async function load(options: { silent?: boolean } = {}) {
  const seq = ++loadSeq
  const typeAtStart = props.type
  if (!options.silent) loading.value = true
  try {
    const [media] = await Promise.all([
      api<MediaPage>(`/api/admin/media?${buildListQuery()}`),
      options.silent ? Promise.resolve() : loadSection(),
    ])
    if (seq !== loadSeq || typeAtStart !== props.type) return
    items.value = media.items
    total.value = media.meta.total
    if (page.value > media.meta.totalPages) {
      await withPagerSuppressed(() => {
        page.value = media.meta.totalPages
      })
    }
  } catch (e) {
    if (seq !== loadSeq || typeAtStart !== props.type) return
    if (!options.silent) {
      toast.error(e instanceof Error ? e.message : 'Ошибка загрузки')
    }
  } finally {
    if (seq === loadSeq) loading.value = false
  }
}

function onSortChange(payload: { prop: string; order: string | null }) {
  if (!payload.order) {
    sort.value = 'createdAt'
    order.value = 'desc'
  } else {
    sort.value = payload.prop as MediaSortField
    order.value = payload.order === 'ascending' ? 'asc' : 'desc'
  }
  if (page.value !== 1) page.value = 1
  else void load()
}

async function onSectionToggle(enabled: boolean) {
  if (!section.value?.canEnable && enabled) {
    toast.error('Сначала добавьте хотя бы один элемент')
    return
  }
  sectionSaving.value = true
  try {
    section.value = await api<SectionStatus>(`/api/admin/settings/sections/${props.type}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    })
    toast.success(enabled ? 'Раздел показывается на сайте' : 'Раздел скрыт на сайте')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось обновить')
    await loadSection()
  } finally {
    sectionSaving.value = false
  }
}

function openCreate() {
  if (usePageEditor.value) {
    router.push({ name: 'news-create' })
  }
}

function openEdit(item: MediaItem) {
  if (usePageEditor.value) {
    router.push({ name: 'news-edit', params: { id: item.id } })
  }
}

async function uploadShotFile(file: File) {
  uploading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    const uploaded = await api<{ url: string }>('/api/admin/media/upload', {
      method: 'POST',
      body,
    })
    await api<MediaItem>('/api/admin/media', {
      method: 'POST',
      body: JSON.stringify({
        type: props.type,
        title: pageCopy.value.defaultTitle || props.title,
        imageUrl: uploaded.url,
        published: true,
      }),
    })
    await loadSection()
    const nextTotal = total.value + 1
    const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize.value))
    if (page.value !== lastPage) {
      page.value = lastPage
    } else {
      await load({ silent: true })
    }
    toast.success(props.type === 'GALLERY' ? 'Фото добавлено' : 'Скриншот добавлен')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось загрузить')
  } finally {
    uploading.value = false
    fileInputKey.value += 1
  }
}

function onShotFileChange(uploadFile: UploadFile) {
  const raw = (uploadFile.raw || null) as UploadRawFile | null
  if (!raw) return
  void uploadShotFile(raw)
}

function openReplacePicker(item: MediaItem) {
  if (uploading.value || replacing.value || reordering.value) return
  replaceTargetId.value = item.id
  const input = replaceInput.value
  if (!input) return
  input.value = ''
  input.click()
}

async function onReplaceFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  const targetId = replaceTargetId.value
  replaceTargetId.value = null
  if (!file || !targetId) return
  await replaceShotFile(targetId, file)
}

async function replaceShotFile(itemId: string, file: File) {
  replacing.value = true
  busyItemId.value = itemId
  try {
    const body = new FormData()
    body.append('file', file)
    const uploaded = await api<{ url: string }>('/api/admin/media/upload', {
      method: 'POST',
      body,
    })
    const updated = await api<MediaItem>(`/api/admin/media/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        imageUrl: uploaded.url,
        imageUrls: [uploaded.url],
      }),
    })
    const idx = items.value.findIndex((row) => row.id === itemId)
    if (idx >= 0) items.value[idx] = updated
    toast.success(props.type === 'GALLERY' ? 'Фото заменено' : 'Скриншот заменён')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось заменить')
  } finally {
    replacing.value = false
    busyItemId.value = null
    if (replaceInput.value) replaceInput.value.value = ''
  }
}

function onShotDragStart(item: MediaItem, event: DragEvent) {
  dragId.value = item.id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.id)
  }
}

function onShotDragOver(item: MediaItem, event: DragEvent) {
  event.preventDefault()
  if (!dragId.value || dragId.value === item.id) return
  dropTargetId.value = item.id
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onShotDragLeave(item: MediaItem) {
  if (dropTargetId.value === item.id) dropTargetId.value = null
}

function onShotDragEnd() {
  dragId.value = null
  dropTargetId.value = null
}

async function persistShotOrder(next: MediaItem[]) {
  const prev = items.value
  items.value = next
  reordering.value = true
  try {
    await api<{ ok: boolean }>('/api/admin/media/reorder', {
      method: 'PATCH',
      body: JSON.stringify({
        type: props.type,
        ids: next.map((row) => row.id),
        offset: shotOffset.value,
      }),
    })
    await load({ silent: true })
  } catch (e) {
    items.value = prev
    toast.error(e instanceof Error ? e.message : 'Не удалось сохранить порядок')
  } finally {
    reordering.value = false
    dragId.value = null
    dropTargetId.value = null
  }
}

async function onShotDrop(target: MediaItem, event: DragEvent) {
  event.preventDefault()
  const sourceId = dragId.value || event.dataTransfer?.getData('text/plain')
  dropTargetId.value = null
  if (!sourceId || sourceId === target.id || reordering.value) {
    dragId.value = null
    return
  }

  const from = items.value.findIndex((row) => row.id === sourceId)
  const to = items.value.findIndex((row) => row.id === target.id)
  if (from < 0 || to < 0) {
    dragId.value = null
    return
  }

  const next = [...items.value]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  await persistShotOrder(next)
}

async function togglePublished(item: MediaItem) {
  try {
    const updated = await api<MediaItem>(`/api/admin/media/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ published: !item.published }),
    })
    const idx = items.value.findIndex((row) => row.id === item.id)
    if (idx >= 0) items.value[idx] = updated
    await loadSection()
    toast.success(updated.published ? 'Опубликовано' : 'Скрыто')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось обновить')
  }
}

async function removeItem(item: MediaItem) {
  const ok = await confirm({
    title: 'Удалить?',
    message: props.type === 'GALLERY'
      ? 'Фото будет удалено из галереи.'
      : props.type === 'REVIEW'
        ? 'Скриншот будет удалён из галереи отзывов.'
        : `«${item.title || 'элемент'}» будет удалён из раздела «${props.title}».`,
    confirmLabel: 'Удалить',
    danger: true,
  })
  if (!ok) return

  try {
    await api(`/api/admin/media/${item.id}`, { method: 'DELETE' })
    toast.success('Удалено')
    if (items.value.length === 1 && page.value > 1) {
      page.value -= 1
    } else {
      await load({ silent: true })
    }
    await loadSection()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось удалить')
  }
}

watch(pageSize, () => {
  if (suppressPagerWatch) return
  if (page.value !== 1) {
    void withPagerSuppressed(() => {
      page.value = 1
    }).then(() => load({ silent: isShotGallery.value }))
  } else {
    void load({ silent: isShotGallery.value })
  }
})

watch(page, () => {
  if (suppressPagerWatch) return
  // В галерее не перекрываем сетку белым лоадером при смене страницы
  void load({ silent: isShotGallery.value })
})

onMounted(load)
watch(
  () => props.type,
  async () => {
    // Router переиспользует MediaView — сразу чистим чужие картинки
    loadSeq += 1
    items.value = []
    total.value = 0
    section.value = null
    dragId.value = null
    dropTargetId.value = null
    busyItemId.value = null
    uploading.value = false
    replacing.value = false
    reordering.value = false
    sort.value = 'createdAt'
    order.value = 'desc'
    await withPagerSuppressed(() => {
      page.value = 1
      pageSize.value = props.type === 'REVIEW' || props.type === 'GALLERY' ? 24 : 10
    })
    void load()
  },
)
</script>

<template>
  <div>
    <PageHeader :title="props.title" :description="pageCopy.description">
      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <div
            class="section-switch"
            :class="{ 'is-disabled': !section?.canEnable }"
            :title="
              section?.canEnable
                ? 'Показывать раздел на сайте'
                : 'Добавьте контент, чтобы включить раздел'
            "
          >
            <span class="section-switch__label">На сайте</span>
            <el-switch
              :model-value="Boolean(section?.enabled && section?.canEnable)"
              :disabled="!section?.canEnable || sectionSaving"
              :loading="sectionSaving"
              @change="onSectionToggle"
            />
          </div>
          <el-button v-if="!isShotGallery" type="primary" @click="openCreate">
            {{ pageCopy.add }}
          </el-button>
        </div>
      </template>
    </PageHeader>

    <!-- Reviews / gallery: drag&drop image grid -->
    <div
      v-if="isShotGallery"
      v-loading="loading"
      element-loading-background="transparent"
    >
      <input
        ref="replaceInput"
        type="file"
        class="sr-only"
        accept="image/jpeg,image/png,image/webp,image/gif"
        tabindex="-1"
        @change="onReplaceFileChange"
      />
      <div :class="isPhoneGallery ? 'review-gallery' : 'photo-gallery'">
        <el-upload
          :key="fileInputKey"
          :class="[
            isPhoneGallery ? 'review-phone review-phone--add' : 'photo-tile photo-tile--add',
            { 'is-busy': uploading },
          ]"
          drag
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          accept="image/jpeg,image/png,image/webp,image/gif"
          :disabled="uploading || replacing || reordering"
          :on-change="onShotFileChange"
        >
          <template v-if="isPhoneGallery">
            <div class="review-phone__frame">
              <div class="review-phone__island" aria-hidden="true" />
              <div class="review-phone__screen review-phone__screen--add">
                <el-icon v-if="uploading" :size="28" class="shot-spin text-brand-500"><Loading /></el-icon>
                <template v-else>
                  <el-icon :size="28" class="text-brand-500"><Plus /></el-icon>
                  <span class="mt-2 text-sm font-medium text-slate-600">Добавить</span>
                  <span class="mt-1 px-3 text-center text-[11px] leading-snug text-slate-400">
                    {{ pageCopy.uploadHint }}
                  </span>
                </template>
                <span v-if="uploading" class="mt-2 text-sm font-medium text-slate-600">Загрузка…</span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="photo-tile__body photo-tile__body--add">
              <el-icon v-if="uploading" :size="28" class="shot-spin text-brand-500"><Loading /></el-icon>
              <template v-else>
                <el-icon :size="28" class="text-brand-500"><Plus /></el-icon>
                <span class="mt-2 text-sm font-medium text-slate-600">Добавить</span>
                <span class="mt-1 px-3 text-center text-[11px] leading-snug text-slate-400">
                  {{ pageCopy.uploadHint }}
                </span>
              </template>
              <span v-if="uploading" class="mt-2 text-sm font-medium text-slate-600">Загрузка…</span>
            </div>
          </template>
        </el-upload>

        <div
          v-for="item in items"
          :key="item.id"
          :class="[
            isPhoneGallery ? 'review-phone' : 'photo-tile',
            {
              'is-dragging': dragId === item.id,
              'is-drop-target': dropTargetId === item.id,
              'is-busy': busyItemId === item.id,
            },
          ]"
          draggable="true"
          @dragstart="onShotDragStart(item, $event)"
          @dragover="onShotDragOver(item, $event)"
          @dragleave="onShotDragLeave(item)"
          @drop="onShotDrop(item, $event)"
          @dragend="onShotDragEnd"
        >
          <template v-if="isPhoneGallery">
            <div class="review-phone__frame">
              <div class="review-phone__island" aria-hidden="true" />
              <div class="review-phone__screen">
                <img
                  :src="item.imageUrl"
                  :alt="item.title || 'Отзыв'"
                  class="review-phone__img"
                  draggable="false"
                />
              </div>
            </div>
            <span class="review-phone__handle" title="Перетащить">
              <el-icon :size="16"><component :is="icons['drag-move']" /></el-icon>
            </span>
            <div class="review-phone__actions">
              <button
                type="button"
                class="shot-action"
                title="Заменить"
                :disabled="replacing || uploading"
                @click.stop="openReplacePicker(item)"
                @mousedown.stop
              >
                <el-icon :size="16"><component :is="icons.redo" /></el-icon>
              </button>
              <button
                type="button"
                class="shot-action shot-action--danger"
                title="Удалить"
                @click.stop="removeItem(item)"
                @mousedown.stop
              >
                <el-icon :size="16"><component :is="icons.trash" /></el-icon>
              </button>
            </div>
            <div v-if="busyItemId === item.id" class="shot-busy" aria-hidden="true">
              <el-icon :size="22" class="shot-spin"><Loading /></el-icon>
            </div>
          </template>
          <template v-else>
            <div class="photo-tile__body">
              <img
                :src="item.imageUrl"
                :alt="item.title || 'Фото'"
                class="photo-tile__img"
                draggable="false"
              />
            </div>
            <span class="photo-tile__handle" title="Перетащить">
              <el-icon :size="16"><component :is="icons['drag-move']" /></el-icon>
            </span>
            <div class="photo-tile__actions">
              <button
                type="button"
                class="shot-action"
                title="Заменить"
                :disabled="replacing || uploading"
                @click.stop="openReplacePicker(item)"
                @mousedown.stop
              >
                <el-icon :size="16"><component :is="icons.redo" /></el-icon>
              </button>
              <button
                type="button"
                class="shot-action shot-action--danger"
                title="Удалить"
                @click.stop="removeItem(item)"
                @mousedown.stop
              >
                <el-icon :size="16"><component :is="icons.trash" /></el-icon>
              </button>
            </div>
            <div v-if="busyItemId === item.id" class="shot-busy" aria-hidden="true">
              <el-icon :size="22" class="shot-spin"><Loading /></el-icon>
            </div>
          </template>
        </div>
      </div>
      <p v-if="!loading && !items.length" class="mt-4 text-sm text-slate-500">
        {{ pageCopy.empty }}
      </p>
      <TablePager
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
      />
    </div>

    <!-- News table -->
    <el-card v-else shadow="never" class="!border-slate-200">
      <el-table
        v-loading="loading"
        :data="items"
        stripe
        :empty-text="pageCopy.empty"
        class="news-table"
        :default-sort="{ prop: 'createdAt', order: 'descending' }"
        @row-click="openEdit"
        @sort-change="onSortChange"
      >
        <el-table-column label="Обложка" width="96">
          <template #default="{ row }">
            <div class="news-table__thumb">
              <img :src="row.imageUrl" :alt="row.title" />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="Новость" min-width="200" sortable="custom">
          <template #default="{ row }">
            <button type="button" class="news-table__title" @click.stop="openEdit(row)">
              {{ row.title }}
            </button>
          </template>
        </el-table-column>

        <el-table-column prop="topic" label="Тема" width="160" sortable="custom">
          <template #default="{ row }">
            <el-tag v-if="row.topic" size="small" type="danger" effect="light">
              {{ row.topic }}
            </el-tag>
            <span v-else class="text-slate-400">—</span>
          </template>
        </el-table-column>

        <el-table-column prop="published" label="Статус" width="130" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="row.published ? 'success' : 'info'" size="small">
              {{ row.published ? 'Опубликовано' : 'Скрыто' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="Дата" width="140" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="Действия" width="136" align="right" fixed="right">
          <template #default="{ row }">
            <div class="admin-table__actions" @click.stop>
              <button
                type="button"
                class="admin-table__action"
                title="Изменить"
                aria-label="Изменить"
                @click="openEdit(row)"
              >
                <el-icon :size="18"><component :is="icons.edit" /></el-icon>
              </button>
              <button
                type="button"
                class="admin-table__action"
                :title="row.published ? 'Скрыть' : 'Показать'"
                :aria-label="row.published ? 'Скрыть' : 'Показать'"
                @click="togglePublished(row)"
              >
                <el-icon :size="18">
                  <component :is="row.published ? icons.lock : icons.unlock" />
                </el-icon>
              </button>
              <button
                type="button"
                class="admin-table__action admin-table__action--danger"
                title="Удалить"
                aria-label="Удалить"
                @click="removeItem(row)"
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
        :page-sizes="newsPageSizes"
      />
    </el-card>
  </div>
</template>

<style scoped>
.news-table {
  --el-table-row-hover-bg-color: rgb(248 250 252);
}

.news-table :deep(.el-table__row) {
  cursor: pointer;
}

.news-table__thumb {
  width: 64px;
  height: 48px;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(241 245 249);
}

.news-table__thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-table__title {
  border: 0;
  background: transparent;
  padding: 0;
  color: #0b2a5b;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.news-table__title:hover {
  color: var(--el-color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.review-gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 0.85rem;
  align-items: start;
}

@media (min-width: 640px) {
  .review-gallery {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem 1rem;
  }
}

@media (min-width: 1024px) {
  .review-gallery {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .review-gallery {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.review-phone {
  position: relative;
  width: 100%;
  max-width: 220px;
  margin-inline: auto;
  cursor: grab;
  user-select: none;
  filter: drop-shadow(0 16px 28px rgb(15 23 42 / 14%));
  transition:
    opacity 0.15s ease,
    filter 0.15s ease,
    transform 0.15s ease;
}

.review-phone:active {
  cursor: grabbing;
}

.review-phone.is-dragging {
  opacity: 0.45;
}

.review-phone.is-drop-target {
  transform: translateY(-2px);
  filter: drop-shadow(0 18px 32px rgb(37 99 235 / 28%));
}

.review-phone--add {
  cursor: pointer;
}

.review-phone--add :deep(.el-upload),
.review-phone--add :deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
}

.review-phone__frame {
  position: relative;
  aspect-ratio: 9 / 19.2;
  padding: 8px;
  border-radius: 1.85rem;
  background: linear-gradient(160deg, #3a3a3c 0%, #1c1c1e 45%, #0a0a0a 100%);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 12%),
    inset 0 0 0 2px #111;
}

.review-phone__island {
  position: absolute;
  top: 14px;
  left: 50%;
  z-index: 3;
  width: 28%;
  height: 14px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #0a0a0a;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 6%);
  pointer-events: none;
}

.review-phone__screen {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 1.45rem;
  background: #fff;
}

.review-phone__screen--add {
  flex-direction: column;
  border: 1.5px dashed rgb(148 163 184 / 70%);
  background: rgb(248 250 252);
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.review-phone--add:hover .review-phone__screen--add {
  border-color: var(--el-color-primary);
  background: rgb(239 246 255);
}

.review-phone__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  pointer-events: none;
  -webkit-user-drag: none;
}

.review-phone__handle {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgb(15 23 42 / 55%);
  color: #fff;
  pointer-events: none;
}

.review-phone__actions,
.photo-tile__actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 4;
  display: inline-flex;
  gap: 4px;
}

.review-phone__actions {
  top: 14px;
  right: 14px;
}

.shot-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: rgb(15 23 42 / 72%);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
}

.shot-action:hover {
  background: var(--el-color-primary);
}

.shot-action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.shot-action--danger:hover {
  background: var(--el-color-danger);
}

.shot-spin {
  animation: shot-spin 0.7s linear infinite;
}

@keyframes shot-spin {
  to {
    transform: rotate(360deg);
  }
}

.shot-busy {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-items: center;
  border-radius: inherit;
  background: rgb(15 23 42 / 35%);
  color: #fff;
  pointer-events: none;
}

.photo-tile.is-busy,
.review-phone.is-busy {
  pointer-events: none;
}

.photo-tile--add.is-busy,
.review-phone--add.is-busy {
  opacity: 0.85;
}

.photo-gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

@media (min-width: 640px) {
  .photo-gallery {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
}

@media (min-width: 1024px) {
  .photo-gallery {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .photo-gallery {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.photo-tile {
  position: relative;
  cursor: grab;
  user-select: none;
  border-radius: 1rem;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.photo-tile:active {
  cursor: grabbing;
}

.photo-tile.is-dragging {
  opacity: 0.45;
}

.photo-tile.is-drop-target {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgb(37 99 235 / 22%);
}

.photo-tile--add {
  cursor: pointer;
}

.photo-tile--add :deep(.el-upload),
.photo-tile--add :deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
}

.photo-tile__body {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 10px 24px rgb(15 23 42 / 10%);
}

.photo-tile__body--add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1.5px dashed rgb(148 163 184 / 70%);
  background: rgb(248 250 252);
  box-shadow: none;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.photo-tile--add:hover .photo-tile__body--add {
  border-color: var(--el-color-primary);
  background: rgb(239 246 255);
}

.photo-tile__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  -webkit-user-drag: none;
}

.photo-tile__handle {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgb(15 23 42 / 55%);
  color: #fff;
  pointer-events: none;
}

.section-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 10px;
  background: #fff;
}

.section-switch__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgb(51 65 85);
}

.section-switch.is-disabled {
  opacity: 0.65;
}

.section-switch.is-disabled .section-switch__label {
  color: rgb(148 163 184);
}
</style>
