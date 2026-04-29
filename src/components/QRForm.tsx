import { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
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
] as const

interface QRFormProps {
  selectedType: QRType
  logoDataUrl: string | null
  onLogoChange: (dataUrl: string | null) => void
  onGenerate: (data: WifiData | UrlData | TextData) => void
}

// Controlled form - simple state management without react-hook-form
export function QRForm({
  selectedType,
  logoDataUrl,
  onLogoChange,
  onGenerate,
}: QRFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  
  // Form state
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')
  const [hidden, setHidden] = useState(false)
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  
  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (selectedType === 'wifi' && !ssid.trim()) {
      newErrors.ssid = 'SSID is required'
    }
    if (selectedType === 'url' && !url.trim()) {
      newErrors.url = 'URL is required'
    }
    if (selectedType === 'text' && !text.trim()) {
      newErrors.text = 'Text is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    if (selectedType === 'wifi') {
      onGenerate({ ssid, password, encryption, hidden })
    } else if (selectedType === 'url') {
      onGenerate({ url })
    } else {
      onGenerate({ text })
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
                autoComplete="organization-title"
                value={ssid}
                onChange={(e) => {
                  setSsid(e.target.value)
                  if (errors.ssid) setErrors(prev => ({ ...prev, ssid: '' }))
                }}
                aria-invalid={!!errors.ssid}
                aria-describedby={errors.ssid ? 'ssid-error' : undefined}
              />
              {errors.ssid && (
                <p id="ssid-error" className="text-sm text-destructive" role="alert">
                  {errors.ssid}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
<Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="WiFi password"
                className="pr-10"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="encryption">Encryption</Label>
              <select
                id="encryption"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                value={encryption}
                onChange={(e) => setEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
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
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
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
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (errors.url) setErrors(prev => ({ ...prev, url: '' }))
              }}
              aria-invalid={!!errors.url}
              aria-describedby={errors.url ? 'url-error' : undefined}
            />
            {errors.url && (
              <p id="url-error" className="text-sm text-destructive" role="alert">
                {errors.url}
              </p>
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
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                if (errors.text) setErrors(prev => ({ ...prev, text: '' }))
              }}
              aria-invalid={!!errors.text}
              aria-describedby={errors.text ? 'text-error' : undefined}
            />
            {errors.text && (
              <p id="text-error" className="text-sm text-destructive" role="alert">
                {errors.text}
              </p>
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
        <form onSubmit={handleSubmit} className="space-y-6" aria-label="QR Code form">
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