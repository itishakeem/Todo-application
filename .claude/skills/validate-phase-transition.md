# Skill: Validate Phase Transition

**Owner**: Orchestrator Agent
**Phase**: Universal (All Phase Transitions)
**Purpose**: Validate that all requirements are met before transitioning from one hackathon phase to the next

---

## Context

The hackathon requires sequential phase progression (I → II → III → IV → V). Each phase must be fully complete before the next begins. This skill performs comprehensive validation to ensure quality gates are met.

## Prerequisites

- [ ] Current phase work completed
- [ ] All phase artifacts exist (spec, plan, tasks)
- [ ] Implementation complete
- [ ] Tests passing

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `from_phase` | enum | Yes | Current phase number | "phase1", "phase2", etc. |
| `to_phase` | enum | Yes | Target phase number | "phase2", "phase3", etc. |
| `skip_demo_check` | bool | No | Skip demo video validation | `false` (default) |

## Phase Transition Requirements

### Phase I → Phase II

**Prerequisites**:
- [x] Console application fully functional
- [x] All CRUD operations working
- [x] Tests passing (100% for core features)
- [x] Code follows constitution
- [x] Demo video recorded (<90 seconds)
- [x] README updated

**Artifacts Required**:
- `specs/phase1-console-app/spec.md`
- `specs/phase1-console-app/plan.md`
- `specs/phase1-console-app/tasks.md`
- `src/` directory with working code
- `tests/` directory with passing tests
- PHRs in `history/prompts/phase1-console-app/`

### Phase II → Phase III

**Prerequisites**:
- [x] Full-stack web app deployed locally
- [x] RESTful API with all endpoints
- [x] Authentication working (Better Auth)
- [x] Database connected (Neon PostgreSQL)
- [x] Frontend accessible at localhost:3000
- [x] All API tests passing
- [x] Demo video recorded
- [x] README updated

**Artifacts Required**:
- `specs/phase2-fullstack-web/spec.md`
- `specs/phase2-fullstack-web/plan.md`
- `specs/phase2-fullstack-web/tasks.md`
- `frontend/` directory with Next.js app
- `backend/` directory with FastAPI app
- Database migrations in `backend/alembic/`
- PHRs in `history/prompts/phase2-fullstack-web/`

### Phase III → Phase IV

**Prerequisites**:
- [x] AI chatbot functional
- [x] MCP server running
- [x] OpenAI Agents SDK integrated
- [x] Natural language todo management working
- [x] Urdu support implemented (bonus)
- [x] All integration tests passing
- [x] Demo video recorded
- [x] README updated

**Artifacts Required**:
- `specs/phase3-ai-chatbot/spec.md`
- `specs/phase3-ai-chatbot/plan.md`
- `specs/phase3-ai-chatbot/tasks.md`
- `backend/mcp_server/` directory
- MCP tools implemented
- Chatbot UI component
- PHRs in `history/prompts/phase3-ai-chatbot/`

### Phase IV → Phase V

**Prerequisites**:
- [x] Docker containers built
- [x] Helm charts created
- [x] Local Kubernetes deployment (Minikube) working
- [x] All services accessible via K8s
- [x] Health checks passing
- [x] Demo video recorded
- [x] README updated

**Artifacts Required**:
- `specs/phase4-kubernetes/spec.md`
- `specs/phase4-kubernetes/plan.md`
- `specs/phase4-kubernetes/tasks.md`
- `docker/` directory with Dockerfiles
- `helm/` directory with Helm charts
- `k8s/` directory with manifests
- PHRs in `history/prompts/phase4-kubernetes/`

### Phase V (Final)

**Completion Requirements**:
- [x] Cloud deployment complete (GKE/AKS/OKE)
- [x] Kafka + Dapr integrated
- [x] CI/CD pipelines working
- [x] Advanced features implemented
- [x] Production-ready
- [x] Final demo video
- [x] Complete documentation

## Execution Steps

### Step 1: Check Artifacts Exist

```python
import os
from pathlib import Path

def check_phase_artifacts(phase: str) -> dict:
    """
    Check that all required artifacts exist for a phase.

    Returns:
        Dictionary with artifact status
    """
    phase_dir = f"specs/{phase}"
    artifacts = {
        "spec": os.path.exists(f"{phase_dir}/spec.md"),
        "plan": os.path.exists(f"{phase_dir}/plan.md"),
        "tasks": os.path.exists(f"{phase_dir}/tasks.md"),
        "prompts_dir": os.path.exists(f"history/prompts/{phase}"),
    }

    # Check for at least one PHR
    if artifacts["prompts_dir"]:
        phr_count = len(list(Path(f"history/prompts/{phase}").glob("*.prompt.md")))
        artifacts["phrs_count"] = phr_count
        artifacts["has_phrs"] = phr_count > 0
    else:
        artifacts["phrs_count"] = 0
        artifacts["has_phrs"] = False

    return artifacts
```

### Step 2: Validate Spec Completeness

```python
def validate_spec(spec_path: str) -> dict:
    """Validate spec.md has all required sections."""

    required_sections = [
        "# Phase",
        "## Overview",
        "## User Stories",
        "## Functional Requirements",
        "## Non-Functional Requirements",
        "## Technical Constraints",
        "## Edge Cases",
        "## Success Metrics",
        "## Out of Scope",
    ]

    with open(spec_path, "r") as f:
        content = f.read()

    missing = []
    for section in required_sections:
        if section not in content:
            missing.append(section)

    return {
        "valid": len(missing) == 0,
        "missing_sections": missing,
    }
```

### Step 3: Validate Tasks Completion

```python
import re

def validate_tasks_completion(tasks_path: str) -> dict:
    """Check all tasks are marked complete."""

    with open(tasks_path, "r") as f:
        content = f.read()

    # Find all task checkboxes
    all_tasks = re.findall(r'- \[([ x])\] \*\*TASK-\d+\*\*', content)
    total_tasks = len(all_tasks)
    completed_tasks = sum(1 for task in all_tasks if task == "x")

    return {
        "total": total_tasks,
        "completed": completed_tasks,
        "all_complete": total_tasks > 0 and completed_tasks == total_tasks,
        "completion_rate": completed_tasks / total_tasks if total_tasks > 0 else 0,
    }
```

### Step 4: Run Tests

```python
import subprocess

def run_phase_tests(phase: str) -> dict:
    """Run tests for the phase."""

    results = {
        "tests_run": False,
        "tests_passed": False,
        "test_output": "",
    }

    # Determine test command based on phase
    test_commands = {
        "phase1-console-app": ["pytest", "tests/", "-v"],
        "phase2-fullstack-web": ["pytest", "backend/tests/", "-v"],
        "phase3-ai-chatbot": ["npm", "test", "--prefix", "frontend"],
        "phase4-kubernetes": ["helm", "test", "todo-app"],
        "phase5-cloud-deployment": ["kubectl", "get", "pods"],
    }

    cmd = test_commands.get(phase)
    if not cmd:
        results["test_output"] = f"No test command defined for {phase}"
        return results

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minutes
        )

        results["tests_run"] = True
        results["tests_passed"] = result.returncode == 0
        results["test_output"] = result.stdout + result.stderr

    except subprocess.TimeoutExpired:
        results["test_output"] = "Tests timed out after 5 minutes"
    except FileNotFoundError:
        results["test_output"] = f"Test command not found: {' '.join(cmd)}"

    return results
```

### Step 5: Check Code Quality

```python
def check_code_quality(phase: str) -> dict:
    """Run linting and type checking."""

    results = {
        "linting_passed": False,
        "type_checking_passed": False,
        "issues": [],
    }

    # Python phases
    if phase in ["phase1-console-app", "phase2-fullstack-web"]:
        # Ruff linting
        try:
            result = subprocess.run(
                ["ruff", "check", "src/" if phase == "phase1-console-app" else "backend/"],
                capture_output=True,
                text=True,
            )
            results["linting_passed"] = result.returncode == 0
            if result.returncode != 0:
                results["issues"].append(f"Linting: {result.stdout}")
        except FileNotFoundError:
            results["issues"].append("Ruff not installed")

        # MyPy type checking
        try:
            result = subprocess.run(
                ["mypy", "src/" if phase == "phase1-console-app" else "backend/"],
                capture_output=True,
                text=True,
            )
            results["type_checking_passed"] = result.returncode == 0
            if result.returncode != 0:
                results["issues"].append(f"Type checking: {result.stdout}")
        except FileNotFoundError:
            results["issues"].append("MyPy not installed")

    # TypeScript phases
    elif phase in ["phase3-ai-chatbot"]:
        try:
            result = subprocess.run(
                ["npm", "run", "lint", "--prefix", "frontend"],
                capture_output=True,
                text=True,
            )
            results["linting_passed"] = result.returncode == 0
        except FileNotFoundError:
            results["issues"].append("npm not found")

    return results
```

### Step 6: Validate Demo Video

```python
def validate_demo_video(phase: str) -> dict:
    """Check demo video exists and meets requirements."""

    video_patterns = [
        f"docs/{phase}/demo.mp4",
        f"docs/{phase}/demo.mov",
        f"docs/demos/{phase}.mp4",
        f"README.md",  # Check for video link
    ]

    results = {
        "video_exists": False,
        "video_path": None,
        "video_linked_in_readme": False,
    }

    # Check for video file
    for pattern in video_patterns:
        if os.path.exists(pattern):
            results["video_exists"] = True
            results["video_path"] = pattern
            break

    # Check README for video link
    if os.path.exists("README.md"):
        with open("README.md", "r") as f:
            readme = f.read()
            if "demo" in readme.lower() or "video" in readme.lower():
                results["video_linked_in_readme"] = True

    return results
```

### Step 7: Generate Validation Report

```python
def generate_transition_report(
    from_phase: str,
    to_phase: str,
    artifacts: dict,
    spec_valid: dict,
    tasks: dict,
    tests: dict,
    quality: dict,
    demo: dict,
) -> str:
    """Generate comprehensive transition validation report."""

    report = f"""
# Phase Transition Validation Report

**From**: {from_phase}
**To**: {to_phase}
**Date**: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

---

## Artifacts Check

- [{"x" if artifacts["spec"] else " "}] spec.md exists
- [{"x" if artifacts["plan"] else " "}] plan.md exists
- [{"x" if artifacts["tasks"] else " "}] tasks.md exists
- [{"x" if artifacts["has_phrs"] else " "}] PHRs created ({artifacts["phrs_count"]} found)

## Spec Validation

- [{"x" if spec_valid["valid"] else " "}] All required sections present
{"- Missing sections: " + ", ".join(spec_valid["missing_sections"]) if spec_valid["missing_sections"] else ""}

## Tasks Completion

- Total tasks: {tasks["total"]}
- Completed: {tasks["completed"]}
- Completion rate: {tasks["completion_rate"]:.0%}
- [{"x" if tasks["all_complete"] else " "}] All tasks complete

## Tests

- [{"x" if tests["tests_run"] else " "}] Tests executed
- [{"x" if tests["tests_passed"] else " "}] All tests passed

## Code Quality

- [{"x" if quality["linting_passed"] else " "}] Linting passed
- [{"x" if quality["type_checking_passed"] else " "}] Type checking passed
{"- Issues: " + "; ".join(quality["issues"]) if quality["issues"] else ""}

## Demo Video

- [{"x" if demo["video_exists"] else " "}] Demo video exists
- [{"x" if demo["video_linked_in_readme"] else " "}] Linked in README

---

## Overall Status

"""

    # Determine if transition is approved
    all_checks = [
        artifacts["spec"] and artifacts["plan"] and artifacts["tasks"],
        artifacts["has_phrs"],
        spec_valid["valid"],
        tasks["all_complete"],
        tests["tests_passed"],
        quality["linting_passed"],
        demo["video_exists"] or demo["video_linked_in_readme"],
    ]

    if all(all_checks):
        report += "✅ **APPROVED** - All requirements met. Ready to proceed to " + to_phase
    else:
        report += "❌ **BLOCKED** - Requirements not met. Complete the following before proceeding:\n\n"

        if not artifacts["spec"]:
            report += "- Create spec.md\n"
        if not artifacts["plan"]:
            report += "- Create plan.md\n"
        if not artifacts["tasks"]:
            report += "- Create tasks.md\n"
        if not artifacts["has_phrs"]:
            report += "- Create PHRs for key decisions\n"
        if not spec_valid["valid"]:
            report += "- Complete spec.md with missing sections\n"
        if not tasks["all_complete"]:
            report += f"- Complete remaining {tasks['total'] - tasks['completed']} tasks\n"
        if not tests["tests_passed"]:
            report += "- Fix failing tests\n"
        if not quality["linting_passed"]:
            report += "- Fix linting issues\n"
        if not (demo["video_exists"] or demo["video_linked_in_readme"]):
            report += "- Record and link demo video\n"

    return report
```

### Step 8: Execute Validation

```python
def validate_phase_transition(
    from_phase: str,
    to_phase: str,
    skip_demo_check: bool = False,
) -> tuple[bool, str]:
    """
    Validate phase transition readiness.

    Returns:
        (approved, report)
    """
    print(f"🔍 Validating transition: {from_phase} → {to_phase}")

    # Run all checks
    artifacts = check_phase_artifacts(from_phase)
    spec_valid = validate_spec(f"specs/{from_phase}/spec.md") if artifacts["spec"] else {"valid": False, "missing_sections": ["spec.md not found"]}
    tasks = validate_tasks_completion(f"specs/{from_phase}/tasks.md") if artifacts["tasks"] else {"total": 0, "completed": 0, "all_complete": False, "completion_rate": 0}
    tests = run_phase_tests(from_phase)
    quality = check_code_quality(from_phase)
    demo = validate_demo_video(from_phase) if not skip_demo_check else {"video_exists": True, "video_linked_in_readme": True}

    # Generate report
    report = generate_transition_report(
        from_phase,
        to_phase,
        artifacts,
        spec_valid,
        tasks,
        tests,
        quality,
        demo,
    )

    # Determine approval
    approved = all([
        artifacts["spec"] and artifacts["plan"] and artifacts["tasks"],
        artifacts["has_phrs"],
        spec_valid["valid"],
        tasks["all_complete"],
        tests["tests_passed"],
        quality["linting_passed"],
        demo["video_exists"] or demo["video_linked_in_readme"] or skip_demo_check,
    ])

    # Save report
    report_path = f"specs/{from_phase}/transition-validation-report.md"
    with open(report_path, "w") as f:
        f.write(report)

    print(f"\n📄 Report saved: {report_path}")
    print(report)

    return approved, report
```

## Output Artifacts

1. **Validation Report**: `specs/<phase>/transition-validation-report.md`
2. **Console Output**: Detailed validation results

## Validation Rules

### MUST Pass (All):
- All phase artifacts exist
- Spec is complete
- All tasks marked complete
- Tests pass (100% for current phase)
- Code quality checks pass
- Demo video recorded
- PHRs created for key decisions

### CAN Skip:
- Demo video check (with `skip_demo_check=true`)

## Example Usage

```python
# Validate Phase I → Phase II transition
approved, report = validate_phase_transition(
    from_phase="phase1-console-app",
    to_phase="phase2-fullstack-web",
)

if approved:
    print("✅ Proceeding to Phase II")
    # Orchestrator loads Phase II agents
else:
    print("❌ Cannot proceed. Fix issues first.")
    # Show blockers to user
```

## Success Indicators

- ✅ All artifacts present
- ✅ Spec complete and validated
- ✅ All tasks done
- ✅ Tests pass
- ✅ Code quality high
- ✅ Demo video ready
- ✅ PHRs document key decisions
- ✅ Transition approved

## Failure Modes & Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Missing spec | Run `/sp.specify` to create |
| Missing plan | Run `/sp.plan` to create |
| Missing tasks | Run `/sp.tasks` to create |
| Tasks incomplete | Continue implementation |
| Tests failing | Debug and fix |
| No PHRs | Run `/sp.phr` for key exchanges |
| No demo | Record demo video |

## Related Skills

- **create-phr**: Documents phase work for validation
- **create-phase1-spec** (and Phase II, III, etc.): Creates specs validated here

## Integration with Orchestrator

The Orchestrator Agent uses this skill to:
1. Prevent premature phase advancement
2. Ensure quality gates are met
3. Provide clear feedback on blockers
4. Maintain hackathon standards

**Critical**: User cannot override failed validation without fixing issues.

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Hackathon**: Todo Spec-Driven Development
