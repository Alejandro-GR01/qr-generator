import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import QRCode from 'qrcode'
import { Sun, Moon, X } from 'lucide-react'
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
import type { QRType, WifiData, UrlData, TextData } from '@/types'

const TYPE_OPTIONS: { value: QRType; label: string }[] = [
  { value: 'wifi', label: 'WiFi' },
  { value: 'url', label: 'URL' },
  { value: 'text', label: 'Text' },
]

const RESOLUTION_OPTIONS = [
  { value: 300, label: 'Pequeño (300px)' },
  { value: 600, label: 'Mediano (600px)' },
  { value: 1200, label: 'Grande (1200px)' },
  { value: 2400, label: 'Impresión (2400px)' },
]

const ENCRYPTION_OPTIONS = [
  { value: 'WPA', label: 'WPA/WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'None' },
]

// Helper: Escape special chars for WiFi format
function escapeWifiString(str: string): string {
  return str.replace(/([;,:;\"\\])/g, '\\$1')
}

// Helper: Build WiFi QR string
function buildWifiString(data: WifiData): string {
  const escapedSsid = escapeWifiString(data.ssid)
  const escapedPassword = escapeWifiString(data.password)
  const hiddenStr = data.hidden ? 'true' : 'false'
  return `WIFI:T:${data.encryption};S:${escapedSsid};P:${escapedPassword};H:${hiddenStr};;`
}

type FormData = WifiData | UrlData | TextData

const QR_GENERATOR_OPTIONS = {
  errorCorrectionLevel: 'H' as const, // High for logo support
  width: 600, // Higher resolution for print quality
  margin: 2,
}

export default function QRGeneratorPage() {
  const [selectedType, setSelectedType] = useState<QRType>('wifi')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [rawString, setRawString] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Resolution state for download
  const [downloadResolution, setDownloadResolution] = useState<number>(600)
  const [isDownloading, setIsDownloading] = useState(false)

  // Logo state
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoDataUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoDataUrl(null)
    // Reset file input
    const fileInput = document.getElementById('logo') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      ssid: '',
      password: '',
      encryption: 'WPA',
      hidden: false,
      url: '',
      text: '',
    },
  })

  // Watch for type changes to reset form
  watch('ssid')
  watch('url')
  watch('text')

  const handleTypeChange = (type: QRType) => {
    setSelectedType(type)
    setQrDataUrl(null)
    setRawString('')
    setError(null)
    setCopySuccess(false)
    reset()
  }

  const generateQR = async (data: FormData) => {
    try {
      setError(null)
      let qrString = ''

      if (selectedType === 'wifi') {
        const wifiData = data as WifiData
        if (!wifiData.ssid) {
          setError('SSID is required')
          return
        }
        qrString = buildWifiString(wifiData)
      } else if (selectedType === 'url') {
        const urlData = data as UrlData
        if (!urlData.url) {
          setError('URL is required')
          return
        }
        qrString = urlData.url
      } else {
        const textData = data as TextData
        if (!textData.text) {
          setError('Text is required')
          return
        }
        qrString = textData.text
      }

      setRawString(qrString)

// Create offscreen canvas
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, qrString, QR_GENERATOR_OPTIONS)

      // Apply rounded corners - keep only the rounded center, make outside transparent
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const size = canvas.width
        const radius = 16
        
        // Use destination-in: only keeps what's inside the rounded rect, outside becomes transparent
        ctx.globalCompositeOperation = 'destination-in'
        ctx.beginPath()
        ctx.roundRect(0, 0, size, size, radius)
        ctx.fill()
        
        ctx.globalCompositeOperation = 'source-over'
      }

      // If logo is provided, draw it in the center
      if (logoDataUrl) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const img = new Image()
          img.src = logoDataUrl

          await new Promise<void>((resolve) => {
            img.onload = () => {
              const canvasSize = canvas.width
              const maxLogoSize = canvasSize * 0.2 // Max 20% of QR size
              const logoWidth = img.width
              const logoHeight = img.height
              const scale = Math.min(maxLogoSize / logoWidth, maxLogoSize / logoHeight)
              const finalLogoWidth = logoWidth * scale
              const finalLogoHeight = logoHeight * scale

              const x = (canvasSize - finalLogoWidth) / 2
              const y = (canvasSize - finalLogoHeight) / 2

// Draw white background with border radius for logo
              const radius = 8
              const padding = 10
              const borderWidth = QR_GENERATOR_OPTIONS.width >= 2400 ? 2 : 1
              ctx.fillStyle = '#ffffff'
              ctx.beginPath()
              ctx.roundRect(x - padding, y - padding, finalLogoWidth + padding * 2, finalLogoHeight + padding * 2, radius)
              ctx.fill()

              // Draw black border around logo
              ctx.strokeStyle = '#000000'
              ctx.lineWidth = borderWidth
              ctx.stroke()

              // Draw logo
              ctx.drawImage(img, x, y, finalLogoWidth, finalLogoHeight)
              resolve()
            }
          })
        }
      }

      const finalDataUrl = canvas.toDataURL('image/png')
      setQrDataUrl(finalDataUrl)
    } catch (err) {
      console.error('QR generation error:', err)
      setError('Failed to generate QR code')
    }
  }

  const handleCopyToClipboard = async () => {
    if (!qrDataUrl) return

    try {
      // Try to copy as image
      const response = await fetch(qrDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
      setCopySuccess(true)
    } catch {
      // Fallback: copy raw string
      try {
        await navigator.clipboard.writeText(rawString)
        setCopySuccess(true)
      } catch {
        setError('Failed to copy to clipboard')
      }
    }

    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handleDownload = async () => {
    if (!rawString || isDownloading) return

    setIsDownloading(true)
    try {
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, rawString, {
        ...QR_GENERATOR_OPTIONS,
        width: downloadResolution,
      })

      // Apply rounded corners
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const size = canvas.width
        const radius = Math.floor(size * 0.05)
        
        // Use destination-in to keep only rounded center, make outside transparent
        ctx.globalCompositeOperation = 'destination-in'
        ctx.beginPath()
        ctx.roundRect(0, 0, size, size, radius)
        ctx.fill()
        
        ctx.globalCompositeOperation = 'source-over'
      }

      if (logoDataUrl) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const img = new Image()
          img.src = logoDataUrl

          await new Promise<void>((resolve) => {
            img.onload = () => {
              const canvasSize = canvas.width
              const maxLogoSize = canvasSize * 0.2
              const logoWidth = img.width
              const logoHeight = img.height
              const scale = Math.min(maxLogoSize / logoWidth, maxLogoSize / logoHeight)
              const finalLogoWidth = logoWidth * scale
              const finalLogoHeight = logoHeight * scale

              const x = (canvasSize - finalLogoWidth) / 2
              const y = (canvasSize - finalLogoHeight) / 2

              const radius = 8
              const padding = 10
              ctx.fillStyle = '#ffffff'
              ctx.beginPath()
              ctx.roundRect(x - padding, y - padding, finalLogoWidth + padding * 2, finalLogoHeight + padding * 2, radius)
              ctx.fill()

              ctx.strokeStyle = '#000000'
              ctx.lineWidth = 0.5
              ctx.stroke()

              ctx.drawImage(img, x, y, finalLogoWidth, finalLogoHeight)
              resolve()
            }
          })
        }
      }

      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `qr-code-${downloadResolution}px.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to download QR code')
    } finally {
      setIsDownloading(false)
    }
  }

  const renderFormFields = () => {
    switch (selectedType) {
      case 'wifi': {
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="ssid">SSID</Label>
              <Input
                id="ssid"
                placeholder="Network name"
                {...register('ssid', { required: selectedType === 'wifi' })}
              />
              {(errors as any).ssid && (
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
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
      }

      case 'url': {
        return (
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              {...register('url', { required: selectedType === 'url' })}
            />
            {(errors as any).url && (
              <p className="text-sm text-destructive">URL is required</p>
            )}
          </div>
        )
      }

      case 'text': {
        return (
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <textarea
              id="text"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter your text here..."
              {...register('text', { required: selectedType === 'text' })}
            />
            {(errors as any).text && (
              <p className="text-sm text-destructive">Text is required</p>
            )}
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header with Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight">QR Generator</h1>
            <p className="text-muted-foreground mt-2">
              Create QR codes for WiFi, URLs, or text
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Two column layout: form left, QR right on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Column */}
          <div className="space-y-6">
            {/* Type Selector */}
            <div className="flex gap-1 rounded-md bg-muted p-1">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTypeChange(opt.value)}
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

            <Card>
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
                <form onSubmit={handleSubmit(generateQR)} className="space-y-4">
                  {renderFormFields()}

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

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <Button type="submit" className="w-full">
                    Generate QR Code
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* QR Display Column */}
          <div className="space-y-6">
            {qrDataUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Your QR Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center rounded-lg border p-4">
                    <img
                      src={qrDataUrl}
                      alt="Generated QR Code"
                      className="h-80 w-80"
                    />
                  </div>

                  {/* Resolution selector for download */}
                  <div className="space-y-2">
                    <Label htmlFor="resolution">Download Resolution</Label>
                    <select
                      id="resolution"
                      value={downloadResolution}
                      onChange={(e) => setDownloadResolution(Number(e.target.value))}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {RESOLUTION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopyToClipboard}
                      className="flex-1"
                    >
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDownload}
                      className="flex-1"
                      disabled={isDownloading}
                    >
                      {isDownloading ? 'Generating...' : 'Download'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}