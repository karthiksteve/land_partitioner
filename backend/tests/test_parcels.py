import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_search_parcel(client: AsyncClient, auth_headers):
    payload = {
        "district": "Patna",
        "circle": "Patna Sadar",
        "mouza": "Rampur",
        "plot_number": "123",
    }
    response = await client.post("/api/v1/parcels/search", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["pniu"] is not None
    assert data["district"] == "Patna"
    assert data["plot_number"] == "123"
    assert "geometry" in data
    assert data["geometry"]["type"] == "Polygon"


@pytest.mark.asyncio
async def test_search_parcel_duplicate(client: AsyncClient, auth_headers, sample_parcel):
    payload = {
        "district": "Patna",
        "circle": "Patna Circle",
        "mouza": "Rampur",
        "plot_number": "123",
    }
    response = await client.post("/api/v1/parcels/search", json=payload, headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_list_parcels(client: AsyncClient, auth_headers, sample_parcel):
    response = await client.get("/api/v1/parcels", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_get_parcel(client: AsyncClient, auth_headers, sample_parcel):
    response = await client.get(f"/api/v1/parcels/{sample_parcel.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(sample_parcel.id)
    assert data["pniu"] == sample_parcel.pniu


@pytest.mark.asyncio
async def test_get_parcel_not_found(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/parcels/00000000-0000-0000-0000-000000000000", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_parcel_geometry(client: AsyncClient, auth_headers, sample_parcel):
    response = await client.get(f"/api/v1/parcels/{sample_parcel.id}/geometry", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_parcel_map(client: AsyncClient, auth_headers, sample_parcel):
    response = await client.get(f"/api/v1/parcels/{sample_parcel.id}/map", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "center" in data
    assert "zoom" in data


@pytest.mark.asyncio
async def test_delete_parcel(client: AsyncClient, auth_headers, sample_parcel):
    response = await client.delete(f"/api/v1/parcels/{sample_parcel.id}", headers=auth_headers)
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_search_requires_auth(client: AsyncClient):
    payload = {
        "district": "Patna",
        "circle": "Patna Sadar",
        "mouza": "Rampur",
        "plot_number": "123",
    }
    response = await client.post("/api/v1/parcels/search", json=payload)
    assert response.status_code == 403
