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


# Standard preparation checklist example IDs matching the React frontend
CHECKLIST_ITEMS = {
    "registration": "Business registration or ownership proof",
    "bank_statements": "Recent bank statements",
    "sales_records": "Sales and expense records",
    "funds_estimate": "Estimate of how the funding will be used",
}


class AssistantNextStepRequest(BaseModel):
    business_type: Optional[str] = Field(None, description="Kind of business")
    location: Optional[str] = Field(None, description="City, district, or state")
    funding_amount: Optional[float] = Field(None, description="Target funding amount")
    marked_records: list[str] = Field(
        default_factory=list,
        description="List of checklist item IDs marked as available",
    )
    available_records: Optional[list[str]] = Field(
        None,
        description="Alternative alias for marked_records",
    )
    checklist_ids: Optional[list[str]] = Field(
        None,
        description="Alternative alias for marked_records",
    )

    @property
    def selected_record_ids(self) -> set[str]:
        records = set(self.marked_records)
        if self.available_records:
            records.update(self.available_records)
        if self.checklist_ids:
            records.update(self.checklist_ids)
        return records


@app.post("/api/assistant/next-step")
def get_assistant_next_step(payload: AssistantNextStepRequest):
    """
    Suggests the next preparation step using deterministic rules based on
    the owner's business profile and marked checklist examples.
    Does not make credit decisions or claim that examples are mandatory.
    """
    # Rule 1: If any profile detail is missing, ask for it
    missing_details = []
    if not payload.business_type or not payload.business_type.strip():
        missing_details.append("business type")
    if not payload.location or not payload.location.strip():
        missing_details.append("location")
    if payload.funding_amount is None or payload.funding_amount <= 0:
        missing_details.append("funding amount (positive number)")

    if missing_details:
        missing_text = ", ".join(missing_details)
        return {
            "status": "missing_profile",
            "message": f"To understand your next step, please provide your {missing_text}.",
            "remaining_examples": [],
        }

    # Rule 2: Identify checklist examples not yet marked as available
    selected_ids = payload.selected_record_ids
    unmarked_keys = [item_id for item_id in CHECKLIST_ITEMS if item_id not in selected_ids]

    if unmarked_keys:
        unmarked_names = [CHECKLIST_ITEMS[k] for k in unmarked_keys]
        items_bulleted = "; ".join(unmarked_names)
        return {
            "status": "records_pending",
            "message": (
                f"You have started organizing records for your {payload.business_type.strip()} in {payload.location.strip()}. "
                f"Common examples not yet marked as available include: {items_bulleted}. "
                "Keep in mind that these are common preparation examples; actual requirements vary by financing route."
            ),
            "remaining_examples": unmarked_names,
        }

    # Rule 3: All examples are marked; recommend checking specific route requirements
    return {
        "status": "ready_for_routes",
        "message": (
            f"You have marked all common example records as available for your {payload.business_type.strip()}. "
            "Your next step is to explore potential financing routes (such as banks, NBFCs, or government schemes) "
            "and verify the exact official requirements for your chosen route."
        ),
        "remaining_examples": [],
    }


