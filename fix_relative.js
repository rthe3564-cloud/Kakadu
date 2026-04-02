const fs = require('fs');
const files = ['index.html', 'assets/index-dvnme8i2.js', 'assets/prerender-c8efxlcn.js'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // If it starts with assets/, make it ./assets/ to be more specific for subfolders
        content = content.replace(/(?<!\.)assets\//g, './assets/');
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
