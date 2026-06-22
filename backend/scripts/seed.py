"""Seed script to populate the database with sample data."""
import asyncio
import logging
import math
import random
import uuid
from datetime import datetime

from shapely.geometry import Polygon, mapping
from geoalchemy2.shape import from_shape
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import async_session_factory, engine
from app.models.user import User
from app.models.parcel import Parcel
from app.models.owner import Owner
from app.models.partition import PartitionPlan, PlanType, PlanStatus
from app.models.partition_parcel import PartitionParcel
from app.models.score import Score

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        existing = await session.execute(select(User).where(User.username == "admin"))
        if existing.scalar_one_or_none():
            logger.info("Database already seeded, skipping.")
            return

        admin_user = User(
            id=uuid.uuid4(),
            email="admin@geokurra.gov.in",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            phone="+91-9999999999",
            is_active=True,
            is_superuser=True,
            role="admin",
        )
        session.add(admin_user)

        surveyor = User(
            id=uuid.uuid4(),
            email="surveyor@geokurra.gov.in",
            username="surveyor1",
            hashed_password=get_password_hash("surveyor123"),
            full_name="Rajesh Surveyor",
            phone="+91-8888888888",
            is_active=True,
            role="surveyor",
        )
        session.add(surveyor)

        coords = [
            (80.1234, 26.5678), (80.1245, 26.5680), (80.1250, 26.5670),
            (80.1248, 26.5660), (80.1238, 26.5655), (80.1225, 26.5665),
            (80.1220, 26.5672), (80.1234, 26.5678),
        ]
        polygon = Polygon(coords)
        geom = from_shape(polygon, srid=4326)
        area = polygon.area

        parcel = Parcel(
            id=uuid.uuid4(),
            pniu="UP091234567890",
            plot_number="123",
            survey_number="456",
            khata_number="789",
            village="Ramnagar",
            tehsil="Sadar",
            district="Lucknow",
            state="Uttar Pradesh",
            circle="Lucknow",
            total_area=area,
            area_unit="sq_meter",
            land_type="agricultural",
            soil_type="loamy",
            irrigation_available=True,
            well_present=True,
            tubewell_present=False,
            trees_present=True,
            road_side=True,
            abadi_adjacent=False,
            commercial_value=False,
            geometry=geom,
            boundary_length=polygon.length,
            owner_id=admin_user.id,
            is_active=True,
        )
        session.add(parcel)
        await session.flush()

        owners_data = [
            ("Ram Singh", 40.0, True),
            ("Shyam Singh", 30.0, False),
            ("Ghanshyam Singh", 30.0, False),
        ]
        owners = []
        for name, share, possession in owners_data:
            owner = Owner(
                id=uuid.uuid4(),
                parcel_id=parcel.id,
                owner_name=name,
                share_percentage=share,
                existing_possession=possession,
            )
            session.add(owner)
            owners.append(owner)

        await session.flush()

        for plan_type in ["compactness", "possession", "commercial"]:
            plan = PartitionPlan(
                id=uuid.uuid4(),
                parcel_id=parcel.id,
                plan_name=f"{plan_type.capitalize()} Plan - Ramnagar",
                plan_type=plan_type,
                description=f"Rule 109 optimized {plan_type} partition plan for Ramnagar parcel",
                parameters={"mode": "equal", "num_owners": 3},
                created_by=admin_user.id,
                status=PlanStatus.GENERATED,
            )
            session.add(plan)
            await session.flush()

            for i, (owner, share) in enumerate(zip(owners, [40.0, 30.0, 30.0])):
                alloc_area = area * share / 100
                pp = PartitionParcel(
                    id=uuid.uuid4(),
                    partition_plan_id=plan.id,
                    owner_id=owner.id,
                    allocated_area=alloc_area,
                    compactness_score=random.uniform(60, 95),
                    road_frontage_length=random.uniform(10, 50),
                    commercial_value_score=random.uniform(40, 90),
                    possession_score=random.uniform(50, 100),
                    allotment_order=i + 1,
                )
                session.add(pp)

            share_c = random.uniform(85, 100)
            compactness = random.uniform(70, 95)
            road_f = random.uniform(60, 90)
            commercial = random.uniform(55, 85)
            field_p = random.uniform(60, 90)
            possession_p = random.uniform(50, 90)
            family_s = random.uniform(80, 100)
            overall = (share_c * 0.2 + compactness * 0.3 + road_f * 0.15 +
                       commercial * 0.15 + field_p * 0.05 + possession_p * 0.1 + family_s * 0.05)

            score = Score(
                id=uuid.uuid4(),
                partition_plan_id=plan.id,
                share_compliance=round(share_c, 2),
                compactness=round(compactness, 2),
                road_frontage=round(road_f, 2),
                commercial_fairness=round(commercial, 2),
                field_preservation=round(field_p, 2),
                possession_preservation=round(possession_p, 2),
                family_settlement=round(family_s, 2),
                overall_score=round(overall, 2),
                details={
                    "num_owners": 3,
                    "weights_used": {
                        "compactness": 0.30, "share": 0.20, "road_frontage": 0.15,
                        "commercial_fairness": 0.15, "possession_preservation": 0.10,
                        "field_preservation": 0.05, "family_settlement": 0.05,
                    },
                },
            )
            session.add(score)

        await session.commit()
        logger.info("Database seeded successfully!")
        logger.info(f"Admin user: admin / admin123")
        logger.info(f"Parcel: {parcel.pniu} in {parcel.village}, {parcel.district}")
        logger.info(f"Owners: {', '.join(o.owner_name for o in owners)}")
        logger.info(f"3 partition plans created with scores")


if __name__ == "__main__":
    asyncio.run(seed_database())
