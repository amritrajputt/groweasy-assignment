# Smart CRM Lead Importer & AI Sanitizer

An enterprise-grade, highly resilient, and scalable CSV lead import pipeline. This application utilizes stream-based parsing, OpenAI's LLMs for semantic CRM field mapping, and Inngest for event-driven background job orchestration. It is fully containerized and designed for high throughput, cost-efficiency, and bulletproof reliability.

---

## 🚀 Key Features

* **AI-Powered Semantic Mapping**: Leverages `gpt-4o-mini` with structured JSON prompts to map arbitrary, user-supplied CSV headers (e.g., `"cell_phone"`, `"first_name"`, `"status_notes"`) to standard CRM fields.
* **Parallel Batch Processing**: Employs `Promise.all` inside background steps to process parsed batches concurrently. This parallel execution model ensures highly optimized throughput and minimal completion latency.
* **Stream-Based Chunking**: Uses `PapaParse` to parse incoming CSV files via Node streams, segmenting data into chunks of 10 rows. This maintains a constant memory footprint (OOM protection) during large file uploads.
* **Non-Blocking Background Workflows**: Immediately dispatches CSV parsing tasks to background workers, returning a `202 Accepted` response with a `jobId` so clients can poll for status in real-time.
* **Multi-Contact & Deduplication Rules**: Automatically extracts and maps multiple contacts. If a row has a second email or phone number, it is routed to the CRM notes field to prevent lead loss, while keeping primary contact fields clean.
* **Dynamic Cache Idempotency**: Calculates an MD5 hash of the uploaded CSV buffer. Identical duplicate uploads return the cached `jobId` instantly, bypassing OpenAI API call fees. If a job fails, the cache is automatically bypassed to allow retries.
* **Automatic Failure Resiliency**: Background tasks are configured with automated retries (up to 5 attempts) using Inngest state machine persistence.

---

## 🧠 Core Engineering Decisions & Rationale

* **Asynchronous Event-Driven Architecture (Inngest)**: Using Inngest provides type-safe event-driven workflows, serverless compatibility, built-in step re-evaluation, and automatic step deduplication out-of-the-box, without requiring a Redis database setup.
* **Optimized Batch Size (10 Rows)**: A batch size of 10 rows per OpenAI request maps precisely to optimized token generation windows. This keeps request latency under 15 seconds, preventing HTTP connection timeouts.
* **Zod Schema Compatibility**: OpenAI occasionally returns empty strings (`""`) for missing fields. Since optional Zod strings require `undefined`, the backend sanitizes empty strings to `undefined` prior to validation to ensure a seamless validation pass.
* **Dynamic API Idempotency**: Checks job store progress before returning cached results. If the cached job failed or is no longer in memory, the system dynamically allows a fresh run, preventing users from getting locked out of importing corrected datasets.

---

## 🛠️ Technology Stack

* **Backend**: Node.js (Express, TypeScript, ESM, Zod, PapaParse)
* **AI Engine**: OpenAI Node SDK (`gpt-4o-mini` structured prompt mapping)
* **Background Jobs**: Inngest SDK
* **Containerization**: Docker & Docker Compose

---

## 💻 Local Setup & Development Guide

### Prerequisites
* **Node.js**: v20 or higher
* **pnpm**: v10 or higher
* **Inngest CLI**: Installed locally

### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env` file in the `backend` directory and add your keys:
   ```env
   PORT=4000
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Start the local development server:
   ```bash
   pnpm run dev
   ```

### 2. Start the Inngest Dev Server
In a new terminal window inside the `backend` directory, run the Inngest developer server pointing to our local express router port:
```bash
npx inngest-cli@latest dev -u http://localhost:4000/api/inngest
```
Open `http://localhost:8288` in your browser to view the Inngest dashboard.

---

## 📦 Docker Setup

The system is fully containerized using Docker for decoupled deployments.

### 1. Build and Run the Complete Application (Root Directory)
To spin up both the backend and frontend services alongside each other:
```bash
docker compose up --build
```
* **Backend**: Exposed at `http://localhost:4000`
* **Frontend**: Exposed at `http://localhost:3000`

### 2. Run Backend Only via Docker
To run only the backend service using docker-compose:
```bash
docker compose up backend --build
```

### 💡 Docker Networking Troubleshooting
Inside a Docker container, `localhost` resolves to the container's environment, not your host machine. If your backend container needs to connect to the Inngest Dev Server running on your host machine, you must configure the `INNGEST_BASE_URL` environment variable:
```bash
docker run -p 4000:4000 --env-file .env -e INNGEST_BASE_URL=http://host.docker.internal:8288/ groweasy-backend
```

---

## 📡 API Endpoints

### 1. Upload CSV File
* **Method**: `POST`
* **URL**: `http://localhost:4000/api/import`
* **Body**: `form-data`
  * `file`: (Select your `.csv` file)
* **Response (202 Accepted / 200 Idempotent)**:
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

### 2. Poll Import Job Status
* **Method**: `GET`
* **URL**: `http://localhost:4000/api/import/status/:jobId`
* **Response (200 OK)**:
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
