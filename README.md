# ShiftDesk

ShiftDesk is a personal adaptive workspace for turning goals, assignments, and projects into organized working environments. The app guides a user from an initial goal into a workspace containing tasks, milestones, notes, documents, progress, and focus tools.

## Current status

The main frontend experience is implemented and the latest work connected it to an optional backend:

- The Next.js app provides the goal setup flow and workspace dashboard.
- Workspaces support study, project, and personal modes.
- Users can manage tasks, milestones, notes, documents, deadlines, and focus sessions.
- A companion panel summarizes progress and suggests the next action.
- Data is saved to browser `localStorage` by default.
- When `NEXT_PUBLIC_API_URL` is configured, workspaces sync with the Flask/MongoDB API.
- Document uploads use the backend when configured; local-only mode keeps document metadata in the browser.

Recent changes fixed workspace-hook initialization and completed MongoDB workspace synchronization.

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling/UI:** Tailwind CSS 4, Base UI, shadcn-compatible components, Framer Motion, Lucide
- **Backend:** Flask, Flask-CORS, PyMongo
- **Database:** MongoDB
- **Analytics:** Vercel Analytics in production

## Project structure

```text
app/                         Next.js app entrypoint and global styles
components/shiftdesk/       ShiftDesk screens and workspace components
components/ui/               Shared UI primitives
lib/                         Types, workspace state, API client, and utilities
backend/app.py               Flask API and document upload handling
backend/README.md            Backend-specific setup and endpoint reference
public/                      Static assets
```

## Run the frontend locally

Requirements: Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

Available scripts:

```bash
pnpm dev
pnpm build
pnpm start
```

Without a backend URL, the app runs in browser-storage mode.

## Run the backend locally

Requirements: Python 3.11+ and MongoDB.

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

Then configure the frontend before starting it:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000 pnpm dev
```

Backend environment variables are documented in `backend/.env.example`. The default API port is `5000`, and the default MongoDB database is `shiftdesk`.

## Backend API

- `GET /api/health`
- `GET /api/workspaces`
- `POST /api/workspaces`
- `PUT /api/workspaces/<workspace_id>`
- `DELETE /api/workspaces/<workspace_id>`
- `POST /api/workspaces/<workspace_id>/documents`
- `GET /api/workspaces/<workspace_id>/documents/<document_id>`
- `DELETE /api/workspaces/<workspace_id>/documents/<document_id>`

Uploaded files are stored on disk under `UPLOAD_DIR`; workspace and document metadata are stored in MongoDB. Uploads are limited to 15 MB by the Flask service.

## Current limitations

- There is no authentication or per-user access control yet.
- There is no automated test suite configured in the package scripts.
- Backend availability is optional; failed syncs are surfaced in the frontend while local state remains available.
- Uploaded document files are stored on the backend filesystem, so production deployments need persistent storage and a backup strategy.
- The Next.js configuration currently allows builds to ignore TypeScript errors; this should be tightened before production release.
