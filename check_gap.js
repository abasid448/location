const fs = require('fs');

try {
    const content = fs.readFileSync('d:/location/data.js', 'utf8');
    const jsonStr = content.replace('const keralaData =', '').replace(/;\s*$/, '').trim();
    // Using Function instead of eval for slightly better safety/practice, though distinct here
    const keralaData = new Function('return ' + jsonStr)();

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

    console.log("District | Current GPs | Official | Status");
    console.log("---|---|---|---");

    let totalMissing = 0;

    keralaData.districts.forEach(d => {
        let currentGPs = 0;
        if (d.localBodies.taluks) {
            d.localBodies.taluks.forEach(t => currentGPs += t.gramaPanchayats.length);
        }
        const official = officialCounts[d.name] || 0;
        const diff = official - currentGPs;
        if (diff > 0) totalMissing += diff;

        const status = diff === 0 ? "✅ OK" : (diff > 0 ? `❌ Missing ${diff}` : `⚠️ Excess ${Math.abs(diff)}`);
        console.log(`${d.name} | ${currentGPs} | ${official} | ${status}`);
    });

    console.log(`\nTotal Missing GPs: ${totalMissing}`);

} catch (e) {
    console.error("Error parsing data.js:", e.message);
}
