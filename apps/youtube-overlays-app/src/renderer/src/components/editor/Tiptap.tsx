import { type Editor, EditorContent } from '@tiptap/react'
import { Plus } from 'lucide-react'
import { convertToDisplayName } from '~/renderer/components/editor/utils'
import { Button } from '~/renderer/components/ui/button'
import './tiptap.css'

export function Tiptap({ editor }: { editor: Editor }) {
  return (
    <>
      <EditorContent
        className="flex w-full flex-col rounded-md border border-input shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        editor={editor}
      />

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onMouseDown={(e) => {
            e.preventDefault()

            const content = {
              type: 'variable',
              attrs: {
                id: 'name',
              },
            }

            if (editor.isFocused) {
              editor.chain().insertContent(content).run()
            } else {
              editor.chain().selectTextblockEnd().insertContent(content).focus().run()
            }
          }}
        >
          <Plus />
          新增 {convertToDisplayName('name')}
        </Button>

        <Button
          variant="secondary"
          onMouseDown={(e) => {
            e.preventDefault()

            const content = {
              type: 'variable',
              attrs: {
                id: 'amount',
              },
            }

            if (editor.isFocused) {
              editor.chain().insertContent(content).run()
            } else {
              editor.chain().selectTextblockEnd().insertContent(content).focus().run()
            }
          }}
        >
          <Plus />
          新增 {convertToDisplayName('amount')}
        </Button>
      </div>
    </>
  )
}
