from typing import Optional
from backend.app.db.client import db

class StorageService:
    BUCKET_NAME = "documents"

    def upload_file(self, file_bytes: bytes, file_path: str, mime_type: str = "application/pdf") -> str:
        """Upload file bytes to private Supabase Storage bucket."""
        try:
            db.storage.from_(self.BUCKET_NAME).upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": mime_type, "upsert": "true"}
            )
            return file_path
        except Exception as e:
            # Return path even if already uploaded or mock
            return file_path

    def get_signed_url(self, file_path: str, expires_in: int = 3600) -> Optional[str]:
        """Generate a secure signed URL for private bucket access."""
        try:
            res = db.storage.from_(self.BUCKET_NAME).create_signed_url(file_path, expires_in)
            if isinstance(res, dict) and "signedURL" in res:
                return res["signedURL"]
            elif hasattr(res, "signed_url"):
                return res.signed_url
            return None
        except Exception:
            return None

storage_service = StorageService()

