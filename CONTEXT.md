# Grammar Checker – Project Context

## Purpose

A grammar checker app that monitors text input and offers: (a) grammar suggestions, (b) alternative phrasings, (c) fine-tuning with additional user input. Starting with terminal interaction; browser extension planned later.

---

## Tech Stack

- **Runtime**: Python 3.10+
- **Backend**: Claude (Anthropic API)
- **CLI**: Standard library only (urllib for API calls)

---

## Structure

- `grammar_checker.py` – Main CLI entry point
- `llm_checker.py` – Claude API integration

---

## Current Focus

Building terminal-based interactive grammar checker with options a, b, c.

---

## Roadmap

- [x] Terminal CLI with text input
- [ ] Grammar check + suggestions (a, b, c)
- [ ] Browser extension (monitor typing, keyboard shortcuts)
- [ ] Fine-tuning with user context
