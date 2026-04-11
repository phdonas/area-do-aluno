'use client'

import React from 'react'

interface Element {
  id: string
  content: string
  x: number
  y: number
  fontSize: number
  color: string
  fontWeight: string
  textAlign: string
}

interface CertificatePaperProps {
  templateUrl: string
  elements: Element[]
  scale?: number
}

export function CertificatePaper({ templateUrl, elements, scale = 1 }: CertificatePaperProps) {
  return (
    <div className="relative w-full aspect-[1.41] shadow-2xl rounded-sm overflow-hidden bg-white border border-black/5 print:shadow-none print:border-none">
      {templateUrl && (
        <img 
          src={templateUrl} 
          className="absolute inset-0 w-full h-full object-cover select-none" 
          alt="Template"
          draggable={false}
        />
      )}
      
      {elements.map((el) => (
        <div 
          key={el.id}
          style={{
            position: 'absolute',
            left: `${el.x}%`,
            top: `${el.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `calc(${el.fontSize}px * ${scale})`,
            color: el.color,
            fontWeight: el.fontWeight,
            textAlign: el.textAlign as any,
            whiteSpace: 'pre-wrap',
            width: '80%',
            lineHeight: 1.2,
            zIndex: 10
          }}
        >
          {el.content}
        </div>
      ))}
    </div>
  )
}
