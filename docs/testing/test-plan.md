# Testing Plan — Baseline

## Scope & Objectives
Verify the current room-filtering logic before adding new functionality.

## Test Environment Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run Instructions
```bash
pytest -q
```

## Test Case Inventory
| ID | Behavior / Requirement | Type | Test | Expected Result |
|---|---|---|---|---|
| T-01 | Filter rooms by building and minimum capacity | Automated | `test_filter_by_building_and_capacity` | Library search with minimum capacity 4 returns only `LIB-204` |
| T-02 | Filter rooms by required feature | Automated | `test_filter_by_feature` | Requesting `display` returns only `LIB-204` |
| T-03 | Accept minimum-capacity boundary value | Automated | `test_capacity_boundary_one_is_valid` | `min_capacity=1` returns all 4 current rooms |
| T-04 | Reject invalid minimum capacity | Automated | `test_invalid_capacity_rejected` | `min_capacity=0` raises `ValueError` |
| T-05 | Store and retrieve floor information | Automated | `test_room_includes_floor` | `LIB-204` has floor value `2` |
| T-06 | Preserve search behavior when floor is not specified | Automated | `test_filter_no_floor` | Library rooms meeting minimum capacity 3 are returned without requiring a floor |
| T-07 | Filter rooms by numeric floor | Automated | `test_filter_by_floor` | `floor=2` returns only `LIB-204` |
| T-08 | Support named/string floor values | Automated | `test_filter_by_floor_string` | `floor="Main"` returns only `LOBBY` |
| T-09 | Support room records without floor information | Automated | `test_room_without_floor_is_supported` | Room formatting succeeds and does not display a `Floor` value |

## Manual Test Cases
None required for the baseline command-line example.

## Pass/Fail Criteria
All automated tests pass before a new change is merged.

## Limitations
No browser UI, persistence, authentication, deployment, or accessibility testing exists yet.
