const fs = require('fs');

const jsFile = 'assets/index-dvnme8i2.js';
if (fs.existsSync(jsFile)) {
    let content = fs.readFileSync(jsFile, 'utf8');
    
    // Исправляем динамическую сборку путей для картинок и SVG
    // Ищем паттерны типа "./images/" и "./svg/" которые используются как префиксы
    
    content = content.split('"./images/"').join('"./assets/images/"');
    content = content.split('"./svg/"').join('"./assets/svg/"');
    
    // Также на всякий случай исправляем любые оставшиеся "./assets/"
    content = content.split('"./assets/').join('"./assets/');
    
    fs.writeFileSync(jsFile, content);
    console.log('Deep-fixed image path logic in JS');
}

const jsFile2 = 'assets/prerender-c8efxlcn.js';
if (fs.existsSync(jsFile2)) {
    let content = fs.readFileSync(jsFile2, 'utf8');
    content = content.split('"./images/"').join('"./assets/images/"');
    content = content.split('"./svg/"').join('"./assets/svg/"');
    content = content.split('"./assets/').join('"./assets/');
    fs.writeFileSync(jsFile2, content);
    console.log('Deep-fixed image path logic in prerender JS');
}
