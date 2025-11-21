const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

//GEt workspace folder command line argument, default to current folder
const outputDir = process.argv[2] || __dirname;

//Make sure Folder exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true});
}

async function analyzePage(url) {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2'});

    //COllect Data

    const report = await page.evaluate(() => {
        const seo = {
            title: document.title || null,
            metaDescription: document.querySelector('meta[name="description"]')?.content || null,
            hasH1: !!document.querySelector('h1')
        };

        const links = Array.from(document.querySelectorAll('a')).map(a => a.href).filter(Boolean).slice(0, 30);

        return { url: location.href, timestamp: Date.now(), seo, linksSample: links};
    });

    //Save to JSOn file

    const filename = path.join(outputDir, `report-${new URL(url).hostname}-${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`Report saved: ${filename}`);

    await browser.close();
}

//Read URLs from url.txt

const urlsFile = path.join(__dirname, 'urls.txt');
const urls = fs.readFileSync(urlsFile, 'utf-8').split('\n').map(u => u.trim()).filter(Boolean);

(async () => {
    for (const url of urls){
        try {
            console.log(`Analyzing: ${url}`);
            await analyzePage(url);
        }catch (err) {
            console.error(`Error analyzing ${url}:`, err);
        }
    }
    console.log("All done!");
    process.exit(0);
})();