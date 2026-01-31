const fs = require('fs');

const DATA_JS_PATH = 'd:/location/data.js';
const CLEANED_JSON_PATH = 'd:/location/cleaned_kerala_data.json';
const OUTPUT_DATA_JS_PATH = 'd:/location/data.js';

function normalize(str) {
    if (!str) return "";
    return str.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/p{2,}/g, 'p') // common variations in Kerala names
        .replace(/l{2,}/g, 'l')
        .replace(/n{2,}/g, 'n')
        .replace(/r{2,}/g, 'r')
        .replace(/t{2,}/g, 't')
        .replace(/y/g, 'i')      // common swap (Thakazhy/Thakazhi)
        .replace(/u/g, 'v')      // common swap (Edathua/Edathva)
        .replace(/d/g, '')       // ignore d vs th vs t usually
        .replace(/h/g, '')
        .trim();
}

// Simple Levenshtein distance isn't needed if normalize works well enough for these specific names
// But let's try a better approach: soundex or just strict normalization.
// Let's stick to a robust normalization for now.

try {
    const dataJsContent = fs.readFileSync(DATA_JS_PATH, 'utf8');
    const jsonStr = dataJsContent.replace('const keralaData =', '').replace(/;\s*$/, '').trim();
    const keralaData = new Function('return ' + jsonStr)();

    const cleanedJson = JSON.parse(fs.readFileSync(CLEANED_JSON_PATH, 'utf8'));

    keralaData.districts.forEach(dist => {
        if (!dist.localBodies.taluks) return;

        // 1. Merge Duplicate Taluks (e.g. Ambalapuzha and Ambalappuzha)
        const taluks = dist.localBodies.taluks;
        const seenTaluks = new Map(); // normalized -> actual object
        const finalTaluks = [];

        taluks.forEach(t => {
            const norm = normalize(t.name);
            if (seenTaluks.has(norm)) {
                const existing = seenTaluks.get(norm);
                // Merge GPs
                t.gramaPanchayats.forEach(gp => {
                    const gpNorm = normalize(gp.name);
                    if (!existing.gramaPanchayats.some(egp => normalize(egp.name) === gpNorm)) {
                        existing.gramaPanchayats.push(gp);
                    }
                });
            } else {
                seenTaluks.set(norm, t);
                finalTaluks.push(t);
            }
        });
        dist.localBodies.taluks = finalTaluks;

        // 2. Deduplicate GPs within each taluk
        dist.localBodies.taluks.forEach(t => {
            if (!t.gramaPanchayats) return;
            const seenGPs = new Set();
            const finalGPs = [];
            t.gramaPanchayats.forEach(gp => {
                const norm = normalize(gp.name);
                if (!seenGPs.has(norm)) {
                    seenGPs.add(norm);
                    finalGPs.push(gp);
                }
            });
            t.gramaPanchayats = finalGPs;
        });
    });

    const newContent = 'const keralaData = ' + JSON.stringify(keralaData, null, 4) + ';';
    fs.writeFileSync(OUTPUT_DATA_JS_PATH, newContent);
    console.log(`Deduplicated and updated ${OUTPUT_DATA_JS_PATH}.`);

} catch (e) {
    console.error("Error:", e.message);
}
