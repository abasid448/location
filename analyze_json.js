const fs = require('fs');

const officialCounts = {
    "Thiruvananthapuram": 78,
    "Kollam": 68,
    "Pathanamthitta": 53,
    "Alappuzha": 72,
    "Kottayam": 71,
    "Idukki": 52,
    "Ernakulam": 82,
    "Thrissur": 86,
    "Palakkad": 88,
    "Malappuram": 94,
    "Kozhikode": 70,
    "Wayanad": 23,
    "Kannur": 71,
    "Kasaragod": 38
};

try {
    const data = JSON.parse(fs.readFileSync('d:/location/kerala_administrative_data.json', 'utf8'));

    console.log("District | GPs | Official | Corporations | Municipalities | Blocks | Taluks");
    console.log("---|---|---|---|---|---|---");

    data.forEach(d => {
        let gpCount = 0;
        let talukCount = 0;
        if (d.localBodies.taluks) {
            talukCount = d.localBodies.taluks.length;
            d.localBodies.taluks.forEach(t => {
                gpCount += t.gramaPanchayats ? t.gramaPanchayats.length : 0;
            });
        }

        const corpCount = d.localBodies.corporations ? d.localBodies.corporations.length : 0;
        const muniCount = d.localBodies.municipalities ? d.localBodies.municipalities.length : 0;
        const blockCount = d.localBodies.blockPanchayats ? d.localBodies.blockPanchayats.length : 0;

        const official = officialCounts[d.name] || 0;
        const status = gpCount === official ? "✅" : (gpCount > official ? "➕" : "➖");

        console.log(`${d.name} | ${gpCount} | ${official} ${status} | ${corpCount} | ${muniCount} | ${blockCount} | ${talukCount}`);
    });

} catch (e) {
    console.error("Error:", e.message);
}
