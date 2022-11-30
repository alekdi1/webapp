import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import ViewInvoiceHistoryDetail from "./components/invoice-history-detail/invoice-history-detail.vue"
import { EmployeeServices, LogServices, PaymentServices, VuexServices } from "@/services"
import { BranchModel, PaymentModel } from "@/models"
import { TimeUtils, NumberUtils, DialogUtils, LanguageUtils } from "@/utils"
import moment from "moment"
import PageNames from "../page-names"
import { PaymentSlip } from "@/pages/dashboard/models"
import PaymentSplit from "@/pages/dashboard/views/payment-slip.vue"
import numeral from "numeral"
import { ROUTER_NAMES } from "@/router"
import { Endpoints } from "@/config"

class Transaction extends PaymentModel.PaymentTransactionItem {}

@Component({
    name: PageNames.payment_history,
    components: {
        "cpn-payment-slip": PaymentSplit,
        "cpn-payment-invoice-history-detail": ViewInvoiceHistoryDetail
    }
})
export default class PaymentHistoryPage extends Base {
    private isLoading = false
    private isExpandedDetail = false
    private selectedInvoice: Transaction|null = null
    private transactions: Transaction[] =  []
    private searchBranch = ""
    private slip: PaymentSlip|null = null
    private route = ROUTER_NAMES.dashboard_payment_history
    private userNo = ""

    private async mounted () {
        this.userNo = this.user.customerNo
        LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onPageLoad"))
        await this.getPaymentHistory()
        LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onReady"))
    }

    private async onSlipData(s: PaymentSlip) {
        this.slip = s
        await this.$nextTick()
        // @ts-ignore
        await this.$refs.slipView.download()
        this.slip = null
    }

    private async getPaymentHistory() {
        this.isLoading = true

        try {
            let transactions: PaymentModel.PaymentTransactionItem[] = []
            if (!this.user.isOwner) {
                const permission = this.user.permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.payment)
                if (!permission) {
                    throw new Error(LanguageUtils.lang("คุณไม่มีสิทธิ์เข้าใช้งาน", "You have no permission to use this feature"))
                }
                const filters = permission?.shops?.map(e=>{return {"branchId" : e.branch.code==='PK2'?'PKT': (e.branch.code==='PKT'?'PK1':e.branch.code),
                shopId : e.number.toString().padStart(6, "0"),
                industryCode : e.industryCode}});
                console.log(permission?.shops);
                
                const branches: any[] = []
                const shops: any[] = []
                permission?.shops?.map(e=>{branches.push( {branchId : e.branch.code==='PK2'?'PKT': (e.branch.code==='PKT'?'PK1':e.branch.code)})});
                permission?.shops?.map(e=>{shops.push({
                    // shopId : e.id,
                    shopId : e.number.toString().padStart(6, "0"),
                    industryCode : e.industryCode
                })});

                LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallStart", Endpoints.getPaymentHistory))
                transactions = await PaymentServices.getPaymentHistory(this.user.customerNo,filters)
                LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallFinsih", Endpoints.getPaymentHistory))

                const formatShopNumber = (shopNumber: string|number) => numeral(shopNumber).format("000000")
                const mapKeys: {[x: string]: boolean|undefined} = {}

                for (const shop of permission.shops) {
                    const key = `${ formatShopNumber(shop.number) }-${shop.branch.code=='PK2'?'PKT': (shop.branch.code=='PKT'?'PK1':shop.branch.code)}-${ shop.industryCode }`
                    // console.log(key)
                    // const key = `${ formatShopNumber(shop.number) }-${ shop.branch.code!='PK2' && shop.branch.code!='PK1'?shop.branch.code:'PKT' }-${ shop.industryCode }`
                    mapKeys[key] = true
                }
                const items: PaymentModel.PaymentTransactionItem[] = []
                // filter invoice
                for (const transaction of transactions) {
                    const invoices: PaymentModel.PaymentInvoiceItem[] = []
                    for (const inv of transaction.invoices) {
                        // console.log(`${ inv.shop.id }-${ inv.branch.id }-${ inv.shop.industryCode }`)
                        if (mapKeys[`${ inv.shop.id }-${ inv.branch.id }-${ inv.shop.industryCode }`] === true) {
                            invoices.push(inv)
                        }
                    }
                    transaction.invoices = invoices

                    if (invoices.length > 0) {
                        items.push(transaction)
                    }
                }

                transactions = items
            } else {
                LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallStart", Endpoints.getPaymentHistory))
                transactions = await PaymentServices.getPaymentHistory(this.user.customerNo)
                LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallFinsih", Endpoints.getPaymentHistory))
            }

            this.transactions = transactions
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || "Get payment history data error"
            })
        }
        this.isLoading = false
    }
    
    private get text () {
        return {
            title: this.$t("pages.payment_history.title").toString(),
            transaction_no: this.$t("transaction_no").toString(),
            baht: this.$t("baht").toString(),
            search_branch: this.$t("search_branch_or_store").toString()
        }
    }

    private displayAmount (price: number) {
        return NumberUtils.getPriceFormat(price)
    }

    private displayDate (date: string) {
        return TimeUtils.convertToLocalDateFormat(moment(date))
    }

    private displayTime (date: string) {
        return TimeUtils.convertToLocalTimeFormat(moment(date))
    }

    private expandedInvoiceDetail(item: Transaction) {
        this.isExpandedDetail = !this.isExpandedDetail
        this.selectedInvoice = item
        const query = {
            transaction: item.uniqueId,
            ref: item.refKey,
            ts: new Date().getTime().toString()
        }
        this.$router.replace({
            query
        })

    }

    private isItemActive(item: Transaction) {
        return this.selectedInvoice?.uniqueId === item.uniqueId
    }

    private get displayTransactions() {
        const { transactions, searchBranch } = this
        if (!searchBranch) {
            return transactions
        }

        const search = String(searchBranch).toLowerCase()
        return transactions.filter(T => T.invoices.some(I => (
            I.branch.displayName.toLowerCase().includes(search) ||
            I.shop.displayName.toLowerCase().includes(search)
        )))
    }
}
