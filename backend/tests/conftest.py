import asyncio
import uuid
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.deps import get_db
from app.core.security import create_access_token, get_password_hash
from app.db.base import Base
from app.db.session import async_session_factory
from app.main import app
from app.models.parcel import Parcel, LandSource
from app.models.user import User, UserRole

TEST_DATABASE_URL = settings.DATABASE_URL  # override as needed

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_session_factory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with test_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture
async def db_session() -> AsyncSession:
    async with test_session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        username="testuser",
        hashed_password=get_password_hash("testpass123"),
        full_name="Test User",
        phone="+91-9876543210",
        role=UserRole.CITIZEN,
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid.uuid4(),
        email="admin@example.com",
        username="adminuser",
        hashed_password=get_password_hash("adminpass123"),
        full_name="Admin User",
        phone="+91-9876543211",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest_asyncio.fixture
async def auth_headers(test_user: User) -> dict:
    token = create_access_token(data={"sub": str(test_user.id), "role": test_user.role.value})
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def admin_headers(admin_user: User) -> dict:
    token = create_access_token(data={"sub": str(admin_user.id), "role": admin_user.role.value})
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def sample_parcel(db_session: AsyncSession) -> Parcel:
    from app.services.bhunaksha.adapter import _generate_mock_geometry

    geometry = _generate_mock_geometry()
    parcel = Parcel(
        id=uuid.uuid4(),
        pniu="0201000100000100123",
        plot_number="123",
        khata_number="K1234",
        survey_number="S5678",
        village="Rampur",
        mouza="Rampur",
        circle="Patna Circle",
        district="Patna",
        state="Bihar",
        total_area=1500.50,
        area_unit="sqm",
        land_type="Agriculture",
        source=LandSource.BHUNAKSH,
        is_active=True,
    )
    db_session.add(parcel)
    await db_session.flush()
    return parcel


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
