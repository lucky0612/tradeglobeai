import openai
from datetime import datetime
from typing import Dict, List, Optional
from ..models import TradeDocument, DocumentType, ProcessingStatus
from ..config import settings
from ..exceptions import DocumentProcessingError

class DocumentProcessor:
    def __init__(self):
        self.model = settings.LLM_MODEL
        openai.api_key = settings.SAMBANOVA_API_KEY
        openai.api_base = "https://api.sambanova.ai/v1"

    async def process_document(self, content: bytes, doc_type: DocumentType) -> Dict:
        """Process trade documents using SambaNova's LLM"""
        try:
            # Extract text from document
            text_content = await self._extract_text(content)
            
            # Get processing tools based on document type
            tools = self._get_processing_tools(doc_type)
            
            # Process with LLM
            response = await openai.chat.completions.acreate(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt(doc_type)
                    },
                    {
                        "role": "user",
                        "content": text_content
                    }
                ],
                tools=tools,
                tool_choice="auto"
            )
            
            # Process and validate results
            result = self._process_llm_response(response)
            validated_result = await self._validate_extraction(result, doc_type)
            
            # Store processing results
            doc_id = await self._store_document(content, doc_type, validated_result)
            
            return {
                "doc_id": doc_id,
                "doc_type": doc_type,
                "extraction_results": validated_result,
                "processed_at": datetime.utcnow()
            }
            
        except Exception as e:
            raise DocumentProcessingError(
                message="Document processing failed",
                error_code="DOC_PROCESSING_ERROR",
                details={"error": str(e)}
            )

    def _get_processing_tools(self, doc_type: DocumentType) -> List[Dict]:
        """Get document-specific processing tools"""
        base_tools = [{
            "type": "function",
            "function": {
                "name": "extract_document_info",
                "description": "Extract key information from trade documents",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "document_type": {"type": "string"},
                        "extracted_fields": {
                            "type": "object",
                            "properties": {
                                "reference_numbers": {"type": "array", "items": {"type": "string"}},
                                "dates": {"type": "object"},
                                "amounts": {"type": "object"},
                                "entities": {"type": "object"}
                            }
                        }
                    }
                }
            }
        }]
        
        # Add document-specific tools
        if doc_type == DocumentType.DUTY_DRAWBACK:
            base_tools.extend(self._get_drawback_tools())
        elif doc_type == DocumentType.RODTEP:
            base_tools.extend(self._get_rodtep_tools())
            
        return base_tools

    def _get_drawback_tools(self) -> List[Dict]:
        """Get duty drawback specific processing tools"""
        return [{
            "type": "function",
            "function": {
                "name": "extract_drawback_info",
                "description": "Extract duty drawback specific information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "shipping_bill_details": {
                            "type": "object",
                            "properties": {
                                "number": {"type": "string"},
                                "date": {"type": "string"},
                                "port": {"type": "string"}
                            }
                        },
                        "items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "description": {"type": "string"},
                                    "quantity": {"type": "number"},
                                    "value": {"type": "number"},
                                    "drawback_rate": {"type": "number"}
                                }
                            }
                        }
                    }
                }
            }
        }]

    def _get_rodtep_tools(self) -> List[Dict]:
        """Get RoDTEP specific processing tools"""
        return [{
            "type": "function",
            "function": {
                "name": "extract_rodtep_info",
                "description": "Extract RoDTEP specific information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "export_details": {
                            "type": "object",
                            "properties": {
                                "shipping_bill_no": {"type": "string"},
                                "date": {"type": "string"},
                                "port": {"type": "string"}
                            }
                        },
                        "product_details": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "hs_code": {"type": "string"},
                                    "description": {"type": "string"},
                                    "quantity": {"type": "number"},
                                    "value": {"type": "number"},
                                    "rodtep_rate": {"type": "number"}
                                }
                            }
                        }
                    }
                }
            }
        }]

    async def _extract_text(self, content: bytes) -> str:
        """Extract text from document content"""
        try:
            # Implementation will depend on document format
            # This is a placeholder for actual text extraction logic
            return content.decode('utf-8')
        except Exception as e:
            raise DocumentProcessingError(
                message="Text extraction failed",
                error_code="TEXT_EXTRACTION_ERROR",
                details={"error": str(e)}
            )

    def _get_system_prompt(self, doc_type: DocumentType) -> str:
        """Get document-type specific system prompt"""
        prompts = {
            DocumentType.DUTY_DRAWBACK: """
                You are an expert in processing duty drawback documents.
                Extract all relevant information including shipping bill details,
                exporter information, and item-wise drawback calculations.
                Pay special attention to:
                1. Validation of drawback rates
                2. Correct calculation of drawback amounts
                3. Compliance with current regulations
            """,
            DocumentType.RODTEP: """
                You are an expert in processing RoDTEP documents.
                Extract all relevant information including export details,
                product information, and RoDTEP calculations.
                Pay special attention to:
                1. Validation of RoDTEP rates
                2. Correct calculation of benefit amounts
                3. Compliance with scheme guidelines
            """
        }
        return prompts.get(doc_type, "Extract relevant trade information from the document")

    def _process_llm_response(self, response: Dict) -> Dict:
        """Process and validate LLM response"""
        try:
            tool_calls = response.choices[0].message.tool_calls
            if not tool_calls:
                raise ValueError("No extraction results received from LLM")
                
            results = []
            for tool_call in tool_calls:
                result = json.loads(tool_call.function.arguments)
                results.append(result)
                
            return self._combine_results(results)
            
        except Exception as e:
            raise DocumentProcessingError(
                message="Failed to process LLM response",
                error_code="LLM_PROCESSING_ERROR",
                details={"error": str(e)}
            )

    async def _validate_extraction(self, result: Dict, doc_type: DocumentType) -> Dict:
        """Validate extraction results"""
        try:
            # Validate against schema
            schema = self._get_validation_schema(doc_type)
            validation_result = self._validate_against_schema(result, schema)
            
            if not validation_result["valid"]:
                raise ValidationError(
                    message="Extraction validation failed",
                    error_code="VALIDATION_ERROR",
                    details=validation_result["errors"]
                )
                
            # Perform additional validations
            await self._perform_business_validations(result, doc_type)
            
            return result
            
        except Exception as e:
            raise DocumentProcessingError(
                message="Extraction validation failed",
                error_code="VALIDATION_ERROR",
                details={"error": str(e)}
            )

    async def _store_document(
        self,
        content: bytes,
        doc_type: DocumentType,
        extraction_result: Dict
    ) -> str:
        """Store document and processing results"""
        try:
            # Create document record
            document = TradeDocument(
                type=doc_type,
                content=content,
                metadata={
                    "filename": extraction_result.get("filename"),
                    "file_size": len(content),
                    "mime_type": extraction_result.get("mime_type"),
                    "processed_at": datetime.utcnow()
                },
                processing_status=ProcessingStatus.COMPLETED,
                extraction_result=extraction_result,
                created_at=datetime.utcnow()
            )

            # Store in MongoDB
            doc_id = await self.db.documents.insert_one(document.dict())
            
            # Index in Elasticsearch for search
            await self.es.index(
                index="trade_documents",
                id=str(doc_id.inserted_id),
                document={
                    "doc_type": doc_type,
                    "content": extraction_result,
                    "processed_at": datetime.utcnow(),
                    "metadata": document.metadata
                }
            )
            
            return str(doc_id.inserted_id)
            
        except Exception as e:
            raise DocumentProcessingError(
                message="Failed to store document",
                error_code="STORAGE_ERROR",
                details={"error": str(e)}
            )