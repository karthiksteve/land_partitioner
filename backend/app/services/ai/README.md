# AI Engine Module

**Rule-Based AI Recommendations and Explainable Legal Reasoning**

## Overview

The AI Engine powers GeoKurra's intelligent features: plan ranking, allotment explanations, and legal knowledge retrieval. Unlike black-box ML models, this engine uses transparent rule-based reasoning that can be audited and explained in court.

## Files

### `recommendation_engine.py` - Plan Ranking & Selection

**Core Functions:**
- `rank_plans(plans_with_scores)` → Sorted list [best, second, third]
- `explain_selection(best_plan, all_plans)` → Why this plan was selected
- `which_rule109_conditions_satisfied(plan)` → List of satisfied/partially satisfied/violated clauses
- `tradeoff_analysis(selected_plan, alternative_plans)` → What was sacrificed/chosen
- `generate_recommendation_summary(plans)` → Complete human-readable summary

**Selection Logic:**
1. Score each plan using ScoreManager
2. Rank by overall score (weighted ensemble)
3. If plans tie, prefer: possession-optimized > compactness > commercial
4. Check if any plan violates critical constraints (109a share > 10% deviation)
5. Generate human-readable explanation with clause references

**Trade-off Analysis:**
- Compare best plan vs alternatives on each metric
- Identify metrics where best plan is weaker (trade-offs)
- Explain why trade-off was acceptable

### `explanation_engine.py` - Allotment Explanations

**Functions:**
- `explain_allotment(allotment, owner, context)` → Full explanation for one allotment
- `explain_share_calculation(owner, total_area)` → "Owner X owns Y%. Total area = Z. Required = Y% of Z = A"
- `explain_rule_109a_compliance(owner_share, allocated_share)` → Proportions match
- `explain_rule_109e_compliance(possession_overlap)` → "X% of your existing possession is preserved"
- `explain_rule_109f_compliance(frontage_allocated, frontage_expected)` → Frontage fairness
- `explain_commercial_fairness(commercial_score)` → Commercial value explanation
- `generate_parcel_explanation(parcel_id, plan_id, owner_id)` → Complete explanation dict
- `generate_human_readable(all_findings)` → Formatted text

**Explanation Format:**
```
Why was this parcel allotted to Owner A?

1. Share Calculation:
   - Owner A owns 50% of the total holding
   - Total area = 10.00 acres
   - Required allocation = 5.00 acres
   - Allocated area = 4.95 acres (99% of target)

2. Rule 109(a) Compliance:
   - Share compliance score: 97/100
   - ✓ Allocated proportion matches ownership within acceptable tolerance

3. Rule 109(e) - Existing Possession:
   - 85% of your existing possession overlaps with this allotment
   - Your existing occupied area is preserved

4. Rule 109(f) - Road Frontage:
   - Total road frontage: 100 meters
   - Your allocated frontage: 49.5 meters (99% of 50% share)
   - Commercial fairness score: 97/100

Conclusion: This allotment satisfies all Rule 109 requirements.
```

### `knowledge_base.py` - Legal Knowledge Base

**Contents:**
- `UP_REVENUE_CODE_SECTIONS` → Section 116 (Suit for division of holding)
- `RULE_109_EXPLANATIONS` → All 7 clauses with legal text and plain English
- `LEGAL_PRECEDENTS` → Key court decisions on land partition
- `VALUATION_FORMULAS` → Improvement valuation methodologies
- `PARTITION_PRINCIPLES` → General partition law principles

**Function:**
- `query_knowledge_base(topic)` → Retrieve relevant legal knowledge by topic

## Key Changes

- Pure rule-based AI (no external LLM needed, fully auditable)
- Human-readable explanations formatted for court admissibility
- Legal knowledge base covers UP Revenue Code, Rule 109, and precedents
- Trade-off analysis helps users understand compromises
- Generate explanations per-owner, per-allotment, per-plan

## Usage

```python
from app.services.ai.recommendation_engine import (
    rank_plans, explain_selection
)
from app.services.ai.explanation_engine import (
    generate_parcel_explanation
)

# Rank plans
ranked = rank_plans([plan_a, plan_b, plan_c])
# Returns: [(PlanA, 85), (PlanC, 78), (PlanB, 72)]

# Get explanation
explanation = generate_parcel_explanation(
    parcel_id="...",
    plan_id="...",
    owner_id="..."
)
print(explanation["human_readable"])
```
