export function createBehavior() {
    const breadcrumbs = [];
    const _inputLastRecord = {};

    function init() {
        document.addEventListener('click', (e) => {
            breadcrumbs.push({
                type: 'click',
                tagName: e.target.tagName,
                text: e.target.innerText?.slice(0, 20),
                timestamp: Date.now()
            });
            if (breadcrumbs.length > 10) {
                breadcrumbs.shift();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') return;

            const now = Date.now();
            const name = e.target.name || e.target.id || 'unknown';
            const last = _inputLastRecord[name] || 0;

            if (now - last < 1000) return;
            _inputLastRecord[name] = now;

            breadcrumbs.push({
                type: 'input',
                tagName: e.target.tagName,
                name: e.target.name || '',
                value: e.target.value?.slice(0, 20),
                timestamp: Date.now()
            });
            if (breadcrumbs.length > 10) {
                breadcrumbs.shift();
            }
        });
    }

    function getBreadcrumbs() {
        return [...breadcrumbs];
    }

    function clearBreadcrumbs() {
        breadcrumbs.length = 0;
    }

    return { init, getBreadcrumbs, clearBreadcrumbs };
}
