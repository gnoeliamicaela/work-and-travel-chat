# Copiloto Work and Travel

Sitio con chat con inteligencia artificial que ayuda a argentinos que
estan evaluando o haciendo el programa Work and Travel a Estados Unidos.
El chat responde en base a una base de conocimiento propia en
`/knowledge` (RAG liviano por keywords, sin base vectorial), no a
conocimiento generico del modelo.

Ver [docs/case-study.md](docs/case-study.md) para las decisiones de
producto detras del proyecto.

## Requisitos previos

Este entorno no tiene Node.js instalado. Para correr el proyecto hace
falta instalar Node.js 20 o superior (por ejemplo desde
https://nodejs.org, o via `nvm`).

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Completar en `.env.local`:

- `ANTHROPIC_API_KEY`: clave de la API de Anthropic.
- `N8N_WEBHOOK_DOWNLOAD_URL` y `N8N_WEBHOOK_UNANSWERED_URL`: URLs de los
  webhooks de la instancia de n8n. Se pueden dejar vacias en desarrollo,
  el envio simplemente se omite.

## Contenido de /knowledge

Los 6 archivos markdown de `/knowledge` estan creados con su frontmatter
y estructura de secciones, pero el contenido real de cada seccion esta
marcado como pendiente (`_Contenido pendiente: completar..._`). Ese
contenido lo tiene que escribir la autora con su experiencia real
coordinando el programa, no esta generado por el asistente. Las paginas
del sitio y el chat se alimentan directamente de estos archivos, asi que
completarlos es el paso principal antes de mostrar el sitio.

## Generar el PDF del checklist

Una vez completado `knowledge/checklist.md`:

```bash
npm run generate:checklist
```

Esto genera `public/downloads/checklist-pre-viaje.pdf`, que es el archivo
que sirve el endpoint `/api/download`.

## Correr en desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000

## Deploy

Pensado para Vercel. Configurar las mismas variables de entorno de
`.env.local` en el proyecto de Vercel antes de deployar.

## Estructura

Ver el detalle completo en
[docs/case-study.md](docs/case-study.md) y en las notas de
[docs/decisions/](docs/decisions/). Resumen rapido:

- `app/`: paginas (App Router) y las API routes `chat` y `download`.
- `components/`: chat, layout y componentes de UI reutilizables.
- `knowledge/`: base de conocimiento en markdown, fuente unica para el
  sitio y para el chat.
- `lib/`: retrieval por keywords, armado del prompt, cliente de Claude,
  webhooks a n8n y manejo de sesion anonima.
- `scripts/`: generacion del PDF del checklist a partir del markdown.
- `docs/`: case study y decisiones de producto para portfolio.
