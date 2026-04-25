# Generador de QR

Herramienta para generar códigos QR desarrollada con React, TypeScript y Tailwind CSS.

## Características

- **Tipos de QR disponibles:**
  - 📶 **WiFi** — Conectar directo a redes inalámbricas
  - 🔗 **URL** — Redirigir a enlaces web
  - 📝 **Texto** — Cualquier información en texto

- **Funcionalidades:**
  - 🌙 Modo oscuro/claro (se guarda en el navegador)
  - 🖼️ Subir logo de empresa centrado en el QR
  - ⬜ Esquinas redondeadas del QR
  - 💾 Descarga en varias resoluciones (300px - 2400px)
  - 📋 Copiar al portapapeles

- **Stack técnico:**
  - React 19
  - TypeScript
  - Vite
  - Tailwind CSS v4
  - shadcn/ui
  - react-hook-form
  - qrcode

## Cómo usarlo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## Opciones de descarga

| Opción | Tamaño | Para |
|--------|--------|------|
| Pequeño | 300px | Redes sociales |
| Mediano | 600px | Pantallas |
| Grande | 1200px | Impresión mediana |
| Impresión | 2400px | Folletos, carteles |

## Autor

Alejandro Guzmán Rodríguez

## Licencia

MIT