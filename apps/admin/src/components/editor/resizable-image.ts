import Image from '@tiptap/extension-image'

export type ImageSize = 'sm' | 'md' | 'lg' | 'full'

export const imageSizes: { value: ImageSize; label: string }[] = [
  { value: 'full', label: 'На всю ширину' },
  { value: 'lg', label: '¾ ширины' },
  { value: 'md', label: '½ ширины' },
  { value: 'sm', label: '⅓ ширины' },
]

export const ResizableImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: 'full' satisfies ImageSize,
        parseHTML: (element) =>
          (element.getAttribute('data-size') as ImageSize | null) || 'full',
        renderHTML: (attributes) => ({
          'data-size': attributes.size,
          class: `rte-image rte-image--${attributes.size || 'full'}`,
        }),
      },
    }
  },
})
