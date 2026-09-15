# Development Guide

## Project Overview
Small Python example for study-room filtering.

## Local Setup
```bash
git clone <repository-url>
cd <repository>
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

## Required Software
- Python 3.12 recommended
- Git
- pytest
- GitHub CLI (`gh`) for setup/import scripts

## Codebase Structure
```text
src/        application logic
tests/      automated tests
docs/       durable engineering/project documentation
course/     course/process records
.github/    CI and issue forms
```

## Known Gotcha
If pytest reports `ModuleNotFoundError: No module named 'src'`, run from the repository root and confirm `pytest.ini` exists.

## Running Tests
```bash
pytest -q
```
