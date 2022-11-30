import { Component } from "vue-property-decorator"
import Base from "../../reward-base"
import moment from "moment"
import { DialogUtils, LanguageUtils } from "@/utils"
import { RewardModel } from "@/models"
import TransactionItem from "../../view/transaction-item.vue"
import { RewardServices, VuexServices } from "@/services"
import { ROUTER_NAMES } from "@/router"

const DF = "YYYY-MM-DD"
const dateValue = (m: moment.Moment) => m.format(DF)
const getLocalYear = (d: moment.Moment) => LanguageUtils.lang(d.year() + 543, d.year())

class Paginate {
    currentPage = 1
    lastPage = 1
    tempCurrentPage = 1
    totalItems = 0

    get ITEM_PER_PAGE() {
        return 20
    }

    get isLastPage() {
        return this.currentPage >= this.lastPage
    }
}

@Component({
    components: {
        "cpn-the1-transaction-item": TransactionItem
    }
})
export default class CustomerRewardTransactionHistory extends Base {

    private hasPermission = false
    private loading = false
    private tabState = new HistoryTabState()
    private cumulativeItems: RewardModel.RewardTransaction[] = []
    private privilegeItems: RewardModel.RewardTransaction[] = []
    private showOnlyMyTransactions = false

    private paginate = new Paginate()

    private get text() {
        const t = (k: string) => this.$t("pages.rewards_transaction_history." + k).toString()
        return {
            page_title: t("title"),
            req_download: t("req_download"),
            tab1: LanguageUtils.lang("รายการสะสม/คะแนน", "Cumulative Items/Points"),
            tab2: LanguageUtils.lang("รายการสิทธิพิเศษ/คูปอง", "Privilege/Coupon List"),
            text_no_date: LanguageUtils.lang("ไม่มีข้อมูล", "No data"),
            show_only_my_transactions: LanguageUtils.lang("แสดงรายการของฉัน", "Show only my transactions")
        }
    }

    private showOnlyMyTransactionsChange() {
        console.log("showOnlyMyTransactions change: " + this.showOnlyMyTransactions)
        this.paginate = new Paginate()
        this.getHistory(true)
    }

    private onContentScroll(/*e: Event*/) {
        const container = this.$refs["dbs-container"] as HTMLDivElement
        if (container.offsetHeight + container.scrollTop >= container.scrollHeight) {
            if (!this.loading && !this.paginate.isLastPage) {
                this.paginate.tempCurrentPage++
                this.getHistory()
            }
        }
    }

    private selectTab(t: TabItem) {
        if (t.value === this.tabState.current && this.tabState.current !== "custom") {
            return
        }

        this.$set(this.tabState, "current", t.value)
        this.paginate = new Paginate()
        this.cumulativeItems = []
        const dr = (() => {
            switch (this.tabState.current) {
                case "30days": return {
                    start: dateValue(moment().subtract(29, "days")),
                    end: dateValue(moment())
                }
    
                case "7days": return {
                    start: dateValue(moment().subtract(6, "days")),
                    end: dateValue(moment())
                }
    
                case "today": return {
                    start: dateValue(moment()),
                    end: dateValue(moment())
                }
    
                default: return {
                    start: this.tabState.customStartDate,
                    end: this.tabState.customEndDate
                }
            }
        })()
        this.tabState.dates = [dr.start, dr.end]
        // @ts-ignore
        this.$refs["date-range-picker-dialog"].save(this.tabState.dates)
        this.tabState.customStartDate = dr.start
        this.tabState.customEndDate = dr.end
        this.getHistory()
    }

    private reqDownloadClick() {
        this.$router.push({
            name: ROUTER_NAMES.rewards_transaction_download_history,
            query: this.$route.query,
            params: this.$route.params
        })
    }

    private showCustomDateRange() {
        this.tabState.showDatePicker = true
    }

    private async getHistory(refresh = false) {
        // const type = this.tabState.typeTab === 0 ? "c" : "p"
        this.loading = true
        try {

            let { configs } = this

            const store = await this.getStoreFromQuery()

            if (!store) {
                return DialogUtils.showErrorDialog({
                    text: `Store not found`
                }).then(() => this.$router.replace({
                    name: ROUTER_NAMES.rewards_shop_list
                }))
            }

            if (configs.length === 0) {
                configs = await RewardServices.getRewardConfigs(this.user.bpNumber, store.branch.code, store.industryCode, store.number, store.floorRoom)
                if (configs.length === 0) {
                    return DialogUtils.showErrorDialog({
                        text: "No store config"
                    }).then(() => {
                        this.$router.replace({
                            name: ROUTER_NAMES.rewards_shop_list
                        })
                    })
                }
                await VuexServices.CustomerReward.configs.set(configs)
            }
            const config = this.filterConfig(configs)

            const rs = await RewardServices.getTransactions({
                endDate: this.tabState.customEndDate,
                startDate: this.tabState.customStartDate,
                partnerCode: config.partnerCode,
                the1BizBranchCode: config.branchCode1Biz,
                paginate: {
                    itemPerPage: this.paginate.ITEM_PER_PAGE,
                    page: this.paginate.tempCurrentPage
                },
                onlyMe: this.showOnlyMyTransactions,
                store
            })

            this.paginate.lastPage = rs.lastPage
            this.paginate.currentPage = rs.currentPage
            this.paginate.tempCurrentPage = rs.currentPage
            this.paginate.totalItems = rs.total

            this.cumulativeItems = (refresh ?
                rs.transactions
                :
                [
                ...this.cumulativeItems,
                ...rs.transactions
                ]
            )
            .sort((a, b) => String(b.createdDate).localeCompare(String(a.createdDate)))

            console.log(JSON.stringify(this.paginate))
        } catch (e) {
            console.log(e.message)
            DialogUtils.showErrorDialog({
                text: e.message || "Error"
            })
            this.paginate.tempCurrentPage = this.paginate.currentPage
        }
        this.loading = !true
    }

    private onTabChange() {
        // if (this.tabState.typeTab === 1) {
        //     return
        // }

        // this.getHistory()
    }

    private mounted() {
        if (!this.userPermissions.history) {
            return DialogUtils.showErrorDialog({
                text: LanguageUtils.lang(
                    "คุณไม่มีสิทธิ์เข้าใช้งาน",
                    "You have not permission to access this feature"
                )
            }).then(() => this.$router.replace({
                name: ROUTER_NAMES.rewards_main,
                query: this.$route.query,
                params: this.$route.params
            }))
        }
        this.hasPermission = true
        this.getHistory()
    }

    private get lang() {
        return this.$i18n.locale
    }

    private confirmSelectDates() {
        const dates = [...this.tabState.dates].sort()
        // @ts-ignore
        this.$refs["date-range-picker-dialog"].save(dates)
        this.tabState.showDatePicker = false

        this.tabState.customStartDate = moment(dates[0], DF).locale(this.lang).format(DF)
        if (dates.length === 1) {
            this.tabState.customEndDate = moment(dates[0], DF).locale(this.lang).format(DF)
        } else {
            this.tabState.customEndDate = moment(dates[1], DF).locale(this.lang).format(DF)
        }
        this.selectTab(this.tabState.customItem)
    }

    private cancelSelectDate() {
        // @ts-ignore
        this.$refs["date-range-picker-dialog"].save([this.tabState.customStartDate, this.tabState.customEndDate])
        this.tabState.showDatePicker = false
    }
}

type TabType = "today" | "7days" | "30days" | "custom"
interface TabItem {
    value: TabType
    label: string
    active?: boolean
}

class HistoryTabState {
    current: TabType = "today"
    
    customStartDate = dateValue(moment())
    customEndDate = dateValue(moment())
    dates = [this.customStartDate, this.customEndDate]
    showDatePicker = false

    typeTab = 0

    get maxDate() {
        return moment().format(DF)
    }

    get tabs(): TabItem[] {
        const { lang } = LanguageUtils
        return [
            {
                label: lang("วันนี้", "Today"),
                value: "today",
                active: this.current === "today"
            },
            {
                label: lang("7 วัน", "7 Days"),
                value: "7days",
                active: this.current === "7days"
            },
            {
                label: lang("30 วัน", "30 Days"),
                value: "30days",
                active: this.current === "30days"
            }
        ]
    }

    get customItem(): TabItem {
        return {
            label: "",
            value: "custom",
            active: this.current === "custom"
        }
    }

    get displayDateRange() {
        const { customStartDate: start, customEndDate: end } = this
        const s = moment(start).locale(LanguageUtils.getCurrentLang())
        const e = moment(end).locale(LanguageUtils.getCurrentLang())

        if (s.year() !== e.year()) {
            return `${s.format("D MMM")} ${getLocalYear(s)} - ` +
                `${e.format("D MMM")} ${getLocalYear(e)}`
        }

        return `${s.format("D MMM")} - ${e.format("D MMM")} ${getLocalYear(s)}`
    }

    get displayPickerDateRang() {
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

    get htmlTabDateRange() {
        return (Math.abs(moment(this.customStartDate, DF).diff(moment(this.customEndDate, DF), "days")) + 1) + " " + LanguageUtils.lang("วัน", "Days")
    }
}
