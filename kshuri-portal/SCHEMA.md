# Enterprise Database Architecture & Entities (Public Web Node)

This document details the rigorous relational database schema designed specifically for the **Barber App Web Portal (Next.js)**. Unlike the operational apps, this layer acts as an aggregator (CMS/SEO layer). It primarily relies on materialized views, read-replicas of core tables, and independent planning engines (Wishlists, Checklists) that don't directly manipulate live salon operations.

## 1. Directory Aggregation (Read-Only Replicas)
For massive scalability during high web traffic, the Next.js app queries pre-computed materialized views of the core entities (`freelancer_profiles` and `salon_locations`).

### `public_directory_listings` (Materialized View)
A highly indexed flat table designed for instant geo-spatial or text-based search.
*   `id` (UUID, Primary Key)
*   `entity_type` (ENUM: `'freelancer', 'salon'`)
*   `source_entity_id` (UUID) - Origin DB reference
*   `url_slug` (VARCHAR 255, Unique, Indexed) - e.g., `'royal-cuts-koramangala'`
*   `display_name` (VARCHAR 150)
*   `location_coordinates` (GEOMETRY/Point, Indexed via GiST)
*   `city_slug` (VARCHAR 100) - For routes like `/salons/bangalore`
*   `average_rating` (DECIMAL 3,2)
*   `review_count` (INT)
*   `starting_price` (DECIMAL 10,2)
*   `featured_image_url` (VARCHAR 255)
*   `promoted_score` (INT) - Controls sort order on listing pages
*   `last_synced_at` (TIMESTAMPZ)

### `directory_listing_services` (1:N under Listings)
JSON arrays are often too slow for complex JOIN filtering; this relationship maps distinct bookable categories up to the search index.
*   `id` (UUID, PK)
*   `listing_id` (UUID, FK -> `public_directory_listings.id`)
*   `service_category_id` (UUID)
*   `service_name` (VARCHAR 100)
*   `minimum_price` (DECIMAL 10,2)

## 2. Content Management System (Stories)
Powers the `/stories` and `/blog` routes to drive organic Top-of-Funnel (ToFu) traffic.

### `cms_authors`
*   `id` (UUID, PK)
*   `user_id` (UUID, FK -> global `users.id`, Nullable)
*   `display_name` (VARCHAR 100)
*   `avatar_url` (VARCHAR 255)
*   `bio_short` (VARCHAR 255)

### `cms_posts`
*   `id` (UUID, PK)
*   `author_id` (UUID, FK -> `cms_authors.id`)
*   `title` (VARCHAR 200)
*   `slug` (VARCHAR 200, Unique, Indexed)
*   `content_mdx` (TEXT)
*   `hero_image_url` (VARCHAR 255)
*   `meta_title` (VARCHAR 70) - SEO `<title>` override
*   `meta_description` (VARCHAR 160) - SEO `<meta name="description">`
*   `status` (ENUM: `'draft', 'published', 'archived'`)
*   `published_at` (TIMESTAMPZ, Indexed for chronological sorting)

### `cms_post_tags` (N:M specific capabilities)
*   `post_id` (UUID, FK -> `cms_posts.id`)
*   `tag_name` (VARCHAR 50) - e.g., "Wedding prep", "Beard care"

## 3. Web-App Planning Engine
Interactive tools for unregistered (via local storage) and registered end-users.

### `user_wishlists`
*   `id` (UUID, PK)
*   `user_id` (UUID, FK -> global `users.id`)
*   `target_type` (ENUM: `'vendor', 'service', 'cms_post'`)
*   `target_id` (UUID) - Polymorphic relation to the specific entity
*   `created_at` (TIMESTAMPZ)

### `planner_events`
The overarching timeline container for users planning large scale grooming.
*   `id` (UUID, PK)
*   `user_id` (UUID, FK -> global `users.id`)
*   `event_name` (VARCHAR 150)
*   `event_date` (DATE)
*   `event_type` (ENUM: `'wedding', 'gala', 'photoshoot', 'other'`)
*   `target_budget` (DECIMAL 10,2, Nullable)

### `planner_checklist_tasks` (1:N under Events)
*   `id` (UUID, PK)
*   `planner_event_id` (UUID, FK -> `planner_events.id`)
*   `task_title` (VARCHAR 150)
*   `category` (ENUM: `'hair', 'skin', 'logistics', 'makeup'`)
*   `due_date` (DATE) - Calculated dynamically based on `event_date` (e.g., 3 months prior)
*   `is_completed` (BOOLEAN)
*   `linked_vendor_id` (UUID, Nullable) - If they hire a specific salon from the directory

## 4. CRM & Public Submissions
Catches traffic from Contact Forms.

### `contact_leads`
*   `id` (UUID, PK)
*   `first_name` (VARCHAR 50)
*   `last_name` (VARCHAR 50)
*   `email_address` (VARCHAR 255)
*   `phone_number` (VARCHAR 20, Nullable)
*   `inquiry_type` (ENUM: `'partnership', 'support', 'enterprise_sales', 'general'`)
*   `message_body` (TEXT)
*   `status` (ENUM: `'new', 'contacted', 'resolved', 'junk'`)
*   `created_at` (TIMESTAMPZ)

### `newsletter_subscribers`
*   `id` (UUID, PK)
*   `email_address` (VARCHAR 255, Unique)
*   `source_url` (VARCHAR 255) - Which page they signed up on
*   `is_active` (BOOLEAN)
*   `subscribed_at` (TIMESTAMPZ)
