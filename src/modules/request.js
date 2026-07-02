export function initRequest(bus, reportUrl) {
    const originFetch = window.fetch
    window.fetch = function (url, options = {}) {
        const startTime = Date.now()
        const requestUrl = typeof url === 'string' ? url : url.url
        const isSdkRequest = reportUrl && requestUrl.includes(reportUrl)
        return originFetch(url, options).then((response) => {
            const duration = Date.now() - startTime
            if (!isSdkRequest) {
                bus.emit('request:captured', {
                    type: 'request',
                    url: requestUrl,
                    method: options.method || 'GET',
                    status: response.status,
                    duration
                })
            }
            return response
        }).catch((err) => {
            if (!isSdkRequest) {
                bus.emit('request:captured', {
                    type: 'request',
                    url: requestUrl,
                    method: options.method || 'GET',
                    status: 0,
                    duration: Date.now() - startTime,
                    error: err.message
                })
            }
            throw err
        })
    }
}