const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    for (const [searchValue, replaceValue] of replacements) {
        content = content.replace(searchValue, replaceValue);
    }
    fs.writeFileSync(fullPath, content);
}

// 1. Fix app/api/map/route.ts
replaceInFile('app/api/map/route.ts', [
    [/openai\.beta\.chat\.completions\.parse/g, 'openai.chat.completions.parse']
]);

// 2. Fix app/layout.tsx
replaceInFile('app/layout.tsx', [
    [/delayDuration=\{200\}/g, 'delay={200}']
]);

// 3. Fix app/page.tsx Variants
replaceInFile('app/page.tsx', [
    [/import \{ motion \} from "framer-motion";/g, 'import { motion, Variants } from "framer-motion";'],
    [/const container = \{/g, 'const container: Variants = {'],
    [/const item = \{/g, 'const item: Variants = {']
]);

// 4. Fix Tailwind v4 warnings globally in src components
function walkSync(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkSync(fullPath, callback);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            callback(fullPath);
        }
    }
}

function fixTailwind(fullPath) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let newContent = content;

    // _/_ in oklch
    newContent = newContent.replace(/\[oklch\(([^)]+)_(\/|\/_|_\/|_\/_)_([^)]+)\)\]/g, (match, p1, slash, p3) => {
         return `[oklch(${p1}/${p3})]`;
    });
    // Another pass for spaces inside oklch since regex above might capture complex strings. Actually, simple replace is:
    newContent = newContent.replace(/_(\/|_\/|_\/|_\/_)_/g, '/');

    // !class to class!
    const importantPrefixes = [
        '!w-', '!h-', '!border-', '!bg-', '!left-', '!right-'
    ];
    for (const p of importantPrefixes) {
        const regex = new RegExp(`(?<=[\\s"'\`])\\${p}([\\[\\]a-zA-Z0-9_.-]+)`, 'g');
        newContent = newContent.replace(regex, (match, suffix) => {
            return `${p.slice(1)}${suffix}!`;
        });
    }

    newContent = newContent.replace(/(?<=[ \t"'\`])!bg-transparent(?=[ \t"'\`])/g, 'bg-transparent!');

    newContent = newContent.replace(/flex-shrink-0/g, 'shrink-0');
    newContent = newContent.replace(/bg-gradient-to-r/g, 'bg-linear-to-r');

    if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
    }
}

walkSync('app', fixTailwind);
walkSync('components', fixTailwind);

console.log('Fixed files');
