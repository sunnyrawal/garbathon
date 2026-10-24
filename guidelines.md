# MASTER BUILD SPECIFICATION — CIVICSAATHI AI
## Garbath​on Hackathon | AI-Powered Civic Complaint Agent

You are acting as a senior full-stack engineer, AI agent architect, UI/UX designer, security engineer, and QA tester.

Your task is to build a complete, polished, functional, and thoroughly tested web application named **CivicSaathi AI**.

Do not merely generate a UI mockup. Build a working end-to-end application in which users can upload an image, receive AI-powered issue analysis, identify the appropriate municipal ward and department, create a complaint record, and retrieve its status through a conversational assistant.

The project must be suitable for a live hackathon demonstration.

IMPORTANT: No real municipal portal will be connected. This is a simulated civic complaint system. Clearly disclose that complaints are demo records and have not been submitted to a government authority.

---

# 1. PROJECT OBJECTIVE

## Problem

Citizens often do not know which municipal department is responsible for potholes, garbage accumulation, broken streetlights, or waterlogging. Reporting these problems can involve identifying the correct ward, finding the appropriate department, and repeatedly following up on the complaint.

## Solution

Build an AI-powered civic agent that handles the reporting workflow.

The user should be able to:

1. Upload a photo of a civic problem.
2. Enter an area or locality.
3. Receive an AI-generated issue classification and description.
4. Review and confirm the identified issue.
5. See the matched municipal ward and department.
6. Create a simulated complaint with a unique tracking ID.
7. Check the saved complaint status through a chat interface.
8. See a transparent timeline of the actions the agent actually performed.

## Product differentiator

The application must demonstrate actual agent behavior through tool execution, not merely a chatbot that describes actions it has not performed.

The agent must use backend tools for ward lookup, department lookup, complaint creation, and status retrieval. Each action must produce a real result that is reflected in the interface.

---

# 2. TECHNOLOGY STACK

Use the following stack unless the existing workspace has a compelling technical constraint.

Frontend:
- React
- Vite
- JavaScript
- Tailwind CSS
- React Router if multiple routes are needed
- Lucide React icons
- A lightweight charting library only if a dashboard chart is useful

Backend:
- Node.js
- Express.js
- Official Google GenAI JavaScript SDK for Gemini image analysis
- Multer for multipart image uploads
- Zod or an equivalent schema validator
- UUID or cryptographically secure identifiers for tickets

Storage:
- Local JSON files for the mock ward directory, department mappings, and complaint records
- A small storage service abstraction so the persistence implementation can be replaced later
- Serialized or otherwise concurrency-safe writes to prevent simultaneous requests from corrupting JSON files

Testing:
- Vitest for frontend and shared utility tests where appropriate
- Supertest for Express API tests
- React Testing Library for essential frontend behavior
- Browser-based end-to-end testing using an available supported browser automation tool

Do not add a database server, authentication system, payment system, real municipal integration, or unnecessary infrastructure.

Use compatible, stable dependency versions. Verify current SDK usage against official documentation instead of inventing method names.

---

# 3. REQUIRED PROJECT STRUCTURE

Organize the project cleanly. A monorepo is acceptable.

Suggested structure:

civic-saathi-ai/
  client/
    src/
      components/
      pages/
      layouts/
      hooks/
      services/
      utils/
      styles/
      App.jsx
      main.jsx
    package.json
    vite.config.js

  server/
    src/
      config/
      controllers/
      routes/
      services/
      agent/
      tools/
      middleware/
      validators/
      data/
      utils/
      app.js
      server.js
    tests/
    package.json
    .env.example

  shared/
    schemas/
    constants/

  README.md
  .gitignore
  package.json

Adapt this structure when useful, but keep UI, API handling, AI integration, tool implementations, persistence, and validation separate.

Do not put the entire application into one component or one enormous backend file.

---

# 4. UI/UX AND VISUAL DESIGN

Create a premium civic-tech interface, not a generic admin dashboard.

## Visual direction

Use a modern, trustworthy, warm visual identity.

Suggested palette:
- Deep navy or midnight purple for primary surfaces
- Warm saffron or amber for highlights
- Soft off-white backgrounds
- Dark readable text
- Green for success
- Red for errors
- Neutral gray for secondary information

Use the palette consistently. Maintain strong contrast and accessible text sizes.

Design requirements:
- Responsive on desktop, tablet, and mobile
- Clean typography and consistent spacing
- Rounded cards with restrained shadows
- Subtle animations, not excessive motion
- Clear visual hierarchy
- Proper loading, error, empty, and success states
- Accessible labels and keyboard navigation
- Meaningful icons
- No overlapping elements, horizontal overflow, or clipped text

Use realistic sample data and real UI states. Never use decorative elements that imply a successful operation when the operation has failed.

## Required screens

### A. Landing page

Include:
- Product logo and name: CivicSaathi AI
- Hero heading: "Report a problem. Let AI handle the routing."
- Short explanation of the problem being solved
- Primary action: "Report an Issue"
- Secondary action: "Track a Complaint"
- Four issue categories: pothole, garbage, broken streetlight, waterlogging
- A short explanation of the AI workflow
- A visible demo-mode disclosure
- A sample complaint statistics section only if values are derived from the local records

### B. Report issue page

Include:
- Drag-and-drop upload area
- File picker
- Image preview
- Remove or replace image action
- Image file type and size guidance
- Area/locality text input
- Optional latitude and longitude fields if location coordinates are used
- AI analysis button
- Loading state with actual progress information where available
- Issue analysis result
- Editable issue type, description, and severity
- A confirmation step before creating the complaint

Do not claim to have obtained the user's location unless the browser actually supplies it and the user grants permission.

Do not invent coordinates or use a user's location without consent.

### C. Analysis results

Display:
- Uploaded image
- Detected issue category
- Description of the visible problem
- Severity: low, medium, or high
- Confidence, when supported by a meaningful model-provided estimate
- Recommended action
- Any uncertainty or limitations
- Selected area
- Ward lookup result
- Department lookup result
- Explanation of the routing decision

Do not present a model-generated confidence value as a scientifically calibrated probability.

Do not infer the exact location, ownership, cause, or severity of damage from an image when the evidence does not support it.

### D. Complaint confirmation

After successful persistence, show:
- Unique tracking ID
- Issue type
- Area
- Ward
- Department
- Creation timestamp
- Initial status
- Summary of the action taken
- A button to open complaint details
- A button to check status

Include a clearly visible notice:

"Demo complaint only — this record has not been submitted to a real municipal authority."

### E. Complaint tracking

Include:
- Tracking ID input
- Search button
- Complaint details card
- Current saved status
- Issue type and location
- Ward and department
- Creation timestamp
- Status history, if stored
- Helpful error message for an invalid or nonexistent ID

### F. AI assistant

Build a conversational interface that can:
- Explain a newly created complaint
- Retrieve a complaint by tracking ID
- Report the saved status
- Explain which department was selected
- Explain how to use the application
- State honestly when it cannot find a record

The assistant must use actual ticket records for complaint-specific questions.

It must not invent tracking IDs, status changes, official contact information, government submission confirmations, or municipal policies.

### G. Agent activity timeline

Display the real sequence of operations:

1. Image received
2. Image analysis completed
3. Location validated
4. Ward lookup completed
5. Department lookup completed
6. Complaint creation completed
7. Ticket persisted
8. Status retrieved when requested

Each entry must reflect an actual backend event, its result, and its success or failure.

Do not display future steps as completed before they have actually succeeded.

---

# 5. AI AGENT ARCHITECTURE

Build a controlled, observable agent workflow.

The application should not rely on unconstrained AI text generation to decide whether a complaint was created.

## Required backend tools

Implement these functions as real, independently testable backend services:

### Tool 1: analyzeIssueImage(image)

Input:
- Validated image file

Output:
- issueType
- description
- severity
- confidence or uncertainty information
- recommendedAction
- visualEvidence
- warnings, if applicable

Supported issue types:
- pothole
- garbage
- broken_streetlight
- waterlogging
- other

Requirements:
- Use Gemini image understanding.
- Ask for structured output using a schema-supported API mechanism.
- Validate the response before returning it.
- Handle missing fields and malformed JSON.
- Do not automatically create a complaint during image analysis.
- If the image is ambiguous, request user confirmation.
- If the image is unrelated to civic issues, explain that and allow the user to upload another image.
- Do not treat a text description from the model as proof of an issue that is not visible.

### Tool 2: lookupWard(areaName)

Input:
- Area or locality name

Output:
- Matching ward ID
- Ward name
- Matched locality
- Match method
- Whether the result is an exact match

Requirements:
- Use a local mock directory.
- Normalize whitespace and capitalization.
- Support known aliases only when explicitly configured.
- Avoid broad fuzzy matching that silently assigns the wrong ward.
- If no reliable match exists, ask the user to select a supported area.
- Never invent a ward or present a fictional ward as an official assignment.

### Tool 3: lookupDepartment(issueType)

Use a deterministic mapping:

- pothole → Roads / Public Works
- garbage → Sanitation
- broken_streetlight → Electrical Maintenance
- waterlogging → Drainage
- other → Manual review / Unassigned

Return:
- Department ID
- Department name
- Reason for assignment
- Mapping source

The mapping must be deterministic for supported categories. The AI may explain the mapping but must not override it arbitrarily.

### Tool 4: createComplaint(issueDetails, ward, department)

Requirements:
- Validate all inputs.
- Generate a unique tracking ID.
- Persist the record before returning success.
- Store the issue, location, ward, department, severity, timestamp, and initial status.
- Return the saved record.
- Handle storage errors safely.
- Prevent duplicate submission caused by accidental double clicks or retries.
- Disable the submit button while a request is in progress.
- Do not create duplicate records when an idempotency key is reused for the same operation.

Suggested status:
"Submitted (Demo)"

Do not imply that the complaint has been sent to a real municipality.

### Tool 5: getComplaintStatus(ticketId)

Requirements:
- Read the saved record from storage.
- Validate the tracking ID format.
- Return the actual current status and relevant ticket details.
- Return a proper not-found result for unknown IDs.
- Never fabricate a ticket or status.

### Tool 6: getComplaintDetails(ticketId)

Return the saved record and status history, if available.

### Tool 7: answerGeneralQuestion(question)

Answer general questions about the application and explain the demo workflow.

If a question requires ticket-specific data, invoke the relevant lookup tool first. If a tool fails, report the failure rather than pretending the tool succeeded.

## Orchestration rules

Implement a clear, bounded orchestration layer.

- Analyze the image first.
- Validate the location.
- Resolve the ward.
- Resolve the department.
- Require user confirmation before complaint creation.
- Persist the ticket.
- Confirm success only after persistence succeeds.
- Retrieve ticket data before answering a status question.
- Keep an audit-friendly record of actual tool execution.
- Limit retries and execution time.
- Avoid infinite loops and unbounded agent tool calls.
- Do not permit the LLM to invent or execute arbitrary server functions.
- Never expose environment variables, internal secrets, or filesystem access through the agent.

For deterministic operations, call the backend tool directly. Use AI where it adds value, especially image understanding and natural-language interaction.

---

# 6. MOCK MUNICIPAL DATA

Create a clearly labeled fictional municipal directory.

Include several sample areas, such as:

- Riverfront Extension
- Central Market
- Green Park
- Lakeview Road
- Sunrise Colony
- Station Road

These are demo localities, not claims about official ward boundaries.

For each area, define:
- Stable ward ID
- Demo ward name
- Supported locality aliases

Create department records for Roads / Public Works, Sanitation, Electrical Maintenance, Drainage, and Manual Review.

Store the directory separately from complaint records.

Include a handful of sample complaints for the demo dashboard, but keep them distinguishable from newly created user complaints.

Do not use sample data to make false claims about real municipal response times or real-world resolution rates.

---

# 7. DATA MODEL

Define and validate the complaint record.

Suggested schema:

{
  "id": "unique-internal-id",
  "ticketId": "CS-DEMO-UNIQUE",
  "issueType": "pothole",
  "description": "Visible road damage near the intersection",
  "severity": "medium",
  "confidence": 0.85,
  "recommendedAction": "Inspection by the roads team",
  "area": "Central Market",
  "wardId": "WARD-DEMO-01",
  "wardName": "Central Market Demo Ward",
  "departmentId": "roads",
  "departmentName": "Roads / Public Works",
  "status": "Submitted (Demo)",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp",
  "statusHistory": [],
  "isDemo": true
}

Treat this as an example schema, not a requirement to copy the values literally.

Use a shared validation schema and consistent error responses.

Avoid storing image binaries in JSON. Store a suitable reference or metadata if necessary, and make sure temporary uploaded files are cleaned up.

Do not collect names, phone numbers, or other personal information unless genuinely required. The MVP should not require citizen registration.

---

# 8. REQUIRED API ENDPOINTS

Implement and test:

GET /api/health

POST /api/analyze
- Accept multipart/form-data containing an image.
- Validate the image.
- Return structured analysis.

GET /api/wards?area=...
- Resolve the requested supported area.

GET /api/departments?issueType=...
- Return the deterministic department mapping.

POST /api/complaints
- Validate the confirmed issue, location, ward, and department.
- Persist the complaint.
- Return the saved record and ticket ID.

GET /api/complaints/:ticketId
- Retrieve the actual saved complaint.

POST /api/assistant
- Accept a question and optional tracking ID or conversation context.
- Invoke appropriate tools.
- Return the answer, relevant record information, and actual tool events.

Use correct HTTP status codes.

Examples:
- 200: successful read
- 201: newly created complaint
- 400: invalid request
- 404: unknown ticket or unmatched resource
- 413: upload too large
- 415: unsupported media type
- 429: rate limit exceeded
- 500: unexpected server error
- 503: unavailable AI service

Return errors in a consistent shape, for example:

{
  "success": false,
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "No complaint was found for this tracking ID."
  }
}

Never return stack traces, secrets, or internal filesystem paths to the frontend.

---

# 9. ERROR HANDLING AND SECURITY

Implement the following protections:

- Server-side Gemini API key only
- Environment variables and a documented .env.example
- .env and private data excluded from Git
- File-size limits
- MIME-type and file signature validation where practical
- Safe image processing
- Input validation on every mutating endpoint
- Rate limiting on expensive AI endpoints
- CORS configured for the intended frontend origin
- Safe error handling and request timeouts
- Protection against duplicate submissions
- No arbitrary shell commands or dynamic code execution from user input
- No unrestricted file paths supplied by the user
- No exposure of internal stack traces
- No hardcoded API keys
- No untrusted HTML rendered directly into the page

Treat the AI model's output as untrusted input. Validate all fields and enforce the supported category list.

If the API key is missing, return a clear setup message. Never silently return fake AI results while claiming the live AI service succeeded.

Provide a clearly labeled demo mode using deterministic sample data so the application remains demonstrable without an API key.

Demo mode must be explicit and visible. The UI must distinguish demo analysis from live AI analysis.

---

# 10. PERSISTENCE AND DATA INTEGRITY

Use a storage service abstraction.

For JSON persistence:
- Initialize the data files if missing.
- Validate records when loading.
- Handle empty or malformed files.
- Write atomically using a temporary file and rename where supported.
- Serialize concurrent writes.
- Generate unique identifiers safely.
- Avoid losing records when two requests arrive close together.
- Return errors when persistence fails.
- Never report a successful complaint creation unless the record is saved.

Keep a stable ticket ID separate from the internal database ID.

Make sure the complaint remains available after refreshing the browser and restarting the server.

Document the limitations of local JSON persistence. This is a hackathon prototype, not a production multi-instance database.

---

# 11. FRONTEND FUNCTIONAL REQUIREMENTS

Implement:
- Reusable components
- Controlled forms
- Loading indicators
- Disabled states during requests
- Success and error notifications
- Clear validation messages
- Empty states
- Responsive layouts
- Accessible form labels
- Proper keyboard focus
- Retry actions where appropriate

Every visible button must have a working action.

Do not leave placeholder links, dead buttons, empty click handlers, or forms that appear to submit but do nothing.

Do not use hardcoded success responses in production code paths.

The frontend must display backend results rather than independently inventing ticket details or routing decisions.

Avoid exposing raw backend errors directly to users.

---

# 12. TESTING REQUIREMENTS

Create automated tests for the important functionality.

## Unit tests

Test:
- Area-name normalization
- Exact ward matching
- Unknown-area handling
- Department mapping
- Ticket ID generation
- Request validation
- AI response validation
- Error formatting
- Idempotency behavior

## API tests

Test:
- Health endpoint
- Valid image analysis using a mocked AI provider
- Missing image
- Invalid image type
- Oversized upload
- Missing API key
- AI provider timeout
- AI provider malformed response
- Valid ward lookup
- Unknown ward
- Valid department lookup
- Successful complaint creation
- Invalid complaint payload
- Duplicate submission
- Successful ticket lookup
- Unknown ticket
- Persistence failure
- Assistant response for an existing ticket
- Assistant response for a nonexistent ticket

Do not require a paid AI API call for every automated test. Mock the AI provider in automated tests, and perform a separate live integration check when credentials are configured.

## Browser end-to-end tests

Run the actual application and verify:

1. The landing page renders.
2. Navigation works.
3. A valid image can be selected and previewed.
4. An image can be analyzed in live or explicitly labeled demo mode.
5. The user can correct the detected category.
6. A supported area can be selected.
7. The ward and department are displayed.
8. The user confirms complaint creation.
9. A ticket ID is displayed.
10. Refreshing the page does not destroy the saved record.
11. Searching the ticket ID retrieves the same complaint.
12. The assistant returns the actual stored status.
13. An unknown ticket produces a clear not-found response.
14. Invalid submissions show helpful validation.
15. Network or AI failures do not produce false success messages.
16. The interface works at desktop and mobile viewport sizes.
17. There are no uncaught browser errors or failed essential requests.

Where browser automation is unavailable, perform and document the equivalent manual checks. Never claim that an unexecuted test passed.

---

# 13. PERFORMANCE AND RELIABILITY

- Avoid unnecessary dependencies.
- Keep components small and focused.
- Do not reload the entire page for ordinary operations.
- Limit image size before sending it to the AI provider.
- Use request timeouts and bounded retries.
- Avoid repeated AI calls caused by React rerenders.
- Prevent double-click duplicate submissions.
- Handle API outages gracefully.
- Use an explicit loading state during image analysis.
- Do not claim exact progress percentages unless actual progress is measurable.
- Ensure the application starts using documented commands.

---

# 14. DEMO MODE

Implement a predictable offline demo mode.

In demo mode:
- Display a visible "Demo Mode" label.
- Use a small, deterministic set of sample analyses.
- Use real ward lookup and department mapping functions.
- Create and persist real demo complaint records.
- Use real ticket retrieval.
- Clearly identify simulated AI responses and sample data.
- Do not claim that the Gemini model analyzed the image if it did not.
- Do not claim that a real municipality received the complaint.

The demo must demonstrate the complete workflow without external API credentials.

---

# 15. DEVELOPMENT WORKFLOW

Follow these phases in order.

## Phase A: Inspect and plan

- Inspect the entire existing workspace.
- Identify existing files, package managers, dependencies, and configuration.
- Do not overwrite working code blindly.
- Produce a concise implementation plan.
- Identify major risks and dependencies.
- Then begin implementation without waiting for unnecessary clarification.

## Phase B: Build the vertical slice

Implement the smallest complete working flow:

Image selection → analysis → location lookup → department lookup → confirmation → persisted ticket → status lookup.

Do not spend the first half of the project only on styling.

## Phase C: Implement remaining screens

Complete the landing page, report screen, tracking screen, assistant, and activity timeline.

## Phase D: Integrate and verify

- Start the frontend and backend.
- Inspect terminal logs.
- Run automated tests.
- Use the browser to test the complete workflow.
- Fix the root cause of errors instead of hiding them.
- Re-run tests after changes.

## Phase E: Final review

Check functionality, security, responsive behavior, data persistence, documentation, and demo readiness.

Keep a clear list of completed work and remaining limitations.

---

# 16. DEFINITION OF DONE

Do not consider the project complete until the following conditions are met.

[ ] The application starts successfully using documented commands.

[ ] The frontend and backend communicate correctly.

[ ] The landing page and all primary screens work.

[ ] An image can be uploaded and analyzed in live mode or explicitly labeled demo mode.

[ ] The AI result is validated before being displayed.

[ ] The user can correct the issue classification.

[ ] Ward lookup uses real mock directory data.

[ ] Department mapping is deterministic.

[ ] The user must confirm before creating a complaint.

[ ] The complaint is actually persisted.

[ ] Every new ticket has a unique tracking ID.

[ ] The ticket survives browser refresh and server restart.

[ ] The tracking page retrieves the saved record.

[ ] The assistant retrieves the actual status before answering.

[ ] The activity timeline reflects actual tool executions.

[ ] Unknown locations and ticket IDs are handled correctly.

[ ] API and frontend failures never display false success.

[ ] Environment secrets are not exposed in client code.

[ ] Automated tests pass.

[ ] The end-to-end workflow has been verified in the browser.

[ ] The application is usable on mobile and desktop.

[ ] The README includes installation, environment setup, commands, testing, demo mode, and known limitations.

[ ] No critical TODOs, broken routes, dead buttons, or unimplemented core features remain.

If any condition is unmet, identify it clearly and continue fixing it when feasible.

---

# 17. FINAL REPORT

After implementation, provide:

1. A concise architecture overview.
2. The project folder structure.
3. Installation and startup commands.
4. Required environment variables.
5. API endpoint documentation.
6. Test commands and actual results.
7. Browser verification results.
8. Features completed.
9. Any remaining bugs or limitations.
10. Exact steps to demonstrate the application to a judge.

Do not claim the application is bug-free or production-ready solely because it builds.

Report only tests that were actually executed. Distinguish passing, failing, skipped, and unverified checks.

Begin by inspecting the workspace, preparing the implementation plan, and then building the application end to end. Prioritize a reliable, complete demo over unnecessary complexity.