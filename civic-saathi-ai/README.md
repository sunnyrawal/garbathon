# CivicSaathi AI 🏛️

> AI-Powered Civic Complaint Agent — Garbathon Hackathon Demo

**CivicSaathi AI** lets citizens upload a photo of a civic issue (pothole, garbage, broken streetlight, waterlogging), automatically identifies the issue using Google Gemini, routes it to the correct ward and department, files a tracked complaint, and lets you query status via an AI assistant.

> ⚠️ **Demo System** — Complaints are NOT submitted to any real municipality. This is a hackathon prototype.

---

## Quick Start

### Prerequisites
- Node.js v18+
- npm v9+
- (Optional) Google Gemini API key for live AI analysis

### 1. Install dependencies

```bash
cd civic-saathi-ai/server && npm install
cd ../client && npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env and add your GEMINI_API_KEY (optional — demo mode works without it)
```

### 3. Start the backend (Terminal 1)

```bash
cd civic-saathi-ai/server
npm run dev        # with nodemon (auto-restart)
# OR
npm start          # production start
```

Backend runs on: **http://localhost:3001**

### 4. Start the frontend (Terminal 2)

```bash
cd civic-saathi-ai/client
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | _(empty)_ | Google Gemini API key. Leave empty for demo mode. |
| `PORT` | `3001` | Backend server port |
| `NODE_ENV` | `development` | Environment |
| `DEMO_MODE` | `true` | Force demo mode (overrides API key check) |
| `FRONTEND_URL` | `http://localhost:5173` | CORS allowed origin |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| POST | `/api/analyze` | Analyze image (multipart/form-data: `image`, `area`) |
| GET | `/api/wards?area=...` | Look up ward for an area |
| GET | `/api/departments?issueType=...` | Get department for issue type |
| GET | `/api/complaints` | List all complaints |
| POST | `/api/complaints` | Create a new complaint |
| GET | `/api/complaints/:ticketId` | Get complaint by tracking ID |
| POST | `/api/assistant` | Ask the AI assistant |

---

## Demo Mode

When `GEMINI_API_KEY` is not set (or `DEMO_MODE=true`):
- Image analysis uses deterministic sample responses (cycles through 4 issue types)
- Ward lookup, department mapping, complaint creation, and status retrieval all use **real data**
- A visible "DEMO ANALYSIS" label is shown in the UI
- The complete workflow is fully demonstrable without any API keys

---

## Supported Areas (Demo Directory)

| Area | Ward |
|---|---|
| Central Market | Central Market Ward |
| Riverfront Extension | Riverfront Ward |
| Green Park | Green Park Ward |
| Lakeview Road | Lakeview Ward |
| Sunrise Colony | Sunrise Colony Ward |
| Station Road | Station Road Ward |
| Navrangpura | Navrangpura Ward |
| Maninagar | Maninagar Ward |

---

## Sample Tracking IDs (pre-loaded)

- `CS-DEMO-SAMPLE01` — Pothole, Central Market, In Progress
- `CS-DEMO-SAMPLE02` — Garbage, Riverfront Extension, Submitted
- `CS-DEMO-SAMPLE03` — Broken Streetlight, Green Park, Resolved

---

## Project Structure

```
civic-saathi-ai/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/        # Navbar, ComplaintCard, ActivityTimeline, DemoAlert
│       ├── pages/             # LandingPage, ReportPage, TrackPage, AssistantPage
│       ├── services/api.js    # Axios API service layer
│       └── utils/helpers.js   # Formatting, label, color utilities
│
├── server/                    # Node.js + Express backend
│   └── src/
│       ├── tools/             # 7 agent tools (analyze, lookupWard, lookupDept, create, getStatus...)
│       ├── agent/assistant.js # AI orchestration layer
│       ├── controllers/       # HTTP handlers
│       ├── routes/index.js    # All API routes
│       ├── utils/             # Storage, ticketId, errorResponse
│       ├── config/env.js      # Environment config
│       └── data/              # municipal-directory.json, complaints.json
│
└── package.json               # Root convenience scripts
```

---

## Known Limitations

1. **JSON file persistence** — not suitable for multi-instance production. Single-process safe only.
2. **Demo mode AI** — cycles through 4 deterministic analyses regardless of actual image content.
3. **Ward matching** — supports exact/prefix matching only; no true fuzzy matching.
4. **No authentication** — MVP does not require citizen registration.
5. **Rate limiting** — basic in-memory rate limiting; resets on server restart.

---

## Demo Steps (For Judges)

1. Open **http://localhost:5173**
2. Click **"Report an Issue"**
3. Upload any photo, type **"Central Market"** as the area
4. Click **"Analyze with AI"** — see the agent timeline
5. Review analysis, click **"Confirm & File"**
6. Copy the **tracking ID** shown
7. Click **"Track Status"** — paste the ID and search
8. Click **"Ask AI About This"** — query the assistant
9. Try asking: *"What is the status of CS-DEMO-SAMPLE01?"*
