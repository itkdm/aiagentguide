# Article Illustration Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repository-specific skill that plans article illustrations for `aiagentguide`, recommends suitable image insertion points, and generates style-consistent prompts with minimal on-image text.

**Architecture:** Create one repo-local skill folder with a concise `SKILL.md` workflow and two reference files: one for section-specific visual systems and one for reusable image templates/output format. Keep the skill focused on analysis and prompt generation, not automatic image creation.

**Tech Stack:** Markdown skill files, repo-local references, skill-creator initialization scripts

---

### Task 1: Initialize the skill scaffold

**Files:**
- Create: `.codex/skills/article-illustration-planner/SKILL.md`
- Create: `.codex/skills/article-illustration-planner/agents/openai.yaml`
- Create: `.codex/skills/article-illustration-planner/references/`

- [ ] Run the skill initializer in the repo-local `.codex/skills` directory with references enabled.
- [ ] Confirm the scaffold exists and matches the requested skill name.

### Task 2: Write the repo-specific skill workflow

**Files:**
- Modify: `.codex/skills/article-illustration-planner/SKILL.md`

- [ ] Add triggering guidance tied specifically to `aiagentguide`.
- [ ] Define the workflow for locating insertion points, selecting image types, and generating stable prompts.
- [ ] Add strong rules for minimal text, section consistency, and avoiding “text poster” style images.

### Task 3: Add section style references

**Files:**
- Create: `.codex/skills/article-illustration-planner/references/sections.md`
- Create: `.codex/skills/article-illustration-planner/references/templates.md`

- [ ] Document the visual language for major sections such as `frameworks`, `rag`, `llm`, `principles`, `getting-started`, `tools`, `tutorials`, and `interviews`.
- [ ] Define reusable image templates such as header image, comparison image, flow image, layered concept image, and metaphor image.
- [ ] Standardize prompt scaffolding so repeated requests produce similar style.

### Task 4: Validate the skill

**Files:**
- Validate: `.codex/skills/article-illustration-planner/`

- [ ] Run `quick_validate.py` on the new skill.
- [ ] Review generated metadata and fix any mismatches between `SKILL.md` and references.
