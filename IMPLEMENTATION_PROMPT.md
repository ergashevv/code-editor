# 📌 W3Schools-like HTML/CSS Learning Platform - Implementation Prompt

Here's a copy-paste READY FULL PROMPT adapted for your existing Next.js 14 Pages Router + TypeScript + Tailwind + MongoDB project.

Auth and a code editor already exist in the project; keep them and add the new features below.

---

## 📌 PROJECT CONTEXT (Do NOT change)

- **Stack**: Next.js 14 (Pages Router) + TypeScript + TailwindCSS + MongoDB/Mongoose
- **Auth already implemented**: JWT-based authentication with username/phone/password (NO email). Keep routes, providers, and middleware intact.
- **Code editor (Monaco) already exists** at `/home`. Reuse it for new training & homework flows.
- **The project is deployed; DB connected**. Do not break existing auth.
- **Roles**: USER and ADMIN. Use role-based guards.
- **Admin dev seed creds** (development only):
  - login: edevzi
  - password: edevzi123!
- **Current User model**: `src/models/User.ts` with `username`, `phone`, `password`. Extend it, don't replace.
- **Current auth API**: `/api/auth/login`, `/api/auth/register`, `/api/auth/verify`, `/api/auth/refresh`. Keep them intact.

---

## 🎯 GOAL

Build a W3Schools-like HTML/CSS learning platform inside the existing app:

- Full HTML & CSS curriculum, sectioned by topics, each with:
  1. Concept content (markdown)
  2. Interactive examples (runnable in the in-app editor)
  3. Train exercises (infinite attempts, auto-check)
  4. Homework (one final submission only, auto-check + score/rubric)
- Auto-grading happens on the server (no cheating), with safe sandboxing.
- Telegram notification is sent to a predefined chat when a homework is submitted successfully (who, what lesson, when, result).
- Leaderboard on Home: ranks all users by XP/level (1st place, 2nd place, …).
- Lesson scheduling: each lesson has an unlockAt date; users cannot access future lessons before that date.
- Fully responsive (desktop → mobile) with professional, learner-friendly UI/UX.

---

## 🧩 FEATURES TO IMPLEMENT

### 1) Data Models (Mongoose)

Create/extend models under `src/models/`:

#### User.ts (EXTEND existing model)

```typescript
// Add to existing User schema:
{
  _id: ObjectId,
  username: string,        // already exists
  phone: string,          // already exists
  password: string,       // already exists
  role: 'USER' | 'ADMIN', // ADD: default 'USER'
  level: number,          // ADD: default 1
  xp: number,             // ADD: default 0
  lastSeenAt?: Date       // ADD: optional
}
```

#### Lesson.ts (NEW)

```typescript
{
  _id: ObjectId,
  slug: string,           // unique, e.g. 'html-basics'
  title: string,
  summary: string,
  contentMD: string,      // lesson text in Markdown
  examples: [{
    id: string, 
    title: string,
    html: string, 
    css?: string, 
    js?: string
  }],
  trains: [{
    id: string, 
    title: string, 
    task: string,
    initialHtml: string, 
    initialCss?: string,
    checks: [{ 
      id: string, 
      type: 'html'|'css', 
      rule: string, 
      hint: string 
    }]
  }],
  homework: {
    id: string, 
    title: string, 
    brief: string,
    rubric: [{ 
      id: string, 
      description: string, 
      points: number 
    }],
    checks: [{ 
      id: string, 
      type: 'html'|'css', 
      rule: string, 
      hint: string 
    }]
  },
  unlockAt: Date,         // lesson opens at this date
  order: number           // course order
}
```

#### Submission.ts (NEW)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  lessonId: ObjectId,
  kind: 'TRAIN' | 'HOMEWORK',
  targetId: string,       // trains[].id or homework.id
  html: string,
  css?: string,
  checksResult: [{ 
    checkId: string, 
    passed: boolean, 
    message: string 
  }],
  score?: number,         // sum from rubric for HOMEWORK
  createdAt: Date,
  isFinal: boolean        // HOMEWORK final = true (only once)
}
```

#### Progress.ts (NEW)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  lessonId: ObjectId,
  trainsCompleted: string[],   // train ids
  homeworkSubmitted: boolean,
  xpEarned: number,
  updatedAt: Date
}
```

#### AdminSettings.ts (NEW - optional)

```typescript
{
  _id: ObjectId,
  telegram: {
    botToken: string,      // from .env at runtime
    chatId: string         // group or admin chat id
  }
}
```

#### LeaderboardSnapshot.ts (NEW - optional cache)

```typescript
{
  _id: ObjectId,
  period: 'GLOBAL'|'WEEKLY',
  weekStart?: Date,
  items: [{ 
    userId: ObjectId, 
    username: string, 
    level: number, 
    xp: number 
  }],
  generatedAt: Date
}
```

---

### 2) ENV

Add and use:

```env
MONGODB_URI=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
ADMIN_SEED_LOGIN=edevzi
ADMIN_SEED_PASSWORD=edevzi123!
NEXT_PUBLIC_APP_URL=https://your-app.com
JWT_SECRET=...  # already exists
```

---

### 3) Routing (Pages Router)

Create routes/pages under `src/pages/`:

- `/` → Home: user's level, XP, unlocked lessons, leaderboard preview
- `/learn` → Lesson catalog (locked/unlocked badges)
- `/learn/[slug]` → Lesson page: contentMD + examples + "Start Train" + "Homework"
- `/learn/[slug]/train/[id]` → Editor + "Check Solution" (infinite attempts)
- `/learn/[slug]/homework` → Editor + ONE final submission button
- `/leaderboard` → Global + Weekly tabs
- `/profile` → User progress
- `/admin` → Admin dashboard (role-guarded)
  - `/admin/lessons` → CRUD lessons, schedule unlockAt, reorder
  - `/admin/lessons/new` → Create new lesson
  - `/admin/lessons/[id]` → Edit lesson (use query param or dynamic route)
  - `/admin/settings` → Telegram bot settings

Guard admin pages with role checks; reuse existing auth middleware pattern.

---

### 4) UI/UX

- Tailwind + clean, accessible, mobile-first design (match existing style).
- Lesson page layout: sticky sidebar (sections), main content (Markdown → rendered), examples area with "Run".
- Editor page (train/homework): reuse existing Monaco editor component from `/home`. Split view – code left, live preview right (iframe sandbox). "Run" and "Check" buttons.
- Home (`/home`): extend existing page to show user level badge, XP progress bar, next unlock countdown, leaderboard preview.
- Leaderboard: paginated list with rank numbers (1st, 2nd, 3rd, …).
- Lock state (before unlockAt): disable actions, show countdown.

---

### 5) Editor & Sandbox

- Reuse the existing Monaco editor component (`src/components/Editor.tsx`).
- Live preview in a sandboxed iframe (reuse `src/components/Preview.tsx` pattern). Disable arbitrary JS for grading; if JS allowed for preview, still grade only HTML/CSS.
- Persist draft per user per exercise (localStorage + optional server draft).

---

### 6) Auto-Grader (Server)

Implement server-side grading utilities in `src/lib/grader.ts`:

- Use `cheerio` to parse HTML and assert structure (e.g., element existence, attributes, text).
- Use `postcss` + `postcss-value-parser` (or `css-tree`) to assert CSS rules (e.g., #box has color: red).
- Implement a small DSL for checks:
  - `type: 'html' | 'css'`
  - Rule examples:
    - HTML: `exists:h1`, `has:.primary button`, `attr:img.alt`, `text:h1=Welcome`
    - CSS: `rule:#box color=red`, `class:.primary background-color=#0ea5e9`
- Return an array of `{checkId, passed, message}`.

---

### 7) Business Rules

- **Trains**: unlimited attempts. Store last result; mark train as completed when all checks pass.
- **Homework**: one final submission only (`isFinal = true`). Disable the submit button after success. Allow practicing on the same page in a separate "Practice" tab that never locks.
- **When homework final submission succeeds**:
  - Compute score using `homework.rubric`.
  - Award XP to user and update level (simple linear formula: e.g., `level = floor(xp / 100) + 1`).
  - Send Telegram notification (see below).
- **Scheduling**: if `now < unlockAt`, lesson and its routes are inaccessible (return 403 UI with countdown).
- **Leaderboard**:
  - Global = by total XP.
  - Weekly = XP earned within current week (Mon–Sun).
  - Show ranks and usernames; cache snapshot (optional) with cron/route.

---

### 8) API Routes (Pages Router)

Create API under `src/pages/api/*`:

#### GET `/api/lessons`
- List all lessons (respect `unlockAt` for users, admins see all)
- Response: `{ lessons: Lesson[] }`

#### GET `/api/lessons/[slug]`
- Get one lesson (403 if locked for non-admin)
- Response: `{ lesson: Lesson }`

#### POST `/api/admin/lessons`
- Create lesson (ADMIN only)
- Body: `Lesson`
- Response: `{ success: boolean, lesson: Lesson }`

#### PUT `/api/admin/lessons/[id]`
- Update lesson (ADMIN only)
- Body: `Partial<Lesson>`
- Response: `{ success: boolean, lesson: Lesson }`

#### DELETE `/api/admin/lessons/[id]`
- Delete lesson (ADMIN only)
- Response: `{ success: boolean }`

#### POST `/api/train/grade`
- Body: `{ lessonId: string, trainId: string, html: string, css?: string }`
- Response:
```typescript
{
  passedAll: boolean,
  checksResult: { 
    checkId: string, 
    passed: boolean, 
    message: string 
  }[]
}
```

#### POST `/api/homework/submit`
- Body: `{ lessonId: string, html: string, css?: string }`  // final once
- Response:
```typescript
{
  accepted: boolean,               // true if all checks passed
  score: number,                   // rubric sum
  xpAwarded: number,
  checksResult: { 
    checkId: string, 
    passed: boolean, 
    message: string 
  }[],
  locked: boolean                  // true if student already submitted final before
}
```

**Server validations:**
- Verify `now >= unlockAt` or `role==ADMIN`.
- Enforce single final submission: if a HOMEWORK submission exists with `isFinal=true`, return `{ locked: true }`.
- Grade with the server auto-grader; ignore any client-side claims.
- Use existing JWT auth pattern (extract token from `Authorization` header or cookie).

#### GET `/api/leaderboard/global`
- Response: `{ items: [{ userId, username, level, xp, rank }] }`

#### GET `/api/leaderboard/weekly`
- Response: `{ items: [{ userId, username, level, xp, rank }], weekStart: Date }`

#### GET `/api/me/progress`
- Response: `{ progress: Progress[], totalXp: number, level: number }`

---

### 9) Telegram Notification (Server)

Create `src/lib/telegram.ts`:

```typescript
export async function sendHomeworkTelegram({
  username, userId, lessonSlug, lessonTitle, score, xpAwarded, submittedAt
}: {
  username: string; 
  userId: string; 
  lessonSlug: string; 
  lessonTitle: string;
  score: number; 
  xpAwarded: number; 
  submittedAt: Date;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  if (!token || !chatId) return;

  const text =
    `✅ Homework submitted\n` +
    `👤 User: ${username} (${userId})\n` +
    `📘 Lesson: ${lessonTitle} (${lessonSlug})\n` +
    `📝 Score: ${score}\n` +
    `⭐ XP: +${xpAwarded}\n` +
    `🕒 When: ${submittedAt.toISOString()}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}
```

Call this function only after a successful HOMEWORK final submission and DB writes.

---

### 10) Admin Panel

- CRUD lessons: edit contentMD, examples, trains, homework, unlockAt, and order.
- Simple Markdown editor (e.g., textarea or Monaco) + forms for checks/rubric arrays.
- Button "Preview lesson".
- Guard with role ADMIN; seed dev admin using .env values (on first run or migration script).

---

### 11) Security & Integrity

- Grade server-side only. Never trust client.
- Sanitize HTML/CSS for preview. Use sandboxed iframe (no `allow-same-origin` if possible).
- Rate-limit grading endpoints per user (optional).
- Respect auth everywhere (no anonymous grading/submission). Use existing JWT pattern.
- Do not leak rubric points or detailed checks to users before submission; show only hints.

---

### 12) Level & XP

- Basic formula (adjustable):
  - `xp += score`
  - `level = Math.floor(xp / 100) + 1`
- Show progress bar to next level.
- Weekly leaderboard window resets every Monday 00:00 app timezone.

---

### 13) Home Page

Extend existing `/home` page to show:

- User badge: Level N + XP progress
- Next unlock countdown (nearest unlockAt in the course)
- Unlocked lessons grid (locked ones greyed out)
- Leaderboard preview (top 10 global + link to full board)

Keep existing editor functionality intact.

---

### 14) Responsive & Accessibility

- Mobile-first, supports small screens (students on phones).
- Keyboard navigation in the editor page.
- Clear CTA buttons ("Run", "Check", "Submit Final").

---

### 15) Acceptance Criteria

- A normal student can:
  - Open only unlocked lessons; locked lessons show countdown.
  - Read content, run examples, solve trains with unlimited checks.
  - Submit homework once; further final attempts are blocked.
  - See grading result and XP/level update instantly.
- Admin can:
  - Create/edit lessons with markdown, examples, trains, homework, checks, rubric.
  - Set unlockAt and change ordering.
  - Configure Telegram bot chatId/token (reads from env; optional DB settings page).
- Telegram receives a message on each successful homework final submission.
- Leaderboard lists all users ranked; Home shows current user's level & position.

---

## 🔨 IMPLEMENTATION NOTES

- Use Pages Router API routes (`src/pages/api/*.ts`) for grading & submission.
- Keep existing auth (`/api/auth/*`) and editor components; create adapter wrappers if needed.
- Use `remark`/`rehype` or similar to render `contentMD` (install if needed).
- Write small utility: `evaluateHtmlCss(html, css, checks)` returning `checksResult`.
- Cache leaderboard server-side for 1–5 minutes to reduce DB load.
- Install needed packages: `cheerio`, `postcss`, `postcss-value-parser` (or `css-tree`), `remark`, `rehype`, `remark-html` (or similar).
- Extend User model by adding fields, not replacing the schema.

---

## ✅ DELIVERABLES

1. Mongoose models (extend User, create Lesson, Submission, Progress, etc.) and migration/seed scripts (seed lessons + admin dev user).
2. API endpoints above (with tests for grading & single final submission).
3. Pages & components for catalog, lesson, train, homework, leaderboard, admin.
4. Telegram service file and integration in homework submit flow.
5. Tailwind UI with responsive layouts (match existing style).
6. README section explaining env, roles, and how to add new lessons.

---

**Important**: 
- Do not remove or modify existing auth/editor unless strictly necessary. 
- Integrate the new features side-by-side. 
- Use TypeScript everywhere. 
- Keep code production-grade and consistent with the current project style.
- **NO EMAIL** - use username/phone only.
- Use Pages Router (not App Router).
- Extend existing User model, don't replace it.

