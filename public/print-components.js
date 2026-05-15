/**
 * Print Components System for V2 Trifolds
 *
 * Instead of 8 rectangular tiles, this exports each individual component
 * (sections, images, infographics, stat cards, etc.) as a separate
 * high-DPI PNG ready to cut out and glue onto a physical poster board.
 */
(function () {
    'use strict';

    const COMPONENT_SELECTORS = [
        '.panel-header',
        '.section',
        '.img-frame',
        '.token-viz',
        '.rates-chart',
        '.syco-compare',
        '.stat-card',
        '.consequences-grid',
        '.thesis-box',
        '.quote-box',
        '.tip-list',
        '.checklist',
        '.shield-viz',
        '.center-title',
        '.center-masthead',
        '.stats-row',
        '.stats-grid',
        '.stats-infographic',
        '.timeline',
        '.glass-card',
        '.alert-box',
        '.back-panel',
    ];

    function getComponents() {
        const trifold = document.getElementById('trifold') || document.querySelector('.trifold-container');
        if (!trifold) return [];

        const seen = new Set();
        const components = [];

        COMPONENT_SELECTORS.forEach(sel => {
            trifold.querySelectorAll(sel).forEach(el => {
                if (seen.has(el)) return;
                // Skip if this element is a child of another matched component
                let dominated = false;
                seen.forEach(parent => { if (parent.contains(el) && parent !== el) dominated = true; });
                if (dominated) return;
                // Remove elements that are children of this one from the list
                const toRemove = [];
                seen.forEach(child => { if (el.contains(child) && el !== child) toRemove.push(child); });
                toRemove.forEach(child => {
                    seen.delete(child);
                    const idx = components.findIndex(c => c.el === child);
                    if (idx !== -1) components.splice(idx, 1);
                });
                seen.add(el);

                const panel = el.closest('.panel-left, .panel-center, .panel-right, .panel');
                let panelName = 'back';
                if (panel) {
                    if (panel.classList.contains('panel-left')) panelName = 'A';
                    else if (panel.classList.contains('panel-center')) panelName = 'B';
                    else if (panel.classList.contains('panel-right')) panelName = 'C';
                    else panelName = 'panel';
                }

                const tag = sel.replace('.', '');
                const sameTypeInPanel = components.filter(c => c.panelName === panelName && c.tag === tag).length + 1;
                const label = `${panelName} — ${formatTag(tag)}${sameTypeInPanel > 1 ? ' ' + sameTypeInPanel : ''}`;

                components.push({ el, panelName, tag, label, sel });
            });
        });

        // Also include the back-panel outside the trifold
        const page = document.querySelector('.page-body') || document.body;
        page.querySelectorAll('.back-panel').forEach(el => {
            if (!seen.has(el)) {
                seen.add(el);
                components.push({ el, panelName: 'back', tag: 'back-panel', label: 'Back — Works Cited', sel: '.back-panel' });
            }
        });

        return components;
    }

    function formatTag(tag) {
        const names = {
            'panel-header': 'Header',
            'section': 'Section',
            'img-frame': 'Image',
            'token-viz': 'Token Prediction',
            'rates-chart': 'Rates Chart',
            'syco-compare': 'Sycophancy Compare',
            'stat-card': 'Stat Card',
            'consequences-grid': 'Consequences Grid',
            'thesis-box': 'Thesis',
            'quote-box': 'Quote',
            'tip-list': 'Tips List',
            'checklist': 'Checklist',
            'shield-viz': 'Media Shield',
            'center-title': 'Title',
            'center-masthead': 'Masthead',
            'stats-row': 'Stats Row',
            'stats-grid': 'Stats Grid',
            'stats-infographic': 'Stats Infographic',
            'timeline': 'Timeline',
            'glass-card': 'Stat Card',
            'alert-box': 'Alert Stat',
            'back-panel': 'Works Cited',
        };
        return names[tag] || tag;
    }

    function getTextPreview(el) {
        const h = el.querySelector('h2, h3, h4, .thesis-label, .label, .field, .chart-title');
        if (h) return h.textContent.trim().substring(0, 40);
        const p = el.querySelector('p');
        if (p) return p.textContent.trim().substring(0, 40) + '...';
        return '';
    }

    function getPhysicalSize(el) {
        const rect = el.getBoundingClientRect();
        const wInches = (rect.width / 1440 * 24).toFixed(1);
        const hInches = (rect.height / 1440 * 24).toFixed(1);
        return `${wInches}" × ${hInches}"`;
    }

    function getBgColor() {
        const panels = document.querySelectorAll('.panel');
        if (panels.length > 0) {
            const bg = getComputedStyle(panels[0]).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)') return bg;
        }
        return '#ffffff';
    }

    function injectStyles() {
        if (document.getElementById('pc-styles')) return;
        const style = document.createElement('style');
        style.id = 'pc-styles';
        style.textContent = `
            .pc-overlay {
                display: none; position: fixed; inset: 0; z-index: 10000;
                background: rgba(0,0,0,0.8); backdrop-filter: blur(6px);
                overflow-y: auto; padding: 40px 20px;
            }
            .pc-overlay.open { display: block; }
            .pc-modal {
                max-width: 800px; margin: 0 auto;
                background: #1a1a1a; border: 1px solid #333;
                border-radius: 12px; padding: 28px 32px;
                color: #eee; font-family: system-ui, sans-serif;
                position: relative;
            }
            .pc-modal h2 {
                font-size: 1.3rem; font-weight: 700; margin-bottom: 4px;
                color: #fff; background: none; -webkit-text-fill-color: unset;
                -webkit-background-clip: unset; border: none; padding: 0;
                letter-spacing: 0; text-transform: none;
            }
            .pc-subtitle { font-size: 0.8rem; color: #999; margin-bottom: 20px; line-height: 1.5; }
            .pc-close {
                position: absolute; top: 16px; right: 20px;
                background: none; border: none; color: #999;
                font-size: 1.5rem; cursor: pointer; padding: 4px;
            }
            .pc-close:hover { color: #fff; }
            .pc-panel-group { margin-bottom: 16px; }
            .pc-panel-label {
                font-size: 0.65rem; text-transform: uppercase;
                letter-spacing: 1.5px; color: #666;
                margin-bottom: 6px; font-weight: 600;
                padding-bottom: 4px; border-bottom: 1px solid #2a2a2a;
            }
            .pc-list { display: flex; flex-direction: column; gap: 4px; }
            .pc-item {
                display: flex; align-items: center; justify-content: space-between;
                background: #222; border: 1px solid #333; border-radius: 8px;
                padding: 8px 14px; cursor: pointer; transition: all 0.15s;
                gap: 12px;
            }
            .pc-item:hover { background: #2a2a2a; border-color: #555; }
            .pc-item:disabled, .pc-item[disabled] { opacity: 0.5; cursor: wait; }
            .pc-item-info { flex: 1; min-width: 0; }
            .pc-item-label { font-size: 0.75rem; color: #ddd; font-weight: 500; }
            .pc-item-preview {
                font-size: 0.6rem; color: #777; margin-top: 2px;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .pc-item-dims {
                font-size: 0.55rem; color: #555; flex-shrink: 0;
                font-family: monospace; letter-spacing: 0.5px;
            }
            .pc-item-dl { color: #888; font-size: 0.85rem; flex-shrink: 0; }
            .pc-download-all {
                width: 100%; padding: 12px; margin-top: 16px;
                background: #2563eb; color: #fff; border: none;
                border-radius: 8px; font-size: 0.85rem; font-weight: 600;
                cursor: pointer; transition: background 0.15s;
                font-family: system-ui, sans-serif;
            }
            .pc-download-all:hover { background: #1d4ed8; }
            .pc-download-all:disabled { opacity: 0.5; cursor: wait; }
            .pc-progress {
                margin-top: 12px; font-size: 0.75rem;
                color: #888; text-align: center; min-height: 1.2em;
            }
            @media (max-width: 768px) {
                .pc-modal { padding: 20px 16px; }
            }
        `;
        document.head.appendChild(style);
    }

    function createModal(components) {
        let existing = document.getElementById('pc-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'pc-overlay';
        overlay.className = 'pc-overlay';

        // Group by panel
        const groups = {};
        components.forEach((c, i) => {
            c._index = i;
            if (!groups[c.panelName]) groups[c.panelName] = [];
            groups[c.panelName].push(c);
        });

        const panelOrder = ['A', 'B', 'C', 'back'];
        const panelLabels = { A: 'Panel A (Left)', B: 'Panel B (Center)', C: 'Panel C (Right)', back: 'Back Panel' };

        let groupsHTML = '';
        panelOrder.forEach(pn => {
            const items = groups[pn];
            if (!items || items.length === 0) return;
            let itemsHTML = items.map(c => {
                const preview = getTextPreview(c.el);
                const dims = getPhysicalSize(c.el);
                return `<button class="pc-item" data-idx="${c._index}">
                    <div class="pc-item-info">
                        <div class="pc-item-label">${c.label}</div>
                        ${preview ? `<div class="pc-item-preview">${preview}</div>` : ''}
                    </div>
                    <span class="pc-item-dims">${dims}</span>
                    <span class="pc-item-dl">&darr;</span>
                </button>`;
            }).join('');
            groupsHTML += `<div class="pc-panel-group">
                <div class="pc-panel-label">${panelLabels[pn] || pn}</div>
                <div class="pc-list">${itemsHTML}</div>
            </div>`;
        });

        overlay.innerHTML = `
            <div class="pc-modal">
                <button class="pc-close" onclick="closeComponents()">&times;</button>
                <h2>Print Components</h2>
                <p class="pc-subtitle">Each piece exports at 300 DPI, scaled to fit a 24&times;16&Prime; poster board. Panel A/C pieces are 6&Prime; wide, Panel B pieces are 12&Prime; wide. <strong>Print at 100% scale</strong>, cut out, and glue. ${components.length} components found.</p>
                ${groupsHTML}
                <button class="pc-download-all" id="pc-download-all">Download All ${components.length} Components</button>
                <div class="pc-progress" id="pc-progress"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Wire up individual buttons
        overlay.querySelectorAll('.pc-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                downloadComponent(components[idx]);
            });
        });

        // Wire up download-all
        document.getElementById('pc-download-all').addEventListener('click', () => {
            downloadAllComponents(components);
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeComponents();
        });
    }

    function injectCaptureStyles() {
        if (document.getElementById('pc-capture-styles')) return;
        const s = document.createElement('style');
        s.id = 'pc-capture-styles';
        s.textContent = `
            body.pc-capturing { min-width: 1440px !important; overflow-x: auto !important; }
            body.pc-capturing .trifold-container { width: 1440px !important; }
            body.pc-capturing .trifold {
                display: grid !important;
                grid-template-columns: 360px 720px 360px !important;
                width: 1440px !important;
            }
        `;
        document.head.appendChild(s);
    }

    // Scale 5 maps 1440px HTML → 7200px output = 300 DPI at 24" wide.
    // Panel A (360px) → 1800px = 6" at 300 DPI
    // Panel B (720px) → 3600px = 12" at 300 DPI
    // Panel C (360px) → 1800px = 6" at 300 DPI
    // Heights scale proportionally so every piece is poster-accurate.
    const POSTER_SCALE = 5;

    async function captureElement(el) {
        injectCaptureStyles();
        document.body.classList.add('pc-capturing');
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        let canvas;
        try {
            canvas = await html2canvas(el, {
                scale: POSTER_SCALE,
                useCORS: true,
                backgroundColor: getBgColor(),
            });
        } finally {
            document.body.classList.remove('pc-capturing');
        }
        return canvas;
    }

    function downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function setProgress(text) {
        const el = document.getElementById('pc-progress');
        if (el) el.textContent = text;
    }

    function setAllDisabled(disabled) {
        document.querySelectorAll('.pc-item, .pc-download-all').forEach(b => b.disabled = disabled);
    }

    function makeFilename(comp) {
        const prefix = document.title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/-+$/, '');
        const name = comp.label.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/-+$/, '');
        return `${prefix}-${name}.png`;
    }

    async function downloadComponent(comp) {
        setAllDisabled(true);
        setProgress('Capturing component...');
        try {
            const canvas = await captureElement(comp.el);
            downloadCanvas(canvas, makeFilename(comp));
            setProgress('Done!');
        } catch (err) {
            setProgress('Error: ' + err.message);
            console.error(err);
        }
        setTimeout(() => { setAllDisabled(false); setProgress(''); }, 1200);
    }

    async function downloadAllComponents(components) {
        setAllDisabled(true);
        try {
            for (let i = 0; i < components.length; i++) {
                setProgress(`Capturing ${i + 1} of ${components.length}: ${components[i].label}...`);
                const canvas = await captureElement(components[i].el);
                downloadCanvas(canvas, makeFilename(components[i]));
                await new Promise(r => setTimeout(r, 350));
            }
            setProgress(`All ${components.length} components downloaded!`);
        } catch (err) {
            setProgress('Error: ' + err.message);
            console.error(err);
        }
        setTimeout(() => { setAllDisabled(false); setProgress(''); }, 2500);
    }

    window.openComponents = function () {
        injectStyles();
        const components = getComponents();
        createModal(components);
        document.getElementById('pc-overlay').classList.add('open');
    };

    window.closeComponents = function () {
        const el = document.getElementById('pc-overlay');
        if (el) el.classList.remove('open');
    };
})();
