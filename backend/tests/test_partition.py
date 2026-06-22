import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.parcel import Parcel
from app.models.owner import Owner
from app.models.partition import PartitionPlan, PlanType, PlanStatus
from app.models.partition_parcel import PartitionParcel
from app.models.score import Score
from app.core.security import create_access_token
from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon


@pytest.fixture
def sample_geometry():
    return from_shape(Polygon([
        (80.0, 26.0), (80.2, 26.0), (80.2, 26.2), (80.0, 26.2), (80.0, 26.0),
    ]), srid=4326)


@pytest.mark.asyncio
async def test_generate_partition_plans(client: AsyncClient, db_session: AsyncSession, sample_geometry):
    test_user = User(
        id="00000000-0000-0000-0000-000000000020",
        username="partitionuser",
        email="part@test.com",
        hashed_password="hash",
        full_name="Partition User",
        role="revenue_officer",
        is_active=True,
    )
    db_session.add(test_user)
    await db_session.flush()

    parcel = Parcel(
        pniu="PART123",
        plot_number="500",
        village="PartVillage",
        total_area=10000.0,
        land_type="agricultural",
        geometry=sample_geometry,
        is_active=True,
        owner_id=test_user.id,
    )
    db_session.add(parcel)
    await db_session.flush()

    owner1 = Owner(parcel_id=parcel.id, owner_name="Owner A", share_percentage=60.0)
    owner2 = Owner(parcel_id=parcel.id, owner_name="Owner B", share_percentage=40.0)
    db_session.add_all([owner1, owner2])
    await db_session.commit()

    token = create_access_token({"sub": str(test_user.id), "role": "revenue_officer"})
    response = await client.post(
        "/api/v1/partition/generate",
        json={
            "parcel_id": str(parcel.id),
            "mode": "equal",
            "owners": [
                {"owner_id": str(owner1.id), "share_percentage": 60.0},
                {"owner_id": str(owner2.id), "share_percentage": 40.0},
            ],
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_list_plans(client: AsyncClient, db_session: AsyncSession):
    test_user = User(
        id="00000000-0000-0000-0000-000000000021",
        username="listplan",
        email="listplan@test.com",
        hashed_password="hash",
        full_name="List Plan",
        role="surveyor",
        is_active=True,
    )
    db_session.add(test_user)

    parcel = Parcel(
        pniu="LISTPLAN",
        plot_number="600",
        village="PlanVillage",
        total_area=5000.0,
        land_type="agricultural",
        is_active=True,
        owner_id=test_user.id,
    )
    db_session.add(parcel)
    await db_session.flush()

    plan = PartitionPlan(
        parcel_id=parcel.id,
        plan_name="Test Plan",
        plan_type="compactness",
        created_by=test_user.id,
        status="generated",
    )
    db_session.add(plan)
    await db_session.commit()

    token = create_access_token({"sub": str(test_user.id)})
    response = await client.get(
        f"/api/v1/partition/plans?parcel_id={parcel.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_approve_plan(client: AsyncClient, db_session: AsyncSession):
    admin_user = User(
        id="00000000-0000-0000-0000-000000000022",
        username="admin_approve",
        email="admin.approve@test.com",
        hashed_password="hash",
        full_name="Admin Approve",
        role="admin",
        is_active=True,
    )
    db_session.add(admin_user)

    parcel = Parcel(
        pniu="APPROVE",
        plot_number="700",
        village="ApproveVillage",
        total_area=2000.0,
        land_type="agricultural",
        is_active=True,
        owner_id=admin_user.id,
    )
    db_session.add(parcel)
    await db_session.flush()

    plan = PartitionPlan(
        parcel_id=parcel.id,
        plan_name="Approve Test Plan",
        plan_type="compactness",
        created_by=admin_user.id,
        status="generated",
    )
    db_session.add(plan)
    await db_session.commit()

    token = create_access_token({"sub": str(admin_user.id), "role": "admin"})
    response = await client.post(
        f"/api/v1/partition/plans/{plan.id}/approve",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "approved"
