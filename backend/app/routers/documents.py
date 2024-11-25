from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from typing import List
from ..services.document_processor import DocumentProcessor
from ..models import TradeDocument, DocumentType, ProcessingStatus

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: DocumentType = None
):
    processor = DocumentProcessor()
    try:
        content = await file.read()
        result = await processor.process_document(content, doc_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/list", response_model=List[TradeDocument])
async def list_documents(status: Optional[ProcessingStatus] = None):
    try:
        filters = {"status": status} if status else {}
        documents = await DocumentProcessor().list_documents(filters)
        return documents
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{doc_id}", response_model=TradeDocument)
async def get_document(doc_id: str):
    try:
        document = await DocumentProcessor().get_document(doc_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        return document
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))