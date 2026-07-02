import EventBus from "./EventBus.js";
import { createBatchReporter, report } from "./utils/report.js";
import { initError } from "./modules/error.js";
import { initPerformance } from "./modules/performance.js";
import { createBehavior } from "./modules/behavior.js";
import { initRequest } from "./modules/request.js";
import { initRecord } from "./modules/record.js"



class MonitorSDK {
    constructor(options = {}) {
        this.appId = options.appId || ''
        this.reportUrl = options.reportUrl || ''
        this.enabled = true
        this.bus = new EventBus()
        this._behavior = createBehavior()
        const defaultPlugins = { error: true, performance: true, behavior: true, request: true, record: true }
        this.plugins = Object.assign({}, defaultPlugins, (options.plugins || {}))

    }
    _reportOptions() {
        return { appId: this.appId, reportUrl: this.reportUrl, enabled: this.enabled };
    }
    start() {
        const batchReport = createBatchReporter(this._reportOptions())
        const requestStack = []

        if (this.plugins.request) {
            this.bus.on('request:captured', (data) => {
                requestStack.push(data)
                if (requestStack.length > 10) requestStack.shift()
            })
            initRequest(this.bus, this.reportUrl)
        }

        let recorder = null
        if (this.plugins.record) {
            recorder = initRecord(this.bus)
        }

        this.bus.on('error:captured', (data) => {
            if (this.plugins.behavior) {
                data.breadcrumbs = this._behavior.getBreadcrumbs()
            }
            if (this.plugins.request) {
                data.requests = [...requestStack]
            }
            if (this.plugins.record && recorder) {
                data.recording = {
                    snapshot: recorder.getSnapshot(),
                    events: recorder.getEvents()
                }
            }
            batchReport(data)
            if (this.plugins.behavior) {
                this._behavior.clearBreadcrumbs()
            }
        })

        if (this.plugins.error) {
            initError(this.bus, this.reportUrl)
        }
        if (this.plugins.performance) {
            initPerformance(report, this._reportOptions())
        }
        if (this.plugins.behavior) {
            this._behavior.init()
        }
    }
}
export default MonitorSDK