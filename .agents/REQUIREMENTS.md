# Stack Requirements - generador-de-qr

**Last Updated**: 2026-04-29
**Project**: generador-de-qr

## Technology Stack

| Category | Technology | Version | Notes |
|----------|------------|---------|-------|
| Framework | React | 19 | - |
| Language | TypeScript | 5.x | strict mode |
| Build Tool | Vite | 8+ | Rolldown-powered |
| Styling | Tailwind CSS | v4 | @theme for CSS variables |
| Form Handling | react-hook-form | latest | - |
| QR Generation | qrcode | latest | Canvas-based |
| Icons | lucide-react | latest | - |

## Preferences

### Styling
- **USE Tailwind CSS v4** - No Plain CSS
- Use `@theme` block for CSS variables (v4 syntax)
- Responsive first (mobile → desktop)
- Dark mode support with `data-theme` attribute

### Form Handling
- Use react-hook-form with proper TypeScript inference
- Avoid `any` type assertions
- Implement proper validation with error messages

### Performance
- Lazy initialization for expensive operations
- Memoize watched fields
- Avoid unnecessary re-renders

### Accessibility (WCAG 2.2)
- All form inputs must have associated labels
- Error messages with `role="alert"` and `aria-live`
- Focus visible states
- 24x24px minimum touch targets

### SEO
- Meta title and description
- Structured data (JSON-LD) where appropriate
- Semantic HTML heading structure