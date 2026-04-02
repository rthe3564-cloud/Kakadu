const fs = require('fs');
const path = require('path');

const baseUrl = 'https://kakadu.ae';
const targetDir = '.';

async function download(url, filePath) {
    console.log(`Downloading ${url} to ${filePath}...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(buffer));
}

async function main() {
    // 1. Download index.html
    const htmlRes = await fetch(`${baseUrl}/ru/`);
    let html = await htmlRes.text();

    // 2. Find and download assets
    const assetRegex = /src="(\/assets\/[^"]+)"|href="(\/assets\/[^"]+)"|src: "(\/assets\/[^"]+)"/g;
    let match;
    const assets = new Set();
    while ((match = assetRegex.exec(html)) !== null) {
        assets.add(match[1] || match[2] || match[3]);
    }

    // Add favicon
    assets.add('/favicon.ico');

    for (const asset of assets) {
        const url = `${baseUrl}${asset}`;
        const filePath = path.join(targetDir, asset.startsWith('/') ? asset.slice(1) : asset);
        try {
            await download(url, filePath);
        } catch (e) {
            console.error(e.message);
        }
    }

    // 3. Rewrite paths in index.html to be relative
    // Change /assets/ to assets/
    html = html.replace(/src="\/assets\//g, 'src="assets/');
    html = html.replace(/href="\/assets\//g, 'href="assets/');
    html = html.replace(/src: "\/assets\//g, 'src: "assets/');
    html = html.replace(/href="\/favicon\.ico"/g, 'href="favicon.ico"');

    fs.writeFileSync(path.join(targetDir, 'index.html'), html);
    console.log('Saved index.html');

    // 4. Look into JS/CSS for more assets (images, fonts)
    // This is more complex, but let's try to find common extensions
    for (const asset of assets) {
        if (asset.endsWith('.js') || asset.endsWith('.css')) {
            const filePath = path.join(targetDir, asset.startsWith('/') ? asset.slice(1) : asset);
            let content = fs.readFileSync(filePath, 'utf8');
            const subAssetRegex = /\/assets\/[^"'\)\s]+\.(png|jpg|jpeg|gif|svg|woff2|woff|ttf|otf|webp)/g;
            let subMatch;
            while ((subMatch = subAssetRegex.exec(content)) !== null) {
                const subAsset = subMatch[0];
                const subUrl = `${baseUrl}${subAsset}`;
                const subFilePath = path.join(targetDir, subAsset.startsWith('/') ? subAsset.slice(1) : subAsset);
                if (!fs.existsSync(subFilePath)) {
                    try {
                        await download(subUrl, subFilePath);
                    } catch (e) {
                        console.error(e.message);
                    }
                }
            }
            
            // Rewrite paths in JS/CSS as well if needed
            // Actually, for JS it might be better to keep them as is if they are relative to the root
            // But since we want to open it as a file, we should try to make them relative or at least remove the leading slash
            // If the JS is in /assets/, then /assets/image.png becomes ./image.png or ../assets/image.png
            // However, most SPAs use /assets/ as a base.
        }
    }
}

main().catch(console.error);
