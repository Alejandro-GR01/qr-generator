import type { QRType } from '@/types'

const TYPE_OPTIONS: { value: QRType; label: string }[] = [
  { value: 'wifi', label: 'WiFi' },
  { value: 'url', label: 'URL' },
  { value: 'text', label: 'Text' },
]

interface TypeSelectorProps {
  selectedType: QRType
  onTypeChange: (type: QRType) => void
}

export function TypeSelector({ selectedType, onTypeChange }: TypeSelectorProps) {
  return (
    <div className="flex gap-1 rounded-md bg-muted p-1">
      {TYPE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onTypeChange(opt.value)}
          className={`flex-1 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
            selectedType === opt.value
              ? 'bg-background shadow'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}