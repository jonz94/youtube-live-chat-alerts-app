import { mergeAttributes, Node } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { useEditor } from '@tiptap/react'
import { convertToDisplayName } from '~/renderer/components/editor/utils'
import { Template } from '../../../../main/schema'
import { Dropcursor } from './drop-cursor'

// See `addAttributes` below
export interface VariableNodeAttrs {
  id: string | null
}

export const VariableNode = Node.create({
  name: 'variable',

  priority: 101,

  group: 'inline',

  inline: true,

  draggable: true,

  atom: true,

  isolating: true,

  whitespace: 'pre',

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (attributes.id && typeof attributes.id === 'string') {
            return {
              'data-id': attributes.id,
            }
          }

          return {}
        },
      },
    }
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('span')
      dom.classList.add(...'inline-block !whitespace-pre py-2 cursor-grab'.split(' '))
      dom.setAttribute('data-type', this.name)

      const content = document.createElement('code')
      content.innerText = ` ${convertToDisplayName((node.attrs.id as string) ?? null)} `
      content.classList.add(
        ...'bg-primary text-white rounded-full mx-1 py-1 transition-colors hover:bg-primary/80'.split(' '),
      )

      dom.append(content)

      return {
        dom,
      }
    }
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['var', mergeAttributes({ 'data-type': this.name }, HTMLAttributes), node.attrs.id]
  },

  parseHTML() {
    return [{ tag: `var[data-type="${this.name}"]` }]
  },
})

/** credits: https://github.com/ueberdosis/tiptap/issues/96#issuecomment-1814724327 */
const OneLineDocument = Document.extend({
  // NOTE: override the default content setting `block+` to enforce a one-line document
  content: 'block',
})

export function useOneLineEditor(template: Template) {
  return useEditor({
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'focus:outline-none px-5 py-4',
      },
    },
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: template,
        },
      ],
    },
    extensions: [
      OneLineDocument,
      Text,
      Paragraph.extend({
        addKeyboardShortcuts: () => ({}),
      }),
      Dropcursor,
      VariableNode,
    ],
    immediatelyRender: false,
  })
}
