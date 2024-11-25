from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, EmailStr

class DocumentType(str, Enum):
    SHIPPING_BILL = "shipping_bill"
    IMPORT_BILL = "import_bill"
    DUTY_DRAWBACK = "duty_drawback"
    RODTEP = "rodtep"
    INVOICE = "invoice"
    PACKING_LIST = "packing_list"

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class TradeDocument(BaseModel):
    id: Optional[str] = None
    type: DocumentType
    content: Dict
    metadata: Dict
    processing_status: ProcessingStatus
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    compliance_status: Optional[bool] = None
    verification_result: Optional[Dict] = None

class DutyDrawbackClaim(BaseModel):
    claim_id: str
    shipping_bill_no: str
    date: datetime
    exporter_details: Dict
    items: List[Dict]
    total_amount: float
    status: str
    processing_history: List[Dict]
    verification_status: str
    disbursement_details: Optional[Dict] = None

class RoDTEPClaim(BaseModel):
    claim_id: str
    export_details: Dict
    product_details: List[Dict]
    rate_details: Dict
    calculated_amount: float
    status: str
    e_scrip_details: Optional[Dict] = None
    validation_result: Dict

class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    name: str
    hashed_password: str
    company_name: str
    iec_number: str
    created_at: datetime = None
    last_login: Optional[datetime] = None
    preferences: Optional[Dict] = None
    is_active: bool = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class DutyDrawbackClaim(BaseModel):
    shipping_bill_no: str
    date: datetime
    exporter_details: Dict
    items: List[Dict]
    total_amount: float
    status: str = "pending"
    processing_history: List[Dict] = []
    verification_status: str = "pending"
    disbursement_details: Optional[Dict] = None