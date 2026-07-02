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

export function createBatchReporter(options, maxSize = 5, maxWait = 3000) {
    const queue = []
    let timer = null
    function flush() {
        if (queue.length === 0) return
        const batch = [...queue]   // 复制一份
        queue.length = 0            // 清空原队列
        report({ type: 'batch', items: batch }, options)
        clearTimeout(timer)
        timer = null
    }
    return function batchAdd(data) {
        queue.push(data)
        if (queue.length >= maxSize) {
            flush()
        } else if (timer === null) {
            timer = setTimeout(flush, maxWait)
        }

    }
}