# Barber App Web Portal: Architecture & SEO Blueprint

This document serves as the master architectural outline for the **Next.js Web Portal**, the public-facing directory and Top-of-Funnel (ToFu) driver. Unlike the Vite SPAs, this repository leverages the App Router paradigm to maximize organic search visibility and initial page load speeds.

## 1. Executive Summary & Domain Driven Design
The Next.js node operates primarily as an Aggregator and Content Management layer. It reads heavily from Materialized Views (flattened data from the operational apps) to instantly serve HTML to search engine crawlers. Internally, it handles decoupled logic like `planner_events` (Checklists) for unregistered users acting via local session state.

*   **Primary Actors:** Googlebot, Unregistered Traffic, Engaged Grooms/Brides.
*   **Core Domains:** SEO Generation, Static CMS Routing, Interactive Client Planning.

## 2. Core Modules & Exhaustive Route Mapping
Because this uses the App Router, every folder is a literal URL path, requiring careful distinction between Server Components (`async function`) and Client Components (`"use client"`).

| App Route (Folder) | Files | Next.js Pattern | Primary Architectural Responsibility |
| :--- | :--- | :--- | :--- |
| **`/` (Root)** | `page.tsx` | Server Component | High-conversion landing page fetching aggregated `directory_listings`. |
| **`/vendors`** | `page.tsx` | Server Component | The main Search Index. Executes raw SQL/Prisma queries against the `directory_listings` view. |
| **`/vendors/[slug]`**| `page.tsx`, `layout.tsx` | Server/SSG | Generates static HTML for specific salon profiles. Uses `generateMetadata()` for `<title>` tags. |
| **`/compare`** | `page.tsx` | Client Component | Interactive tool comparing up to 3 `directory_listings` side-by-side using local state arrays. |
| **`/stories`** | `page.tsx` | Server Component | Serves CMS excerpts for blog loops. |
| **`/stories/[slug]`**| `page.tsx` | SSG via `generateStaticParams`| Compiles Markdown/MDX into static HTML for maximum blog performance. |
| **`/wishlist`** | `page.tsx` | Client Component | Reads `user_wishlists` from session to render saved vendors. |
| **`/planner`** | `page.tsx` | Client/Server Action | Bootstraps a `planner_events` timeline via a `<form action={...}>`. |
| **`/checklist`** | `page.tsx` | Client Component | Interactive To-Do list mapping `planner_checklist_tasks`. |
| **`/contact`** | `page.tsx` | Server Action Form | Replaces REST API calls; writes directly to `contact_leads` via a Zod-validated Action. |

## 3. Technology Stack & Infrastructure
*   **Core Framework:** Next.js 14+ (App Router).
*   **Data Fetching:** Direct database access within Server Components (eliminating the need for an intermediate API layer for read operations).
*   **Styling:** Tailwind CSS v4 utilizing the new `@tailwindcss/postcss` compiler.
*   **Forms & Mutations:** Next.js Server Actions paired with `zod` schema parsing for maximum security without exposing API routes.
*   **Animations:** `framer-motion` restricted tightly to Client Components (e.g., hero fade-ins).

## 4. Modular Folder Structure
Adhering to strict Next.js conventions:
```text
/
├── app/                  
│   ├── (vendor)/         # Route Group: Keeps URL clean but groups vendor-specific styles.
│   ├── vendors/[slug]/   # Dynamic Route: Handled by DB slug lookups.
│   ├── api/v1/           # Rarely used; only for webhooks or external CRON pings.
│   ├── layout.tsx        # Global HTML shell injecting root providers.
│   └── page.tsx          # Root URL (/)
├── components/           
│   ├── Navbar.tsx        # Client/Server mix for responsive menus.
│   └── ui/               # Server-Component compatible shadcn primitives.
└── lib/                  # Server-side utils (DB instances, Session decoders).
```

## 5. System Cross-References
As the aggregator of the ecosystem, refer to the deep data constraints driving the Next.js cache mechanisms:
*   🔗 **[SCHEMA.md](./SCHEMA.md)**: Details the crucial Materialized View structures (`public_directory_listings`) that Next.js queries safely without impacting live salon throughput.
*   🔗 **[API_REQUIREMENTS.md](./API_REQUIREMENTS.md)**: Details the explicit inputs/outputs required for the Server Actions (like Contact and Planning tools) listed in Section 2.
