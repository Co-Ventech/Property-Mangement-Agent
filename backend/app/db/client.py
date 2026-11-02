from typing import Optional, Any
from supabase import create_client, Client
from backend.app.core.config import settings
from backend.app.db.supabase_datastore import SupabaseQueryBuilder, supabase_store

class SupabaseProxyQueryBuilder:
    def __init__(self, table: str, supa_client: Optional[Client]):
        self.table = table
        self.supa_client = supa_client
        self.store_builder = SupabaseQueryBuilder(table, supabase_store)
        self.use_store = False
        self.supa_builder = None
        
        if supa_client:
            try:
                self.supa_builder = supa_client.table(table)
            except Exception:
                self.use_store = True
        else:
            self.use_store = True

    def select(self, cols: str = "*"):
        if not self.use_store and self.supa_builder is not None:
            try:
                self.supa_builder = self.supa_builder.select(cols)
            except Exception:
                self.use_store = True
        self.store_builder.select(cols)
        return self

    def eq(self, col: str, val: Any):
        if not self.use_store and self.supa_builder is not None:
            try:
                self.supa_builder = self.supa_builder.eq(col, val)
            except Exception:
                self.use_store = True
        self.store_builder.eq(col, val)
        return self

    def neq(self, col: str, val: Any):
        if not self.use_store and self.supa_builder is not None:
            try:
                self.supa_builder = self.supa_builder.neq(col, val)
            except Exception:
                self.use_store = True
        self.store_builder.neq(col, val)
        return self

    def ilike(self, col: str, pattern: str):
        if not self.use_store and self.supa_builder is not None:
            try:
                self.supa_builder = self.supa_builder.ilike(col, pattern)
            except Exception:
                self.use_store = True
        self.store_builder.ilike(col, pattern)
        return self

    def order(self, col: str, desc: bool = False):
        if not self.use_store and self.supa_builder is not None:
            try:
                self.supa_builder = self.supa_builder.order(col, desc=desc)
            except Exception:
                self.use_store = True
        self.store_builder.order(col, desc=desc)
        return self

    def limit(self, n: int):
        if not self.use_store and self.supa_builder is not None:
            try:
                self.supa_builder = self.supa_builder.limit(n)
            except Exception:
                self.use_store = True
        self.store_builder.limit(n)
        return self

    def insert(self, data: Any):
        if not self.use_store and self.supa_builder is not None:
            try:
                self.supa_builder = self.supa_builder.insert(data)
            except Exception:
                self.use_store = True
        self.store_builder.insert(data)
        return self

    def update(self, data: Any):
        if not self.use_store and self.supa_builder is not None:
            try:
                self.supa_builder = self.supa_builder.update(data)
            except Exception:
                self.use_store = True
        self.store_builder.update(data)
        return self

    def upsert(self, data: Any):
        if not self.use_store and self.supa_builder is not None:
            try:
                self.supa_builder = self.supa_builder.upsert(data)
            except Exception:
                self.use_store = True
        self.store_builder.upsert(data)
        return self

    def execute(self):
        if not self.use_store and self.supa_builder is not None:
            try:
                return self.supa_builder.execute()
            except Exception:
                self.use_store = True
        return self.store_builder.execute()

class SupabaseDBClient:
    def __init__(self):
        self.supa_client: Optional[Client] = None
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.supa_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            except Exception as e:
                print(f"[Supabase Client Init]: {e}")

    def table(self, table_name: str) -> SupabaseProxyQueryBuilder:
        return SupabaseProxyQueryBuilder(table_name, self.supa_client)

    @property
    def storage(self):
        if self.supa_client:
            return self.supa_client.storage
        class MockStorage:
            def from_(self, bucket):
                class MockBucket:
                    def upload(self, *a, **kw): return True
                    def create_signed_url(self, path, exp): return {"signedURL": f"/mock-download/{path}"}
                return MockBucket()
        return MockStorage()

db = SupabaseDBClient()
