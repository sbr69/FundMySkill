"""
Firebase/Firestore service with in-memory fallback for development.
Uses mock data store when Firebase credentials are not available.
"""
import os
from typing import Optional, Any
from datetime import datetime
import json

from app.config import get_settings

# Try to import firebase_admin
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False


class MockFirestore:
    """In-memory mock Firestore for development without Firebase credentials."""

    def __init__(self):
        self._data: dict[str, dict[str, Any]] = {
            "users": {},
            "courses": {},
            "user_progress": {},
            "quizzes": {},
            "quiz_attempts": {},
            "ai_sessions": {},
            "donations": {},
        }
        self._subcollections: dict[str, dict[str, Any]] = {}

    def collection(self, name: str) -> "MockCollection":
        if name not in self._data:
            self._data[name] = {}
        return MockCollection(self._data, name, self._subcollections)


class MockCollection:
    def __init__(self, data: dict, name: str, subcollections: dict):
        self._data = data
        self._name = name
        self._subcollections = subcollections
        self._filters: list[tuple] = []
        self._order_by_field: Optional[str] = None
        self._limit_count: Optional[int] = None

    def document(self, doc_id: str) -> "MockDocument":
        return MockDocument(self._data, self._name, doc_id, self._subcollections)

    def where(self, field: str, op: str, value: Any) -> "MockCollection":
        new_col = MockCollection(self._data, self._name, self._subcollections)
        new_col._filters = self._filters + [(field, op, value)]
        new_col._order_by_field = self._order_by_field
        new_col._limit_count = self._limit_count
        return new_col

    def order_by(self, field: str, direction: str = "ASCENDING") -> "MockCollection":
        new_col = MockCollection(self._data, self._name, self._subcollections)
        new_col._filters = self._filters
        new_col._order_by_field = field
        new_col._limit_count = self._limit_count
        return new_col

    def limit(self, count: int) -> "MockCollection":
        new_col = MockCollection(self._data, self._name, self._subcollections)
        new_col._filters = self._filters
        new_col._order_by_field = self._order_by_field
        new_col._limit_count = count
        return new_col

    def stream(self):
        collection_data = self._data.get(self._name, {})
        results = []

        for doc_id, doc_data in collection_data.items():
            match = True
            for field, op, value in self._filters:
                doc_value = doc_data.get(field)
                if op == "==":
                    if doc_value != value:
                        match = False
                elif op == ">=":
                    if doc_value is None or doc_value < value:
                        match = False
                elif op == "<=":
                    if doc_value is None or doc_value > value:
                        match = False
                elif op == "in":
                    if doc_value not in value:
                        match = False

            if match:
                results.append(MockDocumentSnapshot(doc_id, doc_data))

        if self._order_by_field:
            results.sort(key=lambda x: x.to_dict().get(self._order_by_field, 0))

        if self._limit_count:
            results = results[:self._limit_count]

        return results

    def get(self):
        return self.stream()

    def add(self, data: dict) -> tuple:
        import uuid
        doc_id = str(uuid.uuid4())
        self._data[self._name][doc_id] = data
        return (None, MockDocument(self._data, self._name, doc_id, self._subcollections))


class MockDocument:
    def __init__(self, data: dict, collection: str, doc_id: str, subcollections: dict):
        self._data = data
        self._collection = collection
        self._doc_id = doc_id
        self._subcollections = subcollections

    @property
    def id(self) -> str:
        return self._doc_id

    def get(self) -> "MockDocumentSnapshot":
        doc_data = self._data.get(self._collection, {}).get(self._doc_id)
        return MockDocumentSnapshot(self._doc_id, doc_data)

    def set(self, data: dict, merge: bool = False):
        if self._collection not in self._data:
            self._data[self._collection] = {}

        if merge and self._doc_id in self._data[self._collection]:
            self._data[self._collection][self._doc_id].update(data)
        else:
            self._data[self._collection][self._doc_id] = data

    def update(self, data: dict):
        if self._collection in self._data and self._doc_id in self._data[self._collection]:
            self._data[self._collection][self._doc_id].update(data)

    def delete(self):
        if self._collection in self._data and self._doc_id in self._data[self._collection]:
            del self._data[self._collection][self._doc_id]

    def collection(self, name: str) -> "MockCollection":
        subcol_key = f"{self._collection}/{self._doc_id}/{name}"
        if subcol_key not in self._subcollections:
            self._subcollections[subcol_key] = {}

        # Create a mock collection that references the subcollection data
        mock_data = {name: self._subcollections[subcol_key]}
        return MockCollection(mock_data, name, self._subcollections)


class MockDocumentSnapshot:
    def __init__(self, doc_id: str, data: Optional[dict]):
        self._id = doc_id
        self._data = data

    @property
    def id(self) -> str:
        return self._id

    @property
    def exists(self) -> bool:
        return self._data is not None

    def to_dict(self) -> Optional[dict]:
        return self._data

    def get(self, field: str) -> Any:
        if self._data:
            return self._data.get(field)
        return None


class FirestoreDB:
    """Wrapper for Firestore operations with mock fallback."""

    _instance: Optional["FirestoreDB"] = None
    _db: Any = None
    _is_mock: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        settings = get_settings()

        # Try to initialize Firebase
        if FIREBASE_AVAILABLE and settings.firebase_credentials_path:
            try:
                if not firebase_admin._apps:
                    cred_path = settings.firebase_credentials_path
                    if os.path.exists(cred_path):
                        cred = credentials.Certificate(cred_path)
                        firebase_admin.initialize_app(cred)
                        self._db = firestore.client()
                        self._is_mock = False
                        print("Firebase initialized successfully")
                        return
            except Exception as e:
                print(f"Failed to initialize Firebase: {e}")

        # Fall back to mock
        print("Using in-memory mock Firestore")
        self._db = MockFirestore()
        self._is_mock = True

    @property
    def db(self):
        return self._db

    @property
    def is_mock(self) -> bool:
        return self._is_mock

    def collection(self, name: str):
        return self._db.collection(name)

    def get_all(self, doc_refs: list) -> list:
        """Batch fetch multiple documents at once."""
        if not doc_refs:
            return []
        if self._is_mock:
            # Mock implementation: fetch one by one
            return [ref.get() for ref in doc_refs]
        # Real Firestore: use batch get
        return self._db.get_all(doc_refs)


def get_firestore() -> FirestoreDB:
    """Get Firestore database instance."""
    return FirestoreDB()


def datetime_to_firestore(dt: datetime) -> Any:
    """Convert datetime to Firestore-compatible format."""
    db = get_firestore()
    if db.is_mock:
        return dt.isoformat()
    return dt


def firestore_to_datetime(val: Any) -> datetime:
    """Convert Firestore timestamp to datetime."""
    if isinstance(val, str):
        return datetime.fromisoformat(val)
    if hasattr(val, "timestamp"):
        return datetime.fromtimestamp(val.timestamp())
    return val
