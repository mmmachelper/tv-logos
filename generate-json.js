const fs = require('fs');
const path = require('path');

const BASE_DIR = 'C:\\Users\\ROOT\\Downloads\\tv-logos-main';

function getDisplayName(filename) {
    let name = filename.replace(/\.(png|jpg|jpeg)$/i, '');
    name = name.replace(/-/g, ' ');
    name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return name;
}

function scanDirectory(dir, relativePath = '') {
    const logos = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (item === 'utilities' || item === '.git' || item === 'obsolete' || item === 'screen-bug' || item === 'hd' || item === 'custom' || item === 'us-local') continue;

            const newRelativePath = relativePath ? `${relativePath}/${item}` : item;
            logos.push(...scanDirectory(fullPath, newRelativePath));
        } else if (/\.(png|jpg|jpeg)$/i.test(item) && !item.startsWith('0_') && item !== 'space-1500.png' && item !== 'paypal-donate.png') {
            const category = relativePath.split('/')[0];
            const subcategory = relativePath.split('/').slice(1).join('/') || null;

            logos.push({
                id: item.replace(/\.(png|jpg|jpeg)$/i, ''),
                name: getDisplayName(item),
                filename: item,
                category: category,
                subcategory: subcategory,
                path: `${relativePath}/${item}`,
                url: `${relativePath}/${item}`.replace(/\\/g, '/')
            });
        }
    }

    return logos;
}

console.log('Scanning directories...');
const allLogos = scanDirectory(BASE_DIR);

const categories = [...new Set(allLogos.map(l => l.category))];

const result = {
    meta: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalLogos: allLogos.length,
        baseUrl: ''
    },
    categories: categories.map(cat => ({
        id: cat,
        name: cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        count: allLogos.filter(l => l.category === cat).length
    })),
    logos: allLogos
};

const outputPath = path.join(BASE_DIR, 'logos.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

console.log(`Done! Created logos.json with ${allLogos.length} logos.`);
console.log(`Categories: ${categories.join(', ')}`);
