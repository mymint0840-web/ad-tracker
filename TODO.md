# TODO — ad-tracker

## Hygiene backlog

- [ ] **Migrate FormSearchSelect to `@base-ui/react` Combobox** (already in deps)
  - Current implementation in `src/components/entries/entry-form.tsx` fights Radix Dialog primitives on three axes (FocusScope, pointer-events body lock, outside-interaction detection) and ended up as a split-tree hack: inline input + portaled options list with a data attribute marker.
  - Base UI Combobox was designed for this case — it knows how to coexist with dialog focus traps, handles its own positioning, and removes the need for the `data-form-search-select-portal` escape hatch in `DialogContent` handlers.
  - Tracked during the dropdown bug fix chain 2026-04-11 (commits `1cf5c0b`, `868be3b`, `fa4492a`, plus the split-render commit that replaces this entry).
