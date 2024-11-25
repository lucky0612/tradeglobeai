from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..services.trade_processor import TradeProcessor
from ..models import RoDTEPClaim

router = APIRouter(prefix="/rodtep", tags=["RoDTEP"])

@router.post("/claims", response_model=RoDTEPClaim)
async def submit_rodtep_claim(claim: RoDTEPClaim):
    processor = TradeProcessor()
    try:
        result = await processor.process_rodtep_claim(claim)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/claims", response_model=List[RoDTEPClaim])
async def list_rodtep_claims(status: Optional[str] = None):
    try:
        filters = {"status": status} if status else {}
        claims = await TradeProcessor().list_rodtep_claims(filters)
        return claims
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/claims/{claim_id}", response_model=RoDTEPClaim)
async def get_rodtep_claim(claim_id: str):
    try:
        claim = await TradeProcessor().get_rodtep_claim(claim_id)
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        return claim
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/claims/{claim_id}/generate-scrip")
async def generate_escrip(claim_id: str):
    try:
        result = await TradeProcessor().generate_rodtep_scrip(claim_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))