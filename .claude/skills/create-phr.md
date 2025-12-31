# Skill: Create Prompt History Record (PHR)

**Owner**: SpecKit Architect Agent
**Phase**: Universal (All Phases)
**Purpose**: Create a structured Prompt History Record (PHR) to capture AI exchanges for learning, traceability, and knowledge sharing

---

## Context

Every significant AI interaction should be recorded as a PHR for organizational learning, audit trails, and building a corpus of effective prompts. This skill automates PHR creation following SDD-RI standards.

## Prerequisites

- [ ] PHR template exists at `.specify/templates/phr-template.prompt.md`
- [ ] History directory structure created (`history/prompts/`)
- [ ] Git user configured (for metadata)
- [ ] Current feature context known (if applicable)

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `prompt_text` | string | Yes | Complete user input (verbatim) | "Implement login endpoint" |
| `response_text` | string | Yes | Agent's key response | "Created POST /api/auth/login" |
| `stage` | enum | Yes | Development stage | "spec", "plan", "tasks", "green", etc. |
| `feature_name` | string | No | Feature context (if applicable) | "phase2-fullstack-web" |
| `files_modified` | string[] | No | List of files created/modified | ["backend/app/auth.py"] |
| `tests_run` | string[] | No | List of tests run/created | ["test_auth.py::test_login"] |

## Execution Steps

### Step 1: Determine Stage and Routing

**Stages**:
- `constitution` → Routes to `history/prompts/constitution/`
- `spec` → Routes to `history/prompts/<feature>/`
- `plan` → Routes to `history/prompts/<feature>/`
- `tasks` → Routes to `history/prompts/<feature>/`
- `red` → Routes to `history/prompts/<feature>/` (debugging)
- `green` → Routes to `history/prompts/<feature>/` (implementation)
- `refactor` → Routes to `history/prompts/<feature>/`
- `explainer` → Routes to `history/prompts/<feature>/`
- `misc` → Routes to `history/prompts/<feature>/`
- `general` → Routes to `history/prompts/general/`

**Routing Logic**:
```python
def determine_route(stage: str, feature_name: Optional[str]) -> str:
    """Determine PHR output directory."""
    if stage == "constitution":
        return "history/prompts/constitution/"
    elif stage in ["spec", "plan", "tasks", "red", "green", "refactor", "explainer", "misc"]:
        if not feature_name:
            raise ValueError(f"Stage '{stage}' requires feature_name")
        return f"history/prompts/{feature_name}/"
    elif stage == "general":
        return "history/prompts/general/"
    else:
        raise ValueError(f"Invalid stage: {stage}")
```

### Step 2: Generate Title and Allocate ID

**Title Generation**:
- 3-7 words
- Descriptive and action-oriented
- Use kebab-case for filename slug

**ID Allocation**:
```bash
# Find highest existing ID in target directory
existing_ids=$(ls history/prompts/**/*.prompt.md | grep -oE 'PHR-[0-9]+' | sed 's/PHR-//' | sort -n | tail -1)
next_id=$((existing_ids + 1))
phr_id=$(printf "PHR-%04d" $next_id)
```

Example:
```
Prompt: "Implement JWT authentication"
Title: "implement-jwt-authentication"
Next ID: PHR-0042
```

### Step 3: Read PHR Template

**File**: `.specify/templates/phr-template.prompt.md`

```markdown
---
id: {{ID}}
title: "{{TITLE}}"
stage: {{STAGE}}
date: {{DATE_ISO}}
surface: {{SURFACE}}
model: {{MODEL}}
feature: {{FEATURE}}
branch: {{BRANCH}}
user: {{USER}}
command: {{COMMAND}}
labels: {{LABELS}}
links:
  spec: {{LINKS_SPEC}}
  ticket: {{LINKS_TICKET}}
  adr: {{LINKS_ADR}}
  pr: {{LINKS_PR}}
files: |
{{FILES_YAML}}
tests: |
{{TESTS_YAML}}
---

# {{TITLE}}

## Prompt

{{PROMPT_TEXT}}

## Response

{{RESPONSE_TEXT}}

## Outcome

**What was accomplished:**
{{OUTCOME_IMPACT}}

**Tests:**
{{TESTS_SUMMARY}}

**Files modified:**
{{FILES_SUMMARY}}

## Next Steps

{{NEXT_PROMPTS}}

## Reflection

{{REFLECTION_NOTE}}

## Evaluation

**Failure modes observed:**
{{FAILURE_MODES}}

**Next experiment to improve prompt quality:**
{{NEXT_EXPERIMENT}}
```

### Step 4: Fill All Placeholders

```python
from datetime import datetime
import subprocess
import json

def fill_phr_template(
    template: str,
    prompt_text: str,
    response_text: str,
    stage: str,
    feature_name: Optional[str],
    files_modified: list[str],
    tests_run: list[str],
) -> str:
    """Fill PHR template with actual values."""

    # Generate metadata
    phr_id = allocate_phr_id(stage, feature_name)
    title = generate_title(prompt_text)
    date_iso = datetime.now().strftime("%Y-%m-%d")

    # Get git metadata
    try:
        branch = subprocess.check_output(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            text=True
        ).strip()
        user = subprocess.check_output(
            ["git", "config", "user.name"],
            text=True
        ).strip()
    except:
        branch = "unknown"
        user = "unknown"

    # Extract labels
    labels = extract_labels(prompt_text, response_text)

    # Format files and tests as YAML lists
    files_yaml = "\n".join([f"  - {f}" for f in files_modified]) or "  - none"
    tests_yaml = "\n".join([f"  - {t}" for t in tests_run]) or "  - none"

    # Fill placeholders
    filled = template
    replacements = {
        "{{ID}}": phr_id,
        "{{TITLE}}": title,
        "{{STAGE}}": stage,
        "{{DATE_ISO}}": date_iso,
        "{{SURFACE}}": "agent",
        "{{MODEL}}": "claude-sonnet-4-5",
        "{{FEATURE}}": feature_name or "none",
        "{{BRANCH}}": branch,
        "{{USER}}": user,
        "{{COMMAND}}": "/sp.implement",  # Current command
        "{{LABELS}}": json.dumps(labels),
        "{{LINKS_SPEC}}": f"specs/{feature_name}/spec.md" if feature_name else "null",
        "{{LINKS_TICKET}}": "null",
        "{{LINKS_ADR}}": "null",
        "{{LINKS_PR}}": "null",
        "{{FILES_YAML}}": files_yaml,
        "{{TESTS_YAML}}": tests_yaml,
        "{{PROMPT_TEXT}}": prompt_text,  # FULL TEXT (not truncated!)
        "{{RESPONSE_TEXT}}": summarize_response(response_text),
        "{{OUTCOME_IMPACT}}": generate_outcome(response_text, files_modified),
        "{{TESTS_SUMMARY}}": f"{len(tests_run)} tests run" if tests_run else "none",
        "{{FILES_SUMMARY}}": f"{len(files_modified)} files modified" if files_modified else "none",
        "{{NEXT_PROMPTS}}": generate_next_steps(stage),
        "{{REFLECTION_NOTE}}": generate_reflection(prompt_text, response_text),
        "{{FAILURE_MODES}}": "none observed",
        "{{NEXT_EXPERIMENT}}": "none",
    }

    for placeholder, value in replacements.items():
        filled = filled.replace(placeholder, str(value))

    return filled


def extract_labels(prompt: str, response: str) -> list[str]:
    """Extract topic labels from prompt and response."""
    # Simple keyword extraction (can be enhanced with NLP)
    keywords = set()

    common_topics = {
        "authentication": ["auth", "login", "jwt", "token"],
        "database": ["db", "database", "sql", "migration"],
        "api": ["api", "endpoint", "rest", "http"],
        "testing": ["test", "pytest", "jest", "coverage"],
        "frontend": ["frontend", "ui", "react", "next"],
        "backend": ["backend", "fastapi", "python"],
    }

    text = (prompt + " " + response).lower()

    for topic, terms in common_topics.items():
        if any(term in text for term in terms):
            keywords.add(topic)

    return sorted(list(keywords))
```

### Step 5: Write PHR File

```python
import os

def create_phr(
    prompt_text: str,
    response_text: str,
    stage: str,
    feature_name: Optional[str] = None,
    files_modified: list[str] = [],
    tests_run: list[str] = [],
) -> str:
    """
    Create a Prompt History Record.

    Returns:
        Absolute path to created PHR file
    """
    # Determine route
    route = determine_route(stage, feature_name)
    os.makedirs(route, exist_ok=True)

    # Allocate ID and generate filename
    phr_id = allocate_phr_id(route)
    title_slug = slugify(generate_title(prompt_text))

    # Determine extension based on stage
    if stage == "constitution":
        ext = "constitution.prompt.md"
    elif stage == "general":
        ext = "general.prompt.md"
    else:
        ext = f"{stage}.prompt.md"

    filename = f"{phr_id}-{title_slug}.{ext}"
    filepath = os.path.join(route, filename)

    # Read template
    template_path = ".specify/templates/phr-template.prompt.md"
    with open(template_path, "r") as f:
        template = f.read()

    # Fill template
    filled = fill_phr_template(
        template,
        prompt_text,
        response_text,
        stage,
        feature_name,
        files_modified,
        tests_run,
    )

    # Write file
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(filled)

    # Validate
    validate_phr(filepath)

    return os.path.abspath(filepath)
```

### Step 6: Validate PHR

```python
import re

def validate_phr(filepath: str) -> bool:
    """
    Validate PHR file meets all requirements.

    Raises:
        ValueError: If validation fails
    """
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Check for unresolved placeholders
    placeholders = re.findall(r'\{\{[A-Z_]+\}\}', content)
    if placeholders:
        raise ValueError(f"Unresolved placeholders: {placeholders}")

    # Check frontmatter
    if not content.startswith("---"):
        raise ValueError("Missing YAML frontmatter")

    # Check required sections
    required_sections = ["# ", "## Prompt", "## Response", "## Outcome"]
    for section in required_sections:
        if section not in content:
            raise ValueError(f"Missing section: {section}")

    # Check prompt is not truncated
    if "{{PROMPT_TEXT}}" in content or len(content.split("## Prompt")[1].split("## Response")[0]) < 10:
        raise ValueError("Prompt text appears truncated")

    print(f"✅ PHR validated: {filepath}")
    return True
```

### Step 7: Report Creation

```python
def report_phr_creation(filepath: str, stage: str, feature: Optional[str]) -> None:
    """Report PHR creation to user."""

    phr_id = os.path.basename(filepath).split("-")[0]
    relative_path = os.path.relpath(filepath)

    print(f"""
✅ Exchange recorded as {phr_id} in {stage} context
📁 {relative_path}

Stage: {stage}
Feature: {feature or "none"}
Files modified: {count_files(filepath)}
Tests involved: {count_tests(filepath)}

Acceptance Criteria (PASS only if all true)
- Full prompt preserved verbatim (no truncation) ✅
- Stage and routing determined correctly ✅
- Metadata fields populated ✅
    """.strip())
```

## Output Artifacts

1. **PHR File**: `history/prompts/<route>/<id>-<slug>.<stage>.prompt.md`

## Validation Rules

### MUST Pass:
- No unresolved placeholders ({{ANYTHING}})
- PROMPT_TEXT is complete (not truncated)
- All required sections present
- File matches routing rules
- YAML frontmatter valid
- Stage and title match

### MUST NOT:
- Truncate user input to summary
- Skip any template sections
- Have placeholder values in output
- Fail silently (report errors)

## Example Usage

```python
# After implementing authentication:
create_phr(
    prompt_text="Implement JWT authentication for the API",
    response_text="Created auth.py with JWT token generation...",
    stage="green",
    feature_name="phase2-fullstack-web",
    files_modified=["backend/app/auth.py", "backend/tests/test_auth.py"],
    tests_run=["test_auth.py::test_login", "test_auth.py::test_register"],
)

# Output:
# ✅ Exchange recorded as PHR-0042 in green context
# 📁 history/prompts/phase2-fullstack-web/PHR-0042-implement-jwt-authentication.green.prompt.md
```

## Routing Examples

```
Stage: constitution
Feature: none
Output: history/prompts/constitution/PHR-0001-define-code-quality-standards.constitution.prompt.md

Stage: spec
Feature: phase1-console-app
Output: history/prompts/phase1-console-app/PHR-0005-create-todo-model-spec.spec.prompt.md

Stage: green
Feature: phase2-fullstack-web
Output: history/prompts/phase2-fullstack-web/PHR-0023-implement-login-endpoint.green.prompt.md

Stage: general
Feature: none
Output: history/prompts/general/PHR-0007-setup-project-structure.general.prompt.md
```

## Success Indicators

- ✅ PHR file created at correct path
- ✅ All placeholders filled
- ✅ Full prompt text preserved
- ✅ Metadata complete
- ✅ Routing correct for stage
- ✅ Validation passes
- ✅ File readable and well-formatted

## Failure Modes & Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Template missing | Create from example or fail with clear message |
| ID collision | Increment and retry (max 10 attempts) |
| Invalid stage | Report valid stages, ask user to correct |
| Missing feature_name | Prompt user for feature context |
| Placeholder unresolved | Report which fields missing, fill with "unknown" |

## Related Skills

- **validate-phase-transition**: Uses PHRs to verify phase completion
- **sp.clarify**: May trigger PHR creation after clarification

## Integration with SDD Workflow

PHRs are created automatically after:
1. Spec creation (`/sp.specify`)
2. Plan creation (`/sp.plan`)
3. Task generation (`/sp.tasks`)
4. Implementation work (`/sp.implement`)
5. Architecture decisions (`/sp.adr`)

**Never skip PHR creation** unless explicitly running `/sp.phr` command itself (to avoid recursion).

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Hackathon**: Todo Spec-Driven Development
