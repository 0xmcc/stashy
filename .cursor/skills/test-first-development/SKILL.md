---
name: test-first-development
description: Enforces test-first implementation for bug fixes and features using a red-green-refactor workflow. Use when the user asks to fix a bug, add a feature, change behavior, or when test coverage is unclear.
---

# Test-First Development

## Goal

For bug fixes and feature work, write or update tests first so they fail for the intended reason before changing production code.

## Trigger Conditions

Apply this skill when:
- The user asks for a bug fix.
- The user asks for a new feature or behavior change.
- The change has unclear expected behavior and needs executable specification.

Do not skip this workflow unless the user explicitly asks to bypass tests.

## Workflow

1. **Define expected behavior**
   - Translate the request into concrete assertions.
   - Identify the narrowest test scope that proves the behavior.

2. **Write or update tests first**
   - Add focused tests that express the expected behavior.
   - Keep test setup minimal and deterministic.

3. **Run tests and confirm failure (Red)**
   - Run targeted tests for the changed area.
   - Verify the failure is caused by missing behavior, not test mistakes or environment issues.

4. **Implement minimal code to satisfy tests (Green)**
   - Make the smallest production change required to pass.
   - Avoid broad refactors during this step.

5. **Refactor safely (Refactor)**
   - Improve readability and structure while keeping tests green.
   - Re-run relevant test suites after refactoring.

## Guardrails

- Prefer targeted tests over broad end-to-end tests unless integration coverage is required.
- If no test harness exists, add the smallest viable test path instead of skipping tests.
- If tests cannot be run locally, explain exactly what was added and how to run it.
- Avoid unrelated code changes while introducing test coverage.

## Response Pattern

When reporting work, include:
1. Which tests were added/changed.
2. Evidence that tests failed before code changes.
3. The implementation change made to pass tests.
4. Final test result after the fix.
