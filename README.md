# Smart CRM Lead Importer & AI Sanitizer

A CSV lead import pipeline that maps arbitrary CSV headers to standard CRM fields using an LLM, with stream-based parsing and background job processing via Inngest.

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
4. In a separate terminal, start the Inngest dev server:
   ```bash
   npx inngest-cli@latest dev -u http://localhost:4000/api/inngest
   ```
   Dashboard: `http://localhost:8288`

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
