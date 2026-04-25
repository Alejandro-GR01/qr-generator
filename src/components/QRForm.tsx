import { X } from 'lucide-react'
import type { QRType, WifiData, UrlData, TextData } from '@/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const ENCRYPTION_OPTIONS = [
  { value: 'WPA', label: 'WPA/WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'None' },
]

interface QRFormProps {
  selectedType: QRType
  logoDataUrl: string | null
  onLogoChange: (dataUrl: string | null) => void
  onGenerate: (data: WifiData | UrlData | TextData) => void
  errors?: Record<string, unknown>
  register: (name: string, options?: Record<string, unknown>) => Record<string, unknown>
  watch: (name: string) => unknown
}

export function QRForm({
  selectedType,
  logoDataUrl,
  onLogoChange,
  onGenerate,
  errors,
  register,
  watch,
}: QRFormProps) {
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onLogoChange(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    onLogoChange(null)
    const fileInput = document.getElementById('logo') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedType === 'wifi') {
      const ssid = watch('ssid') as string
      const password = (watch('password') as string) || ''
      const encryption = (watch('encryption') as string) || 'WPA'
      const hidden = (watch('hidden') as boolean) || false
      onGenerate({ ssid, password, encryption, hidden } as WifiData)
    } else if (selectedType === 'url') {
      const url = watch('url') as string
      onGenerate({ url } as UrlData)
    } else {
      const text = watch('text') as string
      onGenerate({ text } as TextData)
    }
  }

  const renderFields = () => {
    switch (selectedType) {
      case 'wifi':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="ssid">SSID</Label>
              <Input
                id="ssid"
                placeholder="Network name"
                {...register('ssid', { required: selectedType === 'wifi' })}
              />
              {(errors as any)?.ssid && (
                <p className="text-sm text-destructive">SSID is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="WiFi password"
                {...register('password')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="encryption">Encryption</Label>
              <select
                id="encryption"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                {...register('encryption')}
                defaultValue="WPA"
              >
                {ENCRYPTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hidden"
                className="h-4 w-4"
                {...register('hidden')}
              />
              <Label htmlFor="hidden" className="font-normal">
                Hidden network
              </Label>
            </div>
          </>
        )

      case 'url':
        return (
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              {...register('url', { required: selectedType === 'url' })}
            />
            {(errors as any)?.url && (
              <p className="text-sm text-destructive">URL is required</p>
            )}
          </div>
        )

      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <textarea
              id="text"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors"
              placeholder="Enter your text here..."
              {...register('text', { required: selectedType === 'text' })}
            />
            {(errors as any)?.text && (
              <p className="text-sm text-destructive">Text is required</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className='h-full flex flex-col gap-4'>
      <CardHeader>
        <CardTitle>
          {selectedType === 'wifi' && 'WiFi QR Code'}
          {selectedType === 'url' && 'URL QR Code'}
          {selectedType === 'text' && 'Text QR Code'}
        </CardTitle>
        <CardDescription>
          {selectedType === 'wifi' && 'Scan to connect to WiFi'}
          {selectedType === 'url' && 'Scan to open a link'}
          {selectedType === 'text' && 'Scan to read text'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderFields()}

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="flex-1"
              />
              {logoDataUrl && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                  aria-label="Remove logo"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {logoDataUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={logoDataUrl}
                  alt="Logo preview"
                  className="h-10 w-10 object-contain border rounded"
                />
                <span className="text-sm text-muted-foreground">Logo will be centered on QR</span>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Generate QR Code
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}