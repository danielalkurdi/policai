# Policai Data Observatory Redesign

**Date:** 2026-04-06
**Direction:** Utilitarian / institutional — data observatory style
**Scope:** Full site design pass (all pages, header, footer, theme)

## Design Principles

1. The interface disappears; the data speaks
2. Remove every element that isn't data or navigation
3. No cards, no badges, no stat blocks, no gradients, no decorative icons
4. Text, tables, and rules are the only structural elements
5. Light mode only

## Global Theme

### Color Palette

- **Background:** `#f8f7f5` (warm off-white, paper-like)
- **Foreground:** `#1a1a1a` (near-black)
- **Muted text:** `#666666`
- **Secondary text:** `#888888`
- **Borders:** `#d4d4d4` (1px lines)
- **Strong rule:** `#1a1a1a` (2px, used for header bottom border and table headers)
- **Accent/links:** `#1e40af` (deep blue, for interactive elements only)
- **Status colors (muted, text-only, no badges):**
  - Active: `#16a34a`
  - Proposed: `#d97706`
  - Amended: `#2563eb`
  - Repealed: `#6b7280`

### Typography

- **Primary:** IBM Plex Sans (400, 500, 600, 700)
- **Metadata/labels:** IBM Plex Mono (400, 500)
- **Usage rules:**
  - Plex Sans: all headings, body text, navigation, descriptions
  - Plex Mono: jurisdiction labels, policy type, dates, counts, filter section labels, breadcrumbs, footer
- **No system fonts, no Inter, no serif fonts**

### Structural Elements

- Remove `ThemeProvider`, `ThemeToggle`, all dark mode CSS variables
- Remove `@custom-variant dark` from globals.css
- Remove `.dark {}` block from globals.css
- Replace entire color system with flat light-mode-only CSS variables
- Remove `next-themes` dependency

## Header

- **Left:** `POLICAI` in Plex Sans 700, uppercase, letter-spacing 0.5px. No logo icon, no rounded box — the wordmark alone.
- **Nav:** Text-only links — Policies, Map, Agencies. No icons. Active state: 2px bottom border in accent color. Hover: text color darkens.
- **Right:** `Admin` text link only. No button styling. No theme toggle.
- **Bottom border:** 2px solid `#1a1a1a` — the strongest visual anchor on the page.
- **Mobile:** Hamburger menu with same simplified nav items inside.
- **Height:** Compact — approximately 48px.

## Homepage (Policy Browser)

The homepage IS the policy browser. No hero, no stats, no marketing copy. The route `/` renders the policy browser. The `/policies` route redirects to `/` or renders the same component.

### Layout: Sidebar + Main

- **Sidebar (240px, left):**
  - Section label: `FILTERS` in Plex Mono, uppercase, 11px, 600 weight, `#666`
  - Dropdowns: Jurisdiction, Type, Status. Minimal styling — label above, select below, 1px border
  - Below filters, separated by a 1px border-top:
  - Section label: `SUMMARY` in same style
  - Stats in Plex Mono: `10 policies`, `4 jurisdictions`, `8 agencies` — each on its own line, count in bold `#1a1a1a`, label in `#666`
  - On mobile: sidebar collapses to a horizontal filter bar or a toggle-to-reveal panel

- **Main area:**
  - Search input at top: full width, minimal — bottom border only, no box border. Plex Sans placeholder text. Search icon optional (subtle, left-aligned)
  - Count line below: `Showing 10 of 10 policies` in Plex Mono, `#888`, 12px
  - Data table:
    - Columns: Policy (flex, left-aligned), Jurisdiction, Type, Status, Date
    - Header row: Plex Mono, uppercase, 11px, 600 weight, `#666`. 2px solid `#1a1a1a` bottom border
    - Body rows: Plex Sans. Policy title is a link in `#1e40af`. Other columns in `#666`. 1px `#e5e5e5` row borders
    - Status column: colored text only (no badges, no backgrounds). Uses status color palette above
    - Row hover: `#f0efed` background
    - Sortable columns: click header to sort, subtle arrow indicator
  - On mobile: table adapts to a stacked list layout — each policy as a block with metadata below the title

## Policy Detail (`/policies/[id]`)

- **Breadcrumb:** `Policies > [Title]` in Plex Mono, 12px, `#888`. "Policies" links back to homepage
- **Title:** Plex Sans, 28px, 700 weight, `#1a1a1a`
- **Metadata row:** Horizontal, Plex Mono, 13px. Dot-separated: `Federal · Framework · Active · January 2026`. Status word uses its status color. No badges, no backgrounds.
- **Tabs:** Text-only. Active tab: 2px bottom border in `#1a1a1a`. Inactive: `#666`, no border. Hover: `#1a1a1a` text.
- **Tab content:**
  - Overview: clean prose in Plex Sans, 15px line-height 1.6
  - AI Summary: if present, in a box with 1px `#d4d4d4` border, `AI SUMMARY` label in Plex Mono above
  - Tags: if present, plain text comma-separated in Plex Mono, not pill badges
  - Source link: plain text link in accent blue
- **Related policies:** simple list, same style as main table rows

## Map Page

### Layout: Sidebar + Main (same pattern)

- **Remove:** stat cards row at top
- **Sidebar:**
  - Heading: `JURISDICTIONS` in Plex Mono
  - List of all 9 jurisdictions as clickable text items. Selected: bold + accent color left border (2px)
  - When a jurisdiction is selected: its policies appear as a compact list below the jurisdiction list, separated by a border
- **Main area:**
  - Australia SVG map, fills available space
  - State hover: show tooltip with jurisdiction name and policy count
  - State click: selects in sidebar
  - No "Browse All Policies" button in empty state. Just: `Select a state or territory` in Plex Mono, centered in map area, `#888`

## Agencies Page

### Layout: Sidebar + Main (same pattern)

- **Remove:** large stat cards (Total Agencies, Published, No Statement)
- **Sidebar:**
  - Search input (same minimal style)
  - Filter dropdown: All Agencies / Published / No Statement
  - Summary line in Plex Mono: `50 agencies · 48 published · 2 pending`
- **Main area:**
  - Data table with columns: Agency, Acronym, Jurisdiction, Statement Status
  - Statement status: `Published` in green text, `Pending` in amber text. No icons, no checkmarks.
  - Row click or expand: shows transparency statement inline below the row (accordion style) — not a modal, not a separate page
  - Includes: AI Transparency Statement text, AI Usage info, last updated date, link to website

## Footer

Single line. Centered. Plex Mono, 12px, `#888`.

```
© 2026 Policai · About · Methodology · GitHub
```

- Thin 1px `#d4d4d4` border-top
- Minimal padding: `16px 0`
- Links in `#666`, hover `#1a1a1a`
- No grid, no columns, no social icons, no description text

## Files to Modify

### Delete or simplify:
- `src/components/theme-toggle.tsx` — delete
- `src/components/theme-provider.tsx` — delete or reduce to a no-op wrapper
- Remove `next-themes` from package.json

### Major rewrites:
- `src/app/globals.css` — new flat color system, IBM Plex font imports, remove dark mode
- `src/app/layout.tsx` — remove ThemeProvider, add font loading
- `src/app/page.tsx` — replace hero/stats/recent with policy browser (sidebar + table)
- `src/components/layout/Header.tsx` — stripped-down wordmark + text nav
- `src/components/layout/Footer.tsx` — single line
- `src/app/policies/page.tsx` — redirect to `/` or share component
- `src/app/map/page.tsx` — sidebar layout, remove stat cards
- `src/app/agencies/page.tsx` — table layout, remove stat cards
- `src/app/policies/[id]/page.tsx` and `policy-detail-tabs.tsx` — restyle metadata and tabs

### Leave unchanged:
- `src/app/admin/` — admin pages are internal, don't need the redesign
- `src/app/api/` — backend routes unchanged
- `src/lib/` — business logic unchanged
- `src/types/` — type definitions unchanged
- `src/components/visualizations/AustraliaMap.tsx` — keep SVG map, may need minor style updates
- `src/app/network/page.tsx` — not in main nav, leave as-is
- `src/app/framework/page.tsx` — not in main nav, leave as-is
- `src/app/timeline/page.tsx` — not in main nav, leave as-is

## Mobile Responsive Strategy

- Sidebar collapses: on screens < 768px, the filter sidebar becomes a collapsible panel toggled by a button
- Data tables: switch to stacked card-like layout on mobile (each row becomes a block)
- Header: hamburger menu for nav items on mobile (keep existing pattern)
- Footer: same single line, wraps naturally
