(async function () {
    //Collect basic SEO info
    const seo = {
        title: document.title || null,
        metaDescription: document.querySelector('meta[name="description"]')?.content || null,
        hasH1: !!document.querySelector('h1')
    };

    //Collect Links (first 30)
    const links = Array.from(document.querySelectorAll('a')).map(a => a.href).filter(Boolean).slice(0,30);

    //Collect JSON report
    const report = {url: location.href, timestamp: Date.now(), seo, linksSample: links};

    // Download JSON file 
    const blob = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const filename = `report-${new URL(location.href).hostname}-${Date.now()}.json`;

    chrome.runtime.sendMessage({action: 'download', url, filename});

})();