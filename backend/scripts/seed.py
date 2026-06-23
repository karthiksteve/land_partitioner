"""Seed script to populate initial data."""
import asyncio
import math
import random
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.document import Document, DocumentType
from app.models.parcel import Parcel, LandSource
from app.models.user import User, UserRole

SAMPLE_DISTRICTS = [
    {"name": "Patna", "code": "0201"},
    {"name": "Gaya", "code": "0202"},
    {"name": "Nalanda", "code": "0203"},
    {"name": "Muzaffarpur", "code": "0204"},
]

SAMPLE_VILLAGES = ["Rampur", "Shahpur", "Madhopur", "Lakshmipur", "Gopalpur"]


def _generate_polygon_geometry(center_lat=25.5, center_lng=86.0, size_meters=100.0):
    lat_offset = size_meters / 111320.0
    lng_offset = size_meters / (111320.0 * math.cos(math.radians(center_lat)))
    half_lat = lat_offset / 2
    half_lng = lng_offset / 2
    pert = size_meters * 0.05 / 111320.0
    coords = [
        [center_lng - half_lng + random.uniform(-pert, pert), center_lat - half_lat + random.uniform(-pert, pert)],
        [center_lng + half_lng + random.uniform(-pert, pert), center_lat - half_lat + random.uniform(-pert, pert)],
        [center_lng + half_lng + random.uniform(-pert, pert), center_lat + half_lat + random.uniform(-pert, pert)],
        [center_lng - half_lng + random.uniform(-pert, pert), center_lat + half_lat + random.uniform(-pert, pert)],
        [center_lng - half_lng + random.uniform(-pert, pert), center_lat - half_lat + random.uniform(-pert, pert)],
    ]
    return {
        "type": "Polygon",
        "coordinates": [coords],
    }


def _compute_vertices(geometry):
    try:
        return [{"lng": round(c[0], 6), "lat": round(c[1], 6)} for c in geometry["coordinates"][0]]
    except (KeyError, IndexError):
        return []


async def seed_database():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        result = await session.execute(select(User).where(User.username == "admin"))
        if result.scalar_one_or_none():
            print("Admin user already exists, skipping seed.")
            return

        admin = User(
            id=uuid.uuid4(),
            email="admin@geokurra.gov.in",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            phone="+91-1234567890",
            role=UserRole.ADMIN,
            is_active=True,
        )
        session.add(admin)

        district = random.choice(SAMPLE_DISTRICTS)
        village = random.choice(SAMPLE_VILLAGES)
        plot_num = "123"
        circle = f"{district['name']} Circle"
        mouza = village
        pniu = f"{district['code']}{'0001'}{'000001'}{'00123'}"

        geometry = _generate_polygon_geometry(
            center_lat=25.5 + random.uniform(-0.5, 0.5),
            center_lng=86.0 + random.uniform(-0.5, 0.5),
            size_meters=random.uniform(50, 200),
        )

        parcel = Parcel(
            id=uuid.uuid4(),
            pniu=pniu,
            plot_number=plot_num,
            khata_number="K1234",
            survey_number="S5678",
            village=village,
            mouza=mouza,
            circle=circle,
            district=district["name"],
            state="Bihar",
            total_area=round(random.uniform(100, 5000), 2),
            area_unit="sqm",
            land_type="Agriculture",
            boundary_length=round(random.uniform(50, 500), 2),
            vertices=_compute_vertices(geometry),
            source=LandSource.BHUNAKSH,
            is_active=True,
        )
        session.add(parcel)

        docs = [
            Document(
                id=uuid.uuid4(), parcel_id=parcel.id,
                document_type=DocumentType.PARCEL_PDF,
                file_name=f"{pniu}_parcel.pdf",
                source_url=f"https://bhunaksha.bihar.gov.in/api/public/document/parcel/{pniu}",
            ),
            Document(
                id=uuid.uuid4(), parcel_id=parcel.id,
                document_type=DocumentType.ROR,
                file_name=f"{pniu}_ror.pdf",
                source_url=f"https://bhunaksha.bihar.gov.in/api/public/document/ror/{pniu}",
            ),
            Document(
                id=uuid.uuid4(), parcel_id=parcel.id,
                document_type=DocumentType.GEOJSON,
                file_name=f"{pniu}_geometry.geojson",
                source_url=f"https://bhunaksha.bihar.gov.in/api/public/document/geojson/{pniu}",
            ),
        ]
        for doc in docs:
            session.add(doc)

        await session.commit()
        print("Database seeded successfully!")
        print(f"  Admin user: admin / admin123")
        print(f"  Sample parcel: PNIU={pniu}, District={district['name']}")
        print(f"  Documents created: {len(docs)}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_database())
