(function () {
    'use strict';

    if (window.innerWidth > 768) return;

    function init() {
        const trifold = document.querySelector('.trifold');
        const container = document.querySelector('.trifold-container');
        if (!trifold || !container) return;

        const panels = trifold.querySelectorAll('.panel');
        if (panels.length < 3) return;

        // Scale the trifold poster to fit viewport
        const vw = window.innerWidth - 16;
        const scale = vw / 1440;
        trifold.style.transform = `scale(${scale})`;
        trifold.style.transformOrigin = 'top left';
        const trifoldHeight = trifold.scrollHeight * scale;
        container.style.height = trifoldHeight + 'px';
        container.style.overflow = 'hidden';

        // Get theme color from CSS
        const cs = getComputedStyle(document.documentElement);
        const accent = cs.getPropertyValue('--teal') || cs.getPropertyValue('--terracotta') || cs.getPropertyValue('--gold') || '#42A5F5';

        // Add poster label
        const label = document.createElement('div');
        label.className = 'trifold-poster-label';
        label.textContent = 'Poster Overview';
        container.parentNode.insertBefore(label, container);

        // Fold indicators
        const indicators = document.createElement('div');
        indicators.className = 'fold-indicators';
        ['a', 'b', 'c'].forEach((p, i) => {
            const bar = document.createElement('div');
            bar.className = 'fold-indicator';
            bar.dataset.panel = p;
            bar.style.background = accent.trim();
            bar.style.opacity = i === 0 ? '1' : '0.3';
            indicators.appendChild(bar);
        });
        container.parentNode.insertBefore(indicators, container.nextSibling);

        // Panel navigation
        const nav = document.createElement('div');
        nav.className = 'panel-nav';
        const labels = ['Panel A', 'Panel B', 'Panel C'];
        const panelKeys = ['a', 'b', 'c'];
        labels.forEach((l, i) => {
            const btn = document.createElement('button');
            btn.textContent = l;
            btn.dataset.panel = panelKeys[i];
            if (i === 0) btn.classList.add('active');
            btn.onclick = () => switchPanel(i);
            nav.appendChild(btn);
        });
        indicators.parentNode.insertBefore(nav, indicators.nextSibling);

        // Reading view (expanded panels)
        const readingView = document.createElement('div');
        readingView.className = 'reading-view';

        panels.forEach((panel, i) => {
            const rp = document.createElement('div');
            rp.className = 'reading-panel' + (i === 0 ? ' active' : '');
            rp.dataset.index = i;
            rp.innerHTML = panel.innerHTML;
            // Remove the panel-label from reading view
            const pl = rp.querySelector('.panel-label');
            if (pl) pl.remove();
            readingView.appendChild(rp);
        });

        nav.parentNode.insertBefore(readingView, nav.nextSibling);

        function switchPanel(idx) {
            // Update nav
            nav.querySelectorAll('button').forEach((btn, i) => {
                btn.classList.toggle('active', i === idx);
            });
            // Update indicators
            indicators.querySelectorAll('.fold-indicator').forEach((bar, i) => {
                bar.style.opacity = i === idx ? '1' : '0.3';
            });
            // Update reading panels
            readingView.querySelectorAll('.reading-panel').forEach((rp, i) => {
                rp.classList.toggle('active', i === idx);
            });
            // Scroll to reading view
            readingView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth > 768) {
                    location.reload();
                    return;
                }
                const newVw = window.innerWidth - 16;
                const newScale = newVw / 1440;
                trifold.style.transform = `scale(${newScale})`;
                const newH = trifold.scrollHeight * newScale;
                container.style.height = newH + 'px';
            }, 200);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
