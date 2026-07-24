# Barber App Web Portal: High-Level Design (HLD)

## 1. Introduction
The **Barber App Web Portal** (Next.js Application) represents the public face and Top-of-Funnel (ToFu) driver of the ecosystem. It aggregates data from the operational hubs (Customer, Freelance, Manager) to serve SEO-optimized directories, editorial blog content, and localized grooming planners, aimed at capturing unauthenticated web traffic.

## 2. System Architecture
Built exclusively on Next.js 14+ utilizing the App Router architecture.

### 2.1 Architectural Pattern
*   **Server-Side Rendering (SSR) & Static Site Generation (SSG):** Eliminates loading spinners for external search crawlers (Googlebot). Pre-compiles Markdown blogs and high-value landing pages during build time.
*   **Materialized View Consumption:** To protect the core transactional database supporting the salons, this portal reads strictly from pre-computed, flattened `public_directory_listings` tables (Materialized Views).
*   **Server Actions for Mutations:** Form submissions (Contacts, Newsletters, Wishlists) bypass traditional REST APIs and execute securely on the server via Next.js strictly typed Server Actions.

### 2.2 Core Components
1.  **The Directory Compiler:** Scans the `public_directory_listings` view to generate semantic `/vendors/[city]/[slug]` HTML structures.
2.  **MDX Content Engine:** Parses local or remote `.mdx` files into React components, mapping Frontmatter to SEO meta-tags.
3.  **Local Session Planner:** Engages unauthenticated users using `localStorage` to simulate Wishlists and Event Checklists without demanding immediate signup.

## 3. Data Flow
1.  **Organic Search Hit (e.g., "Best barbers in Bangalore")** -> Next.js resolves `/vendors/bangalore`.
2.  **Server Execution:** `page.tsx` awaits a raw Prisma/SQL query against the `public_directory_listings` view where `city_slug = 'bangalore'`.
3.  **HTML Generation:** The server constructs the React DOM populated with the data and sends pure HTML to the client browser.
4.  **Client Hydration:** React boots in the browser to enable interactive components (like image carousels or map pin popups).

## 4. Technology Stack
*   **Core Framework:** Next.js 14+ (App Router).
*   **Database ORM:** Prisma ORM for type-safe database access directly inside Server Components.
*   **Content:** `next-mdx-remote` or similar for compiling Markdown.
*   **Styling:** Tailwind CSS v4.
*   **Validation:** `zod` for parsing Server Action payloads.

## 5. Non-Functional Requirements (NFRs)
*   **SEO & Core Web Vitals:** Strict adherence to LCP (< 2.5s), CLS (< 0.1), and FID (< 100ms) thresholds.
*   **Caching Strategy:** Heavy reliance on Next.js `fetch` caching and Revalidation metrics (e.g., `revalidate: 3600`) to balance fresh data vs. server load.
