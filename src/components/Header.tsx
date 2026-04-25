import { Moon, Sun } from 'lucide-react'

interface HeaderProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-left">
        <h1 className="text-3xl font-bold tracking-tight">QR Generator</h1>
        <p className="text-muted-foreground mt-2">
          Create QR codes for WiFi, URLs, or text
        </p>
      </div>
      <button
        onClick={onToggleDarkMode}
        className="p-2 rounded-md hover:bg-muted transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </div>
  )
}