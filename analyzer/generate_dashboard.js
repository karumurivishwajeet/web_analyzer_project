const fs = require('fs');
const path = require('path');

const reportsDir = process.argv[2] || __dirname;
const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'));

let html = `<html><head><title>Web Analyzer Report</title></head><body>`;
html += `<h1>Web Analyzer Report</h1>`;
html += `<table border="1" cellpadding="5" cellspacing="0">
<tr><th>URL</th><th>Title</th><th>Meta Description</th><th>Has H1</th><th>Links Count</th></tr>`;

files.forEach(file => {
    const report = JSON.parse(fs.readFileSync(path.join(reportsDir, file)));
    html += `<tr>
        <td>${report.url}</td>
        <td>${report.seo.title || ''}</td>
        <td>${report.seo.metaDescription || ''}</td>
        <td>${report.seo.hasH1}</td>
        <td>${report.linksSample.length}</td>
    </tr>`;
});

html += `</table></body></html>`;

// Save HTML file in the reports folder
const outputFile = path.join(reportsDir, 'dashboard.html');
fs.writeFileSync(outputFile, html);
console.log('Dashboard generated at', outputFile);
