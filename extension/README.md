# Grammar Checker - Chrome Extension

Chrome extension for the grammar checker. Select text on any page, press the shortcut, and get Claude-powered corrections.

## Setup

1. **Load the extension in Chrome**
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

2. **Add your API key**
   - Click the extension icon (or right-click → Options)
   - Enter your Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
   - Click Save

## Usage

1. Select text on any webpage
2. Press **Ctrl+Shift+G** (Windows/Linux) or **Cmd+Shift+G** (Mac)
3. A popup appears with the correction and options:
   - **Accept** – Replace the selected text with the correction
   - **Reject** – Close the popup, keep original
   - **Fine-tune** – Add feedback (e.g. "make it more formal") for a refined result

## Shortcut

You can change the shortcut: `chrome://extensions` → find Grammar Checker → "Keyboard shortcuts".
