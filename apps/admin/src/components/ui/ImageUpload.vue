<script setup lang="ts">
import { computed } from 'vue'
import { Picture, Delete, Plus, RefreshRight } from '@element-plus/icons-vue'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { useToast } from '@/composables/useToast'
import { prepareImageUpload } from '@/utils/image'

const props = withDefaults(
  defineProps<{
    preview?: string
    tip?: string
    accept?: string
    aspect?: 'wide' | 'portrait' | 'square'
  }>(),
  {
    preview: '',
    tip: 'JPEG, PNG, WebP или GIF до 20 МБ. На сервере конвертируется в WebP.',
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    aspect: 'wide',
  },
)

const emit = defineEmits<{
  change: [file: File | null]
  remove: []
}>()

const toast = useToast()

const aspectClass = computed(
  () =>
    ({
      wide: 'aspect-[16/9]',
      portrait: 'aspect-[3/4]',
      square: 'aspect-square',
    })[props.aspect],
)

async function emitPrepared(file: File | null) {
  if (!file) {
    emit('change', null)
    return
  }
  try {
    emit('change', await prepareImageUpload(file))
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось добавить фото')
  }
}

function onChange(uploadFile: UploadFile) {
  const raw = (uploadFile.raw || null) as UploadRawFile | null
  void emitPrepared(raw)
}

function onClear() {
  emit('remove')
  emit('change', null)
}

function openPicker() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = props.accept
  input.onchange = () => {
    void emitPrepared(input.files?.[0] || null)
  }
  input.click()
}
</script>

<template>
  <div class="image-upload">
    <template v-if="preview">
      <button type="button" class="image-upload__preview" :class="aspectClass" @click="openPicker">
        <img :src="preview" alt="Превью" class="h-full w-full object-cover" />
      </button>

      <div class="image-upload__toolbar">
        <button type="button" class="image-upload__btn" @click="openPicker">
          <el-icon :size="14"><RefreshRight /></el-icon>
          <span>Заменить</span>
        </button>
        <button type="button" class="image-upload__btn image-upload__btn--danger" @click="onClear">
          <el-icon :size="14"><Delete /></el-icon>
          <span>Удалить</span>
        </button>
      </div>
    </template>

    <el-upload
      v-else
      drag
      class="image-upload__drop"
      :auto-upload="false"
      :show-file-list="false"
      :limit="1"
      :accept="accept"
      :on-change="onChange"
    >
      <div class="image-upload__empty" :class="aspectClass">
        <el-icon :size="28" class="text-brand-500"><Picture /></el-icon>
        <p class="mt-3 text-sm font-medium text-slate-700">
          Перетащите изображение сюда
        </p>
        <p class="mt-1 text-xs text-slate-500">
          или <span class="text-brand-600">выберите файл</span>
        </p>
        <el-button class="mt-4" size="small" :icon="Plus" plain type="primary">
          Выбрать
        </el-button>
      </div>
    </el-upload>

    <p v-if="tip" class="image-upload__tip">{{ tip }}</p>
  </div>
</template>
