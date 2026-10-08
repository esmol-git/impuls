<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { icons } from '@/icons'
import { ElMessageBox } from 'element-plus'
import { api } from '@/api/client'
import { Column, Columns } from '@/components/editor/columns'
import {
  type ImageSize,
  imageSizes,
  ResizableImage,
} from '@/components/editor/resizable-image'
import { useToast } from '@/composables/useToast'

const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: 'Текст…',
    disabled: false,
  },
)

const toast = useToast()
const tick = ref(0)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const editor = useEditor({
  content: model.value || '',
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
    Placeholder.configure({ placeholder: props.placeholder }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    }),
    ResizableImage.configure({
      allowBase64: false,
      inline: false,
    }),
    Columns,
    Column,
  ],
  onUpdate: ({ editor: ed }) => {
    const html = ed.isEmpty ? '' : ed.getHTML()
    if (html !== model.value) model.value = html
  },
  onSelectionUpdate: () => {
    tick.value += 1
  },
  onTransaction: () => {
    tick.value += 1
  },
})

const active = computed(() => {
  void tick.value
  const ed = editor.value
  if (!ed) {
    return {
      undo: false,
      redo: false,
      bold: false,
      italic: false,
      link: false,
      bullet: false,
      ordered: false,
      h2: false,
      h3: false,
      columns: false,
      image: false,
      imageSize: 'full' as ImageSize,
    }
  }
  return {
    undo: ed.can().undo(),
    redo: ed.can().redo(),
    bold: ed.isActive('bold'),
    italic: ed.isActive('italic'),
    link: ed.isActive('link'),
    bullet: ed.isActive('bulletList'),
    ordered: ed.isActive('orderedList'),
    h2: ed.isActive('heading', { level: 2 }),
    h3: ed.isActive('heading', { level: 3 }),
    columns: ed.isActive('columns') || ed.isActive('column'),
    image: ed.isActive('image'),
    imageSize: (ed.getAttributes('image').size as ImageSize) || 'full',
  }
})

watch(model, (value) => {
  if (!editor.value) return
  const current = editor.value.isEmpty ? '' : editor.value.getHTML()
  if (value !== current) {
    editor.value.commands.setContent(value || '', { emitUpdate: false })
  }
})

watch(
  () => props.disabled,
  (disabled) => {
    editor.value?.setEditable(!disabled)
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function run(command: () => boolean) {
  command()
}

async function setLink() {
  if (!editor.value) return
  const previous = (editor.value.getAttributes('link').href as string | undefined) || ''

  try {
    const { value } = await ElMessageBox.prompt('Вставьте адрес ссылки', 'Ссылка', {
      confirmButtonText: 'Применить',
      cancelButtonText: previous ? 'Убрать ссылку' : 'Отмена',
      inputValue: previous || 'https://',
      inputPlaceholder: 'https://',
      distinguishCancelAndClose: true,
    })

    const url = value.trim()
    if (!url) {
      editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  } catch (action) {
    if (action === 'cancel' && previous) {
      editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    }
  }
}

function insertColumns() {
  editor.value?.chain().focus().setColumns().run()
}

function openImagePicker() {
  fileInput.value?.click()
}

async function onImageFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !editor.value) return

  if (!file.type.startsWith('image/')) {
    toast.error('Только изображения')
    return
  }
  uploading.value = true
  try {
    const { prepareImageUpload } = await import('@/utils/image')
    const prepared = await prepareImageUpload(file)
    const body = new FormData()
    body.append('file', prepared)
    const uploaded = await api<{ url: string }>('/api/admin/media/upload', {
      method: 'POST',
      body,
    })

    // по умолчанию на всю ширину текста; размер можно сменить в тулбаре
    editor.value
      .chain()
      .focus()
      .insertContent({
        type: 'image',
        attrs: { src: uploaded.url, size: 'full' },
      })
      .run()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Не удалось загрузить картинку')
  } finally {
    uploading.value = false
  }
}

function onImageSizeCommand(size: ImageSize) {
  if (!editor.value?.isActive('image')) {
    toast.info('Сначала выделите картинку в тексте')
    return
  }
  editor.value.chain().focus().updateAttributes('image', { size }).run()
}
</script>

<template>
  <div class="rich-editor">
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept="image/jpeg,image/png,image/webp,image/gif"
      @change="onImageFile"
    >

    <div v-if="editor" class="rich-editor__toolbar">
      <div class="rich-editor__group">
        <el-tooltip content="Назад" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn"
            :disabled="!active.undo"
            @click="run(() => editor!.chain().focus().undo().run())"
          >
            <el-icon :size="18"><component :is="icons.undo" /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="Вперёд" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn"
            :disabled="!active.redo"
            @click="run(() => editor!.chain().focus().redo().run())"
          >
            <el-icon :size="18"><component :is="icons.redo" /></el-icon>
          </button>
        </el-tooltip>
      </div>

      <span class="rich-editor__sep" />

      <div class="rich-editor__group">
        <el-tooltip content="Жирный" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn rte-btn--label"
            :class="{ 'is-active': active.bold }"
            @click="run(() => editor!.chain().focus().toggleBold().run())"
          >
            <span class="rte-letter rte-letter--bold">Ж</span>
          </button>
        </el-tooltip>
        <el-tooltip content="Курсив" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn rte-btn--label"
            :class="{ 'is-active': active.italic }"
            @click="run(() => editor!.chain().focus().toggleItalic().run())"
          >
            <span class="rte-letter rte-letter--italic">К</span>
          </button>
        </el-tooltip>
        <el-tooltip content="Ссылка" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn"
            :class="{ 'is-active': active.link }"
            @click="setLink"
          >
            <el-icon :size="18"><component :is="icons.links" /></el-icon>
          </button>
        </el-tooltip>
      </div>

      <span class="rich-editor__sep" />

      <div class="rich-editor__group">
        <el-tooltip content="Заголовок H2" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn rte-btn--label"
            :class="{ 'is-active': active.h2 }"
            @click="run(() => editor!.chain().focus().toggleHeading({ level: 2 }).run())"
          >
            H2
          </button>
        </el-tooltip>
        <el-tooltip content="Заголовок H3" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn rte-btn--label"
            :class="{ 'is-active': active.h3 }"
            @click="run(() => editor!.chain().focus().toggleHeading({ level: 3 }).run())"
          >
            H3
          </button>
        </el-tooltip>
      </div>

      <span class="rich-editor__sep" />

      <div class="rich-editor__group">
        <el-tooltip content="Маркированный список" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn"
            :class="{ 'is-active': active.bullet }"
            @click="run(() => editor!.chain().focus().toggleBulletList().run())"
          >
            <el-icon :size="18"><component :is="icons['bulleted-list']" /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="Нумерованный список" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn rte-btn--label"
            :class="{ 'is-active': active.ordered }"
            @click="run(() => editor!.chain().focus().toggleOrderedList().run())"
          >
            1.
          </button>
        </el-tooltip>
      </div>

      <span class="rich-editor__sep" />

      <div class="rich-editor__group">
        <el-tooltip content="Два столбца" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn"
            :class="{ 'is-active': active.columns }"
            @click="insertColumns"
          >
            <el-icon :size="18"><component :is="icons['layout-grid']" /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="Картинка в текст" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn"
            :class="{ 'is-active': active.image }"
            :disabled="uploading"
            @click="openImagePicker"
          >
            <el-icon :size="18"><component :is="icons.image" /></el-icon>
          </button>
        </el-tooltip>
        <el-dropdown trigger="click" @command="onImageSizeCommand">
          <button
            type="button"
            class="rte-btn rte-btn--label"
            :class="{ 'is-active': active.image }"
            :disabled="!active.image"
            title="Ширина картинки"
          >
            {{ active.image ? active.imageSize : '½' }}
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="option in imageSizes"
                :key="option.value"
                :command="option.value"
              >
                {{ option.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-tooltip content="Обычный абзац" placement="top" :show-after="400">
          <button
            type="button"
            class="rte-btn rte-btn--label"
            @click="run(() => editor!.chain().focus().setParagraph().run())"
          >
            ¶
          </button>
        </el-tooltip>
      </div>
    </div>

    <EditorContent :editor="editor" class="rich-editor__content" />
  </div>
</template>

<style>
.rich-editor {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
}

.rich-editor__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.rich-editor__group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
}

.rich-editor__sep {
  width: 1px;
  height: 22px;
  background: #e2e8f0;
}

.rte-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #334155;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.rte-btn:hover:not(:disabled) {
  background: #eff6ff;
  color: #1d4ed8;
}

.rte-btn:disabled {
  cursor: wait;
  opacity: 0.55;
}

.rte-btn.is-active {
  background: #dbeafe;
  color: #1d4ed8;
}

.rte-btn--label {
  width: auto;
  min-width: 32px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.rte-letter {
  font-size: 14px;
  line-height: 1;
}

.rte-letter--bold {
  font-weight: 800;
}

.rte-letter--italic {
  font-style: italic;
  font-weight: 600;
}

.rich-editor__content .tiptap {
  min-height: 220px;
  padding: 14px 16px;
  outline: none;
  font-size: 14px;
  line-height: 1.65;
  color: #0f172a;
}

.rich-editor__content .tiptap p {
  margin: 0 0 0.75em;
}

.rich-editor__content .tiptap h2 {
  margin: 0.6em 0 0.4em;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.3;
}

.rich-editor__content .tiptap h3 {
  margin: 0.55em 0 0.35em;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.35;
}

.rich-editor__content .tiptap ul,
.rich-editor__content .tiptap ol {
  margin: 0 0 0.75em;
  padding-left: 1.35rem;
}

.rich-editor__content .tiptap li + li {
  margin-top: 0.25em;
}

.rich-editor__content .tiptap a {
  color: #1d4ed8;
  text-decoration: underline;
}

.rich-editor__content .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: #94a3b8;
  pointer-events: none;
}

.rich-editor__content .tiptap .rte-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 0.75em 0;
  padding: 10px;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
}

.rich-editor__content .tiptap .rte-column {
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  background: #fff;
}

.rich-editor__content .tiptap .rte-column > *:last-child {
  margin-bottom: 0;
}

.rich-editor__content .tiptap img.rte-image,
.rich-editor__content .tiptap img[data-size] {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  margin: 0.85em 0;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  object-fit: cover;
}

/* размеры только вне колонок — в колонке картинка всегда на всю ширину ячейки */
.rich-editor__content .tiptap :not(.rte-column) > img.rte-image--sm,
.rich-editor__content .tiptap :not(.rte-column) > img[data-size='sm'] {
  width: 33%;
  max-width: 33%;
  margin-left: auto;
  margin-right: auto;
}

.rich-editor__content .tiptap :not(.rte-column) > img.rte-image--md,
.rich-editor__content .tiptap :not(.rte-column) > img[data-size='md'] {
  width: 50%;
  max-width: 50%;
  margin-left: auto;
  margin-right: auto;
}

.rich-editor__content .tiptap :not(.rte-column) > img.rte-image--lg,
.rich-editor__content .tiptap :not(.rte-column) > img[data-size='lg'] {
  width: 75%;
  max-width: 75%;
  margin-left: auto;
  margin-right: auto;
}

.rich-editor__content .tiptap .rte-column img {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.rich-editor__content .tiptap img.ProseMirror-selectednode {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
