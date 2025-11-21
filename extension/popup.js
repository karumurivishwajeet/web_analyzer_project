document.getElementById('analyze').addEventListener('click', async () => {
    //Get the current active tab
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    //Inject the content script into the page
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content-script.js']
    })
    .then(() => console.log("Content script injected"))
    .catch(err => console.error("Injection error:", err));
});