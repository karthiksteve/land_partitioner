import asyncio
import pytest
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.db.base import Base
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.core.security import get_password_hash

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_geokurra.db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=NullPool)
test_async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def setup_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with test_async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def override_get_current_user():
    return User(
        id="00000000-0000-0000-0000-000000000001",
        email="test@test.com",
        username="testuser",
        hashed_password=get_password_hash("testpass"),
        full_name="Test User",
        is_active=True,
        is_superuser=False,
        role="citizen",
    )


@pytest.fixture
def app():
    from app.main import app as _app
    _app.dependency_overrides[get_db] = override_get_db
    _app.dependency_overrides[get_current_user] = override_get_current_user
    return _app


@pytest.fixture
async def client(app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_async_session() as session:
        yield session
