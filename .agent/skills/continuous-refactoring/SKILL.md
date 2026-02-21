---
name: Continuous Refactoring Monitor
description: Identifies code smells and metrics to flag when refactoring is needed to keep the codebase clean and maintain velocity.
---

# Continuous Refactoring Monitor

## Context
Continuous refactoring is the ongoing process of improving the internal structure of code without changing its external behavior. As an agentic coding assistant, maintaining a healthy, testable, and clean codebase is critical. If technical debt and code smells accumulate, it becomes very difficult to add new features or make changes efficiently. This skill empowers you to detect and flag these issues proactively during development.

## Triggers
Activate this skill or consider its guidelines whenever you are about to:
- Modify an existing complex component or heavily coupled file.
- Add significant new logic (e.g., complex state, nested conditions, loops) to a file.
- Observe a file exceeding 150-200 lines of code.
- Notice logic duplicated across multiple components.
- Encounter areas of the codebase that are challenging to debug or decipher.

## Refactoring Metrics & Code Smells Indicator
Continuously monitor the code for these common code smells and metrics:

1. **Bloaters (Excessive Size)**
   - **Long Method/Function:** Methods exceeding 20-30 lines or containing complex nested conditional logic (`if`/`else`, `switch`).
   - **Large Class/Component:** Files with too many responsibilities, violating the Single Responsibility Principle.
   - **Long Parameter List:** Functions or constructors with more than 3-4 arguments.
   - **Data Clumps:** Groups of variables repeatedly passed around together.

2. **Couplers (Excessive Coupling)**
   - **Feature Envy:** Methods/components that access or rely on another component's inner workings heavily.
   - **Cyclic Dependencies:** Components relying on each other in a loop.

3. **Dispensables (Pointless Elements)**
   - **Duplicate Code:** Identical or highly similar logic appearing in multiple files (violates DRY).
   - **Dead Code:** Unused variables, imports, functions, or outdated logic.
   - **Over-commenting:** Extensive comments used to explain poorly written code instead of making the code self-explanatory.

4. **Change Preventers (Difficult to Change)**
   - **Divergent Change/Shotgun Surgery:** A single logical change requiring updates across many unrelated files or components.

5. **Naming Issues**
   - Vague, misleading, or overly generic names for variables, methods, and components.

## Actionable Steps when a Refinery is Needed

1. **Pause and Flag**: When you identify a significant code smell from the list above, pause your feature implementation.
2. **Inform the User**: State clearly: 
   *"I've noticed this component/file has accumulated some technical debt ([insert specific code smell, e.g., it's over 200 lines and handles both data fetching and complex UI state]). To ensure we can easily add new features later, I recommend doing a quick refactoring to keep the codebase clean before we proceed."*
3. **Propose the Solution**: Suggest a specific, manageable refactoring step.
   - e.g., *"We can extract this robust data-fetching logic into a generic custom hook."*
   - e.g., *"We should break this large UI component into three smaller, focused sub-components."*
4. **Safety Net**: Ensure there is a basic level of testing or manual verification available before starting the refactor. Never combine refactoring steps with new feature steps in the same commit. Focus exclusively on rearranging existing logic.

## Goal
By using this monitoring skill, we ensure the codebase remains maintainable, scalable, and a joy to work with, drastically speeding up future feature additions.
