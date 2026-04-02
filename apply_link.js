const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Заменяем ссылку на Android
const oldHref = 'href="kakadu.apk"';
const newHref = 'href="https://github.com/gfgdd798-oss/dsetew/releases/download/v1.0/browser.exe"';
html = html.split(oldHref).join(newHref);

// Убираем атрибут download, чтобы браузер просто переходил по ссылке
html = html.split('download="KakaduVPN.apk"').join('');

fs.writeFileSync('index.html', html);
console.log('Successfully updated Android links in index.html');
