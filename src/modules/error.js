export function initError(bus, reportUrl = '', dedupWindow = 5000) {
    const dedupMap = new Map()
    function shouldDedup(key) {
        const lastTime = dedupMap.get(key);
        if (lastTime && Date.now() - lastTime < dedupWindow) return true;
        dedupMap.set(key, Date.now());
        return false;
    }
    // 1. 全局错误 + 资源加载失败
    window.addEventListener('error', (e) => {

        if (e.target === window) {
            const key = `jsError:${e.message}:${e.filename}:${e.lineno}`;
            if (shouldDedup(key)) return;
            bus.emit('error:captured', {
                type: 'error',
                errorType: 'jsError',
                message: e.message,
                filename: e.filename,
                line: e.lineno,
                col: e.colno
            })
        } else {
            const failedUrl = e.target.src || e.target.href;
            if (reportUrl && failedUrl && failedUrl.includes(reportUrl)) return;
            const key = `resourceError:${e.target.tagName}:${failedUrl}`;
            if (shouldDedup(key)) return;
            bus.emit('error:captured', {
                type: 'error',
                errorType: 'resourceError',
                tagName: e.target.tagName,
                url: e.target.src || e.target.href
            })
        }
    }, true)

    // 2. Promise 拒绝
    window.addEventListener('unhandledrejection', (e) => {
        const key = `promiseRejection:${e.reason?.message || String(e.reason)}`;
        if (shouldDedup(key)) return;
        bus.emit('error:captured', {
            type: 'error',
            errorType: 'promiseRejection',
            message: e.reason?.message || String(e.reason)
        })
    })
}
