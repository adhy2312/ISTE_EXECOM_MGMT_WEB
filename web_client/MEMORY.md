# Project Memory Bank: ISTE SC MBCET Management App

## 🎯 Current Focus & Active Task
* **What we are building right now:** All role-based portals are live and verified. Next: wire members/tasks to Firestore and set Firebase Security Rules.
* **Current Blocker(s):** None — build passed clean (10 routes, 0 TypeScript errors).

## 🏗️ System Architecture & Tech Stack
* **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, **Firebase (Auth + Firestore)**, Zustand, GSAP, Lucide React, react-qr-code.
* **Core Directory Structure:**
  - `src/app/`: Pages — `/` (Dashboard), `/login`, `/leaderboard`, `/tasks`, `/hub`, `/id`, `/faculty`, `/executive`, `/points`.
  - `src/components/`: `Navigation.tsx` (role-aware), `AuthProvider.tsx` (global Firebase listener + route guard).
  - `src/store/`: `auth.ts` (Firebase Auth), `members.ts`, `tasks.ts`, `dashboard.ts`, `points.ts` (Firestore-backed).
  - `src/types/models.ts`: Core domain types incl. `EnergyPointRequest`, `AppNotification`.
  - `src/lib/firebase.ts`: Firebase app, auth, and Firestore exports.
* **Key Architectural Patterns:** `AuthProvider` initializes `onAuthStateChanged` globally and guards routes. Role-based routing in `/login/page.tsx` and `Navigation.tsx`. Firestore is the source of truth; Zustand is the local cache.

## 🧠 Architectural Decisions & Rationale
* **[2026-06-25 / Styling]:** Chosen pure CSS with variables (`globals.css`) for high-performance glassmorphism and GPU-accelerated gradient backgrounds over Tailwind. Updated the color palette from "gamer neon" to a sleek, enterprise Zinc/Blue dark mode palette for a strictly professional aesthetic.
* **[2026-06-25 / Root Route]:** Decided to use a fully professional Dashboard at `/` (showing stats, tasks, and upcoming events) instead of simply redirecting to the leaderboard, to provide a true "Command Center" feel for the management app.
* **[2026-06-25 / Animations]:** Retained GSAP for complex choreographies but added `will-change: transform, opacity` and hardware-accelerated CSS properties to target 100% Lighthouse performance index.

## 🛠️ Progress Log
* ✅ [Project Setup] - Next.js + Zustand + GSAP + Lucide + Firebase initialized.
* ✅ [Auth Store] - Firebase Auth with @mbcet.ac.in domain restriction (Google + Email).
* ✅ [Firestore] - User profiles in `users/` collection, auto-created on first Google login.
* ✅ [Login Page] - 3-role tab selector (Admin / ExeCom / Faculty) with Google + email/password.
* ✅ [Global Styles] - GPU-accelerated Zinc dark palette, Apple-like glassmorphism, custom scrollbars.
* ✅ [Dashboard] - Command center with events, activity feed, quick stats.
* ✅ [Leaderboard] - Podium + ranked list with GSAP stagger animations.
* ✅ [Task Matrix] - Kanban-style tabs (All / Todo / Doing / Done).
* ✅ [Operations Hub] - Grid of module cards.
* ✅ [Digital ID] - QR code pass with Web Share API.
* ✅ [Faculty Portal] - `/faculty` — read-only stats, rankings, task snapshot.
* ✅ [Executive Command Center] - `/executive` — Overview, Approvals queue, Member roster.
* ✅ [Energy Points Portal] - `/points` — Submit XP requests, view history.
* ✅ [Points Store] - Firestore-backed, with approve (increments corePoints) and reject.
* ✅ [AuthProvider] - Global Firebase listener + unauthenticated route guard.
* ✅ [Navigation] - Role-aware: hides on full-screen portals, shows Command/XP tabs by role.
* ✅ [Build Verification] - TypeScript build check completed clean.
* ✅ [E2E Project Report] - Comprehensive report detailing architecture, role workflows, security rules, and databases.

## 📋 Next Steps (Prioritized)
1. Deploy Firestore Security Rules in the Firebase Console (read/write by role).
2. Wire the members and tasks stores to Firestore (migrating mock arrays).
3. Add real-time listeners (`onSnapshot`) for the Points Approval queue in the Executive panel.
4. Expand the sub-modules within the Operations Hub (/hub).
