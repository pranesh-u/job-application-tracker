# 🚀 CareerPulse AI — AI-Powered Job Application & Resume Intelligence Platform

> A modern, high-performance job application tracking and resume intelligence system built with **Next.js 15**, **TypeScript**, **Prisma ORM**, and **Tailwind CSS**. Designed to streamline the software engineering job search, manage resume variations, and analyze job match compatibility.

---

## ✨ Features

- 📋 **Interactive Kanban Application Board**:
  - Drag-and-drop workflow tracking powered by `@dnd-kit`.
  - Stages: *Wishlist*, *Applied*, *OA / Screening*, *Interview*, *Offer*, and *Rejected*.
  - Inline search, sorting by priority (*Low*, *Medium*, *High*, *Critical*), and application status management.

- 📄 **Multi-Version Resume Management Hub**:
  - Upload, version, and manage multiple resume variations (General, Backend, Frontend, Embedded, AI/ML, etc.).
  - Automated PDF & DOCX text extraction engine using `pdf-parse` and `mammoth`.
  - Download version files, set active resume versions, and monitor interview rate conversion per resume type.

- ⏱️ **Automatic Activity Timeline**:
  - Comprehensive history of application events, stage transitions, priority shifts, and resume attachments.

- 🧠 **AI Match & JD Analyzer Engine (Phase 4 Ready)**:
  - Match scoring comparing resume skills against Job Descriptions.
  - Resume Match %, ATS Score, Readiness Score, and Application Strength indicators.
  - Skill gap identifier and tailored bullet point suggestions.

- 🎨 **Linear-Inspired Premium Dark UI**:
  - Custom dark mode architecture with refined micro-animations, glassmorphism elements, and responsive typography.
  - Built-in toast notifications using `sonner`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) (SQLite for local development, PostgreSQL compatible for production)
- **Authentication**: [NextAuth.js (v5 / Auth.js)](https://next-auth.js.org/)
- **Drag & Drop**: [@dnd-kit/core](https://dndkit.com/) & [@dnd-kit/sortable](https://dndkit.com/)
- **File Processing**: `pdf-parse` (PDF) & `mammoth` (DOCX)
- **Styling**: Tailwind CSS & Custom CSS Token System
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Structure

```text
job-tracker/
├── prisma/
│   └── schema.prisma          # Database models (User, Resume, Application, etc.)
├── public/
│   └── uploads/               # Uploaded resume files (git-ignored)
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Dashboard pages (Board, Resumes, Calendar, Analytics, etc.)
│   │   ├── api/               # Next.js API Routes (Auth, Applications, Resumes, Uploads)
│   │   ├── login/             # Auth pages
│   │   └── register/
│   ├── components/
│   │   ├── features/          # Kanban, Resumes, Timeline, Modals, Drawers
│   │   └── layout/            # Sidebar, Header, Global Layout
│   ├── lib/                   # Auth config, Prisma client instance, Resume Parser engine
│   ├── types/                 # Shared TypeScript interfaces & enums
│   └── middleware.ts          # Authentication protection middleware
├── .env.example               # Environment variables template
├── README.md                  # Project documentation
└── tsconfig.json              # TypeScript configuration
```

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally:

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** / **yarn** / **pnpm**

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/job-tracker.git
cd job-tracker
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `.env` includes:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-development-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Initialize the Database
Run Prisma migrations to create the local SQLite database schema:
```bash
npx prisma db push
```

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You can register a new account to start tracking applications and uploading resumes!

---

## 🗺️ Product Roadmap

- [x] **Phase 1**: Foundations, Design System & Auth Infrastructure
- [x] **Phase 2**: Application Kanban Board & Timeline Tracking
- [x] **Phase 3**: Resume Multi-Version Manager & Text Extractor
- [x] **Phase 4**: AI Resume Matching & JD Analyzer Engine
- [ ] **Phase 5**: Interactive Calendar & Interview Deadline Management
- [ ] **Phase 6**: Analytics & Conversion Funnel Dashboard
- [ ] **Phase 7**: AI Career Roadmap & Industry Benchmark Insights

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
