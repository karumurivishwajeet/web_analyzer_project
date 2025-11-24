chrome.runtime.onMessage.addListener((msg, sender) => {
    console.log("Backgorund recieved message:", msg);

    if (msg.action === 'download') {
        console.log("Starting download...")
        chrome.downloads.download({ url: msg.url, filename: msg.filename });
    }

    if (msg.action === 'openReport'){
        //Generate unique key (timestamp)
        const key = `report_${Date.now()}`;

        //Store the report object in chrome.storage.local

        const item = {};
        item[key] = msg.report; //msg.report is the JSON object
        chrome.storage.local.set(item, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving report:', chrome.runtime.lastError);
                return;
            }

            const reportUrl = chrome.runtime.getURL(`report.html?key=${encodeURIComponent(key)}`);
            chrome.tabs.create({url: reportUrl}, (tab) => {
                console.log('Opened report tab', tab && tab.id);
            });
        });
    }
});