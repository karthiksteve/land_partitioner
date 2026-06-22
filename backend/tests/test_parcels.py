import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon

from app.models.parcel import Parcel
from app.models.user import User
from app.core.security import create_access_token


@pytest.fixture
def sample_polygon():
    return Polygon([
        (80.0, 26.0), (80.1, 26.0), (80.1, 26.1), (80.0, 26.1), (80.0, 26.0),
    ])


@pytest.mark.asyncio
async def test_create_parcel(client: AsyncClient, db_session: AsyncSession):
    test_user = User(
        id="00000000-0000-0000-0000-000000000010",
        username="parcelowner",
        email="parcel@test.com",
        hashed_password="hash",
        full_name="Parcel Owner",
        role="surveyor",
        is_active=True,
    )
    db_session.add(test_user)
    await db_session.commit()

    token = create_access_token({"sub": str(test_user.id)})
    polygon = {
        "type": "Polygon",
        "coordinates": [[[80.0, 26.0], [80.1, 26.0], [80.1, 26.1], [80.0, 26.1], [80.0, 26.0]]],
    }
    response = await client.post(
        "/api/v1/parcels",
        json={
            "pniu": "TEST123456",
            "plot_number": "101",
            "village": "TestVillage",
            "tehsil": "TestTehsil",
            "district": "TestDistrict",
            "total_area": 1000.0,
            "land_type": "agricultural",
            "geometry": polygon,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["pniu"] == "TEST123456"
    assert data["village"] == "TestVillage"
    assert data["total_area"] == 1000.0


@pytest.mark.asyncio
async def test_list_parcels(client: AsyncClient, db_session: AsyncSession):
    test_user = User(
        id="00000000-0000-0000-0000-000000000011",
        username="listowner",
        email="list@test.com",
        hashed_password="hash",
        full_name="List Owner",
        role="surveyor",
        is_active=True,
    )
    db_session.add(test_user)
    await db_session.commit()

    parcel = Parcel(
        pniu="LIST123",
        plot_number="200",
        village="ListVillage",
        district="ListDistrict",
        total_area=500.0,
        land_type="agricultural",
        is_active=True,
        owner_id=test_user.id,
    )
    db_session.add(parcel)
    await db_session.commit()

    token = create_access_token({"sub": str(test_user.id)})
    response = await client.get(
        "/api/v1/parcels",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_get_parcel(client: AsyncClient, db_session: AsyncSession):
    test_user = User(
        id="00000000-0000-0000-0000-000000000012",
        username="getowner",
        email="get@test.com",
        hashed_password="hash",
        full_name="Get Owner",
        role="surveyor",
        is_active=True,
    )
    db_session.add(test_user)
    await db_session.commit()

    parcel = Parcel(
        pniu="GET123",
        plot_number="300",
        village="GetVillage",
        total_area=250.0,
        land_type="residential",
        is_active=True,
        owner_id=test_user.id,
    )
    db_session.add(parcel)
    await db_session.commit()

    token = create_access_token({"sub": str(test_user.id)})
    response = await client.get(
        f"/api/v1/parcels/{parcel.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["pniu"] == "GET123"


@pytest.mark.asyncio
async def test_get_parcel_not_found(client: AsyncClient):
    test_user = User(
        id="00000000-0000-0000-0000-000000000013",
        username="notfound",
        email="notfound@test.com",
        hashed_password="hash",
        full_name="Not Found",
        role="surveyor",
        is_active=True,
    )
    token = create_access_token({"sub": str(test_user.id)})
    response = await client.get(
        "/api/v1/parcels/00000000-0000-0000-0000-000000000999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
