<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { Loading, Plus } from '@element-plus/icons-vue'
import { icons } from '@/icons'
import TablePager from '@/components/ui/TablePager.vue'
import type { MediaItem } from '@/api/types'

const props = defineProps<{
  items: MediaItem[]
  loading: boolean
  uploading: boolean
  replacing: boolean
  reordering: boolean
  busyItemId: string | null
  fileInputKey: number
  uploadHint: string
  emptyText: string
  /** phone = отзывы 9:19, photo = квадратная галерея */
  variant: 'phone' | 'photo'
  total: number
  pageSizes: number[]
}>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const emit = defineEmits<{
  upload: [file: File]
  replace: [id: string, file: File]
  remove: [item: MediaItem]
  reorder: [items: MediaItem[]]
  'toggle-published': [item: MediaItem]
}>()

const replaceInput = ref<HTMLInputElement | null>(null)
const replaceTargetId = ref<string | null>(null)
const dragId = ref<string | null>(null)
const dropTargetId = ref<string | null>(null)

const isPhone = () => props.variant === 'phone'
const interactionsLocked = () => props.uploading || props.replacing || props.reordering

function onShotFileChange(uploadFile: UploadFile) {
  const raw = (uploadFile.raw || null) as UploadRawFile | null
  if (!raw) return
  emit('upload', raw)
}

function openReplacePicker(item: MediaItem) {
  if (interactionsLocked()) return
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
  emit('replace', targetId, file)
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

function onShotDrop(target: MediaItem, event: DragEvent) {
  event.preventDefault()
  const sourceId = dragId.value || event.dataTransfer?.getData('text/plain')
  dropTargetId.value = null
  if (!sourceId || sourceId === target.id || props.reordering) {
    dragId.value = null
    return
  }

  const from = props.items.findIndex((row) => row.id === sourceId)
  const to = props.items.findIndex((row) => row.id === target.id)
  if (from < 0 || to < 0) {
    dragId.value = null
    return
  }

  const next = [...props.items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  dragId.value = null
  emit('reorder', next)
}
</script>

<template>
  <div
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
    >
    <div :class="isPhone() ? 'review-gallery' : 'photo-gallery'">
      <el-upload
        :key="fileInputKey"
        :class="[
          isPhone() ? 'review-phone review-phone--add' : 'photo-tile photo-tile--add',
          { 'is-busy': uploading },
        ]"
        drag
        action="#"
        :show-file-list="false"
        :auto-upload="false"
        accept="image/jpeg,image/png,image/webp,image/gif"
        :disabled="interactionsLocked()"
        :on-change="onShotFileChange"
      >
        <template v-if="isPhone()">
          <div class="review-phone__frame">
            <div class="review-phone__island" aria-hidden="true" />
            <div class="review-phone__screen review-phone__screen--add">
              <el-icon v-if="uploading" :size="28" class="shot-spin text-brand-500"><Loading /></el-icon>
              <template v-else>
                <el-icon :size="28" class="text-brand-500"><Plus /></el-icon>
                <span class="mt-2 text-sm font-medium text-slate-600">Добавить</span>
                <span class="mt-1 px-3 text-center text-[11px] leading-snug text-slate-400">
                  {{ uploadHint }}
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
                {{ uploadHint }}
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
          isPhone() ? 'review-phone' : 'photo-tile',
          {
            'is-dragging': dragId === item.id,
            'is-drop-target': dropTargetId === item.id,
            'is-busy': busyItemId === item.id,
            'is-hidden': !item.published,
          },
        ]"
        draggable="true"
        @dragstart="onShotDragStart(item, $event)"
        @dragover="onShotDragOver(item, $event)"
        @dragleave="onShotDragLeave(item)"
        @drop="onShotDrop(item, $event)"
        @dragend="onShotDragEnd"
      >
        <template v-if="isPhone()">
          <div class="review-phone__frame">
            <div class="review-phone__island" aria-hidden="true" />
            <div class="review-phone__screen">
              <img
                :src="item.imageUrl"
                :alt="item.title || 'Отзыв'"
                class="review-phone__img"
                draggable="false"
              >
            </div>
          </div>
          <span class="review-phone__handle" title="Перетащить">
            <el-icon :size="16"><component :is="icons['drag-move']" /></el-icon>
          </span>
          <span
            class="shot-badge"
            :class="item.published ? 'is-live' : 'is-off'"
          >
            {{ item.published ? 'На сайте' : 'Скрыто' }}
          </span>
          <div class="review-phone__actions">
            <button
              type="button"
              class="shot-action"
              :title="item.published ? 'Скрыть с сайта' : 'Показать на сайте'"
              :aria-label="item.published ? 'Скрыть с сайта' : 'Показать на сайте'"
              :disabled="replacing || uploading"
              @click.stop="$emit('toggle-published', item)"
              @mousedown.stop
            >
              <el-icon :size="16"><component :is="item.published ? icons.lock : icons.unlock" /></el-icon>
            </button>
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
              @click.stop="$emit('remove', item)"
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
            >
          </div>
          <span class="photo-tile__handle" title="Перетащить">
            <el-icon :size="16"><component :is="icons['drag-move']" /></el-icon>
          </span>
          <span
            class="shot-badge"
            :class="item.published ? 'is-live' : 'is-off'"
          >
            {{ item.published ? 'На сайте' : 'Скрыто' }}
          </span>
          <div class="photo-tile__actions">
            <button
              type="button"
              class="shot-action"
              :title="item.published ? 'Скрыть с сайта' : 'Показать на сайте'"
              :aria-label="item.published ? 'Скрыть с сайта' : 'Показать на сайте'"
              :disabled="replacing || uploading"
              @click.stop="$emit('toggle-published', item)"
              @mousedown.stop
            >
              <el-icon :size="16"><component :is="item.published ? icons.lock : icons.unlock" /></el-icon>
            </button>
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
              @click.stop="$emit('remove', item)"
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
      {{ emptyText }}
    </p>
    <TablePager
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
    />
  </div>
</template>

<style scoped>
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

.photo-tile.is-hidden .photo-tile__img,
.review-phone.is-hidden .review-phone__img {
  filter: grayscale(0.35) brightness(0.82);
}

.shot-badge {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  height: 1.45rem;
  padding: 0 0.5rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 750;
  letter-spacing: 0.02em;
  pointer-events: none;
}

.review-phone .shot-badge {
  left: 14px;
  bottom: 14px;
}

.shot-badge.is-live {
  background: rgb(4 120 87 / 0.92);
  color: #fff;
}

.shot-badge.is-off {
  background: rgb(15 23 42 / 0.78);
  color: #e2e8f0;
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
</style>
