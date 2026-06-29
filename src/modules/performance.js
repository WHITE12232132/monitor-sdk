export function initPerformance(report, options) {
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
