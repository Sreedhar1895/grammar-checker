document.getElementById("save").onclick = async () => {
  const apiKey = document.getElementById("apiKey").value.trim();
  if (!apiKey) {
    document.getElementById("status").textContent = "Please enter an API key";
    return;
  }
  await chrome.storage.local.set({ apiKey });
  document.getElementById("status").textContent = "Saved!";
  setTimeout(() => (document.getElementById("status").textContent = ""), 2000);
};

chrome.storage.local.get("apiKey", ({ apiKey }) => {
  if (apiKey) {
    document.getElementById("apiKey").value = apiKey;
  }
});
