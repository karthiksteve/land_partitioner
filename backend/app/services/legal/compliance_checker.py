import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from app.services.legal.rule109_engine import validate_all_rules

logger = logging.getLogger(__name__)


class ComplianceReport:
    def __init__(self, plan: Dict[str, Any], context: Dict[str, Any]):
        self.plan = plan
        self.context = context
        self._validation = validate_all_rules(plan, context)
        self._compliant = self._validation.get("overall_compliant", False)
        self._score = self._validation.get("overall_compliance_percentage", 0)
        self._violations = self._extract_violations()
        self._warnings = self._extract_warnings()
        self._legal_notes = self._generate_legal_notes()

    def _extract_violations(self) -> List[Dict[str, Any]]:
        violations = []
        rules = self._validation.get("rules", {})
        for rule_key, rule_result in rules.items():
            if not rule_result.get("compliant", True):
                for detail in rule_result.get("details", []):
                    if not detail.get("compliant", True):
                        violations.append({
                            "rule": rule_result.get("rule", rule_key),
                            "title": rule_result.get("title", ""),
                            "description": rule_result.get("description", ""),
                            "detail": detail,
                        })
        return violations

    def _extract_warnings(self) -> List[Dict[str, Any]]:
        warnings = []
        rules = self._validation.get("rules", {})
        for rule_key, rule_result in rules.items():
            compliance_pct = rule_result.get("overall_compliance_percentage", 100)
            if 70 <= compliance_pct < 100:
                warnings.append({
                    "rule": rule_result.get("rule", rule_key),
                    "title": rule_result.get("title", ""),
                    "compliance_percentage": compliance_pct,
                    "message": f"Partial compliance with {rule_result.get('title', '')}",
                })
        return warnings

    def _generate_legal_notes(self) -> List[str]:
        notes = []
        for violation in self._violations:
            rule = violation.get("rule", "")
            title = violation.get("title", "")
            desc = violation.get("description", "")
            notes.append(f"Violation of Rule {rule} ({title}): {desc}. "
                         f"Owner '{violation.get('detail', {}).get('owner_name', 'Unknown')}' "
                         f"is not compliant.")
        for warning in self._warnings:
            notes.append(f"Warning: {warning.get('message')} "
                         f"(compliance: {warning.get('compliance_percentage', 0):.1f}%)")
        if not notes:
            notes.append("All Rule 109 provisions are satisfied.")
        return notes

    def check_all(self) -> "ComplianceReport":
        return self

    def get_compliance_score(self) -> float:
        return self._score

    def get_violations(self) -> List[Dict[str, Any]]:
        return self._violations

    def get_warnings(self) -> List[Dict[str, Any]]:
        return self._warnings

    def generate_legal_notes(self) -> List[str]:
        return self._legal_notes

    def to_dict(self) -> Dict[str, Any]:
        return {
            "compliant": self._compliant,
            "compliance_score": self._score,
            "num_violations": len(self._violations),
            "num_warnings": len(self._warnings),
            "violations": self._violations,
            "warnings": self._warnings,
            "legal_notes": self._legal_notes,
        }


class Rule109ComplianceChecker:
    def __init__(self):
        self._plan: Optional[Dict[str, Any]] = None
        self._context: Optional[Dict[str, Any]] = None
        self._report: Optional[ComplianceReport] = None

    def check_all(self, plan: Dict[str, Any], context: Dict[str, Any]) -> ComplianceReport:
        self._plan = plan
        self._context = context
        self._report = ComplianceReport(plan, context)
        return self._report

    def get_compliance_score(self) -> float:
        if self._report:
            return self._report.get_compliance_score()
        return 0.0

    def get_violations(self) -> List[Dict[str, Any]]:
        if self._report:
            return self._report.get_violations()
        return []

    def get_warnings(self) -> List[Dict[str, Any]]:
        if self._report:
            return self._report.get_warnings()
        return []

    def generate_legal_notes(self) -> List[str]:
        if self._report:
            return self._report.generate_legal_notes()
        return []

    def to_dict(self) -> Dict[str, Any]:
        if self._report:
            return self._report.to_dict()
        return {
            "compliant": True,
            "compliance_score": 100,
            "num_violations": 0,
            "num_warnings": 0,
            "violations": [],
            "warnings": [],
            "legal_notes": ["No report generated yet."],
        }
