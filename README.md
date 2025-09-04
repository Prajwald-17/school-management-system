# School Management System

A modern, full‑stack application to add, browse, and manage schools with image uploads, robust validation, and a clean, responsive UI.

- GitHub Repository: https://github.com/Prajwald-17/school-management-system.git
- Live Deployment: https://github.com/Prajwald-17/school-management-system.git

> Note: If the live link above is incorrect, replace it with your actual deployment URL (e.g., Vercel).

---

## Features — Core Functionality

- **Add Schools**: Create school records with name, address, city, state, contact, email, and an optional image.
- **Image Uploads**: Upload images to Cloudinary; store and use the optimized CDN URL.
- **Browse & Search-ready**: Paginated, responsive grid to view schools; easy to extend with search/filter.
- **Contact Actions**: Quick actions for call (tel:) and email (mailto:).
- **Client & Server Validation**: React Hook Form validation on the client, basic checks on the server.
- **Responsive UI**: Clean, accessible interface built with Tailwind CSS.

---

## Technical Features

- **Next.js App Router (v15)**: File-based routing in `src/app`, API routes under `app/api`.
- **Server Routes**:
  - `POST /api/upload`: Streams files to Cloudinary using `cloudinary.uploader.upload_stream`.
  - `GET/POST /api/schools`: MySQL-backed endpoints to list and create schools.
- **Database Layer**: `mysql2/promise` with a shared connection pool (`src/lib/db.ts`).
- **Form Handling**: `react-hook-form` with a dedicated validation rules module (`src/lib/validation.ts`).
- **Image Optimization**: Next.js Image component configured for `res.cloudinary.com`.
- **TypeScript-first**: Types across components, pages, and API handlers.
- **Tooling**: ESLint, Tailwind CSS v4, Turbopack for dev/build.

---

## Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API routes, Node.js
- **Database**: MySQL (via `mysql2/promise`)
- **Storage/CDN**: Cloudinary (image uploads & delivery)
- **Utilities**: `react-hook-form`, `sharp` (installed), ESLint

---

## Installation & Setup

### 1) Prerequisites

- Node.js 18+ (LTS recommended)
- MySQL 8+ accessible (local or hosted)
- Cloudinary account (for image uploads)

### 2) Clone and Install

```bash
git clone https://github.com/Prajwald-17/school-management-system.git
cd school-management-system
npm install
```

### 3) Environment Variables

Create `.env.local` in the project root with:

```
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=school_data
DB_PORT=3306
```

> Security: Never commit real secrets. Use environment variables in deployment too.

### 4) Database Schema

Create a database and the `schools` table (example):

```sql
CREATE DATABASE IF NOT EXISTS school_data;
USE school_data;

CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  email_id VARCHAR(150) NOT NULL UNIQUE,
  image TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5) Run Locally

```bash
npm run dev
# open http://localhost:3000
```

### 6) Production Build

```bash
npm run build
npm start
```

---

## Screenshots

|---------------------|
| ![HomePage](public/screenshots/HomePage1.png) |
| Manage and view completed tasks |

```
public/
  screenshots/
    home.png
    add-school.png
    list-schools.png
```

Markdown references:

```md
![Home](public/screenshots/home.png)
![Add School](public/screenshots/add-school.png)
![List Schools](public/screenshots/list-schools.png)
```

Currently available sample images live in `public/schoolImages/` (used for cards). Consider adding screen captures to `public/screenshots/`.

---

## Project Structure

```text
src/
  app/
    add-school/
      page.tsx           # Client page with React Hook Form and validation
    show-schools/
      page.tsx           # Client page listing schools with contact actions
    api/
      upload/
        route.ts         # POST: uploads file to Cloudinary via upload_stream
      schools/
        route.ts         # GET: list schools; POST: insert new school
    layout.tsx
    page.tsx             # Landing page with features & CTAs
    globals.css
  components/
    layout/              # (reserved for layout components)
    ui/                  # (reserved for reusable UI components)
  lib/
    db.ts                # MySQL connection pool & helpers
    validation.ts        # Shared client-side validation rules
public/
  schoolImages/          # Sample images (local fallback)
```

---

## Core Architecture

- **UI Layer (App Router)**
  - `src/app/page.tsx`: Landing + feature highlights.
  - `src/app/add-school/page.tsx`: Form with `react-hook-form` using `validation.ts` rules.
  - `src/app/show-schools/page.tsx`: Fetches `/api/schools`, displays responsive cards, contact dropdowns.

- **Upload Flow**
  1. User selects an image on Add School form.
  2. Client posts form-data to `POST /api/upload`.
  3. Server streams to Cloudinary; returns `secure_url`.
  4. Client includes image URL when posting to `POST /api/schools`.

- **Data Flow**
  - `src/lib/db.ts` provides a pooled MySQL connection.
  - `GET /api/schools` queries and returns recent schools.
  - `POST /api/schools` validates and inserts a new school record.

- **Performance & Reliability**
  - MySQL pool for efficient connections.
  - Next.js Image optimization for Cloudinary & local images.
  - Basic server-side validation and duplicate email handling.

---

## Developer

### Available Scripts

- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm start` — Start production server
- `npm run lint` — Lint the codebase

### Coding Standards

- TypeScript for types and safety.
- Keep components small and focused.
- Centralize validation in `src/lib/validation.ts`.
- Use the provided DB pool; avoid creating ad-hoc connections per request.

### Contribution Guide

1. Fork and clone the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Commit with conventional messages.
4. Open a PR with a clear description and screenshots when applicable.

---

## License

This project is licensed under the MIT License. See the LICENSE file (add one if missing) for details.
