# Report Engine Module

**Kurra Report, Preliminary Decree, Final Decree Generation**

## Overview

The Report Engine generates legally compliant documents required for land partition proceedings. It produces Kurra reports (partition maps), preliminary decrees, final decrees with metes and bounds, and supports multiple export formats.

## Files

### `kurra_report.py` - Kurra Report Generator

**Functions:**
- `generate_kurra_report(partition_plan_id)` → Complete Kurra report data
- `_format_parcel_details(parcel)` → Original parcel info
- `_format_owner_details(owners)` → All co-tenure holders
- `_format_share_details(shares)` → Ownership percentages
- `_include_map_data(partition_plan)` → GIS map with allotments
- `_include_frontage_analysis(plan)` → Road frontage per allotment
- `_include_commercial_analysis(plan)` → Commercial value distribution
- `_include_rule_compliance(plan)` → Rule 109 compliance summary
- `_generate_kurra_pdf(report_data)` → PDF generation using ReportLab

**Kurra Report Structure:**
1. Header: Village, District, Tehsil, Parcel details
2. Original Parcel: Area, boundaries, improvements
3. Owners: Names, shares, existing possession
4. Partition Plan: Allotments per owner with areas
5. GIS Map: Visual representation of partition
6. Frontage Analysis: Road frontage distribution
7. Commercial Analysis: Commercial value allocation
8. Rule 109 Compliance: All clauses checklist
9. Signatures: Revenue Officer, Surveyor, Parties

### `decree_report.py` - Legal Decree Generator

**Functions:**
- `generate_preliminary_decree(partition_plan_id)` → Preliminary decree
- `generate_final_decree(partition_plan_id)` → Final decree with metes and bounds
- `_format_ownership_shares(plan)` → Ownership structure
- `_format_valuation(plan)` → Improvement valuations
- `_include_legal_references()` → Section 116, Rule 109 citations
- `_generate_metes_and_bounds(allotments)` → Boundary descriptions per allotment
- `_generate_decree_pdf(decree_data)` → PDF generation

**Preliminary Decree Structure:**
1. Court header
2. Case details
3. Ownership shares determination
4. Valuation of improvements
5. Legal references (Section 116)
6. Directions for partition

**Final Decree Structure:**
1. Court header and case reference
2. Final allotment schedule
3. Metes and bounds for each allotment
4. Updated revenue records directions
5. GIS maps attached
6. Signatures and seals

### `report_generator.py` - Multi-Format Export

**Functions:**
- `generate_report(plan_id, format='pdf')` → Generate in specified format
- `generate_comparison_report(plans)` → Compare all 3 plans
- `generate_summary_report(parcel_id)` → Parcel summary
- `export_to_pdf(data)` → PDF generation
- `export_to_geojson(geometry)` → FeatureCollection GeoJSON
- `export_to_kml(geometry)` → KML format
- `export_to_csv(data)` → CSV tabular data
- `export_to_shapefile(geometry, path)` → ESRI Shapefile
- `export_to_json(data)` → Pretty-printed JSON

## Key Changes

- Kurra report includes all Rule 109 compliance details
- Preliminary and final decrees are court-ready documents
- Metes and bounds generated for each allotment for legal registration
- Multi-format export supports GIS software interoperability
- PDF generation uses ReportLab with proper formatting

## Usage

```python
from app.services.reports.kurra_report import generate_kurra_report
from app.services.reports.decree_report import (
    generate_preliminary_decree,
    generate_final_decree
)
from app.services.reports.report_generator import export_to_pdf

# Generate Kurra
kurra = await generate_kurra_report(plan_id)
pdf_bytes = await export_to_pdf(kurra)

# Generate decrees
preliminary = await generate_preliminary_decree(plan_id)
final = await generate_final_decree(plan_id)
```
