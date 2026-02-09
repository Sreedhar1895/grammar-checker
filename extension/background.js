const GRAMMAR_SYSTEM_PROMPT =
  "You are a grammar and style proofreader. Correct the user's text for grammar, spelling, punctuation, and clarity. Preserve the original meaning, tone, and intent. Return ONLY the corrected text—no explanations, no markdown, no quotes around it.";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "check-grammar",
    title: "Check grammar",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "check-grammar" && tab?.id && info.selectionText?.trim()) {
    if (tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://")) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
      chrome.tabs.sendMessage(tab.id, { action: "showGrammarChecker" });
    } catch (err) {
      console.error("Grammar Checker:", err);
    }
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "check-grammar") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  if (tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://") || tab.url?.startsWith("edge://")) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    chrome.tabs.sendMessage(tab.id, { action: "showGrammarChecker" });
  } catch (err) {
    console.error("Grammar Checker:", err);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkGrammar") {
    checkGrammar(request.text, request.userFeedback, request.previousCorrection)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

async function checkGrammar(text, userFeedback, previousCorrection) {
  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (!apiKey) {
    throw new Error("API key not set. Click the extension icon → Options to add your Anthropic API key.");
  }

  let prompt;
  if (userFeedback && previousCorrection) {
    prompt = `Original text:\n${text}\n\nCorrected version:\n${previousCorrection}\n\nUser feedback to refine the correction: "${userFeedback}"\n\nPlease produce an improved version based on this feedback. Return ONLY the refined text—no explanations, no markdown, no quotes around it.`;
  } else {
    prompt = text;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: GRAMMAR_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.find((b) => b.type === "text");
  return content?.text?.trim() || text;
}
