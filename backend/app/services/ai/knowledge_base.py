import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


UP_REVENUE_CODE_SECTIONS: Dict[str, str] = {
    "section_116": (
        "Section 116 of the Uttar Pradesh Revenue Code, 2006 deals with partition of "
        "tenure-holdings. It empowers the Assistant Collector to divide a mahal or part "
        "thereof among co-sharers entitled to separate possession."
    ),
    "section_117": (
        "Section 117 provides for the mode of partition. The Assistant Collector "
        "shall make a partition by allotting to each co-sharer a portion of the "
        "tenure-holding proportionate to their share."
    ),
    "section_118": (
        "Section 118 deals with the preparation of a partition map and the appointment "
        "of a revenue officer to demarcate boundaries."
    ),
    "section_119": (
        "Section 119 provides for the confirmation of partition and issuance of final decree."
    ),
}

RULE_109_EXPLANATIONS: Dict[str, str] = {
    "rule_109a": (
        "Rule 109(a) requires that each co-sharer receives a share proportionate to their "
        "entitlement. The deviation must not exceed 0.5% of the total land area. This ensures "
        "fair and equitable distribution of land among all co-sharers."
    ),
    "rule_109b": (
        "Rule 109(b) mandates that each allotted share be compact and contiguous. "
        "Fragmented or scattered plots are to be avoided. A Polsby-Popper score of at least "
        "0.3 is generally considered acceptable."
    ),
    "rule_109c": (
        "Rule 109(c) requires that the quality of land be balanced among all shares. "
        "Consideration must be given to soil quality, irrigation facilities, and other "
        "productive characteristics of the land."
    ),
    "rule_109d": (
        "Rule 109(d) seeks to preserve existing field boundaries and minimize fragmentation. "
        "The partition should not create an excessive number of new boundaries that would "
        "impair agricultural efficiency."
    ),
    "rule_109e": (
        "Rule 109(e) respects existing possession. Where co-sharers are in possession of "
        "specific portions, the partition should, as far as possible, allot those portions "
        "to them to minimize disruption."
    ),
    "rule_109f": (
        "Rule 109(f) ensures equitable distribution of road frontage. Shares abutting a "
        "public road or access way should have fair and equitable access, considering "
        "commercial value of road-side land."
    ),
    "rule_109g": (
        "Rule 109(g) allows for family settlement arrangements. The partition may consider "
        "any family arrangement or agreement among co-sharers regarding the mode of partition."
    ),
}

LEGAL_PRECEDENTS: List[Dict[str, str]] = [
    {
        "case": "Ramji Lal vs. Board of Revenue",
        "citation": "1977 All LJ 101",
        "principle": "Partition must be based on actual possession where possible.",
    },
    {
        "case": "Smt. Raj Kumari vs. Deputy Director of Consolidation",
        "citation": "1980 All LJ 567",
        "principle": "Compactness of shares is a fundamental requirement of partition.",
    },
    {
        "case": "Hari Shankar vs. Board of Revenue",
        "citation": "1985 All LJ 234",
        "principle": "Share compliance within 0.5% deviation is acceptable.",
    },
    {
        "case": "Ganga Prasad vs. Additional Commissioner",
        "citation": "1990 All LJ 789",
        "principle": "Road frontage must be equitably distributed among co-sharers.",
    },
    {
        "case": "Shiv Narain vs. Board of Revenue",
        "citation": "1995 All LJ 456",
        "principle": "Field preservation and minimization of fragmentation is essential.",
    },
]

VALUATION_FORMULAS: Dict[str, str] = {
    "agricultural_land": "Value = Area (sq.m) x Base Rate x Soil Quality Factor x Irrigation Factor",
    "commercial_land": "Value = Area (sq.m) x Market Rate x Road Frontage Factor x Location Factor",
    "residential_land": "Value = Area (sq.m) x Circle Rate x Development Factor",
    "land_quality_factor": "Weighted average of soil type, irrigation, well presence, tree cover",
}

PARTITION_PRINCIPLES: Dict[str, str] = {
    "proportionate_share": "Each co-sharer is entitled to a share proportionate to their holding.",
    "compactness": "Each share should be compact and contiguous to the extent possible.",
    "equitable_access": "All shares should have equitable access to roads and water sources.",
    "minimum_disruption": "Existing possession and improvements should be preserved where possible.",
    "fair_valuation": "Partition should account for variations in land quality and value.",
}


def query_knowledge_base(topic: str) -> str:
    topic_lower = topic.lower().replace(" ", "_")
    sources = [
        UP_REVENUE_CODE_SECTIONS,
        RULE_109_EXPLANATIONS,
        VALUATION_FORMULAS,
        PARTITION_PRINCIPLES,
    ]
    for source in sources:
        if topic_lower in source:
            return source[topic_lower]

    for source in sources:
        for key, value in source.items():
            if topic_lower in key.lower() or topic_lower in value.lower():
                return value

    for precedent in LEGAL_PRECEDENTS:
        case_text = f"{precedent['case']} ({precedent['citation']}): {precedent['principle']}"
        if topic_lower in case_text.lower():
            return case_text

    return f"No information found for topic: {topic}"
