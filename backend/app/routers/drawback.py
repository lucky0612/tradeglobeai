from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..services.trade_processor import TradeProcessor
from ..models import DutyDrawbackClaim

router = APIRouter(prefix="/drawback", tags=["Duty Drawback"])

@router.post("/claims", response_model=DutyDrawbackClaim)
async def submit_drawback_claim(claim: DutyDrawbackClaim):
    processor = TradeProcessor()
    try:
        result = await processor.process_drawback_claim(claim)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/claims", response_model=List[DutyDrawbackClaim])
async def list_drawback_claims(status: Optional[str] = None):
    try:
        filters = {"status": status} if status else {}
        claims = await TradeProcessor().list_drawback_claims(filters)
        return claims
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/claims/{claim_id}", response_model=DutyDrawbackClaim)
async def get_drawback_claim(claim_id: str):
    try:
        claim = await TradeProcessor().get_drawback_claim(claim_id)
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        return claim
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))