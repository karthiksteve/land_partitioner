import pytest
from shapely.geometry import Polygon, Point, LineString, MultiPolygon, box

from app.services.gis.geometry_engine import (
    calculate_area, calculate_perimeter, calculate_compactness,
    calculate_road_frontage, buffer_analysis, intersection_analysis,
    union_analysis, difference_analysis, simplify_geometry,
    split_parcel, geojson_to_shapely, shapely_to_geojson,
    wkt_to_shapely, shapely_to_wkt, extract_parcel_geometry,
    voronoi_partition, angulation_partition,
)
from app.services.gis.spatial_analyzer import (
    analyze_parcel, calculate_frontage_analysis,
    commercial_value_analysis, possession_overlay,
    adjacency_analysis, accessibility_analysis,
)


@pytest.fixture
def sample_polygon():
    return Polygon([
        (0, 0), (10, 0), (10, 10), (0, 10), (0, 0),
    ])


@pytest.fixture
def sample_geojson():
    return {
        "type": "Polygon",
        "coordinates": [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
    }


class TestGeometryEngine:
    def test_calculate_area(self, sample_polygon):
        area = calculate_area(sample_polygon)
        assert area == pytest.approx(100.0, rel=0.01)

    def test_calculate_perimeter(self, sample_polygon):
        perimeter = calculate_perimeter(sample_polygon)
        assert perimeter == pytest.approx(40.0, rel=0.01)

    def test_calculate_compactness(self, sample_polygon):
        compactness = calculate_compactness(sample_polygon)
        expected = (4 * 3.14159 * 100) / (40 * 40)
        assert compactness == pytest.approx(expected, rel=0.01)

    def test_calculate_compactness_zero_perimeter(self):
        point = Point(0, 0)
        comp = calculate_compactness(point)
        assert comp == 0.0

    def test_road_frontage(self, sample_polygon):
        road = LineString([(5, -1), (5, 11)])
        frontage = calculate_road_frontage(sample_polygon, road)
        assert frontage == pytest.approx(10.0, rel=0.01)

    def test_buffer_analysis(self, sample_polygon):
        buffered = buffer_analysis(sample_polygon, 1.0)
        assert buffered.area > sample_polygon.area

    def test_intersection_analysis(self, sample_polygon):
        other = box(5, 5, 15, 15)
        intersection = intersection_analysis(sample_polygon, other)
        assert intersection.area == pytest.approx(25.0, rel=0.01)

    def test_union_analysis(self, sample_polygon):
        other = box(10, 0, 20, 10)
        union = union_analysis([sample_polygon, other])
        assert union.area == pytest.approx(200.0, rel=0.01)

    def test_difference_analysis(self, sample_polygon):
        other = box(5, 0, 15, 10)
        diff = difference_analysis(sample_polygon, other)
        assert diff.area == pytest.approx(50.0, rel=0.01)

    def test_simplify_geometry(self):
        complex_poly = Polygon([
            (0, 0), (5, 0.1), (10, 0), (10, 5), (10, 10),
            (5, 9.9), (0, 10), (0, 5), (0, 0),
        ])
        simplified = simplify_geometry(complex_poly, 0.5)
        assert simplified is not None

    def test_split_parcel_vertical(self, sample_polygon):
        part1, part2 = split_parcel(sample_polygon, 0.5, "vertical")
        assert part1 is not None
        assert part2 is not None

    def test_split_parcel_horizontal(self, sample_polygon):
        part1, part2 = split_parcel(sample_polygon, 0.5, "horizontal")
        assert part1 is not None
        assert part2 is not None

    def test_geojson_conversion(self, sample_geojson):
        geom = geojson_to_shapely(sample_geojson)
        assert geom.geom_type == "Polygon"
        back = shapely_to_geojson(geom)
        assert back["type"] == "Polygon"

    def test_wkt_conversion(self, sample_polygon):
        wkt = shapely_to_wkt(sample_polygon)
        assert "POLYGON" in wkt
        back = wkt_to_shapely(wkt)
        assert back.equals(sample_polygon)

    def test_extract_parcel_geometry(self, sample_polygon):
        extracted = extract_parcel_geometry(sample_polygon)
        assert extracted["area"] == pytest.approx(100.0, rel=0.01)
        assert extracted["perimeter"] == pytest.approx(40.0, rel=0.01)
        assert extracted["num_vertices"] == 5

    def test_voronoi_partition(self, sample_polygon):
        parts = voronoi_partition(sample_polygon, 4)
        assert len(parts) >= 1

    def test_angulation_partition(self, sample_polygon):
        parts = angulation_partition(sample_polygon, 4)
        assert len(parts) >= 1


class TestSpatialAnalyzer:
    def test_analyze_parcel(self, sample_geojson):
        result = analyze_parcel({"geometry": sample_geojson})
        assert "area_sq_meters" in result
        assert result["area_sq_meters"] > 0

    def test_frontage_analysis(self, sample_polygon):
        roads = [{"name": "Main Road", "geometry": {"type": "LineString", "coordinates": [[5, -1], [5, 11]]}}]
        result = calculate_frontage_analysis(sample_polygon, roads)
        assert result["total_frontage"] > 0

    def test_commercial_analysis(self, sample_polygon):
        zones = [{"geometry": {"type": "Polygon", "coordinates": [[[8, 8], [12, 8], [12, 12], [8, 12], [8, 8]]]}}]
        roads = [{"geometry": {"type": "LineString", "coordinates": [[5, -1], [5, 11]]}}]
        result = commercial_value_analysis(sample_polygon, zones, roads)
        assert "commercial_potential_score" in result

    def test_possession_overlay(self, sample_polygon):
        possessions = [{"owner_name": "Test Owner", "geometry": {"type": "Polygon", "coordinates": [[[2, 2], [8, 2], [8, 8], [2, 8], [2, 2]]]}}]
        result = possession_overlay(sample_polygon, possessions)
        assert result["possession_percentage"] > 0

    def test_adjacency_analysis(self, sample_polygon):
        others = [{"id": "1", "pniu": "TEST1", "geometry": {"type": "Polygon", "coordinates": [[[10, 0], [20, 0], [20, 10], [10, 10], [10, 0]]]}}]
        result = adjacency_analysis(sample_polygon, others)
        assert len(result) >= 1

    def test_accessibility_analysis(self, sample_polygon):
        roads = [{"name": "Highway", "geometry": {"type": "LineString", "coordinates": [[-1, 5], [11, 5]]}}]
        result = accessibility_analysis(sample_polygon, roads)
        assert "road_access_score" in result
