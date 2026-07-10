# Smart CRM Lead Importer & AI Sanitizer

An enterprise-grade, highly resilient, and scalable CSV lead import pipeline. This application utilizes stream-based parsing, OpenAI's LLMs for semantic CRM field mapping, and Inngest for event-driven background job orchestration. It is fully containerized and designed for high throughput, cost-efficiency, and bulletproof reliability.

---

## 🎬 Product Demo

<!-- TIP: Place your screen recording video or animated GIF in 'assets/demo.mp4' (or 'assets/demo.gif') and update the path below. -->
<p align="center">
  <video src="frontend/public/AI-Powered%20CSV%20Sanitizer%20-%20Brave%202026-07-10%2018-03-20.mp4" width="100%" autoplay loop muted controls></video>
</p>

---

![Node](https://img.shields.io/badge/Node-20+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991?logo=openai&logoColor=white)
![Inngest](https://img.shields.io/badge/Inngest-background_jobs-3E63DD)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

**[Setup](#local-setup) · [Docker](#docker) · [API](#api) · [Engineering Decisions](#key-engineering-decisions)**

---

## Features

- **AI field mapping** — `gpt-4o-mini` maps arbitrary headers (`cell_phone`, `first_name`, `status_notes`, etc.) to CRM fields using structured JSON prompts.
- **Stream-based parsing** — CSVs are parsed via Node streams (PapaParse) in chunks of 10 rows, keeping memory usage constant regardless of file size.
- **Background processing** — Upload returns `202 Accepted` with a `jobId` immediately; parsing and mapping happen in the background, and clients poll for status.
- **Parallel batch mapping** — Batches are mapped concurrently via `Promise.all` to reduce total completion time.
- **Multi-contact handling** — A second email or phone number in a row is appended to `crm_note` instead of being dropped, so no data is lost.
- **Idempotent uploads** — Duplicate uploads (same file, by MD5 hash) return the cached `jobId` instead of re-calling OpenAI. Failed jobs bypass the cache automatically so corrected files can be retried.
- **Automatic retries** — Failed background steps retry up to 5 times via Inngest's state machine.

---

## Key Engineering Decisions

- **Inngest over a custom queue** — gives type-safe event-driven workflows, step-level retries, and automatic deduplication without standing up Redis.
- **Batch size of 10 rows** — keeps each OpenAI request under ~15s, avoiding HTTP timeouts, while still batching efficiently.
- **Zod + OpenAI output** — OpenAI sometimes returns `""` for missing fields, but optional Zod strings expect `undefined`. Empty strings are normalized to `undefined` before validation.

---

## Tech Stack

**Backend** — Node.js, Express, TypeScript, Zod, PapaParse
**AI** — OpenAI (`gpt-4o-mini`, structured prompts)
**Background jobs** — Inngest
**Containerization** — Docker, Docker Compose

---

## Local Setup

**Prerequisites:** Node.js v20+, pnpm v10+, Inngest CLI

1. **Backend**
   ```bash
   cd backend
   pnpm install
   ```
2. Create `backend/.env`:
   ```env
   PORT=4000
   OPENAI_API_KEY=your_openai_api_key_here
   ```
3. Run the dev server:
   ```bash
   pnpm run dev
   ```
### 2. Start the Inngest Dev Server
In a new terminal window inside the `backend` directory, run the Inngest developer server pointing to our local express router port:
```bash
npx inngest-cli@latest dev -u http://localhost:4000/api/inngest
```
Open `http://localhost:8288` in your browser to view the Inngest dashboard.

### 3. Setup Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the Next.js local development server:
   ```bash
   pnpm run dev
   ```
4. Open `http://localhost:3000` in your browser to access the user interface.

---

## Docker

```bash
docker compose up --build          # full stack: backend on :4000, frontend on :3000
docker compose up backend --build  # backend only
```

**Networking note:** inside a container, `localhost` refers to the container itself. To reach an Inngest dev server running on your host machine:
```bash
docker run -p 4000:4000 --env-file .env \
  -e INNGEST_BASE_URL=http://host.docker.internal:8288/ groweasy-backend
```

---

## API

### `POST /api/import`
Upload a CSV file (`form-data`, field name `file`).

**Response — `202 Accepted`** (or `200` if idempotent):
```json
{
  "statusCode": 202,
  "data": {
    "jobId": "b18365db-fcd3-4e44-b0db-6e69123862cd",
    "totalBatches": 1,
    "totalRows": 4
  },
  "message": "CSV import started in the background",
  "success": true
}
```

### `GET /api/import/status/:jobId`
Poll for job status.

**Response — `200 OK`**:
```json
{
  "statusCode": 200,
  "data": {
    "id": "b18365db-fcd3-4e44-b0db-6e69123862cd",
    "status": "completed",
    "totalBatches": 1,
    "completedBatches": 1,
    "successRecords": [
      {
        "created_at": "2026-06-01 10:15:00",
        "name": "Ankit Verma",
        "email": "ankit.verma@gmail.com",
        "mobile_without_country_code": "9123456780",
        "city": "Mumbai",
        "crm_status": "GOOD_LEAD_FOLLOW_UP",
        "data_source": "meridian_tower"
      }
    ],
    "skippedRecords": [],
    "failedBatches": [],
    "createdAt": 1783612232361
  },
  "message": "Job status retrieved successfully",
  "success": true
}
```
