import os
import uuid
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 15 * 1024 * 1024
CORS(app, origins=os.getenv("FRONTEND_ORIGIN", "http://localhost:3000"))

mongo = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"), serverSelectionTimeoutMS=3000)
db = mongo[os.getenv("MONGO_DB", "shiftdesk")]
workspaces = db["workspaces"]
upload_dir = Path(os.getenv("UPLOAD_DIR", "./uploads")).resolve()
upload_dir.mkdir(parents=True, exist_ok=True)


def error(message, status):
    return jsonify({"error": message}), status


def workspace_payload(data):
    if not isinstance(data, dict):
        return None
    required = ("name", "goal", "description", "type", "createdAt", "tasks", "milestones", "notes", "documents")
    if any(key not in data for key in required):
        return None
    return {key: data[key] for key in data if key != "_id"}


def workspace_or_404(workspace_id):
    workspace = workspaces.find_one({"id": workspace_id}, {"_id": 0})
    return workspace


@app.get("/api/health")
def health():
    try:
        mongo.admin.command("ping")
    except PyMongoError:
        return jsonify({"status": "degraded", "database": "unavailable"}), 503
    return jsonify({"status": "ok", "database": "connected"})


@app.get("/api/workspaces")
def list_workspaces():
    try:
        return jsonify(list(workspaces.find({}, {"_id": 0}).sort("createdAt", -1)))
    except PyMongoError:
        return error("Database unavailable.", 503)


@app.post("/api/workspaces")
def create_workspace():
    payload = workspace_payload(request.get_json(silent=True))
    if payload is None:
        return error("Workspace payload is missing required fields.", 400)
    payload.setdefault("id", str(uuid.uuid4()))
    try:
        workspaces.insert_one(payload)
    except PyMongoError:
        return error("Could not save workspace.", 503)
    return jsonify(payload), 201


@app.put("/api/workspaces/<workspace_id>")
def update_workspace(workspace_id):
    payload = workspace_payload(request.get_json(silent=True))
    if payload is None:
        return error("Workspace payload is missing required fields.", 400)
    payload["id"] = workspace_id
    try:
        result = workspaces.replace_one({"id": workspace_id}, payload)
    except PyMongoError:
        return error("Could not update workspace.", 503)
    if result.matched_count == 0:
        return error("Workspace not found.", 404)
    return jsonify(payload)


@app.delete("/api/workspaces/<workspace_id>")
def delete_workspace(workspace_id):
    try:
        workspace = workspace_or_404(workspace_id)
        if workspace is None:
            return error("Workspace not found.", 404)
        result = workspaces.delete_one({"id": workspace_id})
    except PyMongoError:
        return error("Could not delete workspace.", 503)
    if result.deleted_count == 0:
        return error("Workspace not found.", 404)
    workspace_path = upload_dir / workspace_id
    if workspace_path.exists():
        for path in workspace_path.iterdir():
            if path.is_file():
                path.unlink()
        workspace_path.rmdir()
    return jsonify({"deleted": True})


@app.post("/api/workspaces/<workspace_id>/documents")
def upload_document(workspace_id):
    if workspace_or_404(workspace_id) is None:
        return error("Workspace not found.", 404)
    file = request.files.get("file")
    if file is None or not file.filename:
        return error("A file is required.", 400)
    document_id = str(uuid.uuid4())
    workspace_path = upload_dir / workspace_id
    workspace_path.mkdir(parents=True, exist_ok=True)
    filename = secure_filename(file.filename)
    stored_path = workspace_path / f"{document_id}-{filename}"
    file.save(stored_path)
    document = {
        "id": document_id,
        "name": file.filename,
        "size": stored_path.stat().st_size,
        "mime": file.mimetype or "application/octet-stream",
        "addedAt": int(__import__("time").time() * 1000),
        "storage": "uploaded",
        "path": str(stored_path),
    }
    try:
        workspaces.update_one({"id": workspace_id}, {"$push": {"documents": document}})
    except PyMongoError:
        stored_path.unlink(missing_ok=True)
        return error("Could not save document metadata.", 503)
    return jsonify({key: value for key, value in document.items() if key != "path"}), 201


@app.get("/api/workspaces/<workspace_id>/documents/<document_id>")
def download_document(workspace_id, document_id):
    workspace = workspace_or_404(workspace_id)
    if workspace is None:
        return error("Workspace not found.", 404)
    document = next((item for item in workspace.get("documents", []) if item.get("id") == document_id), None)
    if document is None or not document.get("path"):
        return error("Document not found.", 404)
    path = Path(document["path"])
    if not path.is_file():
        return error("Document file is missing.", 404)
    return send_file(path, download_name=document["name"], mimetype=document.get("mime"))


@app.delete("/api/workspaces/<workspace_id>/documents/<document_id>")
def delete_document(workspace_id, document_id):
    workspace = workspace_or_404(workspace_id)
    if workspace is None:
        return error("Workspace not found.", 404)
    document = next((item for item in workspace.get("documents", []) if item.get("id") == document_id), None)
    if document is None:
        return error("Document not found.", 404)
    try:
        result = workspaces.update_one(
            {"id": workspace_id},
            {"$pull": {"documents": {"id": document_id}}},
        )
    except PyMongoError:
        return error("Could not delete document.", 503)
    if result.modified_count == 0:
        return error("Document not found.", 404)
    if document.get("path"):
        Path(document["path"]).unlink(missing_ok=True)
    return jsonify({"deleted": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG") == "1")
