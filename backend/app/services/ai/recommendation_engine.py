import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

logger = logging.getLogger(__name__)


def rank_plans(plans_with_scores: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    ranked = sorted(
        plans_with_scores,
        key=lambda p: p.get("scores", {}).get("overall_score", 0),
        reverse=True,
    )
    for i, plan in enumerate(ranked):
        plan["rank"] = i + 1
        if i == 0:
            plan["recommendation"] = "recommended"
        elif i == 1:
            plan["recommendation"] = "alternative"
        else:
            plan["recommendation"] = "not_recommended"
    return ranked


def explain_selection(best_plan: Dict[str, Any], all_plans: List[Dict[str, Any]]) -> str:
    best_name = best_plan.get("plan_name", "Unknown")
    best_type = best_plan.get("plan_type", "unknown")
    best_score = best_plan.get("scores", {}).get("overall_score", 0)

    reasons = []
    scores = best_plan.get("scores", {})
    if scores.get("share_compliance", 0) >= 90:
        reasons.append("excellent share compliance")
    if scores.get("compactness", 0) >= 80:
        reasons.append("high compactness ensuring contiguous plots")
    if scores.get("road_frontage", 0) >= 80:
        reasons.append("equitable road frontage distribution")
    if scores.get("commercial_fairness", 0) >= 80:
        reasons.append("fair commercial value allocation")
    if scores.get("possession_preservation", 0) >= 80:
        reasons.append("respects existing possessions")

    top_scores = sorted(
        [(s.get("plan_name", ""), s.get("scores", {}).get("overall_score", 0))
         for s in all_plans],
        key=lambda x: -x[1],
    )

    explanation = (
        f"The **{best_name}** ({best_type} plan) is recommended with an overall score of "
        f"**{best_score:.1f}%**."
    )
    if reasons:
        explanation += f" Key strengths: {', '.join(reasons)}."
    if len(top_scores) > 1:
        explanation += f" It outperforms '{top_scores[1][0]}' ({top_scores[1][1]:.1f}%)"
        if len(top_scores) > 2:
            explanation += f" and '{top_scores[2][0]}' ({top_scores[2][1]:.1f}%)"
        explanation += "."

    return explanation


def which_rule109_conditions_satisfied(plan: Dict[str, Any]) -> List[str]:
    compliance = plan.get("compliance", {})
    rules = compliance.get("rules", {}) if isinstance(compliance, dict) else {}
    satisfied = []
    for rule_key, rule_data in rules.items():
        if isinstance(rule_data, dict) and rule_data.get("compliant", False):
            rule_num = rule_data.get("rule", rule_key)
            title = rule_data.get("title", "")
            satisfied.append(f"Rule {rule_num}: {title}")
    return satisfied if satisfied else ["No Rule 109 conditions satisfied in this plan."]


def tradeoff_analysis(
    selected_plan: Dict[str, Any], alternative_plans: List[Dict[str, Any]]
) -> str:
    selected_scores = selected_plan.get("scores", {})
    selected_overall = selected_scores.get("overall_score", 0)
    selected_type = selected_plan.get("plan_type", "unknown")

    analysis_parts = [f"**Trade-off Analysis for {selected_type} plan (score: {selected_overall:.1f}%):**"]

    for alt in alternative_plans:
        alt_scores = alt.get("scores", {})
        alt_overall = alt_scores.get("overall_score", 0)
        alt_type = alt.get("plan_type", "unknown")
        diff = selected_overall - alt_overall

        if diff > 0:
            analysis_parts.append(
                f" vs {alt_type} ({alt_overall:.1f}%): The {selected_type} plan is "
                f"{diff:.1f}% better overall."
            )
        else:
            analysis_parts.append(
                f" vs {alt_type} ({alt_overall:.1f}%): The {alt_type} plan is "
                f"{-diff:.1f}% better overall."
            )

        for metric in ["share_compliance", "compactness", "road_frontage"]:
            sv = selected_scores.get(metric, 0)
            av = alt_scores.get(metric, 0)
            if abs(sv - av) > 10:
                better = selected_type if sv > av else alt_type
                analysis_parts.append(
                    f"  - {metric}: {better} is better ({sv:.0f} vs {av:.0f})"
                )

    return "\n".join(analysis_parts)


def generate_recommendation_summary(plans: List[Dict[str, Any]]) -> Dict[str, Any]:
    scored_plans = [p for p in plans if p.get("scores")]
    if not scored_plans:
        return {"recommendation": "No scored plans available", "ranked_plans": []}

    ranked_plans = rank_plans(scored_plans)
    best_plan = ranked_plans[0]
    alternatives = ranked_plans[1:]

    return {
        "recommended_plan_id": str(best_plan.get("id", "")),
        "recommended_plan_name": best_plan.get("plan_name", ""),
        "recommended_plan_type": best_plan.get("plan_type", ""),
        "recommended_score": best_plan.get("scores", {}).get("overall_score", 0),
        "explanation": explain_selection(best_plan, ranked_plans),
        "satisfied_rules": which_rule109_conditions_satisfied(best_plan),
        "tradeoff_analysis": tradeoff_analysis(best_plan, alternatives),
        "ranked_plans": [
            {
                "id": str(p.get("id", "")),
                "plan_name": p.get("plan_name", ""),
                "plan_type": p.get("plan_type", ""),
                "overall_score": p.get("scores", {}).get("overall_score", 0),
                "rank": p.get("rank", 0),
                "recommendation": p.get("recommendation", ""),
            }
            for p in ranked_plans
        ],
    }
