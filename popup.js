const scrapeAnswer = document.getElementById("scrapeAnswer");
const answerBox = document.getElementById("answerBox");
const keywordsInput = document.getElementById("keywordsInput");
const missingKeywords = document.getElementById("missingKeywords");
const keywordButton = document.getElementById("addKeywords");

scrapeAnswer.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: grade,
    },
    (results) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      const answer = results[0].result;
      answerBox.textContent = answer;
      checkKeywords(); // Call checkKeywords after getting the answer
    }
  );
});

keywordButton.addEventListener("click", () => {
  checkKeywords(); // Call checkKeywords when the keyword list is changed
});

function checkKeywords() {
  const keywords = keywordsInput.value
    .toLowerCase()
    .split(",")
    .map((keyword) => keyword.trim());
  const answerText = answerBox.textContent;

  // Reset the answerBox's innerHTML to its text content to remove any existing highlights
  answerBox.innerHTML = answerText;

  const notFoundKeywords = [];
  keywords.forEach((keyword) => {
    if (answerText.toLowerCase().includes(keyword)) {
      const keywordRegex = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
      answerBox.innerHTML = answerBox.innerHTML.replace(
        keywordRegex,
        '<span class="keyword-highlight">$1</span>'
      );
    } else {
      notFoundKeywords.push(keyword);
    }
  });

  missingKeywords.innerHTML = notFoundKeywords.length
    ? "Missing keywords: " + notFoundKeywords.join(", ")
    : "All keywords found";
}

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function grade() {
  const answer = document.getElementsByClassName("form--textArea")[0].innerHTML.replace(
    /^<span>|<\/span>$/g,
    ""
  );
  return answer;
}