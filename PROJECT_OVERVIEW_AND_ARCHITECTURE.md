# 🌌 Project "WORKSPACE" ERP
## Comprehensive Architectural Specification, Technical Dossier & Development Log

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [End-to-End Development Chronicle (What Was Built)](#2-end-to-end-development-chronicle-what-was-built)
3. [Deep-Dive Module Capabilities (What Every Subsystem Does)](#3-deep-dive-module-capabilities-what-every-subsystem-does)
   - [Module A: Zero-Trust Authentication & RBAC Engine](#module-a-zero-trust-authentication--rbac-engine)
   - [Module B: Client Relationship Management (CRM)](#module-b-client-relationship-management-crm)
   - [Module C: Hierarchical Project Engine & Phase Lifecycle](#module-c-hierarchical-project-engine--phase-lifecycle)
   - [Module D: Optimistic Drag-and-Drop Kanban Interface](#module-d-optimistic-drag-and-drop-kanban-interface)
   - [Module E: Persistent Timer & Timesheet Accounting](#module-e-persistent-timer--timesheet-accounting)
   - [Module F: Immutable Versioned Asset Vault](#module-f-immutable-versioned-asset-vault)
   - [Module G: Automated Financial Engine & The Unbroken Chain](#module-g-automated-financial-engine--the-unbroken-chain)
   - [Module H: External Client Portal Hub](#module-h-external-client-portal-hub)
   - [Module I: "Living Soul" Motion Engine & Signature Visuals](#module-i-living-soul-motion-engine--signature-visuals)
4. [Relational Database Schema (14 Normalized Models)](#4-relational-database-schema-14-normalized-models)
5. [Front-End Design System: Modern Enterprise ("Landed")](#5-front-end-design-system-modern-enterprise-landed)
6. [Demo Accounts & Operational Playbook](#6-demo-accounts--operational-playbook)
7. [Repository & Deployment Verification](#7-repository--deployment-verification)

---

## 1. Executive Summary

**Project "WORKSPACE" ERP** is an enterprise-tier operations management platform engineered with **Next.js 14 (App Router)**, **TypeScript (Strict Mode)**, **Prisma ORM**, **PostgreSQL (Supabase Pooler)**, **Tailwind CSS**, **Framer Motion**, **TanStack Query v5**, and **Zustand**. 

The system unifies customer relationship management, hierarchical milestone tracking, zero-latency drag-and-drop task execution, immutable asset versioning, precision billable time recording, and automated receivables invoicing into an atomic, transaction-safe pipeline.

---

## 2. End-to-End Development Chronicle (What Was Built)

Here is the complete chronological log of all engineering sprints executed:

### Phase 1: Core System Foundation & Normalized Database
- Established strict TypeScript configuration with strict path aliasing (`@/*`).
- Modeled and migrated **14 normalized relational tables** in PostgreSQL via Supabase using Prisma.
- Guaranteed relational integrity across users, profiles, clients, interactions, projects, phases, tasks, subtasks, time entries, assets, versions, invoices, items, and payments.
- Created robust idempotent seed scripts populating enterprise mock data.

### Phase 2: Zero-Trust Security & Edge RBAC
- Implemented **NextAuth.js** credentials provider with bcrypt password hashing.
- Augmented TypeScript definitions (`src/types/next-auth.d.ts`) extending Session and JWT contracts with strict role typing (`SUPERADMIN`, `EMPLOYEE`, `CLIENT`).
- Deployed **Edge Middleware** (`src/middleware.ts`) enforcing boundary access control prior to server rendering.
- Role-gated route enforcement:
  - `/financials`: Exclusive to `SUPERADMIN`.
  - `/portal`: Exclusive to `CLIENT` (internal users attempting access are redirected to `/dashboard`).
  - `/crm`, `/projects`, `/kanban`, `/time-tracking`, `/assets`: Internal workspace reserved for `SUPERADMIN` and `EMPLOYEE`.

### Phase 3: Project Hierarchy Engine & Automated Phase Triggers
- Built the 4-level relational execution tree: `Project` $\rightarrow$ `ProjectPhase` $\rightarrow$ `Task` $\rightarrow$ `SubTask`.
- Automated Phase Provisioning: Creating a project auto-provisions 4 industry-standard milestone phases: *Concept & Discovery*, *Design & Architecture*, *Implementation*, and *QA & Launch*.
- **Automated Lifecycle Trigger:** When the final task in a phase transitions to `DONE`, an atomic Prisma `$transaction` updates the phase status to `COMPLETED` and advances dependent lifecycle states.

### Phase 4: Optimistic Drag-and-Drop Kanban Board
- Built a multi-column Kanban board (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`) utilizing `@dnd-kit/core` and `@tanstack/react-query`.
- **Zero-Latency Optimistic Mutations:** Moving a card immediately updates the UI cache while dispatching the background patch.
- **Snap-Back Error Rollback:** If the network fails or the server rejects the update, TanStack Query catches the error snapshot and snaps the card back to its previous column without desyncing state.

### Phase 5: Backend Power Sprint (Timer $\rightarrow$ Assets $\rightarrow$ Financials)
- **Global Persistent Timer:** SSR-safe Zustand store in `src/store/useTimerStore.ts` tracking active task ID, project label, and elapsed seconds across page refreshes and route transitions.
- **Timesheet Management (`/time-tracking`):** Weekly/monthly timesheet grid with billable rate accounting and duration calculations.
- **Immutable Asset Storage Vault (`/assets`):** File versioning system storing non-overwriting `AssetVersion` records (`v1` $\rightarrow$ `v2` $\rightarrow$ `v3`) with changelogs and audit trails.
- **Automated Invoicing Engine (`/financials`):** Pipeline that queries unbilled billable `TimeEntry` records, aggregates hourly totals, generates itemized invoices (`INV-YYYY-XXXX`), and atomically flags entries as `isBilled = true`.

### Phase 6: External Client Portal (`/portal`)
- Developed a high-security external hub tailored for clients:
  - **My Project Progress:** Real-time visibility into project completion percentages and phase task trees.
  - **My Approved Assets:** Direct one-click downloads of verified blueprint and contract versions.
  - **My Invoices & Settlements:** Itemized financial statements with simulated **"Pay Now"** settlement that records payment in PostgreSQL and recalculates balance due.

### Phase 7: Complete Visual Identity Upgrade ("Modern Enterprise")
- Transitioned the entire visual theme from dark liquid glass to a **"Modern Enterprise"** aesthetic inspired by the **"Landed"** design system.
- Light base (`#f8fafc`), crisp white cards (`bg-white border-slate-200 shadow-xs hover:shadow-md`), high-contrast slate typography (`text-slate-900 font-bold`), and bold Electric Indigo accents (`#4f46e5`).
- Re-architected `/dashboard` and `/portal` with spotlight split-screen layouts (4-col left diagnostic dial + 8-col right operational module matrix).

### Phase 8: "Living Soul" Signature Visuals & Micro-Interactions
- **`LivingEntity` Signature Visual (`/login`):** An organic, blurred SVG blob utilizing `<filter id="blob">` (`feTurbulence` + `feDisplacementMap` + `feGaussianBlur`), animated with Framer Motion `useSpring` and **Curious Mouse Attraction** physics that leans and swims toward the cursor behind frosted glass.
- **Sentient Notifications:** An animated bioluminescent herald that glides in from the screen corner to announce phase completions, task resolutions, and payments.
- **Organic Progress Bars:** Elastic progress bars featuring a physiological double-beat heartbeat pulse bead and shimmer reflections.
- **"Curious" Hover Glow:** GPU-accelerated cursor-following light shard embedded in Kanban and Project cards.

---

## 3. Deep-Dive Module Capabilities (What Every Subsystem Does)

### Module A: Zero-Trust Authentication & RBAC Engine
- **Perimeter Edge Defense:** Route verification executes in edge middleware before Next.js page generation begins.
- **JWT Augmentation:** Custom token decoding preserves `user.role` throughout the session lifecycle.
- **Fast-Fill Demo Roles:** `/login` includes 1-click credential auto-fill for `SUPERADMIN`, `EMPLOYEE`, and `CLIENT`.

### Module B: Client Relationship Management (CRM)
- **Customer Master Directory (`/crm`):** Stores client enterprise records, primary contacts, physical billing addresses, and pipeline statuses (`LEAD`, `ACTIVE`, `ARCHIVED`).
- **Touchpoint Interaction Logging:** Records call logs, email summaries, and meeting minutes linked to individual client profiles.

### Module C: Hierarchical Project Engine & Phase Lifecycle
- **Work Breakdown Structure (`/projects` & `/projects/[id]`):** Complete hierarchical view of deliverables.
- **Automatic Lifecycle Promotion:** Automatically switches projects and phases to completed upon full resolution of underlying tasks.
- **Progress Tracking:** Aggregates real-time completion percentages based on task states.

### Module D: Optimistic Drag-and-Drop Kanban Interface
- **Smooth Column Movement (`/kanban`):** Instant drag-and-drop powered by `@dnd-kit/core`.
- **Priority Filtering & Search:** Real-time filtering by priority (`HIGH`, `MED`, `LOW`) and multi-term text search across project names and descriptions.
- **Card-Level Timer Launch:** One-click live timer launch directly from any Kanban card.

### Module E: Persistent Timer & Timesheet Accounting
- **TopNavbar Timer:** Persistent global widget visible across all pages, recording task duration second-by-second.
- **Timesheet Accounting (`/time-tracking`):** Weekly/monthly timesheets with total logged hours, billable amounts, and manual log entry.

### Module F: Immutable Versioned Asset Vault
- **Non-Destructive Versioning (`/assets`):** File uploads create new sequential `AssetVersion` records without deleting prior iterations.
- **Audit Changelog:** Tracks which team member uploaded each revision, the timestamp, and the specific change description.

### Module G: Automated Financial Engine & The Unbroken Chain
- **The Core Chain:** `Timer` $\rightarrow$ `TimeEntry` $\rightarrow$ `Invoice` $\rightarrow$ `Payment`.
- **Atomic Billing Pipeline (`/financials`):** Queries unbilled billable time records, computes hourly rates, creates the invoice with itemized line items, and updates all entries to `isBilled = true` in an atomic database transaction.
- **Partial & Full Settlements:** Records payment methods (Wire, Stripe, Check, Crypto) and auto-updates invoice status from `SENT` $\rightarrow$ `PARTIAL` $\rightarrow$ `PAID`.

### Module H: External Client Portal Hub
- **Secure Client Access (`/portal`):** Gated strictly for clients to track deliverables, download verified assets, review invoices, and execute simulated settlements.

### Module I: "Living Soul" Motion Engine & Signature Visuals
- **Living Entity:** Fluid biological animation behind frosted glass on `/login`.
- **Sentient Notifications:** Living herald toast announcing major achievements.
- **Organic Progress Bars:** Heartbeat pulse indicator on milestone bars.
- **Curious Hover Glow:** Light shard following cursor over project and task cards.

---

## 4. Relational Database Schema (14 Normalized Models)

```
┌────────────────────────────────────────────────────────────────────────┐
│                              PRISMA SCHEMA                             │
└────────────────────────────────────────────────────────────────────────┘

 [User] ──────────< [Profile]
   │
   ├──────────────< [Task] (Assignee)
   │                  │
   │                  ├──────────< [SubTask]
   │                  │
   │                  └──────────< [TimeEntry]
   │
   ├──────────────< [AssetVersion] (Uploader)
   │
   └──────────────< [InteractionLog] (Staff)

 [Client] ────────< [InteractionLog] (Recipient)
   │
   └──────────────< [Project]
                      │
                      ├──────────< [ProjectPhase]
                      │                  │
                      │                  └──────────< [Task]
                      │
                      ├──────────< [Asset]
                      │                  │
                      │                  └──────────< [AssetVersion]
                      │
                      └──────────< [Invoice]
                                         │
                                         ├──────────< [InvoiceItem]
                                         │
                                         └──────────< [Payment]
```

---

## 5. Front-End Design System: Modern Enterprise ("Landed")

| Token | Landed Design Value | Implementation |
| :--- | :--- | :--- |
| **Canvas Background** | Slate-50 (`#f8fafc`) | Clean, distraction-free corporate light base |
| **Card Surface** | White (`#ffffff`) | `border-slate-200`, `shadow-xs hover:shadow-md`, `rounded-xl` |
| **Primary Accent** | Electric Indigo (`#4f46e5`) | Bold action buttons, focus rings, and active tab indicators |
| **Secondary Accent**| Slate-100 / Slate-200 | Clean badges, segmented controls, table headers |
| **Typography** | Geist Sans / Inter | Bold high-contrast headings (`text-slate-900 font-bold tracking-tight`) |
| **Micro-Interactions** | Framer Motion Springs | Elastic progress bars, curious card glow, sentient notifications |

---

## 6. Demo Accounts & Operational Playbook

Use these pre-seeded accounts at **[`/login`](http://localhost:3000/login)** to explore each role clearance:

### 1. SuperAdmin Account (Full Platform Authority)
- **Email:** `admin@workspace.erp`
- **Password:** `Password123!`
- **Access:** Complete platform clearance, Financial Engine, Invoicing, Billing Pipeline, CRM, Projects, Kanban, Assets.

### 2. Employee Account (Project Operations & Workflow)
- **Email:** `sarah.dev@workspace.erp`
- **Password:** `Password123!`
- **Access:** CRM, Projects, Kanban, Time-Tracking, Versioned Assets. Prohibited from `/financials`.

### 3. Client Account (Confined to External Portal)
- **Email:** `client@acmecorp.com`
- **Password:** `Password123!`
- **Access:** Confined strictly to `/portal` to inspect progress, download assets, view invoices, and simulate payments.

---

## 7. Repository & Deployment Verification

- **GitHub Repository:** [https://github.com/manoj1454/Project-ERP](https://github.com/manoj1454/Project-ERP)
- **Production Build Status:** `npm run build` passes with **0 errors** across all 19 dynamic and static routes.
- **Database:** Supabase PostgreSQL with 14 normalized tables and active relational constraints.
- **Local Dev Server:** Running at `http://localhost:3000`.
