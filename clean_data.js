const fs = require('fs');

const JSON_PATH = 'd:/location/kerala_administrative_data.json';
const OUTPUT_PATH = 'd:/location/cleaned_kerala_data.json';

try {
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const cleanedData = [];

    data.forEach(district => {
        const cleanedDistrict = {
            id: district.id,
            name: district.name,
            headquarters: district.headquarters,
            localBodies: {
                districtPanchayat: district.localBodies.districtPanchayat,
                blockPanchayats: [], // Still empty as confirmed
                corporations: [],    // Still empty as confirmed
                municipalities: [],  // Still empty as confirmed
                taluks: []
            }
        };

        if (district.localBodies.taluks) {
            district.localBodies.taluks.forEach(taluk => {
                const cleanedTaluk = {
                    name: taluk.name,
                    gramaPanchayats: []
                };

                if (taluk.gramaPanchayats) {
                    const uniqueGPs = new Set();
                    taluk.gramaPanchayats.forEach(gp => {
                        // Filter numeric noise
                        if (/^\d+$/.test(gp.name)) return;

                        // Filter common placeholders/duplicates
                        const normalizedLabel = gp.name.toLowerCase().trim();
                        if (uniqueGPs.has(normalizedLabel)) return;

                        cleanedTaluk.gramaPanchayats.push({
                            name: gp.name.trim(),
                            type: gp.type || "Grama Panchayat"
                        });
                        uniqueGPs.add(normalizedLabel);
                    });
                }

                if (cleanedTaluk.gramaPanchayats.length > 0) {
                    cleanedDistrict.localBodies.taluks.push(cleanedTaluk);
                }
            });
        }

        cleanedData.push(cleanedDistrict);
    });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cleanedData, null, 2));
    console.log(`Cleaned data written to ${OUTPUT_PATH}`);

    // Summary
    let totalGPs = 0;
    cleanedData.forEach(d => {
        d.localBodies.taluks.forEach(t => totalGPs += t.gramaPanchayats.length);
    });
    console.log(`Total valid Grama Panchayats after cleaning: ${totalGPs}`);

} catch (e) {
    console.error("Error:", e.message);
}
