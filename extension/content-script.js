(async function () {
    //Helpers
    const clamp = (v, a=0, b=100) => Math.max(a, Math.min(b, v));
    const safeLen = s=> (s ? String(s).trim().length : 0);

    //Collect basic SEO info
    /*const seo = {
        title: document.title || null,
        metaDescription: document.querySelector('meta[name="description"]')?.content || null,
        hasH1: !!document.querySelector('h1')
    };*/

    const title = document.title || null;
    const metaEl = document.querySelector('meta[name="description"]');
    const metaDescription = metaEl?.content || null;
    const hasH1 = !!document.querySelector('h1');

    //Images /alt
    const imgs = Array.from(document.querySelectorAll('img'));
    const imgCount = imgs.length;
    const imgWithAlt = imgs.filter(img => (img.getAttribute('alt') || '').trim() !== '').length;
    const imgAltRatio = imgCount === 0 ? 100 : Math.round((imgWithAlt / imgCount)*100);

    //Links (use count; fewer is often better for noise)
    const links = Array.from(document.querySelectorAll('a')).map(a => a.href).filter(Boolean);
    const linksCount = links.length;
    //map linksCount to 0..100 where 0 at >=200 links, 100 at 0 links, linear.
    const linkScore = clamp(Math.round((1 - Math.min(linksCount, 200)/200) * 100));
    
    //Collect Links (first 30)
    //const links = Array.from(document.querySelectorAll('a')).map(a => a.href).filter(Boolean).slice(0,30);

    //Basic accessibilty checks (simple heuristics)
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    const inputsWithLabel = inputs.filter(el => {
        //labeled if has aria-label or labelled <label for> or wrapeedlabel
        if ((el.getAttribute('aria-label') || '').trim()) return true;
        if (el.id && document.querySelector(`label[for="${el.id}"]`)) return true;
        if (el.closest('label')) return true;
        return false;
    }).length;
    const inputsCount = inputs.length;
    const allyScore = inputsCount === 0 ? 100 : Math.round((inputsWithLabel / inputsCount) * 100);

    //Title and meta scoring
    const titleLen = safeLen(title);
    //Title score: 100 if >=10 chars. linear from 0..10 -> 0..100
    const titleScore = clamp(Math.round(Math.min(titleLen/10,1)*100));

    const metaLen = safeLen(metaDescription);
    // meta ideal 50..160 -> 100 if within, else linearly reduce
    let metaScore;
    if   (metaLen === 0) metaScore = 0;
    else if (metaLen >= 50 && metaLen <= 160) metaScore = 100;
    else if (metaLen < 50) metaScore = clamp(Math.round((metaLen /50)*100));
    else metaScore = clamp(Math.round((1 - Math.min(metaLen - 160, 200)/200)*100));

    //Compose weighted quality score
    const weights = {
        title: 0.20,
        meta: 0.20,
        h1: 0.10,
        imgAlt: 0.15,
        link: 0.10,
        ally: 0.25
    };

    const h1Score = hasH1 ? 100 : 0;

    const qualityScore = Math.round(
        weights.title * titleScore +
        weights.meta * metaScore +
        weights.h1 *h1Score +
        weights.imgAlt *imgAltRatio +
        weights.link * linkScore +
        weights.ally *allyScore
    );

    //prepare report
    const report = {
        url: location.href,
        timestamp: Date.now(),
        seo: {
            title,
            metaDescription,
            hasH1
        },
        linksSample: links.slice(0,30),
        counts: {
            linksCount,
            imgCount,
            inputsCount
        },
        quality: {
            score: qualityScore,
            breakdown: {
                titleScore,
                metaScore,
                h1Score,
                imgAltRatio,
                linkScore,
                allyScore
            }
        }
    };
    //Collect JSON report
    //const report = {url: location.href, timestamp: Date.now(), seo, linksSample: links};

    // Download JSON file 
    const blob = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const filename = `report-${new URL(location.href).hostname}-${Date.now()}.json`;
    //chrome.runtime.sendMessage({action: 'download', url, filename});

    //chrome.runtime.sendMessage({action: 'download', url, filename});
    chrome.runtime.sendMessage({action: 'openReport', report: report});

})();