<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Delete, Rank } from '@element-plus/icons-vue'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { useToast } from '@/composables/useToast'
import { prepareImageUpload } from '@/utils/image'

export interface GalleryImage {
  key: string
  url: string
  file?: File
}

const props = withDefaults(
  defineProps<{
    modelValue: GalleryImage[]
    tip?: string
    accept?: string
    max?: number
  }>(),
  {
    tip: 'JPEG, PNG, WebP или GIF до 20 МБ. На сервере конвертируется в WebP. Первое — обложка.',
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    max: 8,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: GalleryImage[]]
}>()

const toast = useToast()
const dragIndex = ref<number | null>(null)
const preparing = ref(false)

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function addFiles(files: File[]) {
  const room = Math.max(0, props.max - props.modelValue.length)
  const batch = files.slice(0, room)
  if (!batch.length) return

  preparing.value = true
  try {
    const next: GalleryImage[] = []
    for (const file of batch) {
      try {
        const prepared = await prepareImageUpload(file)
        next.push({
          key: uid(),
          url: URL.createObjectURL(prepared),
          file: prepared,
        })
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Не удалось добавить фото')
      }
    }
    if (next.length) {
      emit('update:modelValue', [...props.modelValue, ...next])
    }
  } finally {
    preparing.value = false
  }
}

function onUploadChange(uploadFile: UploadFile) {
  const raw = (uploadFile.raw || null) as UploadRawFile | null
  if (!raw) return
  void addFiles([raw])
}

function openPicker() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = props.accept
  input.multiple = true
  input.onchange = () => {
    const files = Array.from(input.files || [])
    void addFiles(files)
  }
  input.click()
}

function removeAt(index: number) {
  const current = props.modelValue[index]
  if (current?.url.startsWith('blob:')) URL.revokeObjectURL(current.url)
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
}

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

function onDrop(index: number, event: DragEvent) {
  event.preventDefault()
  const from = dragIndex.value ?? Number(event.dataTransfer?.getData('text/plain'))
  dragIndex.value = null
  if (Number.isNaN(from) || from === index) return
  const next = [...props.modelValue]
  const [moved] = next.splice(from, 1)
  next.splice(index, 0, moved)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="multi-upload">
    <div class="multi-upload__grid">
      <div
        v-for="(image, index) in modelValue"
        :key="image.key"
        class="multi-upload__item"
        :class="{ 'is-dragging': dragIndex === index }"
        draggable="true"
        @dragstart="onDragStart(index, $event)"
        @dragover.prevent
        @drop="onDrop(index, $event)"
        @dragend="dragIndex = null"
      >
        <img :src="image.url" alt="" class="multi-upload__img" draggable="false" />
        <span v-if="index === 0" class="multi-upload__badge">Обложка</span>
        <span class="multi-upload__handle" title="Перетащить">
          <el-icon :size="12"><Rank /></el-icon>
        </span>
        <button
          type="button"
          class="multi-upload__delete"
          title="Удалить"
          @click="removeAt(index)"
          @mousedown.stop
        >
          <el-icon :size="14"><Delete /></el-icon>
        </button>
      </div>

      <el-upload
        v-if="modelValue.length < max"
        class="multi-upload__add"
        drag
        action="#"
        multiple
        :show-file-list="false"
        :auto-upload="false"
        :disabled="preparing"
        :accept="accept"
        :on-change="onUploadChange"
      >
        <button
          type="button"
          class="multi-upload__add-btn"
          :disabled="preparing"
          @click.prevent="openPicker"
        >
          <el-icon :size="22" class="text-brand-500"><Plus /></el-icon>
          <span>{{ preparing ? 'Проверка…' : 'Добавить' }}</span>
        </button>
      </el-upload>
    </div>
    <p v-if="tip" class="multi-upload__tip">{{ tip }}</p>
  </div>
</template>

<style scoped>
.multi-upload__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

@media (min-width: 640px) {
  .multi-upload__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.multi-upload__item {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border: 1px solid rgb(226 232 240);
  border-radius: 10px;
  background: #fff;
  cursor: grab;
}

.multi-upload__item:active {
  cursor: grabbing;
}

.multi-upload__item.is-dragging {
  opacity: 0.45;
}

.multi-upload__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.multi-upload__badge {
  position: absolute;
  left: 6px;
  bottom: 6px;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  background: rgb(15 23 42 / 72%);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

.multi-upload__handle {
  position: absolute;
  top: 6px;
  left: 6px;
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgb(15 23 42 / 55%);
  color: #fff;
  pointer-events: none;
}

.multi-upload__delete {
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: rgb(15 23 42 / 72%);
  color: #fff;
  cursor: pointer;
}

.multi-upload__delete:hover {
  background: var(--el-color-danger);
}

.multi-upload__add {
  width: 100%;
}

.multi-upload__add :deep(.el-upload),
.multi-upload__add :deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
}

.multi-upload__add-btn {
  display: flex;
  aspect-ratio: 4 / 3;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1.5px dashed rgb(148 163 184 / 70%);
  border-radius: 10px;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.multi-upload__add:hover .multi-upload__add-btn {
  border-color: var(--el-color-primary);
  background: rgb(239 246 255);
}

.multi-upload__tip {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: rgb(100 116 139);
}
</style>
