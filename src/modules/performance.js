export function initPerformance(report, options) {

    let clsValue = 0;
    new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
                clsValue += entry.value;
            }
        }
    }).observe({ type: 'layout-shift', buffered: true });

    // CLS 只在页面隐藏时上报一次最终值
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            report({
                type: 'performance',
                metricType: 'CLS',
                value: clsValue
            }, options);
        }
    });
    // LCP
    new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        report({
            type: 'performance',
            metricType: 'LCP',
            value: lastEntry.startTime
        }, options);
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // FCP
    new PerformanceObserver((list) => {
        const entry = list.getEntries().find(e => e.name === 'first-contentful-paint');
        if (entry) {
            report({
                type: 'performance',
                metricType: 'FCP',
                value: entry.startTime
            }, options);
        }
    }).observe({ type: 'paint', buffered: true });
}
