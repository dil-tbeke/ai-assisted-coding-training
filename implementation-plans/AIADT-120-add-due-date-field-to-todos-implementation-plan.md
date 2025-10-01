# AIADT-120 — Add Due Date field to todos (Implementation Plan)

## Objective and Non-goals

- Objective: Extend the Todo feature to optionally capture and display a due date for each todo, with basic validation and clear UI affordances.
- Non-goals:
  - Notifications, reminders, calendar sync, or auto-sorting by due date
  - Backend/API persistence
  - Complex timezone normalization beyond client-local formatting

## Architecture / Design Overview

- Data model: Add optional `dueDate?: string` (ISO 8601) to `Todo` interface.
- State management: Propagate `dueDate` through context methods `addTodo` and `editTodo` without altering existing behavior.
- UI:
  - In `TodoModal`, provide a date picker to set or update the due date (optional field). Validate inputs and treat missing/invalid values as `undefined`.
  - In `TodoItem`, show the formatted due date (e.g., via `date-fns` `format(new Date(dueDate), 'PP')`). Optionally indicate overdue with a subtle styling.
- Localization Provider: Wrap the app with `LocalizationProvider` using `AdapterDateFns` to support MUI X Date Pickers.
- Persistence: Not implemented currently; skip `sessionStorage` changes for this codebase.

## Detailed Steps (file-by-file)

1. Update types

- File: `src/types/Todo.ts`
  - Add field: `dueDate?: string` (ISO 8601). Keep existing `createdAt: Date` unchanged.

2. Update context

- File: `src/contexts/TodoContext.tsx`
  - `addTodo(title: string, description: string, dueDate?: string)` — extend signature to optionally take `dueDate`. When constructing the new todo, pass `dueDate` if provided and valid; otherwise omit it.
  - `editTodo(id: string, updates: Partial<Todo>)` — ensure `updates` can include `dueDate` and is merged into the matched todo.
  - Validation approach: The modal will ensure validity before passing values. Context should accept `dueDate` as optional and not enforce beyond basic typing (defensive: if an obviously invalid string is detected, treat as `undefined`).

3. Add DatePicker to the modal

- File: `src/components/TodoModal/TodoModal.tsx`
  - Add internal state for `dueDate` (string | undefined).
  - Render MUI X DatePicker (from `@mui/x-date-pickers`) with `value` mapped to a Date or `null`, `onChange` updating the internal `dueDate` as ISO string, or `undefined` if cleared or invalid.
  - Validation:
    - Title remains required.
    - For due date, accept valid calendar dates; allow past dates; on invalid/parsing failure, treat as `undefined`.
  - Submission:
    - Create: `addTodo(title, description, dueDate)`
    - Edit: `editTodo(id, { title, description, completed, dueDate })`
  - Accessibility: keep labels/aria consistent; add `data-testid` for the due date input as needed (e.g., `due-date-picker`).

4. Display due date in list items

- File: `src/components/TodoList/TodoItem.tsx`
  - If `todo.dueDate` exists, render formatted date beneath the description (e.g., `Due: Jan 2, 2026`).
  - Optional: Style overdue dates subtly (e.g., use `color: 'error.main'`) when `new Date(todo.dueDate) < new Date()` and `!todo.completed`.

5. Wrap app with LocalizationProvider

- File: `src/App.tsx`
  - Wrap the existing tree inside `LocalizationProvider` with `AdapterDateFns`.
  - Example structure:
    - `<LocalizationProvider dateAdapter={AdapterDateFns}> ...current App JSX... </LocalizationProvider>`

6. Dependencies

- Add runtime deps:
  - `@mui/x-date-pickers`
  - `date-fns`
- Already present: `@mui/material`
- Install:
  - `npm install @mui/x-date-pickers date-fns`

## Data / Schema Changes and Migrations

- Data shape change: `Todo` gains `dueDate?: string`.
- No migrations required (no persistence currently in codebase). Ensure safe handling for todos without `dueDate`.

## API Contracts and External Integrations

- No backend/API changes.
- External UI lib: `@mui/x-date-pickers` DatePicker with `LocalizationProvider` (`AdapterDateFns`).
- Formatting via `date-fns` `format(date, 'PP')`.

## Feature Flags / Config Changes

- None required.

## Tests (unit/integration)

- Update existing tests and add new coverage:
  - `src/__tests__/TodoModal.test.tsx`
    - Create mode: date picker renders; selecting a date includes `dueDate` in `addTodo` call; empty `dueDate` is permitted.
    - Edit mode: existing `dueDate` appears; can update/remove; submitting updates `editTodo` with expected `dueDate`.
  - `src/__tests__/TodoItem.test.tsx`
    - Renders formatted `dueDate` when present.
    - Overdue styling applied only when overdue and not completed.
  - `src/__tests__/TodoList.test.tsx`
    - Ensure list rendering remains stable with/without `dueDate`.
  - `src/__tests__/App.test.tsx`
    - App composes `LocalizationProvider` (smoke test) and renders without errors.
- Testing notes:
  - Use testing-library to interact with DatePicker; if complex, set value via controlled props and assert resulting calls.
  - Mock `Date.now()` if asserting overdue behavior.

## Telemetry / Monitoring

- None. Ensure no console errors in tests and during manual validation.

## Risks, Edge Cases, Rollback

- Risks:
  - Invalid date strings leading to runtime errors — mitigate via guards in modal when setting `dueDate`.
  - Timezone presentation inconsistencies — use client-local format only.
  - Third-party dependency compatibility — ensure versions compatible with current MUI.
- Edge cases:
  - Missing/empty `dueDate` — treat as `undefined` and do not display date.
  - Past dates allowed; completed items should not show overdue styling.
- Rollback:
  - Revert `Todo` type change and component edits; remove added deps from `package.json`.

## Acceptance Criteria Mapping

- Optional due date on create — DatePicker in modal create path; `addTodo` accepts `dueDate`.
- Existing todos without due date unaffected — Conditional rendering; defaults safe.
- Edit shows current due date; can change/remove — Modal edit path wired to `editTodo` with `dueDate`.
- Due date shows in list — `TodoItem` displays formatted `dueDate`.
- Validation prevents clearly invalid dates — Modal sanitizes, treats unparsable as `undefined`.
- Persistence if present — Not applicable here (no storage); safe if added later.
- All tests pass, coverage baseline maintained — Update/add tests as above.

## Developer Task Checklist (ready-to-run)

1. Install deps: `npm install @mui/x-date-pickers date-fns`
2. Edit `src/types/Todo.ts`: add `dueDate?: string`
3. Edit `src/contexts/TodoContext.tsx`: extend `addTodo` and allow `dueDate` in `editTodo`
4. Edit `src/components/TodoModal/TodoModal.tsx`: add DatePicker, state, validation, wire to context
5. Edit `src/components/TodoList/TodoItem.tsx`: display formatted due date and optional overdue styling
6. Edit `src/App.tsx`: wrap app with `LocalizationProvider` (`AdapterDateFns`)
7. Update tests in `src/__tests__`: modal create/edit flows; item rendering; app smoke
8. Run tests: `npm test`
9. Manual validation: create/edit todos with and without due date; confirm UI rendering; no console errors

---

References

- Jira: AIADT-120 — Add Due Date field to todos
- MUI X Date Pickers: `@mui/x-date-pickers`
- Date-fns: `format(new Date(date), 'PP')`
