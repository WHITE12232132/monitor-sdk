import EventBus from "./EventBus";
import { report } from "./utils/report.js";
import { initError } from "./modules/error.js";
import { initPerformance } from "./modules/performance.js";
import { createBehavior } from "./modules/behavior.js";


class MonitorSDK {
    constructor(options = {}) {
        this.appId = options.appId || ''
        this.reportUrl = options.reportUrl || ''
        this.enabled = true
        this.bus = new EventBus()
        this._behavior = createBehavior()

    }
    _reportOptions() {
        return { appId: this.appId, reportUrl: this.reportUrl, enabled: this.enabled };
    }
    start() {
        this.bus.on('error:captured', (data) => {
            data.breadcrumbs = this._behavior.getBreadcrumbs()
            report(data, this._reportOptions())
            this._behavior.clearBreadcrumbs()
        })

        initError(this.bus)
        initPerformance(report, this._reportOptions())
        this._behavior.init()
    }
}
export default MonitorSDK