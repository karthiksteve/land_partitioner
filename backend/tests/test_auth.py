import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash, create_access_token
from app.models.user import User


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "email": "newuser@test.com",
        "username": "newuser",
        "password": "testpass123",
        "full_name": "New User",
        "phone": "+91-1234567890",
        "role": "citizen",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "citizen"
    assert "password" not in data


@pytest.mark.asyncio
async def test_register_duplicate(client: AsyncClient, db_session: AsyncSession):
    user = User(
        username="dupuser",
        email="dup@test.com",
        hashed_password=get_password_hash("testpass"),
        full_name="Dup User",
        role="citizen",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()

    response = await client.post("/api/v1/auth/register", json={
        "email": "dup@test.com",
        "username": "dupuser",
        "password": "testpass123",
        "full_name": "Dup User",
    })
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login(client: AsyncClient, db_session: AsyncSession):
    user = User(
        username="loginuser",
        email="login@test.com",
        hashed_password=get_password_hash("correctpass"),
        full_name="Login User",
        role="citizen",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()

    response = await client.post("/api/v1/auth/login", json={
        "username": "loginuser",
        "password": "correctpass",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, db_session: AsyncSession):
    user = User(
        username="wrongpass",
        email="wrong@test.com",
        hashed_password=get_password_hash("correctpass"),
        full_name="Wrong Pass",
        role="citizen",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()

    response = await client.post("/api/v1/auth/login", json={
        "username": "wrongpass",
        "password": "wrongpass",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient, db_session: AsyncSession):
    from app.main import app
    test_user = User(
        id="00000000-0000-0000-0000-000000000002",
        username="currentuser",
        email="current@test.com",
        hashed_password=get_password_hash("testpass"),
        full_name="Current User",
        role="admin",
        is_active=True,
    )
    db_session.add(test_user)
    await db_session.commit()

    token = create_access_token({"sub": str(test_user.id)})
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, db_session: AsyncSession):
    test_user = User(
        id="00000000-0000-0000-0000-000000000003",
        username="refreshtest",
        email="refresh@test.com",
        hashed_password=get_password_hash("testpass"),
        full_name="Refresh Test",
        role="citizen",
        is_active=True,
    )
    db_session.add(test_user)
    await db_session.commit()

    token = create_access_token({"sub": str(test_user.id)})
    response = await client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
