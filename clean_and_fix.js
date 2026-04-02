const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://kakadu.ae';
const targetDir = '.';

// Функция для удаления трекеров из текста
function removeTrackers(content) {
    // Удаляем Google Tag Manager
    content = content.replace(/<!-- Google tag \(gtag\.js\) -->[\s\S]*?<\/script>/g, '');
    content = content.replace(/<script[^>]*src="[^"]*googletagmanager\.com[^"]*"[^>]*><\/script>/g, '');
    
    // Удаляем Яндекс.Метрику
    content = content.replace(/<!-- Yandex\.Metrika counter -->[\s\S]*?<\/noscript>/g, '');
    content = content.replace(/<script[^>]*>[\s\S]*?mc\.yandex\.ru[\s\S]*?<\/script>/g, '');
    
    return content;
}

// Функция для скачивания файла
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Status: ${res.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', reject);
    });
}

async function main() {
    const files = fs.readdirSync(targetDir);
    
    for (const file of files) {
        const filePath = path.join(targetDir, file);
        if (fs.lstatSync(filePath).isDirectory()) continue;

        let content = fs.readFileSync(filePath, 'utf8');

        // 1. Если это HTML/JS/CSS, удаляем трекеры
        if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
            const cleaned = removeTrackers(content);
            if (cleaned !== content) {
                fs.writeFileSync(filePath, cleaned);
                console.log(`[Cleaned] ${file}: Trackers removed.`);
            }
        }

        // 2. Если файл имеет расширение картинки, но внутри HTML (начинается с <!doctype)
        if ((file.endsWith('.svg') || file.endsWith('.webp') || file.endsWith('.ico')) && content.trim().startsWith('<!doctype')) {
            console.log(`[Fixing] ${file}: It's a fake image (HTML). Trying to download real one...`);
            
            // Пробуем скачать по разным возможным путям
            const possibleUrls = [
                `${baseUrl}/${file}`,
                `${baseUrl}/assets/${file}`,
                `${baseUrl}/images/${file}`,
                `${baseUrl}/svg/${file}`
            ];

            let success = false;
            for (const url of possibleUrls) {
                try {
                    await downloadFile(url, filePath);
                    console.log(`   Successfully downloaded from ${url}`);
                    success = true;
                    break;
                } catch (e) {
                    // Игнорируем ошибки и пробуем следующий URL
                }
            }
            
            if (!success) {
                // Если не скачалось, создаем пустой SVG, чтобы не грузились трекеры
                if (file.endsWith('.svg')) {
                    fs.writeFileSync(filePath, '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>');
                } else {
                    fs.writeFileSync(filePath, ''); // Пустой файл для других типов
                }
                console.log(`   Failed to download. Replaced with empty file to stop tracking.`);
            }
        }
    }
}

main().catch(console.error);
