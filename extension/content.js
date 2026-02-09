let grammarPopup = null;
let storedRange = null;

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "showGrammarChecker") {
    showGrammarChecker();
  }
});

function showGrammarChecker() {
  const selection = window.getSelection();
  const text = selection?.toString()?.trim();

  if (!text) {
    showToast("Select some text first, then press Ctrl+Shift+G (Cmd+Shift+G on Mac)");
    return;
  }

  storedRange = selection.getRangeAt(0).cloneRange();
  removeExistingPopup();
  createPopup(text);
}

function createPopup(originalText) {
  grammarPopup = document.createElement("div");
  grammarPopup.id = "grammar-checker-popup";
  grammarPopup.innerHTML = `
    <div class="gc-container">
      <div class="gc-header">Grammar Checker</div>
      <div class="gc-status">Checking...</div>
      <div class="gc-result" style="display:none"></div>
      <div class="gc-actions" style="display:none">
        <button class="gc-btn gc-accept">Accept</button>
        <button class="gc-btn gc-reject">Reject</button>
        <button class="gc-btn gc-finetune">Fine-tune</button>
      </div>
      <div class="gc-finetune-input" style="display:none">
        <input type="text" placeholder="e.g. make it more formal, I meant X...">
        <button class="gc-btn gc-submit">Refine</button>
      </div>
    </div>
  `;

  grammarPopup.querySelector("link")?.remove();
  const style = document.createElement("style");
  style.textContent = `
    #grammar-checker-popup {
      position: fixed;
      z-index: 2147483647;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .gc-container {
      min-width: 280px;
      max-width: 400px;
      background: #1e1e1e;
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      padding: 12px;
      font-size: 14px;
    }
    .gc-header {
      font-weight: 600;
      margin-bottom: 8px;
    }
    .gc-status, .gc-result {
      margin-bottom: 12px;
      line-height: 1.5;
    }
    .gc-result {
      background: #2d2d2d;
      padding: 8px;
      border-radius: 4px;
      max-height: 120px;
      overflow-y: auto;
    }
    .gc-actions, .gc-finetune-input {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .gc-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    .gc-accept { background: #0d9488; color: white; }
    .gc-reject { background: #444; color: white; }
    .gc-finetune { background: #6366f1; color: white; }
    .gc-submit { background: #6366f1; color: white; }
    .gc-btn:hover { opacity: 0.9; }
    .gc-finetune-input input {
      flex: 1;
      min-width: 120px;
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px solid #444;
      background: #2d2d2d;
      color: #fff;
      font-size: 13px;
    }
  `;
  grammarPopup.appendChild(style);

  document.body.appendChild(grammarPopup);
  positionNearSelection();

  const statusEl = grammarPopup.querySelector(".gc-status");
  const resultEl = grammarPopup.querySelector(".gc-result");
  const actionsEl = grammarPopup.querySelector(".gc-actions");

  chrome.runtime.sendMessage(
    { action: "checkGrammar", text: originalText },
    (response) => {
      if (chrome.runtime.lastError) {
        statusEl.textContent = "Error: " + chrome.runtime.lastError.message;
        return;
      }
      if (response?.error) {
        statusEl.textContent = "Error: " + response.error;
        return;
      }

      grammarPopup.dataset.originalText = originalText;
      grammarPopup.dataset.correctedText = response;

      statusEl.textContent = response !== originalText ? "Correction ready" : "No changes suggested";
      resultEl.textContent = response;
      resultEl.style.display = "block";
      actionsEl.style.display = "flex";

      grammarPopup.querySelector(".gc-accept").onclick = () =>
        acceptCorrection(grammarPopup.dataset.correctedText);
      grammarPopup.querySelector(".gc-reject").onclick = () => removePopup();
      grammarPopup.querySelector(".gc-finetune").onclick = () => showFinetuneInput();
    }
  );

  document.addEventListener("click", handleOutsideClick);
}

function showFinetuneInput() {
  const finetuneEl = grammarPopup.querySelector(".gc-finetune-input");
  finetuneEl.style.display = "flex";
  finetuneEl.querySelector("input").focus();

  grammarPopup.querySelector(".gc-submit").onclick = () => {
    const feedback = finetuneEl.querySelector("input").value.trim();
    if (!feedback) return;

    grammarPopup.querySelector(".gc-status").textContent = "Refining...";
    grammarPopup.querySelector(".gc-result").style.display = "none";
    grammarPopup.querySelector(".gc-actions").style.display = "none";
    finetuneEl.style.display = "none";

    chrome.runtime.sendMessage(
      {
        action: "checkGrammar",
        text: grammarPopup.dataset.originalText,
        userFeedback: feedback,
        previousCorrection: grammarPopup.dataset.correctedText,
      },
      (response) => {
        if (response?.error) {
          grammarPopup.querySelector(".gc-status").textContent = "Error: " + response.error;
          return;
        }
        grammarPopup.dataset.correctedText = response;
        grammarPopup.querySelector(".gc-status").textContent = "Refined";
        grammarPopup.querySelector(".gc-result").textContent = response;
        grammarPopup.querySelector(".gc-result").style.display = "block";
        grammarPopup.querySelector(".gc-actions").style.display = "flex";
        finetuneEl.querySelector("input").value = "";
      }
    );
  };
}

function acceptCorrection(correctedText) {
  if (!storedRange) return;

  try {
    storedRange.deleteContents();
    const textNode = document.createTextNode(correctedText);
    storedRange.insertNode(textNode);
    storedRange.collapse(false);
  } catch (e) {
    showToast("Could not replace text on this page");
  }
  removePopup();
}

function removePopup() {
  removeExistingPopup();
  storedRange = null;
}

function removeExistingPopup() {
  if (grammarPopup?.parentNode) {
    grammarPopup.parentNode.removeChild(grammarPopup);
  }
  grammarPopup = null;
  document.removeEventListener("click", handleOutsideClick);
}

function handleOutsideClick(e) {
  if (grammarPopup && !grammarPopup.contains(e.target)) {
    removePopup();
  }
}

function positionNearSelection() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  grammarPopup.style.top = `${rect.bottom + 8}px`;
  grammarPopup.style.left = `${rect.left}px`;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #1e1e1e; color: #fff; padding: 10px 20px; border-radius: 6px;
    font-family: system-ui; font-size: 14px; z-index: 2147483647;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
