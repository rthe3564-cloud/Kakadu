const fs = require('fs');

const jsFile = 'assets/index-dvnme8i2.js';
if (fs.existsSync(jsFile)) {
    let content = fs.readFileSync(jsFile, 'utf8');
    
    // Заменяем "./assets/" на "./assets/" во всем файле. 
    // Это заставит браузер искать картинки в текущей папке репозитория.
    content = content.split('"./assets/').join('"./assets/');
    
    // На всякий случай проверяем пути к папкам images и svg внутри assets
    content = content.split('"./images/').join('"./assets/images/');
    content = content.split('"./svg/').join('"./assets/svg/');
    
    fs.writeFileSync(jsFile, content);
    console.log('Fixed image paths in JS');
}

// Также проверим CSS на наличие абсолютных путей
const cssFile = 'assets/index-dju_o_yu.css';
if (fs.existsSync(cssFile)) {
    let content = fs.readFileSync(cssFile, 'utf8');
    // В CSS пути обычно относительные самих файлов, но если там есть /assets/, исправим
    content = content.split('./assets/').join('./');
    fs.writeFileSync(cssFile, content);
    console.log('Fixed image paths in CSS');
}
