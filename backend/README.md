# ShiftDesk backend

The backend is a small Flask API backed by MongoDB. It stores workspace JSON documents and uploaded document metadata; uploaded files are kept on disk under `UPLOAD_DIR`.

## Run locally

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

Set `NEXT_PUBLIC_API_URL=http://localhost:5000` when running the Next.js app so document uploads use the API. Without it, the frontend continues using browser storage.

## Endpoints

- `GET /api/health`
- `GET /api/workspaces`
- `POST /api/workspaces`
- `PUT /api/workspaces/<workspace_id>`
- `DELETE /api/workspaces/<workspace_id>`
- `POST /api/workspaces/<workspace_id>/documents`
- `GET /api/workspaces/<workspace_id>/documents/<document_id>`
- `DELETE /api/workspaces/<workspace_id>/documents/<document_id>`
