# Architecture

## Goal

A private recipe book that feels like a polished market app, optimized for photo-based recipes with 3–10 pages each.

## Current starter architecture

```text
Browser PWA
  ├─ Next.js App Router
  ├─ React UI components
  ├─ IndexedDB via Dexie
  ├─ Service worker cache
  └─ Manifest for installable iOS/iPadOS experience
```

## Data model

```text
Recipe
  id
  title
  description
  tags[]
  collections[]
  favorite
  pages[]
  notes
  createdAt
  updatedAt

RecipePage
  id
  pageNumber
  imageDataUrl
  ocrText
```

## Upgrade path

### Phase 1: local personal app

Use this starter as-is.

### Phase 2: private cloud sync

Add Supabase:

- `recipes`
- `recipe_pages`
- `tags`
- `recipe_tags`
- `collections`
- `collection_recipes`
- `notes`

### Phase 3: media pipeline

Move images out of IndexedDB and into object storage:

```text
original/
large/
medium/
thumb/
blur/
```

### Phase 4: OCR and smart search

Extract OCR text per page and index title, tags, notes, collections, and OCR text.
