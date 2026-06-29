export function initError(bus) {
    // 1. 全局错误 + 资源加载失败
    window.addEventListener('error', (e) => {
        if (e.target === window) {
            bus.emit('error:captured', {
                type: 'error',
                errorType: 'jsError',
                message: e.message,
                filename: e.filename,
                line: e.lineno,
                col: e.colno
            })
        } else {
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
        bus.emit('error:captured', {
            type: 'error',
            errorType: 'promiseRejection',
            message: e.reason?.message || String(e.reason)
        })
    })
}
