export function report(data, options) {
    if (!options.enabled) return;
    if (!options.reportUrl) return;

    const payload = {
        appId: options.appId,
        timestamp: Date.now(),
        ...data
    };

    try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        if (navigator.sendBeacon) {
            navigator.sendBeacon(options.reportUrl, blob);
        } else {
            fetch(options.reportUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
                keepalive: true
            });
        }
    } catch {
        // SDK 自身错误，静默吞咽，不冒泡
    }
}