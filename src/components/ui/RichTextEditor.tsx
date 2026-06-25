'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

// Dynamic import with ssr: false to prevent hydration mismatch and server-side errors
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false, loading: () => <div className="p-4 text-center text-xs text-text-muted">Carregando editor...</div> })

interface RichTextEditorProps {
  id?: string
  name: string
  defaultValue?: string
  placeholder?: string
}

export function RichTextEditor({ id, name, defaultValue = '', placeholder }: RichTextEditorProps) {
  const [value, setValue] = useState(defaultValue)

  const handleChange = (content: string) => {
    setValue(content)
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  }

  return (
    <div className="bg-background border border-border-custom rounded-xl overflow-hidden text-text-primary text-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
      <ReactQuill 
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        placeholder={placeholder}
        className="w-full [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border-custom [&_.ql-container]:border-none [&_.ql-editor]:min-h-[120px]"
      />
      {/* Input oculto para que o formulário possa capturar o valor via FormData */}
      <input type="hidden" id={id} name={name} value={value} />
    </div>
  )
}
