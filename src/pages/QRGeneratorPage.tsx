import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import QRCode from 'qrcode'

import { Header } from '@/components/Header'
import { TypeSelector } from '@/components/TypeSelector'
import { QRForm } from '@/components/QRForm'
import { QRDisplay } from '@/components/QRDisplay'

import type { QRType, WifiData, UrlData, TextData } from '@/types'

const QR_GENERATOR_OPTIONS = {
  errorCorrectionLevel: 'H' as const,
  width: 600,
  margin: 2,
}

// Helper: Escape special chars for WiFi format
function escapeWifiString(str: string): string {
  return str.replace(/([;,:;"\\])/g, '\\$1')
}

// Helper: Build WiFi QR string
function buildWifiString(data: WifiData): string {
  const escapedSsid = escapeWifiString(data.ssid)
  const escapedPassword = escapeWifiString(data.password)
  const hiddenStr = data.hidden ? 'true' : 'false'
  return `WIFI:T:${data.encryption};S:${escapedSsid};P:${escapedPassword};H:${hiddenStr};;`
}

type FormData = WifiData | UrlData | TextData

export default function QRGeneratorPage() {
  const [selectedType, setSelectedType] = useState<QRType>('wifi')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [rawString, setRawString] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [downloadResolution, setDownloadResolution] = useState(600)
  const [isDownloading, setIsDownloading] = useState(false)

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Apply theme on mount and changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  const {
    reset,
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

  const handleTypeChange = (type: QRType) => {
    setSelectedType(type)
    setQrDataUrl(null)
    setRawString('')
    setError(null)
    setCopySuccess(false)
    reset()
  }

  const handleLogoChange = (dataUrl: string | null) => {
    setLogoDataUrl(dataUrl)
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

      // Create canvas and generate QR
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, qrString, QR_GENERATOR_OPTIONS)

      // Apply rounded corners
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const size = canvas.width
        const radius = 16
        ctx.globalCompositeOperation = 'destination-in'
        ctx.beginPath()
        ctx.roundRect(0, 0, size, size, radius)
        ctx.fill()
        ctx.globalCompositeOperation = 'source-over'
      }

      // Draw logo if present
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
              const borderWidth = QR_GENERATOR_OPTIONS.width >= 2400 ? 2 : 1

              ctx.fillStyle = '#ffffff'
              ctx.beginPath()
              ctx.roundRect(x - padding, y - padding, finalLogoWidth + padding * 2, finalLogoHeight + padding * 2, radius)
              ctx.fill()

              ctx.strokeStyle = '#000000'
              ctx.lineWidth = borderWidth
              ctx.stroke()

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
      const response = await fetch(qrDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
      setCopySuccess(true)
    } catch {
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
        ctx.globalCompositeOperation = 'destination-in'
        ctx.beginPath()
        ctx.roundRect(0, 0, size, size, radius)
        ctx.fill()
        ctx.globalCompositeOperation = 'source-over'
      }

      // Draw logo if present
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
              const borderWidth = downloadResolution >= 2400 ? 2 : 1

              ctx.fillStyle = '#ffffff'
              ctx.beginPath()
              ctx.roundRect(x - padding, y - padding, finalLogoWidth + padding * 2, finalLogoHeight + padding * 2, radius)
              ctx.fill()

              ctx.strokeStyle = '#000000'
              ctx.lineWidth = borderWidth
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

        <div className="grid grid-cols-1  md:grid-cols-2 gap-6">
          <div className=" flex flex-col gap-6">
            <TypeSelector
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
            />
            <QRForm
              selectedType={selectedType}
              logoDataUrl={logoDataUrl}
              onLogoChange={handleLogoChange}
              onGenerate={generateQR}
            />
          </div>

          <div className="space-y-6">
            <QRDisplay
              qrDataUrl={qrDataUrl}
              downloadResolution={downloadResolution}
              onResolutionChange={setDownloadResolution}
              onCopy={handleCopyToClipboard}
              onDownload={handleDownload}
              copySuccess={copySuccess}
              isDownloading={isDownloading}
              error={error}
              onClearError={() => setError(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}