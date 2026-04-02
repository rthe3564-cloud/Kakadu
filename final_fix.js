const fs = require('fs');
const path = require('path');

// 1. Фикс index.html - делаем пути максимально простыми и относительными
let html = fs.readFileSync('index.html', 'utf8');
// Убираем старый base если он есть
html = html.replace(/<base href=".*?">/g, '');
// Заменяем пути на ./assets/
html = html.replace(/src="assets\//g, 'src="./assets/');
html = html.replace(/href="assets\//g, 'href="./assets/');
fs.writeFileSync('index.html', html);
console.log('Fixed index.html');

// 2. Фикс JS файлов - заменяем /assets/ на ./assets/
const jsFiles = ['assets/index-DVNmE8I2.js', 'assets/prerender-c8efxLcN.js'];
jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // Заменяем абсолютные пути на относительные с точкой
        content = content.split('"/assets/').join('"./assets/');
        fs.writeFileSync(file, content);
        console.log(`Fixed ${file}`);
    }
});

// 3. Фикс CSS
const cssFile = 'assets/index-DJu_O_Yu.css';
if (fs.existsSync(cssFile)) {
    let content = fs.readFileSync(cssFile, 'utf8');
    content = content.split('/assets/').join('./');
    fs.writeFileSync(cssFile, content);
    console.log('Fixed CSS');
}
