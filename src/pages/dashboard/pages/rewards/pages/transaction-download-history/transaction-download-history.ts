import { Component } from "vue-property-decorator"
import Base from "../../reward-base"
import MonthSelectedBtn from "@/components/month-select-btn.vue"
import moment from "moment"
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import { RewardModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { RewardServices, VuexServices } from "@/services"

class DownloadTabState {
    typeTab = 0
}

class HistoryYear {
    year = 0
    months: HistoryMonth[] = []
}

class HistoryMonth {
    // 02-2021
    id = ""
    month = 0
    selected = false
}

@Component({
    components: {
        "cpn-req-month-btn": MonthSelectedBtn
    }
})
export default class CustomerRewardTransactionDownloadHistory extends Base {
    private tabState = new DownloadTabState()
    private email = ""
    private cumulativeItems: RewardModel.RewardTransaction[] = []
    private privilegeItems: RewardModel.RewardTransaction[] = []
    private historyItems: HistoryYear[] = []
    private selectedItems: string[] = []
    private isInvalidEmail = false
    private loading = false
    
    private get text() {
        const t = (k: string) => this.$t("pages.rewards_transaction_download_history." + k).toString()
        return {
            page_title: t("title"),
            select_option: t("select_option"),
            select_hint: t("select_hint"),
            error_select_month: t("error_select_month"),
            email: this.$t("email"),
            ok: this.$t("ok"),
            tab1: LanguageUtils.lang("รายการสะสม/คะแนน", "Cumulative Items/Points"),
            tab2: LanguageUtils.lang("รายการสิทธิพิเศษ/คูปอง", "Privilege/Coupon List"),
            data_not_found: LanguageUtils.lang("ไม่พบข้อมูล", "Data not found")
        }
    }

    private async checkStoreAndConfig() {
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
            this.createHistoryItems()
        } catch (e) {
            console.log(e.message)
            DialogUtils.showErrorDialog({
                text: e.message || "Error"
            })
        }
        this.loading = false
    }

    private onTabChange() {
        console.log("onTabChange")
    }

    private mounted() {

        if (!this.userPermissions.download) {
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

        this.email = this.user.email
        this.checkStoreAndConfig()
    }

    private get lang() {
        return this.$i18n.locale
    }

    private get isEmpty() {
        return this.tabState.typeTab === 0 ? false : true
    }

    private getDateFromYearAndMonth(year: number, month: number) {
        return moment(`${year} ${month}`, "YYYY M")
    }

    private displayYear(year: string) {
        return moment(year, "YYYY").add(543, "year").format("YYYY")
    }

    private async toggleSelectedMonth(mItem: HistoryMonth) {
        mItem.selected = !mItem.selected
        if (mItem.selected) {
            this.selectedItems.push(mItem.id)
        } else {
            const index = this.selectedItems.indexOf(mItem.id, 0)
            if (index > -1) {
                this.selectedItems.splice(index, 1)
            }
        }
    }

    private createNewHistoryYear(year: number) {
        const newYear = new HistoryYear()
        newYear.year = year
        newYear.months = []
        return newYear
    }

    private createNewHistoryMonth(year: number, month: number) {
        const monthId = moment(month, "M").format("MM")
        const newMonth = new HistoryMonth()
        newMonth.id = `${monthId}-${year}`
        newMonth.month = month
        newMonth.selected = false
        return newMonth
    }

    private createHistoryItems() {
        const thisYear = moment().year()
        const thisMonth = moment().month() + 1
        let endLoop = 0
        let extraCount = 0
        let extraEndLoop = 0
        if (thisMonth < 6) {
            endLoop = 0
            extraCount = 6 - thisMonth
            extraEndLoop = 12 - extraCount
        } else if (thisMonth === 6) {
            endLoop = 0
            extraCount = 0
            extraEndLoop = 0
        } else {
            endLoop = thisMonth - 6
            extraCount = 0
            extraEndLoop = 0
        }
        const historyYear = this.createNewHistoryYear(thisYear)
        for (let m = thisMonth; m > endLoop; m--) {
            const historyMonth = this.createNewHistoryMonth(thisYear, m)
            historyYear.months.push(historyMonth)
        }
        this.historyItems.push(historyYear)
        if (extraCount > 0) {
            const year = thisYear - 1
            const newHistoryYear = this.createNewHistoryYear(year)
            for (let m = 12; m > extraEndLoop; m--) {
                const historyMonth = this.createNewHistoryMonth(year, m)
                newHistoryYear.months.push(historyMonth)
            }
            this.historyItems.push(newHistoryYear)
        }
    }

    get errors() {
        return {
            email: (v => {
                if (!v || (v && !ValidateUtils.validateEmail(v))) {
                    return LanguageUtils.lang("อีเมลไม่ถูกต้อง", "Email invalid")
                }
                this.isInvalidEmail = false
                return null
            })(this.email)
        }
    }
    
    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }

    private async submitDownloadForm () {
        if (this.allValidated) {
            if (this.selectedItems.length === 0) {
                DialogUtils.showErrorDialog({ text: this.text.error_select_month })
            } else {
                this.loading = true

                try {
                    const rs = await RewardServices.transactionHistoryReport(
                        this.config?.industryCode ?? "",
                        this.config?.shopNumber ?? "",
                        this.store?.branch.code ?? "",
                        this.store?.floorRoom ?? "",
                        this.email,
                        this.selectedItems
                    )

                    if (rs.status === "Success") {
                        this.goToSuccessPage()
                    }
                } catch (e) {
                    console.log(e)
                    DialogUtils.showErrorDialog({
                        text: e.message || LanguageUtils.lang("การส่งข้อมูลล้มเหลว", "Error while sending data")
                    })
                }

                this.loading = false
            }
        } else {
            this.isInvalidEmail = true
        }
    }

    private goToSuccessPage() {
        this.$router.push({
            name: ROUTER_NAMES.rewards_transaction_download_success,
            query: this.$route.query,
            params: this.$route.params
        })
    }
}