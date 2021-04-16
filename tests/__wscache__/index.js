const fs = require('fs');
const path = require('path');

// collect all json files
/* 
{ [methodName] => {
    [key] => json
} }
 */

const cacheFiles = (dir, cache = {}) => {
    const dirFiles = fs.readdirSync(dir);
    dirFiles.forEach(file => {
        const filePath = path.resolve(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            cacheFiles(filePath, cache);
        } else if (file.endsWith('.json')) {
            const method = path.basename(dir);
            if (!cache[method]) cache[method] = {};
            const key = file.replace('.json', '');
            try {
                const rawJson = fs.readFileSync(filePath);
                const content = JSON.parse(rawJson);
                cache[method][key] = content;
            } catch (error) {
                console.error(`WS_CACHE parsing error: ${filePath}`);
                throw error;
            }
        }
    });
    return cache;
};

// read cache directory
export const WS_CACHE = cacheFiles(path.resolve(__dirname));
