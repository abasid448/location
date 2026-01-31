const fs = require('fs');

const DATA_JS_PATH = 'd:/location/data.js';
const CLEANED_JSON_PATH = 'd:/location/cleaned_kerala_data.json';
const OUTPUT_DATA_JS_PATH = 'd:/location/data.js';

try {
    const dataJsContent = fs.readFileSync(DATA_JS_PATH, 'utf8');
    const cleanedJson = JSON.parse(fs.readFileSync(CLEANED_JSON_PATH, 'utf8'));

    // Extract the object from data.js
    const jsonStr = dataJsContent.replace('const keralaData =', '').replace(/;\s*$/, '').trim();
    const keralaData = new Function('return ' + jsonStr)();

    cleanedJson.forEach(jsonDist => {
        const jsDist = keralaData.districts.find(d => d.name.toLowerCase() === jsonDist.name.toLowerCase());

        if (jsDist && jsonDist.localBodies.taluks) {
            if (!jsDist.localBodies.taluks) jsDist.localBodies.taluks = [];

            jsonDist.localBodies.taluks.forEach(jsonTaluk => {
                let jsTaluk = jsDist.localBodies.taluks.find(t => t.name.toLowerCase() === jsonTaluk.name.toLowerCase());

                if (!jsTaluk) {
                    jsTaluk = { name: jsonTaluk.name, gramaPanchayats: [] };
                    jsDist.localBodies.taluks.push(jsTaluk);
                }

                if (!jsTaluk.gramaPanchayats) jsTaluk.gramaPanchayats = [];

                jsonTaluk.gramaPanchayats.forEach(jsonGP => {
                    const exists = jsTaluk.gramaPanchayats.some(gp => gp.name.toLowerCase() === jsonGP.name.toLowerCase());
                    if (!exists) {
                        jsTaluk.gramaPanchayats.push({ name: jsonGP.name, type: "Grama Panchayat" });
                    }
                });
            });
        }
    });

    const newContent = 'const keralaData = ' + JSON.stringify(keralaData, null, 4) + ';';
    fs.writeFileSync(OUTPUT_DATA_JS_PATH, newContent);
    console.log(`Updated ${OUTPUT_DATA_JS_PATH} with merged data.`);

} catch (e) {
    console.error("Error:", e.message);
}
