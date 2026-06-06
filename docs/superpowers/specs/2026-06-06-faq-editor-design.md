# FAQ Editor — Design Spec
_2026-06-06_

## Overview

Add a structured Q&A editor to the operator dashboard settings panel. Operators define common question/answer pairs that Ringo knows cold during calls. The existing free-form knowledge base textarea is kept below it unchanged.

---

## 1. Database

New JSONB column on the `operators` table:

```sql
ALTER TABLE operators ADD COLUMN structured_faqs JSONB DEFAULT '[]'::jsonb;
```

Migration file: `supabase/005_add_structured_faqs.sql`

Schema: `Array<{ q: string; a: string }>`

No limit on number of entries.

---

## 2. UI — SettingsPanel

**Location:** New section in `SettingsPanel.tsx`, inserted between "Questions to ask every caller" and the "Import from website" / knowledge base block.

**Section heading:** "Common questions & answers"
**Subtitle:** "Ringo will know these cold — add as many as you like."

**Each FAQ pair (stacked layout):**
- `Question` label + full-width text input
- `Answer` label + full-width textarea (~3 rows, resizable)
- Small "Remove" link right-aligned below the answer
- Thin divider between pairs

**Below all pairs:** Full-width `+ Add question` button (dashed border style, consistent with dashboard aesthetic).

**Below the FAQ section:** Existing "Import knowledge from your website" + "Knowledge base" textarea, unchanged.

**Save:** All FAQ pairs save together with existing settings via the existing "Save settings" button. No separate save action.

**State:** `structuredFaqs` is a `{ q: string; a: string }[]` array managed in React state alongside the existing fields.

---

## 3. System Prompt — stream.ts

In `buildSystemPrompt()`, when `operator.structured_faqs` is a non-empty array, format and inject the pairs before the free-form `faq` text:

```
Frequently asked questions:
Q: What's included in the tour price?
A: All equipment, guide, lunch, and transport. Tips not included.

Q: Do I need experience?
A: No — we cater to all skill levels.

About [Business] and their tours:
[existing faq free-form text]
```

If `structured_faqs` is empty or null, system prompt is unchanged.

---

## 4. Settings API — api/settings.ts

Add `structured_faqs` to the accepted body fields. Type: `Array<{ q: string; a: string }> | undefined`.

When present, save to the `structured_faqs` column. Validate that it is an array before writing (reject non-array values with a 400). Strip any pairs where `q` is an empty string before saving — blank entries should not reach the database or the system prompt.

---

## 5. Dashboard Page — page.tsx

Read `operator.structured_faqs` from the Supabase query (already selects `*`). Pass as `initialStructuredFaqs` prop to `SettingsPanel`. Default to `[]` if null.

---

## Out of Scope

- Drag-to-reorder FAQ pairs
- Per-FAQ enable/disable toggle
- Import FAQs from the website scraper (scraper continues to populate the free-form knowledge base only)
