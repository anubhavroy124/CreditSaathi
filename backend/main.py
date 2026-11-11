from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

app = FastAPI(
    title="CreditSaathi API",
    description="Backend service for CreditSaathi MSME credit readiness prototype",
    version="0.1.0",
)

# Enable CORS so the React frontend (running on Vite's default port 5173) can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProfilePreviewRequest(BaseModel):
    business_type: str = Field(
        ...,
        min_length=1,
        description="Kind of business run by the owner",
    )
    location: str = Field(
        ...,
        min_length=1,
        description="City, district, or state",
    )
    funding_amount: float = Field(
        ...,
        gt=0,
        description="Target funding amount (must be positive)",
    )
    document_name: Optional[str] = Field(
        None,
        description="Optional name of the attached sample document",
    )

    @field_validator("business_type", "location")
    @classmethod
    def validate_not_whitespace(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Field cannot be empty or only spaces")
        return trimmed

    @field_validator("document_name")
    @classmethod
    def clean_document_name(cls, value: Optional[str]) -> Optional[str]:
        if value is not None:
            trimmed = value.strip()
            return trimmed if trimmed else None
        return None


@app.get("/api/health")
def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "ok",
        "service": "CreditSaathi",
    }


@app.post("/api/profile/preview")
def create_profile_preview(payload: ProfilePreviewRequest):
    """
    Validate and return an in-memory preview of the business details.
    Does not save to a database or disk, and does not upload files.
    """
    return {
        "business_type": payload.business_type,
        "location": payload.location,
        "funding_amount": payload.funding_amount,
        "document_name": payload.document_name,
    }

