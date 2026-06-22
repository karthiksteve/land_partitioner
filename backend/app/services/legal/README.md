# Rule 109 / Legal Engine Module

**UP Revenue Code Section 116 & Rule 109 Compliance System**

## Overview

The Legal Engine enforces all legal constraints defined in Uttar Pradesh Revenue Code Section 116 and Rule 109. It provides compliance checking, scoring, and human-readable legal explanations for every partition proposal.

## Files

### `rule109_engine.py` - Rule 109 Compliance Engine

**Clause-by-Clause Checking:**

| Function | Rule | Description |
|----------|------|-------------|
| `check_rule_109a(plan, owners)` | 109(a) | Share proportion compliance |
| `check_rule_109b(plan)` | 109(b) | Compactness assessment |
| `check_rule_109c(plan)` | 109(c) | Land quality balance |
| `check_rule_109d(plan, original_parcel)` | 109(d) | Field preservation |
| `check_rule_109e(plan, possessions)` | 109(e) | Possession preservation |
| `check_rule_109f(plan, roads)` | 109(f) | Commercial fairness |
| `check_rule_109g(plan, settlements)` | 109(g) | Family settlement respect |
| `validate_all_rules(plan, context)` | All | Comprehensive validation |
| `generate_compliance_report(plan, context)` | All | Human-readable report |

**Rule 109(a) - Share Compliance Logic:**
- Compare each owner's allocated area vs target area
- Compute deviation percentage
- Score = max(0, 100 - total_deviation)
- Pass: deviation < 5%

**Rule 109(b) - Compactness:**
- Calculate Polsby-Popper for each allotment
- Compute area-weighted average
- Score normalized 0-100
- Pass: average > 0.4

**Rule 109(c) - Land Quality:**
- Score each allotment on soil, irrigation, value, road access, fertility
- Check variance across allotments (Gini coefficient)
- Pass: variance < 20%

**Rule 109(d) - Field Preservation:**
- Overlay allotments with original fields
- Count fields split across allotments
- Score = (unsplit_fields / total_fields) * 100

**Rule 109(e) - Possession:**
- Calculate overlap ratio: allocated ∩ possession / allocated
- Weighted by possession area
- Score possession-optimized plan higher

**Rule 109(f) - Commercial Fairness:**
- Calculate frontage % deviation from share %
- Sum absolute deviations
- Score = max(0, 100 - deviation * 2)

**Rule 109(g) - Settlement:**
- Overlap with settlement boundaries
- Score: proportional to overlap

### `compliance_checker.py` - Compliance Report Generator

**Class: Rule109ComplianceChecker**
- `check_all(plan, context)` → Complete ComplianceReport
- `get_compliance_score()` → Aggregate 0-100
- `get_violations()` → List of non-compliant clauses
- `get_warnings()` → List of partial compliance issues
- `generate_legal_notes()` → Array of human-readable explanations per owner

**Violation Detection:**
- Violation: score < 60 (e.g., share deviation > 20%)
- Warning: score 60-80 (e.g., share deviation 5-20%)
- Pass: score > 80

### `scoring_engine.py` - Multi-Metric Scoring

**ScoreManager Class:**
- Configurable weights (defaults reflect legal priority)
- Calculates all 7 Rule 109 metrics as 0-100 scores
- Computes weighted overall score

**Default Weights:**
| Metric | Weight | Rationale |
|--------|--------|-----------|
| Compactness | 30% | Rule 109(b) priority |
| Share Compliance | 20% | Rule 109(a) fundamental |
| Road Frontage | 15% | Rule 109(f) commercial value |
| Commercial Fairness | 15% | Rule 109(f) balanced distribution |
| Possession Preservation | 10% | Rule 109(e) practical reality |
| Field Preservation | 5% | Rule 109(d) minimize disruption |
| Family Settlement | 5% | Rule 109(g) mutual agreements |

**Score Functions:**
- `calculate_share_compliance(allocations, shares)` → Compare allocated vs target
- `calculate_compactness_score(allocations)` → Average Polsby-Popper per allotment
- `calculate_road_frontage_score(allocations, road_data)` → Frontage distribution fairness
- `calculate_commercial_fairness_score(allocations, commercial_data)` → Value distribution
- `calculate_field_preservation_score(allocations, original_fields)` → Field intact ratio
- `calculate_possession_preservation_score(allocations, possessions)` → Possession overlap
- `calculate_family_settlement_score(allocations, settlements)` → Settlement overlap

## Key Changes

- Implemented all 7 Rule 109 clauses as independent, testable functions
- Scoring engine uses Gini coefficient for inequality measurement
- Compliance report includes detailed per-owner, per-clause breakdown
- Violation/warning system provides actionable feedback
- Weights are configurable and can be adjusted per case

## Usage

```python
from app.services.legal.scoring_engine import ScoreManager
from app.services.legal.compliance_checker import Rule109ComplianceChecker
from app.services.legal.rule109_engine import validate_all_rules

# Score a plan
manager = ScoreManager()
scores = manager.calculate_all_scores(plan.allotments, owners, roads, possessions)

# Check compliance
checker = Rule109ComplianceChecker()
report = checker.check_all(plan, context)
print(report.get_compliance_score())  # 0-100
print(report.get_violations())  # ["109(a): Share mismatch for Owner B"]
```
