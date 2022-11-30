import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/pages/rewards/reward-base"
import { DialogUtils, LanguageUtils } from "@/utils"
import TransactionItem from "../../view/transaction-item.vue"
import { RewardServices, VuexServices } from "@/services"
import { RewardModel } from "@/models"
import { ROUTER_NAMES } from "@/router"

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
export default class ApproveVoid extends Base {
    private approveAvoidItems: RewardModel.RewardTransaction[] = []
    private tabType = this.$route.params.type === "approved" ? 1 : 0
    private loading = false
    private hasPermission = false

    private paginate = new Paginate()

    private async mounted () {
        if (!this.userPermissions.approveVoid) {
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

        // active tab from notification
        if (this.$route.query.show_from === "notification") {
            const S = RewardServices.TRANSACTION_STATUS
            if ([S.voided, S.void_rejected].includes(String(this.$route.query.status_tab)))
                this.tabType = 1
            else
                this.tabType = 0
        }
        await this.getApprovedVoid()
    }

    private get text() {
        const t = (k: string) => this.$t("pages.approve_void." + k).toString()
        return {
            title: t("title"),
            tab1: LanguageUtils.lang("รออนุมัติ", "Pending approval"),
            tab2: LanguageUtils.lang("ประวัติการอนุมัติ", "Approval history"),
            data_not_found: this.$t("data_not_found").toString()
        }
    }

    private async onTypeChange () {
        this.paginate = new Paginate()
        this.approveAvoidItems = []
        await this.getApprovedVoid()
    }

    private get isPending () {
        return this.tabType === 0
    }

    private get isEmpty () {
        return this.approveAvoidItems.length === 0
    }

    private onContentScroll(/*e: Event*/) {
        const container = this.$refs["dbs-approve-void-container"] as HTMLDivElement
        if (container.offsetHeight + container.scrollTop >= container.scrollHeight) {
            if (!this.loading && !this.paginate.isLastPage) {
                this.paginate.tempCurrentPage++
                this.getApprovedVoid()
            }
        }
    }

    private async getApprovedVoid() {

        try {
            this.loading = true

            let { configs } = this

            const store = await this.getStoreFromQuery()
    
            if (!store) {
                return DialogUtils.showErrorDialog({
                    text: `Store not found`
                }).then(() => {
                    this.$router.replace({
                        name: ROUTER_NAMES.rewards_shop_list
                    })
                })
            }
    
            if (configs.length === 0) {
                configs = await RewardServices.getRewardConfigs(this.user.bpNumber, store.branch.code, store.industryCode, store.number, store.floorRoom)
                if (configs.length === 0) throw new Error("No store config")
                await VuexServices.CustomerReward.configs.set(configs)
            }
    
            const config = this.filterConfig(configs)

            if (this.isPending) {
                const rs = await RewardServices.getPendingApproveVoidHistory({
                    the1BizBranchCode: config.branchCode1Biz,
                    partnerCode: config.partnerCode,
                    paginate: {
                        itemPerPage: this.paginate.ITEM_PER_PAGE,
                        page: this.paginate.tempCurrentPage
                    },
                    store
                })

                this.paginate.lastPage = rs.lastPage
                this.paginate.currentPage = rs.currentPage
                this.paginate.tempCurrentPage = rs.currentPage
                this.paginate.totalItems = rs.total

                this.approveAvoidItems = [
                    ...this.approveAvoidItems,
                    ...rs.transactions
                ]
            } else {
                const rs = await RewardServices.getApproveVoidedHistory({
                    the1BizBranchCode: config.branchCode1Biz,
                    partnerCode: config.partnerCode,
                    paginate: {
                        itemPerPage: this.paginate.ITEM_PER_PAGE,
                        page: this.paginate.tempCurrentPage
                    },
                    store
                })

                this.paginate.lastPage = rs.lastPage
                this.paginate.currentPage = rs.currentPage
                this.paginate.tempCurrentPage = rs.currentPage
                this.paginate.totalItems = rs.total

                this.approveAvoidItems = [
                    ...this.approveAvoidItems,
                    ...rs.transactions
                ]
            }
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || "Error"
            })
            this.paginate.tempCurrentPage = this.paginate.currentPage
        }
        this.loading = false
    }
}
