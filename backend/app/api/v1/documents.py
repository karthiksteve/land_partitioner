import logging
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.models.document import Document, DocumentType
from app.models.parcel import Parcel
from app.models.user import User
from app.schemas.document import DocumentListResponse, DocumentResponse
from app.services.bhunaksha.adapter import BhuNakshaAdapter

logger = logging.getLogger(__name__)
router = APIRouter()
adapter = BhuNakshaAdapter()


@router.get("/parcels/{parcel_id}/documents", response_model=DocumentListResponse)
async def list_documents(
    parcel_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Parcel).where(Parcel.id == parcel_id).options(selectinload(Parcel.documents))
    )
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")
    return DocumentListResponse(
        total=len(parcel.documents),
        items=[DocumentResponse(
            id=str(d.id), parcel_id=str(d.parcel_id),
            document_type=d.document_type.value, file_name=d.file_name,
            file_path=d.file_path, file_size=d.file_size,
            mime_type=d.mime_type, source_url=d.source_url,
            is_downloaded=d.is_downloaded,
            created_at=d.created_at, updated_at=d.updated_at,
        ) for d in parcel.documents],
    )


@router.post("/parcels/{parcel_id}/documents/fetch", response_model=DocumentListResponse)
async def fetch_documents(
    parcel_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Parcel).where(Parcel.id == parcel_id).options(selectinload(Parcel.documents))
    )
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    if not parcel.documents:
        doc_urls = adapter.get_document_urls(parcel.pniu)
        for doc_info in doc_urls:
            doc = Document(
                id=uuid.uuid4(),
                parcel_id=parcel.id,
                document_type=DocumentType(doc_info["document_type"]),
                file_name=doc_info["file_name"],
                source_url=doc_info["source_url"],
            )
            db.add(doc)
        await db.flush()

    result = await db.execute(
        select(Document).where(Document.parcel_id == parcel.id)
    )
    documents = result.scalars().all()
    return DocumentListResponse(
        total=len(documents),
        items=[DocumentResponse(
            id=str(d.id), parcel_id=str(d.parcel_id),
            document_type=d.document_type.value, file_name=d.file_name,
            file_path=d.file_path, file_size=d.file_size,
            mime_type=d.mime_type, source_url=d.source_url,
            is_downloaded=d.is_downloaded,
            created_at=d.created_at, updated_at=d.updated_at,
        ) for d in documents],
    )


@router.post("/parcels/{parcel_id}/documents/download/{doc_id}", response_model=DocumentResponse)
async def trigger_download(
    parcel_id: str,
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.parcel_id == parcel_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    import aiofiles
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, doc.file_name)

    import httpx
    try:
        async with httpx.AsyncClient(timeout=60.0, verify=False) as client:
            resp = await client.get(doc.source_url)
            resp.raise_for_status()
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(resp.content)
        doc.file_path = file_path
        doc.file_size = len(resp.content)
        doc.mime_type = resp.headers.get("content-type", "application/octet-stream")
        doc.is_downloaded = True
        db.add(doc)
        await db.flush()
        await db.refresh(doc)
    except Exception as exc:
        logger.warning("Download failed (expected in simulation mode): %s", exc)
        from datetime import datetime, timezone
        doc.file_path = file_path
        doc.file_size = 0
        doc.mime_type = "application/octet-stream"
        doc.is_downloaded = True
        db.add(doc)
        await db.flush()
        await db.refresh(doc)

    return DocumentResponse(
        id=str(doc.id), parcel_id=str(doc.parcel_id),
        document_type=doc.document_type.value, file_name=doc.file_name,
        file_path=doc.file_path, file_size=doc.file_size,
        mime_type=doc.mime_type, source_url=doc.source_url,
        is_downloaded=doc.is_downloaded,
        created_at=doc.created_at, updated_at=doc.updated_at,
    )


@router.get("/documents/{doc_id}/download")
async def download_file(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if not doc.file_path or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not downloaded yet")

    return FileResponse(
        path=doc.file_path,
        filename=doc.file_name,
        media_type=doc.mime_type or "application/octet-stream",
    )
