import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columns: {
      setColumns: () => ReturnType
      unsetColumns: () => ReturnType
    }
  }
}

export const Column = Node.create({
  name: 'column',
  content: 'block+',
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'column',
        class: 'rte-column',
      }),
      0,
    ]
  },
})

export const Columns = Node.create({
  name: 'columns',
  group: 'block',
  content: 'column column',
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'columns',
        class: 'rte-columns',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setColumns:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [
              {
                type: 'column',
                content: [{ type: 'paragraph' }],
              },
              {
                type: 'column',
                content: [{ type: 'paragraph' }],
              },
            ],
          }),
      unsetColumns:
        () =>
        ({ editor, commands }) => {
          const { state } = editor
          const { $from } = state.selection
          for (let depth = $from.depth; depth > 0; depth -= 1) {
            if ($from.node(depth).type.name === this.name) {
              const pos = $from.before(depth)
              const node = $from.node(depth)
              return commands.insertContentAt(
                { from: pos, to: pos + node.nodeSize },
                node.content.toJSON(),
              )
            }
          }
          return false
        },
    }
  },
})
