# Blog Page Design Spec

## Overview

Add a blog to Policai for project updates and AI policy commentary. Single author (developer), content stored as MDX files in the repo, processed by Contentlayer2 into typed data at build time.

## Content Authoring

- Blog posts live in `content/blog/` at the project root
- Each post is a single `.mdx` file named by slug (e.g., `welcome-to-policai.mdx`)
- Frontmatter schema:

```yaml
---
title: string       # Post title (required)
date: string        # ISO date, e.g. "2026-04-11" (required)
description: string # Short excerpt for list page and meta tags (required)
---
```

- Contentlayer2 processes these files at build time, generating typed TypeScript objects
- MDX allows embedding React components inside Markdown if needed in the future

## Dependencies

- `contentlayer2` — MDX/Markdown content processing with type generation
- `next-contentlayer2` — Next.js integration plugin (wraps next config)
- `@tailwindcss/typography` — Prose styling for rendered Markdown content

## Pages & Routing

### `/blog` — Blog List Page

- Server Component at `src/app/blog/page.tsx`
- Displays all posts in reverse chronological order (newest first)
- Each entry shows: title, date (formatted), description
- Uses shadcn/ui Card components for consistent styling with the rest of the site
- Links to individual post pages

### `/blog/[slug]` — Blog Post Page

- Server Component at `src/app/blog/[slug]/page.tsx`
- Looks up post by slug from Contentlayer's generated data
- Renders MDX content with Tailwind typography prose classes
- Shows title, date, and back-link to `/blog`
- Returns 404 via `notFound()` if slug doesn't match any post

## Navigation

- "Blog" added as the 4th item in the main header navigation, after "Agencies"
- Modification to `src/components/layout/Header.tsx` (or equivalent nav component)

## Styling

- Follows existing project patterns: Tailwind CSS utility classes, `cn()` for conditional classes
- Blog list: shadcn/ui Card components matching the policy list card style
- Blog post content: `@tailwindcss/typography` prose classes for readable long-form text
- Light theme, consistent with the IBM Plex color system used across the site

## Configuration

- Contentlayer config file at project root: `contentlayer.config.ts`
- Defines a `Post` document type with the frontmatter schema above
- `next.config.ts` wrapped with `withContentlayer()` from `next-contentlayer2`

## Seed Content

- One initial post (`welcome-to-policai.mdx`) to verify the setup works end-to-end

## Out of Scope

- Comments or user interaction
- Tags, categories, or filtering
- RSS feed
- Search within blog posts
- Multiple authors
