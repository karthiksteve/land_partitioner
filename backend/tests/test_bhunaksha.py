import pytest

from app.services.bhunaksha.adapter import (
    BhuNakshaAdapter,
    _compute_boundary_length,
    _compute_vertices,
    _generate_mock_geometry,
    _parse_pniu,
)


def test_parse_pniu():
    pniu = _parse_pniu("201", "1", "1", "123")
    assert pniu == "0201000100000100123"
    assert len(pniu) == 19


def test_generate_mock_geometry():
    geo = _generate_mock_geometry(center_lat=25.5, center_lng=86.0, size_meters=100.0)
    assert geo["type"] == "Polygon"
    assert len(geo["coordinates"][0]) == 5


def test_generate_mock_geometry_random():
    geo = _generate_mock_geometry()
    assert geo["type"] == "Polygon"
    coords = geo["coordinates"][0]
    lats = [c[1] for c in coords]
    lngs = [c[0] for c in coords]
    assert all(24.5 <= lat <= 27.5 for lat in lats)
    assert all(83.5 <= lng <= 88.0 for lng in lngs)


def test_compute_boundary_length():
    geo = _generate_mock_geometry(center_lat=25.5, center_lng=86.0, size_meters=100.0)
    length = _compute_boundary_length(geo)
    assert length > 0


def test_compute_vertices():
    geo = _generate_mock_geometry()
    vertices = _compute_vertices(geo)
    assert len(vertices) == 5
    for v in vertices:
        assert "lng" in v
        assert "lat" in v


@pytest.mark.asyncio
async def test_adapter_search_parcel():
    adapter = BhuNakshaAdapter()
    result = await adapter.search_parcel("Patna", "Sadar", "Rampur", "123")
    assert result["pniu"] is not None
    assert result["district"] == "Patna"
    assert result["circle"] == "Sadar"
    assert result["plot_number"] == "123"
    assert result["state"] == "Bihar"
    assert "geometry" in result
    assert result["geometry"]["type"] == "Polygon"
    assert result["total_area"] > 0
    assert result["source"] == "bhunaksha"


@pytest.mark.asyncio
async def test_adapter_get_document_urls():
    adapter = BhuNakshaAdapter()
    urls = adapter.get_document_urls("0201000100000100123")
    assert len(urls) == 4
    for doc in urls:
        assert "document_type" in doc
        assert "file_name" in doc
        assert "source_url" in doc
    types = [d["document_type"] for d in urls]
    assert "parcel_pdf" in types
    assert "ror" in types
    assert "geojson" in types


def test_extract_plot_details():
    adapter = BhuNakshaAdapter()
    response = {
        "pniu": "0201000100000100123",
        "plotNumber": "123",
        "khataNumber": "K9999",
        "village": "TestVillage",
        "district": "TestDistrict",
    }
    details = adapter.extract_plot_details(response)
    assert details["pniu"] == "0201000100000100123"
    assert details["plot_number"] == "123"
    assert details["khata_number"] == "K9999"
    assert details["village"] == "TestVillage"
    assert details["district"] == "TestDistrict"
    assert details["state"] == "Bihar"
    assert "geometry" in details
