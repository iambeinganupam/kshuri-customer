# Exhaustive API Requirements (Mapped by Next.js Route)

This document maps the exact Next.js App Router paths (`app/...`) to their necessary data-fetching functions. Because this is Next.js 14+, most of these act as `fetch` calls running inside **Server Components** or **Server Actions**, directly hitting the backend database or an internal microservice layer.

---

## 1. Landing & Navigation
**Routes:** `app/page.tsx`, `components/Navbar.tsx`

| App Route / Component | Action / Hook | Next.js Pattern | Internal Query/Endpoint | Input Contract | Output Contract |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **page.tsx** | Hero Section Stats | Server Component | `GET /api/v1/public/stats` | `-` | `{ total_vendors: 400, cities: 5 }` |
| **page.tsx** | Featured Vendors Grid | Server Component | `GET /api/v1/public/directory/featured` | `?limit=6` | `[ { slug, name, image, rating } ]` |
| **page.tsx** | Trending Services | Server Component | `GET /api/v1/public/directory/trending` | `?limit=8` | `[ { id, name, avg_price } ]` |
| **Navbar.tsx** | Mega Menu Categories | Server Component | `GET /api/v1/public/directory/categories`| `-` | `[ { label: "Hair", sub: ["Balayage", "Cut"] } ]` |

---

## 2. Directory & Comparison
**Routes:** `app/vendors/`, `app/services/`, `app/compare/`

| App Route / Component | Action / Hook | Next.js Pattern | Internal Query/Endpoint | Input Contract | Output Contract |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **vendors/page.tsx** | Search & Filter Grid | Server Component | `GET /api/v1/public/directory/search` | `?q=Hair&lat=...&lng=...&page=1` | `{ results: [...], pagination: {...} }` |
| **vendors/[slug]**| Metadata Gen. | `generateMetadata`| `GET /api/v1/public/directory/:slug/meta`| `{ slug: "royal-cuts" }` | `{ title, description, ogImage }` |
| **vendors/[slug]**| Deep Profile Load | Server Component | `GET /api/v1/public/directory/:slug` | `{ slug: "royal-cuts" }` | `{ biz_name, address, full_menu: [] }` |
| **services/page.tsx**| Dictionary Browse | Server Component | `GET /api/v1/public/directory/services` | `?category=skin` | `[ { name, description, avg_price_city } ]` |
| **compare/page.tsx** | Side-by-Side View | Client Component | `GET /api/v1/compare/matrix` | `?vendor_ids=v1,v2,v3` | `[ { id, price, rating, distance } ]` |

---

## 3. Editorial & SEO Content
**Routes:** `app/stories/`

| App Route / Component | Action / Hook | Next.js Pattern | Internal Query/Endpoint | Input Contract | Output Contract |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **stories/page.tsx** | List Blog Posts | Server Component | `GET /api/v1/public/cms/posts` | `?status=published&page=1` | `[ { slug, title, hero_img, published_at } ]` |
| **stories/[slug]**| Fetch MDX Content | Server Component | `GET /api/v1/public/cms/posts/:slug` | `{ slug: "bridal-trends" }`| `{ title, content_mdx, author }` |
| **stories/[slug]**| Static Generations | `generateStaticParams`| `GET /api/v1/public/cms/slugs` | `-` | `[ { slug: "bridal-trends" }, ... ]` |

---

## 4. Planning & Engagement
**Routes:** `app/checklist/`, `app/planner/`, `app/wishlist/`, `app/dashboard/`

| App Route / Component | Action / Hook | Next.js Pattern | Internal Query/Endpoint | Input Contract | Output Contract |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **wishlist/page.tsx**| Load Saved Items | Client Component | `GET /api/v1/planner/wishlists/me` | `-` | `[ { type: "vendor", item: { name } } ]` |
| **wishlist/Button**| Toggle Save State | Server Action | `POST /api/v1/planner/wishlists/toggle`| `{ target_type, target_id }` | `{ is_saved: true, message: "Added" }` |
| **planner/page.tsx** | Create Timeline | Server Action | `POST /api/v1/planner/events` | `{ event_name, event_date }` | `{ id: "evt-uuid", tasks_generated: 12 }` |
| **checklist/page.tsx**| Load User Tasks | Client Component | `GET /api/v1/planner/events/:id/tasks`| `?status=all` | `[ { id, title, due_date, is_completed } ]` |
| **checklist/Row** | Toggle Completion | Server Action | `PATCH /api/v1/planner/tasks/:id` | `{ is_completed: true }` | `{ message: "Task marked done." }` |
| **dashboard/page.tsx**| Portal Overview | Client Component | `GET /api/v1/planner/dashboard-kpis` | `-` | `{ total_saved: 5, active_events: 1 }` |

---

## 5. Forms & Support
**Routes:** `app/contact/`, `Footer.tsx`

| App Route / Component | Action / Hook | Next.js Pattern | Internal Query/Endpoint | Input Contract | Output Contract |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **contact/page.tsx** | Submit Inquiry | Server Action | `POST /api/v1/crm/leads` | `{ first_name, email, intent, msg }` | `{ success: true, message: "Sent!" }` |
| **Footer.tsx** | Newsletter Signup | Server Action | `POST /api/v1/crm/newsletter` | `{ email_address }` | `{ success: true, message: "Subscribed!" }` |
