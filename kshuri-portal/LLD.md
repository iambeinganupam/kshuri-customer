# Barber App Web Portal: Low-Level Design (LLD)

## 1. Class & Component Architecture

### 1.1 App Router File Structure
Next.js leverages filesystem-based routing.
*   `app/`
    *   `layout.tsx` (Global HTML/Body shell, Navbar, Footer)
    *   `page.tsx` (Homepage - Server Component)
    *   `vendors/`
        *   `page.tsx` (Directory Grid - Server Component)
        *   `[slug]/page.tsx` (Deep Profile - Server Component)
    *   `stories/`
        *   `page.tsx` (Blog Loop)
        *   `[slug]/page.tsx` (MDX Renderer)
    *   `planner/` (Interactive Client Components)
        *   `page.tsx`
        *   `ChecklistUI.tsx`
    *   `contact/page.tsx` (Form with Server Action execution)

### 1.2 Interactive Islands (Client vs Server)
By default, everything is a Server Component (`async function`). Client components (`"use client"`) are pushed as far down the tree as possible.
```tsx
// Server Component (app/vendors/[slug]/page.tsx)
import { getVendorBySlug } from '@/lib/db';
import VendorMap from './VendorMap'; // Client Component

export default async function VendorProfile({ params }) {
  const data = await getVendorBySlug(params.slug);
  return (
    <div>
      <h1>{data.display_name}</h1>
      <VendorMap coordinates={data.location_coordinates} /> 
    </div>
  );
}
```

## 2. Sequence Diagrams (Critical Paths)

### 2.1 Submitting a Contact Lead (Server Action)
1.  **Actor (User):** Fills out the Contact Form on `/contact` and hits Submit.
2.  **Client Component:** Prevents default. Calls imported function `submitContactForm(formData)`.
3.  **Network Transport:** Next.js seamlessly POSTs a multipart payload to the associated server endpoint behind the scenes.
4.  **Server Action (`lib/actions.ts`):** 
    *   Parses the payload using `ContactSchema.parse(data)`.
    *   Uses Prisma to `await prisma.contact_leads.create(...)`.
    *   Returns `{ success: true }`.
5.  **Client Component:** Awaits response. Displays success toast message.

### 2.2 SEO Rendering (SSG on Blogs)
1.  **Build Phase (`next build`):**
2.  Next.js encounters `app/stories/[slug]/page.tsx`.
3.  Executes `generateStaticParams()`, fetching all published slugs from DB.
4.  For every slug (e.g., `bridal-trends`), fetches the MDX content.
5.  Compiles MDX to raw HTML.
6.  Saves `bridal-trends.html` to the `.next/server` directory.
7.  **Runtime Phase:** Traffic requesting `/stories/bridal-trends` receives the static HTML file instantly from the edge CDN.

## 3. Data Models (Prisma / TypeScript)

```typescript
// Extracted from Prisma Schema mapped to public_directory_listings view
export type DirectoryListing = {
  id: string;
  url_slug: string;
  entity_type: 'salon' | 'freelancer';
  display_name: string;
  average_rating: number;
  review_count: number;
  starting_price: number;
  featured_image_url: string;
  categories_offered: string[]; // JSON Array decoded
};

// Zod Schema for Server Action Validation
export const ContactFormSchema = z.object({
  first_name: z.string().min(2, "Name is too short"),
  email_address: z.string().email("Invalid email"),
  inquiry_type: z.enum(['partnership', 'support', 'general']),
  message_body: z.string().min(10)
});
```

## 4. Session Simulation (Local Storage)
For the `/wishlist` and `/checklist`, Zustand or Context hooks are used to persist state in the browser's `localStorage` until the user decides to create an authentic account.
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlannerState {
  savedVendorIds: string[];
  addVendor: (id: string) => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      savedVendorIds: [],
      addVendor: (id) => set((state) => ({ savedVendorIds: [...state.savedVendorIds, id] })),
    }),
    { name: 'local-planner-storage' }
  )
);
```
