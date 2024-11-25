
from typing import Dict, List, Optional
from datetime import datetime
from ..models import DutyDrawbackClaim, RoDTEPClaim
from ..database import Database
from ..exceptions import TradeProcessingError
from .integration_service import IntegrationService

class TradeProcessor:
    def __init__(self):
        self.model = settings.LLM_MODEL
        openai.api_key = settings.SAMBANOVA_API_KEY
        openai.api_base = "https://api.sambanova.ai/v1"
        
    async def process_drawback_claim(self, claim: DutyDrawbackClaim) -> Dict:
        """Process duty drawback claim"""
        try:
            # Validate claim data
            await self._validate_drawback_claim(claim)
            
            # Calculate drawback amounts
            calculations = await self._calculate_drawback(claim)
            
            # Check compliance
            compliance_result = await self._check_drawback_compliance(claim, calculations)
            
            if not compliance_result["compliant"]:
                return {
                    "status": "rejected",
                    "reasons": compliance_result["reasons"],
                    "claim_id": claim.claim_id
                }
            
            # Process claim
            result = await self._process_drawback(claim, calculations)
            
            # Store results
            await self._store_drawback_claim(claim, result)
            
            return result
            
        except Exception as e:
            raise TradeProcessingError(
                message="Failed to process drawback claim",
                error_code="DRAWBACK_PROCESSING_ERROR",
                details={"error": str(e)}
            )

    async def _validate_drawback_claim(self, claim: DutyDrawbackClaim) -> bool:
        """Validate drawback claim data"""
        try:
            # Basic validation
            if not claim.shipping_bill_no or not claim.items:
                return False
                
            # Validate rates
            for item in claim.items:
                rate = await self._get_drawback_rate(item["tariff_heading"])
                if not rate:
                    raise ValidationError(
                        message=f"Invalid drawback rate for tariff {item['tariff_heading']}",
                        error_code="INVALID_RATE"
                    )
                    
            return True
            
        except Exception as e:
            raise ValidationError(
                message="Drawback claim validation failed",
                error_code="VALIDATION_ERROR",
                details={"error": str(e)}
            )

    async def _calculate_drawback(self, claim: DutyDrawbackClaim) -> Dict:
        """Calculate drawback amounts"""
        try:
            calculations = []
            total_fob = 0
            total_drawback = 0
            
            for item in claim.items:
                # Get drawback rate
                rate = await self._get_drawback_rate(item["tariff_heading"])
                
                # Calculate amount
                fob_value = item["quantity"] * item["unit_price"]
                drawback_amount = (fob_value * rate["rate"]) / 100
                
                # Apply caps if any
                if rate.get("cap_per_unit"):
                    max_amount = rate["cap_per_unit"] * item["quantity"]
                    drawback_amount = min(drawback_amount, max_amount)
                
                calculations.append({
                    "item_id": item["id"],
                    "fob_value": fob_value,
                    "rate_applied": rate["rate"],
                    "calculated_amount": drawback_amount,
                    "cap_applied": drawback_amount == max_amount if rate.get("cap_per_unit") else False
                })
                
                total_fob += fob_value
                total_drawback += drawback_amount
            
            # Validate against 12.5% FOB value cap
            max_total_drawback = total_fob * 0.125
            if total_drawback > max_total_drawback:
                total_drawback = max_total_drawback
            
            return {
                "item_calculations": calculations,
                "total_fob": total_fob,
                "total_drawback": total_drawback,
                "capped_by_fob": total_drawback == max_total_drawback
            }
            
        except Exception as e:
            raise CalculationError(
                message="Drawback calculation failed",
                error_code="CALCULATION_ERROR",
                details={"error": str(e)}
            )

    async def process_rodtep_claim(self, claim: RoDTEPClaim) -> Dict:
        """Process RoDTEP claim"""
        try:
            # Validate claim
            await self._validate_rodtep_claim(claim)
            
            # Check eligibility
            eligibility = await self._check_rodtep_eligibility(claim)
            
            if not eligibility["eligible"]:
                return {
                    "status": "rejected",
                    "reasons": eligibility["reasons"],
                    "claim_id": claim.claim_id
                }
            
            # Calculate benefits
            calculations = await self._calculate_rodtep_benefits(claim)
            
            # Generate e-scrip if approved
            if calculations["status"] == "approved":
                e_scrip = await self._generate_escrip(claim, calculations)
                
                result = {
                    "status": "approved",
                    "claim_id": claim.claim_id,
                    "calculations": calculations,
                    "e_scrip": e_scrip
                }
            else:
                result = {
                    "status": "pending_review",
                    "claim_id": claim.claim_id,
                    "calculations": calculations
                }
            
            # Store result
            await self._store_rodtep_claim(claim, result)
            
            return result
            
        except Exception as e:
            raise TradeProcessingError(
                message="Failed to process RoDTEP claim",
                error_code="RODTEP_PROCESSING_ERROR",
                details={"error": str(e)}
            )

    async def _validate_rodtep_claim(self, claim: RoDTEPClaim) -> bool:
        """Validate RoDTEP claim data"""
        try:
            # Implementation based on section 4.55 of RoDTEP document
            validation_rules = {
                "excluded_categories": [
                    "Export of imported goods covered under paragraph 2.46 of FTP",
                    "Exports through trans-shipment",
                    "Products which are subject to Minimum export price",
                    "Products which are restricted for export",
                    "Products manufactured by DTA units to SEZ/FTWZ units"
                ],
                "required_documents": [
                    "Shipping Bill",
                    "Export Invoice",
                    "BRC"
                ]
            }
            
            # Check for excluded categories
            for product in claim.product_details:
                if product["category"] in validation_rules["excluded_categories"]:
                    raise ValidationError(
                        message=f"Product falls under excluded category: {product['category']}",
                        error_code="EXCLUDED_CATEGORY"
                    )
            
            # Check required documents
            for doc in validation_rules["required_documents"]:
                if doc not in claim.documents:
                    raise ValidationError(
                        message=f"Missing required document: {doc}",
                        error_code="MISSING_DOCUMENT"
                    )
            
            return True
            
        except Exception as e:
            raise ValidationError(
                message="RoDTEP claim validation failed",
                error_code="VALIDATION_ERROR",
                details={"error": str(e)}
            )

    async def _generate_escrip(self, claim: Dict, calculations: Dict) -> Dict:
        """Generate e-scrip for RoDTEP benefit"""
        try:
            scrip = {
                "scrip_id": f"RODTEP{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                "issue_date": datetime.utcnow(),
                "expiry_date": datetime.utcnow() + timedelta(days=365),
                "amount": calculations["total_benefit"],
                "claim_ref": claim["claim_id"],
                "export_details": {
                    "shipping_bill": claim["export_details"]["shipping_bill_no"],
                    "date": claim["export_details"]["date"]
                },
                "status": "active",
                "transferable": True
            }
            
            # Store e-scrip
            await self.db.escrits.insert_one(scrip)
            
            return scrip
            
        except Exception as e:
            raise ProcessingError(
                message="Failed to generate e-scrip",
                error_code="ESCRIP_GENERATION_ERROR",
                details={"error": str(e)}
            )