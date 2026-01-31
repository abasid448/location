document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        dashboard: document.getElementById('dashboard'),
        detailsView: document.getElementById('details-view'),
        districtHeader: document.getElementById('district-header'),
        tabContent: document.getElementById('tab-content'),
        backBtn: document.getElementById('backBtn'),
        searchInput: document.getElementById('searchInput'),
        searchBtn: document.getElementById('searchBtn'),
        tabs: document.querySelectorAll('.tab-btn'),
        statsWidget: document.getElementById('stats-dashboard')
    };

    // State
    let currentDistrict = null;

    // Initialization
    function init() {
        renderGlobalStats();
        renderDashboard(keralaData.districts);
        setupEventListeners();
    }

    // Render Global Stats Widget
    function renderGlobalStats() {
        // Calculate Dynamic Stats from keralaData
        let totalDistricts = keralaData.districts.length;
        let totalCorps = 0;
        let totalMunis = 0;
        let totalGPs = 0;
        let totalBPs = 0;

        keralaData.districts.forEach(d => {
            totalCorps += d.localBodies.corporations.length;
            totalMunis += d.localBodies.municipalities.length;
            totalBPs += d.localBodies.blockPanchayats.length;

            d.localBodies.taluks.forEach(t => {
                totalGPs += t.gramaPanchayats.length;
            });
        });

        elements.statsWidget.innerHTML = `
            <div class="stat-card entrance-hidden">
                <h3>Total Districts</h3>
                <div class="value">${totalDistricts}</div>
                <svg class="sparkline" viewBox="0 0 100 20"><path d="M0,15 Q25,5 50,15 T100,10" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/></svg>
            </div>
             <div class="stat-card entrance-hidden">
                <h3>Corporations</h3>
                <div class="value">${totalCorps}</div>
                <svg class="sparkline" viewBox="0 0 100 20"><path d="M0,10 Q20,18 40,10 T80,15 T100,5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/></svg>
            </div>
             <div class="stat-card entrance-hidden">
                <h3>Municipalities</h3>
                <div class="value">${totalMunis}</div>
                <svg class="sparkline" viewBox="0 0 100 20"><path d="M0,18 Q30,5 60,15 T100,12" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/></svg>
            </div>
             <div class="stat-card entrance-hidden">
                <h3>Panchayats</h3>
                <div class="value">${totalGPs}</div>
                <svg class="sparkline" viewBox="0 0 100 20"><path d="M0,5 Q20,15 40,5 T80,12 T100,8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/></svg>
            </div>
        `;
        // Observe stats too
        elements.statsWidget.querySelectorAll('.stat-card').forEach(s => entranceObserver.observe(s));
    }

    // Render Dashboard (District Cards)
    function renderDashboard(districts) {
        elements.dashboard.innerHTML = '';
        if (districts.length === 0) {
            elements.dashboard.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted); font-size: 1.1rem;">No districts found matching your search. Try "Thiruvananthapuram" or "Kochi".</p>';
            return;
        }

        districts.forEach((district, index) => {
            const card = document.createElement('div');
            card.className = 'district-card entrance-hidden';

            card.innerHTML = `
                <h2>${district.name}</h2>
                <div class="stats">
                    <span class="badge">Local Bodies <span>${calculateTotalBodies(district)}</span></span>
                    <span class="badge">Corporations <span>${district.localBodies.corporations.length}</span></span>
                    <span class="badge">Municipalities <span>${district.localBodies.municipalities.length}</span></span>
                </div>
            `;
            setupTilt(card);
            entranceObserver.observe(card);
            card.addEventListener('click', () => showDistrictDetails(district));
            elements.dashboard.appendChild(card);
        });
    }

    // Calculate total bodies for stats
    function calculateTotalBodies(district) {
        const corps = district.localBodies.corporations.length;
        const munis = district.localBodies.municipalities.length;
        const blocks = district.localBodies.blockPanchayats.length;
        const gps = district.localBodies.taluks.reduce((acc, t) => acc + t.gramaPanchayats.length, 0);
        return corps + munis + blocks + gps + 1; // +1 for District Panchayat
    }

    // Cinematic Parallax Tilt (Ultra Pro 3D)
    function setupTilt(element) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            element.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;

            // Move internal elements for "True Depth"
            const title = element.querySelector('h2');
            if (title) {
                title.style.transform = `translateX(${(x - centerX) / 20}px) translateY(${(y - centerY) / 20}px)`;
            }
        });

        element.addEventListener('mouseleave', () => {
            element.style.transition = 'all 0.8s var(--ease-ultra)';
            element.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateY(0) scale3d(1, 1, 1)';
            const title = element.querySelector('h2');
            if (title) title.style.transform = '';
            setTimeout(() => { element.style.transition = ''; }, 800);
        });
    }

    // Entrance Observer (Staggered Load)
    const entranceObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 50);
                entranceObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Render District Details
    function showDistrictDetails(district) {
        currentDistrict = district;
        elements.dashboard.classList.add('hidden');
        elements.detailsView.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Render Header
        elements.districtHeader.innerHTML = `
            <h1>${district.name}</h1>
            <p>Administrative Headquarters: ${district.headquarters}</p>
        `;

        // content for the first tab (District Panchayat default)
        const defaultTab = 'districtPanchayat';

        // Update active tab UI
        elements.tabs.forEach(t => {
            t.classList.remove('active');
            if (t.dataset.tab === defaultTab) t.classList.add('active');
        });

        renderTabContent(defaultTab);
    }

    // Render Specific Tab Content
    function renderTabContent(tabName) {
        if (!currentDistrict) return;

        let content = '';
        const data = currentDistrict.localBodies;

        if (tabName === 'corporations') {
            if (data.corporations.length === 0) {
                content = '<p style="padding: 1rem; color: var(--text-muted);">No Corporations in this district.</p>';
            } else {
                content = createTable(data.corporations, 'Corporation');
            }
        } else if (tabName === 'municipalities') {
            if (data.municipalities.length === 0) {
                content = '<p style="padding: 1rem; color: var(--text-muted);">No Municipalities in this district.</p>';
            } else {
                content = createTable(data.municipalities, 'Municipality');
            }
        } else if (tabName === 'districtPanchayat') {
            content = createTable([data.districtPanchayat], 'District Panchayat');
        } else if (tabName === 'blockPanchayats') {
            if (data.blockPanchayats.length === 0) {
                content = '<p style="padding: 1rem; color: var(--text-muted);">No Block Panchayats loaded yet.</p>';
            } else {
                content = createTable(data.blockPanchayats, 'Block Panchayat');
            }
        } else if (tabName === 'taluks') {
            content = data.taluks.map(taluk => `
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; border-bottom: 2px solid var(--secondary-color); padding-bottom: 0.5rem; display: inline-block;">${taluk.name} Taluk</h3>
                    ${taluk.gramaPanchayats.length > 0
                    ? createTable(taluk.gramaPanchayats, 'Grama Panchayat')
                    : '<p style="color: var(--text-muted);">No Grama Panchayats listed yet.</p>'}
                </div>
            `).join('');
        }

        elements.tabContent.innerHTML = content;
    }

    // Helper to create tables
    function createTable(items, typeLabel) {
        return `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        ${items[0].wards ? '<th>Wards</th>' : ''}
                        ${items[0].president && items[0].president !== 'TBA' ? '<th>President</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td><strong>${item.name}</strong></td>
                            <td><span class="badge badge-${getTypeClass(typeLabel)}">${typeLabel}</span></td>
                            ${item.wards ? `<td>${item.wards}</td>` : ''}
                            ${item.president && item.president !== 'TBA' ? `<td>${item.president}</td>` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function getTypeClass(type) {
        if (type.includes('District')) return 'dp';
        if (type.includes('Block')) return 'bp';
        if (type.includes('Corporation')) return 'corp';
        if (type.includes('Municipality')) return 'muni';
        return 'gp';
    }

    // HIDDEN IMPORT TOOL
    // Usage in Console: importData("Kottayam", "blockPanchayats", [{name: "Block1"}, ...])
    window.importData = function (districtName, type, dataArray) {
        const district = keralaData.districts.find(d => d.name === districtName);
        if (!district) return console.error('District not found');

        if (!district.localBodies[type] && type !== 'gramaPanchayats') return console.error('Invalid type');

        if (type === 'gramaPanchayats') {
            console.log('For GP, please iterate through Taluks manually or provide taluk name');
        } else {
            // Append or Replace? Let's Replace for cleanliness
            district.localBodies[type] = dataArray.map(item => ({ ...item, type: type.slice(0, -1) })); // naive type naming
            console.log(`Imported ${dataArray.length} items into ${districtName} -> ${type} `);
            renderDashboard(keralaData.districts); // Re-render
            if (currentDistrict && currentDistrict.name === districtName) {
                showDistrictDetails(district); // Refresh view if open
            }
        }
    };

    // Event Listeners
    function setupEventListeners() {
        // Back Button
        elements.backBtn.addEventListener('click', () => {
            elements.detailsView.classList.add('hidden');
            elements.dashboard.classList.remove('hidden');
            currentDistrict = null;
        });

        // Tabs
        elements.tabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                elements.tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                renderTabContent(e.target.dataset.tab);
            });
        });

        // Search
        elements.searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Search Logic (Granular Filter)
    function handleSearch(query) {
        const term = query.toLowerCase();

        // Return to dashboard if search is empty
        if (term.length < 2) {
            if (elements.dashboard.classList.contains('hidden') && !currentDistrict) {
                // If we were showing search results, go back to dashboard
                renderDashboard(keralaData.districts);
            }
            return;
        }

        const results = [];

        keralaData.districts.forEach(district => {
            // Check District
            if (district.name.toLowerCase().includes(term)) {
                results.push({ type: 'District', name: district.name, district: district, match: district });
            }

            // Check Corporations
            district.localBodies.corporations.forEach(item => {
                if (item.name.toLowerCase().includes(term)) {
                    results.push({ type: 'Corporation', name: item.name, district: district, match: item, tab: 'corporations' });
                }
            });

            // Check Municipalities
            district.localBodies.municipalities.forEach(item => {
                if (item.name.toLowerCase().includes(term)) {
                    results.push({ type: 'Municipality', name: item.name, district: district, match: item, tab: 'municipalities' });
                }
            });

            // Check Block Panchayats
            district.localBodies.blockPanchayats.forEach(item => {
                if (item.name.toLowerCase().includes(term)) {
                    results.push({ type: 'Block Panchayat', name: item.name, district: district, match: item, tab: 'blockPanchayats' });
                }
            });

            // Check Taluks & GPs
            district.localBodies.taluks.forEach(taluk => {
                if (taluk.name.toLowerCase().includes(term)) {
                    results.push({ type: 'Taluk', name: taluk.name, district: district, match: taluk, tab: 'taluks' });
                }

                taluk.gramaPanchayats.forEach(gp => {
                    if (gp.name.toLowerCase().includes(term)) {
                        results.push({ type: 'Grama Panchayat', name: gp.name, district: district, match: gp, tab: 'taluks', context: taluk.name });
                    }
                });
            });
        });

        renderSearchResults(results);
    }

    function renderSearchResults(results) {
        elements.dashboard.innerHTML = '';
        elements.detailsView.classList.add('hidden');
        elements.dashboard.classList.remove('hidden');

        if (results.length === 0) {
            elements.dashboard.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">No matching results found.</p>';
            return;
        }

        results.forEach((result, index) => {
            const card = document.createElement('div');
            card.className = 'district-card search-result-card'; // Reuse style
            card.style.animationDelay = `${index * 0.03}s`;

            // Custom styling for search results
            card.style.minHeight = 'auto';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'center';

            const contextInfo = result.context ? `<span>in ${result.context} Taluk</span>` : '';

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-light);">${result.name}</h3>
                    <span class="badge badge-${getTypeClass(result.type)}">${result.type}</span>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                   <span>${result.district.name} District</span>
                   ${contextInfo}
                </div>
            `;

            setupTilt(card);
            card.addEventListener('click', () => {
                showDistrictDetails(result.district);
                if (result.tab) {
                    // Switch to tab
                    const tabBtn = Array.from(elements.tabs).find(t => t.dataset.tab === result.tab);
                    if (tabBtn) tabBtn.click();

                    // Highlight logic (basic scroll)
                    setTimeout(() => {
                        // Find the row with this name
                        const rows = elements.tabContent.querySelectorAll('tr');
                        for (let row of rows) {
                            if (row.textContent.includes(result.name)) {
                                row.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
                                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                setTimeout(() => { row.style.backgroundColor = ''; }, 2000);
                                break;
                            }
                        }
                    }, 100);
                }
            });
            elements.dashboard.appendChild(card);
        });
    }

    // Start
    init();
});
