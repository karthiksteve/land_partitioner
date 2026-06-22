import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

logger = logging.getLogger(__name__)


def explain_allotment(
    allotment: Dict[str, Any], owner: Dict[str, Any], context: Optional[Dict[str, Any]] = None
) -> str:
    owner_name = owner.get("owner_name", "Unknown")
    share = owner.get("share_percentage", 0)
    allocated_area = allotment.get("actual_area", 0)
    expected_area = allotment.get("expected_area", 0)

    parts = [
        f"Allotment for **{owner_name}**:",
        f"- Entitled to {share:.1f}% of total land",
        f"- Allocated area: {allocated_area:.2f} sq. meters (expected: {expected_area:.2f} sq. meters)",
    ]

    diff = allocated_area - expected_area
    if abs(diff) < 0.01:
        parts.append("- Area allocation is exact")
    elif diff > 0:
        parts.append(f"- Received {diff:.2f} sq. meters more than entitled share")
    else:
        parts.append(f"- Received {-diff:.2f} sq. meters less than entitled share")

    compactness = allotment.get("compactness_score", 0)
    if compactness > 80:
        parts.append("- Plot shape is highly compact and contiguous")
    elif compactness > 60:
        parts.append("- Plot shape is moderately compact")
    else:
        parts.append("- Plot shape has low compactness")

    return "\n".join(parts)


def explain_share_calculation(owner: Dict[str, Any], total_area: float) -> str:
    owner_name = owner.get("owner_name", "Unknown")
    share_pct = owner.get("share_percentage", 0)
    entitled_area = total_area * share_pct / 100

    return (
        f"**{owner_name}** has a **{share_pct:.1f}%** share in the total land of "
        f"**{total_area:.2f}** sq. meters. "
        f"This entitles them to **{entitled_area:.2f}** sq. meters "
        f"({share_pct:.1f}% of {total_area:.2f} sq. meters)."
    )


def explain_rule_109a_compliance(owner_share: float, allocated_share: float) -> str:
    deviation = abs(owner_share - allocated_share)
    if deviation <= 0.5:
        return (
            f"Rule 109(a): COMPLIANT. Share deviation is only {deviation:.2f}% "
            f"(within the 0.5% tolerance). The allocated share ({allocated_share:.2f}%) "
            f"matches the entitled share ({owner_share:.2f}%)."
        )
    return (
        f"Rule 109(a): NON-COMPLIANT. Share deviation is {deviation:.2f}% "
        f"(exceeds 0.5% tolerance). Allocated: {allocated_share:.2f}%, Entitled: {owner_share:.2f}%."
    )


def explain_rule_109e_compliance(possession_overlap: float) -> str:
    if possession_overlap >= 80:
        return (
            f"Rule 109(e): COMPLIANT. Existing possession is well-preserved "
            f"({possession_overlap:.1f}% overlap with allocated plot)."
        )
    elif possession_overlap >= 50:
        return (
            f"Rule 109(e): PARTIALLY COMPLIANT. {possession_overlap:.1f}% of existing "
            f"possession overlaps with allocated plot."
        )
    return (
        f"Rule 109(e): NON-COMPLIANT. Only {possession_overlap:.1f}% of existing "
        f"possession is preserved in the allocation."
    )


def explain_rule_109f_compliance(
    frontage_allocated: float, frontage_expected: float
) -> str:
    if frontage_allocated >= frontage_expected:
        return (
            f"Rule 109(f): COMPLIANT. Road frontage allocated ({frontage_allocated:.2f}m) "
            f"meets or exceeds expected ({frontage_expected:.2f}m)."
        )
    ratio = frontage_allocated / max(frontage_expected, 0.01) * 100
    return (
        f"Rule 109(f): PARTIALLY COMPLIANT. Only {ratio:.1f}% of expected road frontage "
        f"allocated ({frontage_allocated:.2f}m vs {frontage_expected:.2f}m expected)."
    )


def explain_commercial_fairness(commercial_score: float) -> str:
    if commercial_score >= 80:
        return f"Commercial fairness is EXCELLENT ({commercial_score:.1f}/100). All owners have equitable access to commercially valuable portions."
    elif commercial_score >= 60:
        return f"Commercial fairness is ADEQUATE ({commercial_score:.1f}/100). Some inequity in commercial value distribution."
    else:
        return f"Commercial fairness is POOR ({commercial_score:.1f}/100). Significant inequity in commercial value distribution."


def generate_parcel_explanation(
    parcel_id: str, plan_id: str, owner_id: str
) -> Dict[str, Any]:
    return {
        "parcel_id": parcel_id,
        "plan_id": plan_id,
        "owner_id": owner_id,
        "explanations": {
            "allotment": "Allotment explanation generated at runtime with full data.",
            "share_compliance": "Share compliance explanation available after scoring.",
            "compactness": "Compactness score reflects plot shape efficiency.",
            "road_frontage": "Road frontage analysis available after spatial analysis.",
            "commercial_fairness": "Commercial fairness analysis available.",
        },
        "note": "Full explanations require complete allotment and scoring data.",
    }


def generate_human_readable(all_findings: Dict[str, Any]) -> str:
    parts = []
    for key, finding in all_findings.items():
        if isinstance(finding, dict):
            title = finding.get("title", key)
            compliant = finding.get("compliant", False)
            status = "✅ Compliant" if compliant else "❌ Non-Compliant"
            parts.append(f"**{title}**: {status}")
            details = finding.get("details", [])
            if details:
                for d in details[:2]:
                    if isinstance(d, dict):
                        parts.append(f"  - {d.get('description', '')}")
                    else:
                        parts.append(f"  - {d}")
        else:
            parts.append(f"**{key}**: {finding}")

    return "\n".join(parts) if parts else "No findings available."
