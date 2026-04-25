import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const RESOLUTION_OPTIONS = [
  { value: 300, label: 'Pequeño (300px)' },
  { value: 600, label: 'Mediano (600px)' },
  { value: 1200, label: 'Grande (1200px)' },
  { value: 2400, label: 'Impresión (2400px)' },
]

interface QRDisplayProps {
  qrDataUrl: string | null
  downloadResolution: number
  onResolutionChange: (resolution: number) => void
  onCopy: () => void
  onDownload: () => void
  copySuccess: boolean
  isDownloading: boolean
  error?: string | null
  onClearError?: () => void
}

export function QRDisplay({
  qrDataUrl,
  downloadResolution,
  onResolutionChange,
  onCopy,
  onDownload,
  copySuccess,
  isDownloading,
  error,
  onClearError,
}: QRDisplayProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Your QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
            {onClearError && (
              <button onClick={onClearError} className="ml-2 underline">
                Dismiss
              </button>
            )}
          </div>
        )}
        
        {!qrDataUrl ? (
          <div className="flex items-center justify-center h-80 rounded-lg border border-dashed">
            <p className="text-muted-foreground text-center px-4">
              Fill the form and click "Generate QR Code"<br/>
              to see your QR here
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center rounded-lg border p-4">
              <img
                src={qrDataUrl}
                alt="Generated QR Code"
                className="h-80 w-80"
              />
            </div>

            {/* Resolution selector */}
            <div className="space-y-2">
              <Label htmlFor="resolution">Download Resolution</Label>
              <select
                id="resolution"
                value={downloadResolution}
                onChange={(e) => onResolutionChange(Number(e.target.value))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
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
                onClick={onCopy}
                className="flex-1"
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onDownload}
                className="flex-1"
                disabled={isDownloading}
              >
                {isDownloading ? 'Generating...' : 'Download'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}