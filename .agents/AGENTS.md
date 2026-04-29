# AGENTS.md - generador-de-qr

**Project**: QR Code Generator Web Application
**Stack**: React 19 + TypeScript + Vite + Tailwind CSS v4 + qrcode

---

## Overview

This is a QR code generator web application that creates QR codes for WiFi networks, URLs, and plain text. The application supports logo embedding, dark mode, download resolution, and copy to clipboard.

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript (strict) |
| Build Tool | Vite 8+ (Rolldown) |
| Styling | **Tailwind CSS v4** (REQUIRED) |
| Form Handling | **Controlled inputs (useState)** - no react-hook-form in components |
| QR Library | qrcode |
| Icons | lucide-react |

## Critical Requirements

### ⚠️ STYLING: USE TAILWIND CSS v4
- **ALWAYS use Tailwind CSS** - No Plain CSS
- Use `@theme` block for CSS variables (v4 syntax, NOT @layer utilities)
- Example:
  ```css
  @theme {
    --color-background: #ffffff;
    --color-foreground: #171717;
  }
  ```

### FORM HANDLING
- Use **controlled inputs with useState** in components
- Parent component (QRGeneratorPage) handles the submit callback
- Child component (QRForm) manages its own state and validation
- Use proper TypeScript types - **NEVER use `any`**

### ACCESSIBILITY (WCAG 2.2)
- All form inputs must have programmatically associated labels (htmlFor + id)
- Error messages must have `role="alert"` and `aria-live="polite"`
- Use `aria-invalid` and `aria-describedby` for field validation
- Focus states must be visible (`:focus-visible`)
- Minimum touch target size: 24x24px
- Autocomplete attributes for password fields

### SEO
- Meta title and description in index.html
- Open Graph tags for social sharing
- Structured data (JSON-LD) for WebApplication

### PERFORMANCE
- Use lazy state initialization with `useState(() => ...)` for expensive values
- Memoize computed values with `useMemo` when needed
- Minimize re-renders with proper state management

---

## Project Structure

```
generador-de-qr/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components (Button, Input, Card, Label)
│   │   ├── QRForm.tsx     # Form for QR data input
│   │   ├── QRDisplay.tsx # QR code display
│   │   ├── TypeSelector.tsx
│   │   └── Header.tsx
│   ├── pages/
│   │   └── QRGeneratorPage.tsx  # Main page
│   ├── types/
│   │   └── index.ts     # TypeScript types
│   ├── lib/
│   │   └── utilities.ts
│   └── App.tsx
├── .agents/
│   ├── REQUIREMENTS.md   # Stack requirements (this file)
│   └── skills/         # Project skills
└── .atl/               # SDD metadata
```

---

## Available Skills

Project skills are located in `.agents/skills/`. Use them for:

| Skill | When to Use |
|-------|-------------|
| tailwind-css-patterns | Styling components |
| vercel-react-best-practices | Performance optimization |
| vercel-composition-patterns | Component refactoring |
| accessibility | WCAG compliance |
| react-hook-form | Form handling |

---

## Key Conventions

### WiFi QR Format
```typescript
// WiFi QR string format: WIFI;T:WPA;S:ssid;P:password;H:hidden;;
const hiddenStr = data.hidden ? 'true' : 'false'
const qrString = `WIFI:T:${encryption};S:${ssid};P:${password};H:${hiddenStr};;`
```

### Types
```typescript
// Define QR data types in src/types/index.ts
export type QRType = 'wifi' | 'url' | 'text'

export interface WifiData {
  ssid: string
  password?: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

export interface UrlData {
  url: string
}

export interface TextData {
  text: string
}
```

### Controlled Form Pattern
```typescript
// Child component (QRForm) - manages its own state
interface QRFormProps {
  selectedType: QRType
  logoDataUrl: string | null
  onLogoChange: (dataUrl: string | null) => void
  onGenerate: (data: WifiData | UrlData | TextData) => void
}

// Use controlled inputs
const [ssid, setSsid] = useState('')
<Input value={ssid} onChange={(e) => setSsid(e.target.value)} />

// Validate in child, call parent's onGenerate with full data
const handleSubmit = () => {
  onGenerate({ ssid, password, encryption, hidden })
}
```

### Tailwind v4 CSS
```typescript
// In index.css - use @theme not @layer
@theme {
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-primary: oklch(0.205 0 0);
}
```

### Form Validation in Controlled Components
```typescript
// Validate before submit
const validate = (): boolean => {
  const newErrors: Record<string, string> = {}
  if (selectedType === 'wifi' && !ssid.trim()) {
    newErrors.ssid = 'SSID is required'
  }
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

// Show errors with a11y attributes
{errors.ssid && (
  <p id="ssid-error" className="text-sm text-destructive" role="alert">
    {errors.ssid}
  </p>
)}
```

---

## Testing

Run dev server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```