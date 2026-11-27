<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { icons } from '@/icons'
import { useRouter } from 'vue-router'
import NewsMediaTable from '@/components/media/NewsMediaTable.vue'
import ShotGalleryBoard from '@/components/media/ShotGalleryBoard.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionSiteSwitch from '@/components/ui/SectionSiteSwitch.vue'
import { api } from '@/api/client'
import type { MediaItem, MediaPage, MediaSortField, MediaType } from '@/api/types'
import { useConfirm } from '@/composables/useConfirm'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch'
import { usePublishedFilter } from '@/composables/usePublishedFilter'
import { useSectionVisibility } from '@/composables/useSectionVisibility'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/apiError'
import { mediaPageCopy } from '@/utils/mediaPageCopy'
import { uploadMediaFile } from '@/utils/uploadMedia'

const props = defineProps<{
  type: MediaType
  title: string
}>()

const toast = useToast()
const { confirm } = useConfirm()
const router = useRouter()

const usePageEditor = computed(() => props.type === 'NEWS')
const isShotGallery = computed(() => props.type === 'REVIEW' || props.type === 'GALLERY')
const shotVariant = computed<'phone' | 'photo'>(() =>
  props.type === 'REVIEW' ? 'phone' : 'photo',
)

const items = ref<MediaItem[]>([])
const loading = ref(false)
const uploading = ref(false)
const reordering = ref(false)
const replacing = ref(false)
const busyItemId = ref<string | null>(null)
const copyingId = ref<string | null>(null)
const fileInputKey = ref(0)

const { section, sectionSaving, loadSection, onSectionToggle } = useSectionVisibility(() => props.type)
const { searchInput, search, onSearchInput, clearSearch, resetSearch } = useDebouncedSearch()
const { publishedFilter, publishedFilterOptions, applyPublishedParam } = usePublishedFilter()

const page = ref(1)
const pageSize = ref(isShotGallery.value ? 24 : 10)
const newsPageSizes = [5, 10, 20, 50]
const shotPageSizes = [12, 24, 48]
const pageSizes = computed(() => (isShotGallery.value ? shotPageSizes : newsPageSizes))
const total = ref(0)
const sort = ref<MediaSortField>('createdAt')
const order = ref<'asc' | 'desc'>('desc')
const shotOffset = computed(() => (page.value - 1) * pageSize.value)
const pageCopy = computed(() => mediaPageCopy(props.type, props.title))

let loadSeq = 0
let suppressPagerWatch = false
let suppressSearchWatch = false

async function withPagerSuppressed(fn: () => void) {
  suppressPagerWatch = true
  try {
    fn()
  } finally {
    await nextTick()
    suppressPagerWatch = false
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
  if (search.value) params.set('q', search.value)
  applyPublishedParam(params)
  return params.toString()
}

const emptyText = computed(() =>
  search.value || publishedFilter.value !== 'ALL' ? 'Ничего не найдено' : pageCopy.value.empty,
)

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
    if (page.value > media.meta.totalPages && media.meta.totalPages > 0) {
      await withPagerSuppressed(() => {
        page.value = media.meta.totalPages
      })
    }
  } catch (e) {
    if (seq !== loadSeq || typeAtStart !== props.type) return
    if (!options.silent) {
      toast.error(getErrorMessage(e, 'Ошибка загрузки'))
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

function openCreate() {
  if (usePageEditor.value) router.push({ name: 'news-create' })
}

function openEdit(item: MediaItem) {
  if (usePageEditor.value) router.push({ name: 'news-edit', params: { id: item.id } })
}

async function uploadShotFile(file: File) {
  uploading.value = true
  try {
    const imageUrl = await uploadMediaFile(file)
    await api<MediaItem>('/api/admin/media', {
      method: 'POST',
      body: JSON.stringify({
        type: props.type,
        title: pageCopy.value.defaultTitle || props.title,
        imageUrl,
        published: true,
      }),
    })
    await loadSection()
    const nextTotal = total.value + 1
    const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize.value))
    if (page.value !== lastPage) page.value = lastPage
    else await load({ silent: true })
    toast.success(props.type === 'GALLERY' ? 'Фото добавлено' : 'Скриншот добавлен')
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось загрузить'))
  } finally {
    uploading.value = false
    fileInputKey.value += 1
  }
}

async function replaceShotFile(itemId: string, file: File) {
  replacing.value = true
  busyItemId.value = itemId
  try {
    const imageUrl = await uploadMediaFile(file)
    const updated = await api<MediaItem>(`/api/admin/media/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ imageUrl, imageUrls: [imageUrl] }),
    })
    const idx = items.value.findIndex((row) => row.id === itemId)
    if (idx >= 0) items.value[idx] = updated
    toast.success(props.type === 'GALLERY' ? 'Фото заменено' : 'Скриншот заменён')
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось заменить'))
  } finally {
    replacing.value = false
    busyItemId.value = null
  }
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
    toast.error(getErrorMessage(e, 'Не удалось сохранить порядок'))
  } finally {
    reordering.value = false
  }
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
    toast.error(getErrorMessage(e, 'Не удалось обновить'))
  }
}

async function copyNewsItem(item: MediaItem) {
  if (props.type !== 'NEWS') return

  const ok = await confirm({
    title: 'Создать копию?',
    message: `Будет создана скрытая новость «${item.title} (копия)» с тем же текстом и обложкой.`,
    confirmLabel: 'Создать копию',
  })
  if (!ok) return

  copyingId.value = item.id
  try {
    // В списке нет body — подтягиваем полную карточку
    const full = await api<MediaItem>(`/api/admin/media/${item.id}`)
    const created = await api<MediaItem>('/api/admin/media', {
      method: 'POST',
      body: JSON.stringify({
        type: 'NEWS',
        title: `${full.title} (копия)`,
        topic: full.topic,
        description: full.description,
        body: full.body,
        imageUrl: full.imageUrl,
        published: false,
        publishAt: null,
        unpublishAt: null,
      }),
    })
    toast.success('Копия создана')
    await router.push({ name: 'news-edit', params: { id: created.id } })
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось создать копию'))
  } finally {
    copyingId.value = null
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
    if (items.value.length === 1 && page.value > 1) page.value -= 1
    else await load({ silent: true })
    await loadSection()
  } catch (e) {
    toast.error(getErrorMessage(e, 'Не удалось удалить'))
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
  void load({ silent: isShotGallery.value })
})

watch([search, publishedFilter], async () => {
  if (suppressSearchWatch) return
  if (page.value !== 1) {
    await withPagerSuppressed(() => {
      page.value = 1
    })
  }
  void load({ silent: isShotGallery.value })
})

onMounted(load)

watch(
  () => props.type,
  async () => {
    loadSeq += 1
    items.value = []
    total.value = 0
    section.value = null
    busyItemId.value = null
    uploading.value = false
    replacing.value = false
    reordering.value = false
    sort.value = 'createdAt'
    order.value = 'desc'
    suppressSearchWatch = true
    resetSearch()
    publishedFilter.value = 'ALL'
    suppressSearchWatch = false
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
          <el-input
            :model-value="searchInput"
            class="w-56 sm:w-64"
            clearable
            placeholder="Название, тема…"
            :prefix-icon="icons.search"
            @update:model-value="onSearchInput"
            @clear="clearSearch"
          />
          <el-select v-model="publishedFilter" class="w-36">
            <el-option
              v-for="option in publishedFilterOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <SectionSiteSwitch
            :section="section"
            :saving="sectionSaving"
            @change="onSectionToggle"
          />
          <el-button
            v-if="!isShotGallery"
            type="primary"
            :icon="Plus"
            @click="openCreate"
          >
            {{ pageCopy.add }}
          </el-button>
        </div>
      </template>
    </PageHeader>

    <ShotGalleryBoard
      v-if="isShotGallery"
      v-model:page="page"
      v-model:page-size="pageSize"
      :items="items"
      :loading="loading"
      :uploading="uploading"
      :replacing="replacing"
      :reordering="reordering"
      :busy-item-id="busyItemId"
      :file-input-key="fileInputKey"
      :upload-hint="pageCopy.uploadHint || ''"
      :empty-text="emptyText"
      :variant="shotVariant"
      :total="total"
      :page-sizes="pageSizes"
      @upload="uploadShotFile"
      @replace="replaceShotFile"
      @remove="removeItem"
      @reorder="persistShotOrder"
      @toggle-published="togglePublished"
    />

    <NewsMediaTable
      v-else
      v-model:page="page"
      v-model:page-size="pageSize"
      :items="items"
      :loading="loading"
      :empty-text="emptyText"
      :total="total"
      :page-sizes="newsPageSizes"
      :copying-id="copyingId"
      @edit="openEdit"
      @copy="copyNewsItem"
      @toggle-published="togglePublished"
      @remove="removeItem"
      @sort-change="onSortChange"
    />
  </div>
</template>
