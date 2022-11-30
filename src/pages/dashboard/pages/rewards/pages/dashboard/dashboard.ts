import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/pages/rewards/reward-base"
import { DialogUtils, LanguageUtils } from "@/utils"
import ContentDaily from "./daily-content.vue"
import ContentWeekly from "./weekly-content.vue"
import ContentMounthly from "./monthly-content.vue"
import ContentCustom from "./custom-content.vue"
import moment from "moment"
import { ROUTER_NAMES } from "@/router"

type TabType = "weekly" | "monthly" | "daily" | "custom"
class TabItem {
    label: string
    value: TabType
    active = false

    constructor (label: string, value: TabType, active: boolean) {
        this.label = label
        this.value = value
        this.active = active
    }
}

const DF = "YYYY-MM-DD"
const dateValue = (m: moment.Moment) => m.format(DF)
const getLocalYear = (d: moment.Moment) => LanguageUtils.lang(d.year() + 543, d.year())

@Component({
    components: {
        "reward-content-daily": ContentDaily,
        "reward-content-monthly": ContentMounthly,
        "reward-content-weekly": ContentWeekly,
        "reward-content-custom": ContentCustom
    }
})
export default class CustomerRewardDashboard extends Base {
    private loading = false
    private currentTab = "day"
    private summaryTab = 0
    private hasPermission = false

    private tabControl = new TabControl()

    private updatedChart = false

    private get text () {
        return {
            title: this.$t("pages.rewards_dashboard.title").toString()
        }
    }

    private onUpdatedChart (status: boolean) {
        this.updatedChart = status
    }

    private get lang () {
        return this.$i18n.locale
    }

    private showCustomDateRange () {
        this.tabControl.showDatePicker = true
    }

    private confirmSelectDates () {
        const dates = [...this.tabControl.dates].sort()
        // @ts-ignore
        this.$refs["date-range-picker-dialog"].save(dates)
        this.tabControl.showDatePicker = false

        this.tabControl.customStartDate = moment(dates[0], DF).locale(this.lang).format(DF)
        if (dates.length === 1) {
            this.tabControl.customEndDate = moment(dates[0], DF).locale(this.lang).format(DF)
        } else {
            this.tabControl.customEndDate = moment(dates[1], DF).locale(this.lang).format(DF)
        }
        this.tabControl.selectTab(this.tabControl.customTab)
        this.updatedChart = true
    }

    private cancelSelectDate () {
        // @ts-ignore
        this.$refs["date-range-picker-dialog"].save([this.tabControl.customStartDate, this.tabControl.customEndDate])
        this.tabControl.showDatePicker = false
    }

    private mounted() {
        if (!this.userPermissions.dashboard) {
            return DialogUtils.showErrorDialog({
                text: LanguageUtils.lang(
                    "คุณไม่สิทธิ์เข้าใช้งาน",
                    "You have not permission to access this feature"
                )
            }).then(() => this.$router.replace({
                name: ROUTER_NAMES.rewards_main,
                query: this.$route.query,
                params: this.$route.params
            }))
        }
        this.hasPermission = true
    }
}

class TabControl {
    currentTab: TabType = "daily"
    customStartDate = dateValue(moment())
    customEndDate = dateValue(moment())
    dates = [this.customStartDate, this.customEndDate]

    showDatePicker = false

    selectTab (tab: TabItem) {
        return this.currentTab = tab.value
    }

    get tabs() {
        const { lang } = LanguageUtils
        return [
            new TabItem(lang("วัน", "Day"), "daily", this.currentTab === "daily"),
            new TabItem(lang("สัปดาห์", "Week"), "weekly", this.currentTab === "weekly"),
            new TabItem(lang("เดือน", "Month"), "monthly", this.currentTab === "monthly")
        ]
    }

    get customTab () {
        const { lang } = LanguageUtils
        return new TabItem(lang("", ""), "custom", this.currentTab === "custom")
    }

    get minDate () {
        return moment().subtract(3, "month").format(DF)
    }

    get maxDate () {
        return moment().format(DF)
    }

    get displayDateRange () {
        const { customStartDate: start, customEndDate: end } = this
        const s = moment(start).locale(LanguageUtils.getCurrentLang())
        const e = moment(end).locale(LanguageUtils.getCurrentLang())

        if (s.year() !== e.year()) {
            return `${s.format("D MMM")} ${getLocalYear(s)} - ` +
                `${e.format("D MMM")} ${getLocalYear(e)}`
        }

        return `${s.format("D MMM")} - ${e.format("D MMM")} ${getLocalYear(s)}`
    }

    get displayPickerDateRange () {
        const dates = [...this.dates].sort()
        if (dates.length === 0) {
            return LanguageUtils.lang("กรุณาเลือกวัน", "Please select dates")
        }

        if (dates.length === 1) {
            const md = moment(dates[0], DF)
            return `${md.format("D MMM")} ${getLocalYear(md)}`
        }

        const s = moment(dates[0], DF).locale(LanguageUtils.getCurrentLang())
        const e = moment(dates[1], DF).locale(LanguageUtils.getCurrentLang())

        if (s.year() !== e.year()) {
            return `${s.format("D MMM")} ${getLocalYear(s)} - ` +
                `${e.format("D MMM")} ${getLocalYear(e)}`
        }

        return `${s.format("D MMM")} - ${e.format("D MMM")} ${getLocalYear(s)}`
    }

    get htmlTabDateRange () {
        return (Math.abs(moment(this.customStartDate, DF).diff(moment(this.customEndDate, DF), "days")) + 1) + " " + LanguageUtils.lang("วัน", "Days")
    }
}
