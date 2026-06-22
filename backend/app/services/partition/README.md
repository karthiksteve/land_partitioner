# Partition Engine Module

**AI-Optimized Land Partition with Rule 109 Compliance**

## Overview

The Partition Engine generates three alternative partition plans for jointly owned agricultural land, optimized for different objectives while maintaining Rule 109 compliance. It uses weighted Voronoi tessellation, centroidal Voronoi optimization, and multi-objective spatial optimization.

## Files

### `partition_engine.py` - Main Partition Engine

**Core Functions:**
- `generate_partition(parcel, owners, mode='compactness')` → Complete PartitionPlan with allotments
- `_generate_compactness_plan(parcel, owners)` → Plan A: Maximize compactness (Polsby-Popper)
- `_generate_possession_plan(parcel, owners)` → Plan B: Preserve existing possession
- `_generate_commercial_plan(parcel, owners)` → Plan C: Fair commercial value distribution
- `_calculate_allocated_areas(total_area, owners)` → Target areas proportional to shares
- `_assign_parcels(allocations, geometries)` → Map geometries to owners

**Plan Generation Flow:**
1. Validate ownership shares sum to 100%
2. Calculate target areas per owner
3. Generate Voronoi partition weighted by plan objective
4. Clip and adjust boundaries to match targets
5. Calculate scores for all Rule 109 metrics
6. Return complete plan with allotments and scores

### `compactness.py` - Compactness Optimization

**Metrics:**
- `calculate_polsby_popper(geometry)` → `4πA/P²` (range 0-1, higher = more compact)
- `calculate_schwartzberg(geometry)` → `P/(2√(πA))` (range 1-∞, lower = more compact)
- `calculate_compactness_score(geometry)` → Normalized 0-100 score

**Optimization:**
- `optimize_compactness(geometry, num_parts, weights)` → Iterative Lloyd's algorithm
- `minimize_fragmentation(partitions)` → Merge tiny fragments, prefer contiguous blocks

### `voronoi.py` - Voronoi Partitioning

**Algorithms:**
- `generate_weighted_voronoi(parcel_geometry, num_parts, weights)` → Voronoi with weighted seed points
- `generate_centroidal_voronoi(parcel_geometry, num_parts, iterations=100)` → Lloyd's algorithm for equal-area Voronoi
- `clip_voronoi_to_parcel(voronoi_regions, parcel_geometry)` → Clip Voronoi cells to parcel boundary
- `adjust_boundaries(partitions, target_areas)` → Shift boundaries to meet area targets

### `optimization.py` - Multi-Objective Optimization

**Functions:**
- `optimize_partition(initial_partitions, targets, constraints)` → Constraint satisfaction
- `calculate_water_optimal(partitions, water_features)` → Prioritize water access
- `minimize_road_distance(partitions, road_network)` → Minimize travel distance
- `balance_factors(partitions, weights)` → Weighted factor balancing
- `multi_objective_optimization(parcel, owners)` → Generates all 3 plans and returns Pareto-optimal set

## Key Changes

- Implemented real weighted Voronoi tessellation using SciPy spatial module
- Added centroidal Voronoi optimization (Lloyd's algorithm) for equal-area partitioning
- Boundary adjustment algorithm that iteratively shifts edges to match area targets
- Compactness optimization using Polsby-Popper index as objective function
- Possession-weighted seeds for Plan B that pull boundaries toward existing possessions
- Commercial-weighted seeds for Plan C that pull boundaries toward road frontage
- Multi-objective optimization that finds Pareto-optimal trade-offs

## Algorithm Details

### Weighted Voronoi
1. Generate seed points based on plan objective
2. Compute Voronoi diagram using SciPy
3. Clip Voronoi regions to parcel boundary
4. Adjust boundaries until area targets are met
5. Assign regions to owners

### Compactness Scoring
```
Polsby-Popper = 4 * π * Area / Perimeter²
Score = normalized 0-100 (1.0 = perfect circle)
```

### Boundary Adjustment
```
for each partition:
    compute area_error = target_area - actual_area
    shift boundary by proportional amount
    reclip and repeat until convergence
```

## Usage

```python
from app.services.partition.partition_engine import PartitionEngine
from app.services.partition.optimization import multi_objective_optimization

# Generate all 3 plans at once
engine = PartitionEngine()
plans = multi_objective_optimization(parcel, owners)

# Or generate specific plan
plan_a = engine.generate_partition(parcel, owners, mode='compactness')
plan_b = engine.generate_partition(parcel, owners, mode='possession')
plan_c = engine.generate_partition(parcel, owners, mode='commercial')

# Each plan contains allotments with geometries and scores
for allotment in plan_a.allotments:
    print(f"Owner: {allotment.owner_id}, Area: {allotment.area}")
    print(f"Compactness: {allotment.compactness_score}")
```
