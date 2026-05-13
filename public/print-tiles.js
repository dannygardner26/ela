/**
 * Print Tiles System for Trifold Posters
 *
 * Splits a 24"x16" trifold (Panel A: 6x16, Panel B: 12x16, Panel C: 6x16)
 * into 8 letter-paper-sized tiles (6"x8" each) at 300 DPI.
 *
 * Tile layout:
 *   Panel A (6x16): panel-a-top (6x8), panel-a-bottom (6x8)
 *   Panel B (12x16): panel-b-top-left (6x8), panel-b-top-right (6x8),
 *                     panel-b-bottom-left (6x8), panel-b-bottom-right (6x8)
 *   Panel C (6x16): panel-c-top (6x8), panel-c-bottom (6x8)
 */

(function () {
    'use strict';

    // At 300 DPI: 6" = 1800px, 8" = 2400px
    const TILE_W = 1800;
    const TILE_H = 2400;

    // The trifold is 1440px wide in the HTML.
    // Panel A = 360px, Panel B = 720px, Panel C = 360px
    const TRIFOLD_W = 1440;
    const PANEL_A_W = 360;
    const PANEL_B_W = 720;
    const PANEL_C_W = 360;

    const TILES = [
        { name: 'panel-a-top',          label: 'Panel A - Top',           col: 0, row: 0, srcX: 0,   srcW: PANEL_A_W, half: 'top' },
        { name: 'panel-a-bottom',       label: 'Panel A - Bottom',        col: 0, row: 1, srcX: 0,   srcW: PANEL_A_W, half: 'bottom' },
        { name: 'panel-b-top-left',     label: 'Panel B - Top Left',      col: 1, row: 0, srcX: PANEL_A_W, srcW: PANEL_B_W / 2, half: 'top' },
        { name: 'panel-b-top-right',    label: 'Panel B - Top Right',     col: 2, row: 0, srcX: PANEL_A_W + PANEL_B_W / 2, srcW: PANEL_B_W / 2, half: 'top' },
        { name: 'panel-b-bottom-left',  label: 'Panel B - Bottom Left',   col: 1, row: 1, srcX: PANEL_A_W, srcW: PANEL_B_W / 2, half: 'bottom' },
        { name: 'panel-b-bottom-right', label: 'Panel B - Bottom Right',  col: 2, row: 1, srcX: PANEL_A_W + PANEL_B_W / 2, srcW: PANEL_B_W / 2, half: 'bottom' },
        { name: 'panel-c-top',          label: 'Panel C - Top',           col: 3, row: 0, srcX: PANEL_A_W + PANEL_B_W, srcW: PANEL_C_W, half: 'top' },
        { name: 'panel-c-bottom',       label: 'Panel C - Bottom',        col: 3, row: 1, srcX: PANEL_A_W + PANEL_B_W, srcW: PANEL_C_W, half: 'bottom' },
    ];

    function injectStyles() {
        if (document.getElementById('print-tiles-styles')) return;
        const style = document.createElement('style');
        style.id = 'print-tiles-styles';
        style.textContent = `
            .pt-overlay {
                display: none;
                position: fixed;
                inset: 0;
                z-index: 10000;
                background: rgba(0,0,0,0.75);
                backdrop-filter: blur(6px);
                overflow-y: auto;
                padding: 40px 20px;
            }
            .pt-overlay.open { display: block; }
            .pt-modal {
                max-width: 720px;
                margin: 0 auto;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 12px;
                padding: 28px 32px;
                color: #eee;
                font-family: system-ui, -apple-system, sans-serif;
                position: relative;
            }
            .pt-modal h2 {
                font-size: 1.3rem;
                font-weight: 700;
                margin-bottom: 6px;
                color: #fff;
                background: none;
                -webkit-text-fill-color: unset;
                -webkit-background-clip: unset;
                border: none;
                padding: 0;
                letter-spacing: 0;
                text-transform: none;
            }
            .pt-modal .pt-subtitle {
                font-size: 0.8rem;
                color: #999;
                margin-bottom: 20px;
                line-height: 1.5;
            }
            .pt-close {
                position: absolute;
                top: 16px;
                right: 20px;
                background: none;
                border: none;
                color: #999;
                font-size: 1.5rem;
                cursor: pointer;
                line-height: 1;
                padding: 4px;
                transition: color 0.15s;
            }
            .pt-close:hover { color: #fff; }

            /* Assembly guide */
            .pt-guide {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                grid-template-rows: 1fr 1fr;
                gap: 4px;
                margin-bottom: 24px;
                background: #111;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 12px;
            }
            .pt-guide-cell {
                background: #222;
                border: 1px solid #444;
                border-radius: 4px;
                padding: 8px 4px;
                text-align: center;
                font-size: 0.6rem;
                color: #aaa;
                line-height: 1.3;
                transition: background 0.15s;
            }
            .pt-guide-cell:hover { background: #333; }
            .pt-guide-cell .cell-label {
                font-weight: 700;
                color: #ddd;
                display: block;
                margin-bottom: 2px;
                font-size: 0.65rem;
            }
            .pt-guide-label {
                grid-column: 1 / -1;
                text-align: center;
                font-size: 0.6rem;
                color: #666;
                padding-top: 4px;
                letter-spacing: 1px;
                text-transform: uppercase;
            }

            /* Tile buttons */
            .pt-tiles-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 20px;
            }
            .pt-tile-btn {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #222;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 10px 14px;
                color: #ddd;
                font-family: system-ui, sans-serif;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.15s;
            }
            .pt-tile-btn:hover { background: #2a2a2a; border-color: #555; }
            .pt-tile-btn:disabled { opacity: 0.5; cursor: wait; }
            .pt-tile-btn .arrow { color: #888; font-size: 0.9rem; }

            .pt-download-all {
                width: 100%;
                padding: 12px;
                background: #2563eb;
                color: #fff;
                border: none;
                border-radius: 8px;
                font-family: system-ui, sans-serif;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s;
            }
            .pt-download-all:hover { background: #1d4ed8; }
            .pt-download-all:disabled { opacity: 0.5; cursor: wait; }

            .pt-progress {
                margin-top: 12px;
                font-size: 0.75rem;
                color: #888;
                text-align: center;
                min-height: 1.2em;
            }

            @media (max-width: 768px) {
                .pt-modal { padding: 20px 16px; }
                .pt-tiles-grid { grid-template-columns: 1fr; }
                .pt-guide { grid-template-columns: repeat(4, 1fr); font-size: 0.5rem; }
            }
        `;
        document.head.appendChild(style);
    }

    function createModal() {
        if (document.getElementById('pt-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'pt-overlay';
        overlay.className = 'pt-overlay';
        overlay.innerHTML = `
            <div class="pt-modal">
                <button class="pt-close" onclick="closePrintTiles()">&times;</button>
                <h2>Print Tiles</h2>
                <p class="pt-subtitle">Download panel images sized for standard letter paper (8.5&times;11&Prime;). Print at 100% scale, trim, and glue onto your 24&times;16&Prime; poster. Each tile is 6&Prime;&times;8&Prime; at 300 DPI.</p>

                <div class="pt-guide">
                    <div class="pt-guide-cell"><span class="cell-label">A-Top</span>6&times;8&Prime;</div>
                    <div class="pt-guide-cell"><span class="cell-label">B-TL</span>6&times;8&Prime;</div>
                    <div class="pt-guide-cell"><span class="cell-label">B-TR</span>6&times;8&Prime;</div>
                    <div class="pt-guide-cell"><span class="cell-label">C-Top</span>6&times;8&Prime;</div>
                    <div class="pt-guide-cell"><span class="cell-label">A-Bot</span>6&times;8&Prime;</div>
                    <div class="pt-guide-cell"><span class="cell-label">B-BL</span>6&times;8&Prime;</div>
                    <div class="pt-guide-cell"><span class="cell-label">B-BR</span>6&times;8&Prime;</div>
                    <div class="pt-guide-cell"><span class="cell-label">C-Bot</span>6&times;8&Prime;</div>
                </div>

                <div class="pt-tiles-grid" id="pt-tiles-grid"></div>
                <button class="pt-download-all" id="pt-download-all" onclick="downloadAllTiles()">Download All 8 Tiles</button>
                <div class="pt-progress" id="pt-progress"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Populate tile buttons
        const grid = document.getElementById('pt-tiles-grid');
        TILES.forEach(tile => {
            const btn = document.createElement('button');
            btn.className = 'pt-tile-btn';
            btn.setAttribute('data-tile', tile.name);
            btn.innerHTML = `<span>${tile.label}</span><span class="arrow">&darr;</span>`;
            btn.onclick = () => downloadSingleTile(tile);
            grid.appendChild(btn);
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePrintTiles();
        });
    }

    function getTrifoldElement() {
        // Try various selectors the trifold pages use
        return document.getElementById('trifold') || document.querySelector('.trifold-container');
    }

    function getBgColor() {
        // Read the body's computed background, or fall back
        const bg = getComputedStyle(document.body).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)') return bg;
        return '#000000';
    }

    function injectCaptureStyles() {
        if (document.getElementById('pt-capture-styles')) return;
        const s = document.createElement('style');
        s.id = 'pt-capture-styles';
        s.textContent = `
            body.pt-capturing { min-width: 1440px !important; overflow-x: auto !important; }
            body.pt-capturing .trifold-container { width: 1440px !important; }
            body.pt-capturing .trifold {
                display: grid !important;
                grid-template-columns: 360px 720px 360px !important;
                flex-direction: unset !important;
                width: 1440px !important;
            }
            body.pt-capturing .panel {
                border-right: revert !important;
                border-left: revert !important;
            }
            body.pt-capturing .panel-label { display: block !important; }
        `;
        document.head.appendChild(s);
    }

    async function captureTrifoldCanvas() {
        const el = getTrifoldElement();
        if (!el) throw new Error('Trifold container not found');

        // Force desktop layout during capture
        injectCaptureStyles();
        document.body.classList.add('pt-capturing');

        // Give browser a frame to reflow
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        // We need a high-res capture. The trifold is 1440px wide.
        // At scale 5, that gives us 7200px wide canvas.
        // Panel A = 1800px (360*5) which matches our 300 DPI tile width perfectly.
        const scale = 5;
        let canvas;
        try {
            canvas = await html2canvas(el, {
                scale: scale,
                useCORS: true,
                backgroundColor: getBgColor(),
                width: TRIFOLD_W,
                windowWidth: TRIFOLD_W
            });
        } finally {
            document.body.classList.remove('pt-capturing');
        }
        return { canvas, scale };
    }

    function extractTile(sourceCanvas, scale, tile) {
        const srcX = tile.srcX * scale;
        const srcW = tile.srcW * scale;
        const totalH = sourceCanvas.height;
        const halfH = totalH / 2;
        const srcY = tile.half === 'top' ? 0 : halfH;
        const srcH = halfH;

        const out = document.createElement('canvas');
        out.width = TILE_W;
        out.height = TILE_H;
        const ctx = out.getContext('2d');

        // Draw the cropped region scaled to output tile size
        ctx.drawImage(sourceCanvas, srcX, srcY, srcW, srcH, 0, 0, TILE_W, TILE_H);
        return out;
    }

    function downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function setProgress(text) {
        const el = document.getElementById('pt-progress');
        if (el) el.textContent = text;
    }

    function setAllBtnsDisabled(disabled) {
        document.querySelectorAll('.pt-tile-btn, .pt-download-all').forEach(btn => {
            btn.disabled = disabled;
        });
    }

    async function downloadSingleTile(tile) {
        setAllBtnsDisabled(true);
        setProgress('Capturing trifold...');
        try {
            const { canvas, scale } = await captureTrifoldCanvas();
            setProgress('Extracting tile...');
            const tileCanvas = extractTile(canvas, scale, tile);
            const prefix = document.title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/-+$/, '');
            downloadCanvas(tileCanvas, `${prefix}-${tile.name}.png`);
            setProgress('Done!');
        } catch (err) {
            setProgress('Error: ' + err.message);
            console.error(err);
        }
        setTimeout(() => { setAllBtnsDisabled(false); setProgress(''); }, 1500);
    }

    async function downloadAllTiles() {
        setAllBtnsDisabled(true);
        setProgress('Capturing trifold at high resolution...');
        try {
            const { canvas, scale } = await captureTrifoldCanvas();
            for (let i = 0; i < TILES.length; i++) {
                const tile = TILES[i];
                setProgress(`Extracting tile ${i + 1} of ${TILES.length}: ${tile.label}...`);
                const tileCanvas = extractTile(canvas, scale, tile);
                const prefix = document.title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/-+$/, '');
                downloadCanvas(tileCanvas, `${prefix}-${tile.name}.png`);
                // Small delay between downloads so browser doesn't block them
                await new Promise(r => setTimeout(r, 400));
            }
            setProgress('All 8 tiles downloaded!');
        } catch (err) {
            setProgress('Error: ' + err.message);
            console.error(err);
        }
        setTimeout(() => { setAllBtnsDisabled(false); setProgress(''); }, 2500);
    }

    /**
     * Force desktop layout for any capture, then restore.
     * Used by both print-tiles and the per-page downloadPNG functions.
     */
    window.forceDesktopForCapture = async function (captureCallback) {
        injectCaptureStyles();
        document.body.classList.add('pt-capturing');
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        try {
            return await captureCallback();
        } finally {
            document.body.classList.remove('pt-capturing');
        }
    };

    // Global functions
    window.openPrintTiles = function () {
        injectStyles();
        createModal();
        document.getElementById('pt-overlay').classList.add('open');
    };

    window.closePrintTiles = function () {
        const overlay = document.getElementById('pt-overlay');
        if (overlay) overlay.classList.remove('open');
    };

    window.downloadAllTiles = downloadAllTiles;
})();
