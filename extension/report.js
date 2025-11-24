function qs(param) {
    const u = new URL(location.href);
    return u.searchParams.get(param);
}

function safe(text) {
    return (text === null || text === undefined) ? '' : String(text);
}

function renderReport(report) {
    const summary = document.getElementById('summary');

    summary.innerHTML = `
        <strong>URL:</strong> ${safe(report.url)} 
        &nbsp;&nbsp; 
        <strong>Timestamp:</strong> ${new Date(report.timestamp).toLocaleString()}
    `;

    const details = document.getElementById('details');

    let html = '<h2>SEO</h2><table>';
    html += `<tr><th>Title</th><td>${safe(report.seo.title)}</td></tr>`;
    html += `<tr><th>Meta Description</th><td>${safe(report.seo.metaDescription)}</td></tr>`;
    html += `<tr><th>Has H1</th><td>${report.seo.hasH1}</td></tr>`;
    html += `</table>`;

    html += '<h2>Links (sample)</h2><table><tr><th>#</th><th>Link</th></tr>';
    (report.linksSample || []).forEach((lnk, idx) => {
        html += `<tr><td>${idx + 1}</td><td><a href="${lnk}" target="_blank" rel="noopener">${lnk}</a></td></tr>`;
    });
    html += '</table>';

    html += '<h2>Raw JSON</h2>';
    html += `<pre>${JSON.stringify(report, null, 2)}</pre>`;

    details.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', async () => {
    const key = qs('key');
    if (!key) {
        document.getElementById('summary').textContent = 'No report key provided in URL.';
        return;
    }

    chrome.storage.local.get(key, (items) => {
        if (chrome.runtime.lastError) {
            document.getElementById('summary').textContent =
                'Error reading report: ' + chrome.runtime.lastError.message;
            return;
        }

        const report = items[key];
        if (!report) {
            document.getElementById('summary').textContent = 'Report not found in storage.';
            return;
        }

        renderReport(report);
    });
});
