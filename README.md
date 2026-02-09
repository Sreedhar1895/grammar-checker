# Grammar Checker

Terminal-based grammar checker using Claude. Evaluates text and returns a grammatically corrected version with options to accept, reject, or fine-tune results.

## Setup

1. Copy `.env.example` to `.env` and add your Anthropic API key:
   ```bash
   cp .env.example .env
   # Edit .env: ANTHROPIC_API_KEY=sk-ant-...
   ```
   Get a key at [console.anthropic.com](https://console.anthropic.com)

2. No pip install required—uses Python standard library only.

## Usage

```bash
python3 grammar_checker.py
```

Type or paste text, press Enter twice. You'll get the corrected version and can:
- **(a)ccept** – Use the correction
- **(r)eject** – Keep original
- **(f)ine-tune** – Add feedback (e.g. "make it more formal") for a refined result

**Pipe text** (non-interactive):
```bash
echo "This is an test." | python3 grammar_checker.py
```

## Chrome Extension

A Chrome extension is in the `extension/` folder. Load it unpacked, add your API key in options, then:
- Select text on any page
- Press **Ctrl+Shift+G** (or **Cmd+Shift+G** on Mac)
- Accept, reject, or fine-tune the correction

See `extension/README.md` for setup.

## Optional

Set a custom model in `.env`:
```
GRAMMAR_MODEL=claude-sonnet-4-5-20250929
```
