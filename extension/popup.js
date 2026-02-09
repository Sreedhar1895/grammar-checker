chrome.storage.local.get("apiKey", ({ apiKey }) => {
  const statusEl = document.getElementById("status");
  const instructionsEl = document.getElementById("instructions");
  const optionsBtn = document.getElementById("optionsBtn");
  const changeKeyBtn = document.getElementById("changeKeyBtn");

  if (apiKey) {
    statusEl.textContent = "Ready";
    statusEl.className = "status ready";
    instructionsEl.textContent =
      "Select text → right-click → 'Check grammar' (or Ctrl+Shift+G)";
    changeKeyBtn.style.display = "block";
    changeKeyBtn.onclick = () => chrome.runtime.openOptionsPage();
  } else {
    statusEl.textContent = "API key not set";
    statusEl.className = "status not-set";
    instructionsEl.textContent = "Set your Anthropic API key to use the grammar checker.";
    optionsBtn.style.display = "block";
    optionsBtn.onclick = () => chrome.runtime.openOptionsPage();
  }
});
