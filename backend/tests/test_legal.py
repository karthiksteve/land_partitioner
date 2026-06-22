import pytest
from app.services.legal.rule109_engine import (
    check_rule_109a, check_rule_109b, check_rule_109d,
    check_rule_109e, check_rule_109f, validate_all_rules,
    generate_compliance_report,
)
from app.services.legal.compliance_checker import Rule109ComplianceChecker
from app.services.legal.scoring_engine import (
    calculate_share_compliance, calculate_compactness_score,
    calculate_road_frontage_score, calculate_commercial_fairness_score,
    calculate_field_preservation_score, calculate_possession_preservation_score,
    calculate_family_settlement_score, calculate_overall_score,
    ScoreManager,
)


@pytest.fixture
def sample_plan():
    return {
        "plan_type": "compactness",
        "total_area": 10000.0,
        "allotments": [
            {
                "owner_id": "owner-1",
                "owner_name": "Owner A",
                "expected_area": 6000.0,
                "actual_area": 6010.0,
                "compactness_score": 85.0,
                "road_frontage_length": 30.0,
                "commercial_value_score": 70.0,
                "possession_score": 80.0,
                "share_percentage": 60.0,
                "geometry": None,
            },
            {
                "owner_id": "owner-2",
                "owner_name": "Owner B",
                "expected_area": 4000.0,
                "actual_area": 3990.0,
                "compactness_score": 78.0,
                "road_frontage_length": 25.0,
                "commercial_value_score": 65.0,
                "possession_score": 75.0,
                "share_percentage": 40.0,
                "geometry": None,
            },
        ],
    }


@pytest.fixture
def sample_owners():
    return [
        {"id": "owner-1", "owner_name": "Owner A", "share_percentage": 60.0},
        {"id": "owner-2", "owner_name": "Owner B", "share_percentage": 40.0},
    ]


@pytest.fixture
def sample_context(sample_owners):
    return {
        "owners": sample_owners,
        "original_parcel": {"geometry": None, "soil_type": "loamy"},
        "possessions": [
            {"owner_id": "owner-1", "area": 5000.0},
            {"owner_id": "owner-2", "area": 3000.0},
        ],
        "roads": [{"name": "Main Road", "geometry": None}],
        "settlements": [],
    }


class TestRule109Engine:
    def test_check_rule_109a(self, sample_plan, sample_owners):
        result = check_rule_109a(sample_plan, sample_owners)
        assert result["rule"] == "109(a)"
        assert "compliant" in result
        assert len(result["details"]) == 2

    def test_check_rule_109b(self, sample_plan):
        result = check_rule_109b(sample_plan)
        assert result["rule"] == "109(b)"

    def test_check_rule_109d(self, sample_plan):
        original = {"geometry": None}
        result = check_rule_109d(sample_plan, original)
        assert result["rule"] == "109(d)"

    def test_check_rule_109e(self, sample_plan):
        possessions = [{"owner_id": "owner-1", "area": 5000.0}]
        result = check_rule_109e(sample_plan, possessions)
        assert result["rule"] == "109(e)"

    def test_check_rule_109f(self, sample_plan):
        roads = [{"name": "Main Road", "geometry": None}]
        result = check_rule_109f(sample_plan, roads)
        assert result["rule"] == "109(f)"

    def test_validate_all_rules(self, sample_plan, sample_context):
        result = validate_all_rules(sample_plan, sample_context)
        assert "overall_compliant" in result
        assert "rules" in result
        assert len(result["rules"]) == 7

    def test_generate_compliance_report(self, sample_plan, sample_context):
        result = generate_compliance_report(sample_plan, sample_context)
        assert "plan_type" in result
        assert "total_rules_checked" in result


class TestComplianceChecker:
    def test_checker(self, sample_plan, sample_context):
        checker = Rule109ComplianceChecker()
        report = checker.check_all(sample_plan, sample_context)
        assert report is not None
        assert checker.get_compliance_score() >= 0
        assert isinstance(checker.get_violations(), list)
        assert isinstance(checker.get_warnings(), list)
        assert isinstance(checker.generate_legal_notes(), list)

    def test_checker_to_dict(self, sample_plan, sample_context):
        checker = Rule109ComplianceChecker()
        checker.check_all(sample_plan, sample_context)
        d = checker.to_dict()
        assert "compliant" in d
        assert "compliance_score" in d


class TestScoringEngine:
    def test_calculate_share_compliance(self):
        allocations = [
            {"actual_share_percentage": 60.5},
            {"actual_share_percentage": 39.5},
        ]
        shares = [60.0, 40.0]
        score = calculate_share_compliance(allocations, shares)
        assert 0 <= score <= 100

    def test_calculate_compactness_score(self):
        allocations = [{"geometry": None}, {"geometry": None}]
        score = calculate_compactness_score(allocations)
        assert score == 0.0

    def test_calculate_road_frontage_score(self):
        allocations = [{"road_frontage_length": 30}, {"road_frontage_length": 20}]
        score = calculate_road_frontage_score(allocations)
        assert 0 <= score <= 100

    def test_calculate_commercial_fairness_score(self):
        allocations = [{"commercial_value_score": 70}, {"commercial_value_score": 65}]
        score = calculate_commercial_fairness_score(allocations)
        assert 0 <= score <= 100

    def test_calculate_field_preservation_score(self):
        allocations = [{"geometry": None}, {"geometry": None}]
        score = calculate_field_preservation_score(allocations)
        assert score >= 0

    def test_calculate_possession_preservation_score(self):
        allocations = [{"owner_id": "1", "actual_area": 100, "geometry": None}]
        possessions = [{"owner_id": "1", "area": 80}]
        score = calculate_possession_preservation_score(allocations, possessions)
        assert score >= 0

    def test_calculate_family_settlement_score(self):
        score = calculate_family_settlement_score([], [])
        assert score == 100.0

    def test_calculate_overall_score(self):
        scores = {"compactness": 80, "share": 90, "road_frontage": 70}
        overall = calculate_overall_score(scores)
        assert 0 <= overall <= 100

    def test_score_manager(self):
        manager = ScoreManager()
        allocations = [
            {"owner_id": "1", "actual_area": 500, "actual_share_percentage": 60,
             "road_frontage_length": 30, "commercial_value_score": 70,
             "geometry": None},
            {"owner_id": "2", "actual_area": 500, "actual_share_percentage": 40,
             "road_frontage_length": 20, "commercial_value_score": 60,
             "geometry": None},
        ]
        owners = [
            {"share_percentage": 60, "owner_name": "A"},
            {"share_percentage": 40, "owner_name": "B"},
        ]
        result = manager.compute_all(allocations, owners)
        assert "share_compliance" in result
        assert "overall_score" in result
        assert result["overall_score"] > 0
