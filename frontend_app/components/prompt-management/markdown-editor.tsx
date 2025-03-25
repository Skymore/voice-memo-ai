"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps {
  initialContent: string
  onSave: (content: string) => void
}

export function MarkdownEditor({ initialContent, onSave }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent)

  return (
    <div className="space-y-4">
      <MDEditor
        value={content}
        onChange={(value) => setContent(value || '')}
        preview="live"
        height={400}
      />
      <Button onClick={() => onSave(content)}>Save Changes</Button>
    </div>
  )
}

