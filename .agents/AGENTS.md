# Project Rules for Missing Frame

These are strict technical guidelines for all AI agents developing the Missing Frame codebase.

## 1. Test-Driven Development (TDD)
- All new features and bug fixes must be developed strictly using Test-Driven Development (TDD).
- Write failing unit/integration tests *before* writing any product logic.
- Implement the minimal amount of code to make the tests pass, then refactor.

## 2. Test Directory Isolation
- Tests must reside in their own dedicated directory at the root of the project (`/tests/`).
- Do NOT place test files (e.g., `*.test.ts`, `*.spec.tsx`) inside the product code directories (such as `/src/` or `/functions/`).
- Keep `/src/` exclusively for source code and production assets.

## 3. Code Quality & Limit Thresholds
- **500-Line Limit**: Any source file (e.g., `.tsx`, `.ts`, `.css`) must not exceed 500 lines of code.
- If a file exceeds or is approaching 500 lines upon finishing a feature, evaluate and execute a modular refactoring (extracting components, custom hooks, or utility services) to keep files concise, readable, and maintainable.

## 4. Web Development Code Smells & Refactoring
AI agents must actively review the code for common web development smells and refactor them if found:
- **Nontrivial Inline Styles**: Nontrivial layouts and styles (e.g., layout grids, borders, margins, padding, flex alignments) must reside in CSS classes inside the stylesheet, not inside React `style={{ ... }}` objects. Inline styles are reserved ONLY for highly dynamic properties (e.g., backdrop image URLs, dynamic sizing calculated at runtime, coordinates).
- **Missing Accessibility (a11y)**: Buttons must have `aria-label` or textual context; form elements must have matching `<label>` wrappers or references; interactive components must support keyboard focus and custom `:focus-visible` outline treatments.
- **Redundant React State**: Derived data (e.g., calculating items count, status text formatting, simple boolean checks) must be calculated on-the-fly during rendering, not stored as separate states that require sync effects.
- **Tight Coupling & Monolithic Files**: Split services, hooks, and presentation components into dedicated files to ensure single-responsibility behavior.
