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

    const originXHROpen = XMLHttpRequest.prototype.open
    const originXHRSend = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.open = function (method, url) {
        this._monitor_method = method
        this._monitor_url = url
        originXHROpen.call(this, method, url)
    }
    XMLHttpRequest.prototype.send = function (body) {
        const startTime = Date.now()
        const requestUrl = this._monitor_url
        const isSdkRequest = reportUrl && requestUrl.includes(reportUrl)

        this.addEventListener('loadend', () => {
            if (!isSdkRequest) {
                const data = {
                    type: 'request',
                    url: requestUrl,
                    method: this._monitor_method || 'GET',
                    status: this.status,
                    duration: Date.now() - startTime
                }
                if (this.status === 0) {
                    data.error = 'Network Error'
                }
                bus.emit('request:captured', data)
            }
        })

        originXHRSend.call(this, body)
    }

}