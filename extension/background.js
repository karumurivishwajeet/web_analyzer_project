chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("Backgorund recieved message:", msg);

    if (msg.action === 'download') {
        console.log("Starting download...")
        chrome.downloads.download({ url: msg.url, filename: msg.filename });
    }
});