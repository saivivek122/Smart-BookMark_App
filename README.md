# 🔖 Smart Bookmark App

A modern full-stack bookmark manager built with **Next.js (App Router)**, **Supabase**, and **Tailwind CSS**.

Users can securely log in using Google OAuth and manage their personal bookmarks with real-time updates.

---

## 🚀 Features

- ✅ Google OAuth Authentication
- ✅ Private user-specific bookmarks
- ✅ Add & Delete bookmarks
- ✅ Real-time updates using Supabase Realtime
- ✅ Secure Row Level Security (RLS)
- ✅ Responsive modern UI with Tailwind CSS
- ✅ Deployed on Vercel

---

## 🛠 Tech Stack

- **Frontend & Backend:** Next.js (App Router)
- **Authentication & Database:** Supabase
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## 🔐 Authentication

- Users log in using Google OAuth.
- Supabase manages sessions securely.
- Only authenticated users can access bookmarks.

---

## 🗄 Database Structure

### Table: `bookmarks`

| Column      | Type      |
|------------|----------|
| id         | uuid (PK) |
| user_id    | uuid (FK → auth.users) |
| title      | text |
| url        | text |
| created_at | timestamp |

---

## 🔒 Security (Row Level Security)

RLS is enabled to ensure:

- Users can only view their own bookmarks.
- Users can only insert bookmarks for themselves.
- Users can only delete their own bookmarks.

Policy condition used:

```sql
auth.uid() = user_id
