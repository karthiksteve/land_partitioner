import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import verify_password
from app.main import app
from app.models.user import UserRole


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, db_session):
    payload = {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "newpass123",
        "full_name": "New User",
        "phone": "+91-1111111111",
        "role": "citizen",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["username"] == payload["username"]
    assert data["role"] == "citizen"
    assert "password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_username(client: AsyncClient, test_user, db_session):
    payload = {
        "email": "another@example.com",
        "username": "testuser",
        "password": "newpass123",
        "full_name": "Another User",
        "role": "citizen",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user, db_session):
    payload = {"username": "testuser", "password": "testpass123"}
    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, test_user, db_session):
    payload = {"username": "testuser", "password": "wrongpassword"}
    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"


@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 403
