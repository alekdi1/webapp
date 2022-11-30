import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/pages/rewards/reward-base"
import numeral from "numeral"
import { DialogUtils, LanguageUtils } from "@/utils"
import moment from "moment"
import ctjs from "crypto-js"
import { ROUTER_NAMES } from "@/router"
import { RewardServices, VuexServices } from "@/services"
import { RewardModel } from "@/models"

const displayPrice = (v: number) => numeral(v).format("0,0.00")

@Component
export default class CustomerRewardTransactionVoidRequestForm extends Base {

    @VuexServices.CustomerReward.transaction.VX()
    private transaction!: RewardModel.RewardTransaction|null

    private reason = ""
    private loading = false
    private state = ""
    private confirmDialog = false

    private async mounted() {

        const { transaction, transactionId } = this
        if (!transaction || (transaction && String(transaction.transactionId) !== transactionId)) {
            return this.$router.replace({
                name: ROUTER_NAMES.rewards_transaction_history,
                query: {
                    ...(this.$route.query || {})
                }
            })
        }
    }

    private get transactionId() {
        return String(this.$route.params.transaction_id)
    }

    private async confirm() {
        this.loading = true

        const { transaction, reason } = this
        try {
            if (!transaction) {
                throw new Error("No transaction")
            }

            this.state = ctjs.SHA256(Date.now().toString() + JSON.stringify(transaction)).toString()
            await RewardServices.requestVoidTransaction(transaction, reason)
            this.$router.replace({
                query: {
                    status: "success",
                    state: this.state
                }
            })
        } catch (e) {
            console.log(e)
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }
        this.confirmDialog = false
        this.loading = !true
    }

    private showConfirmDialog() {
        this.confirmDialog = true
    }

    private get showSuccess() {
        return this.$route.query.status === "success" && this.state === this.$route.query.state
    }

    private get maxReasonLength() {
        return 50
    }

    private get text() {
        const t = (k: string) => this.$t("pages.rewards_transaction_void_form." + k).toString()
        const t1 = (k: string) => this.$t("the1." + k).toString()
        return {
            title: t("title"),
            total_price: t1("total_price"),
            spending: t1("total_spending"),
            dc_point_redeem: t1("discount_from_point_redeem"),
            point_deducted: t1("point_deducted"),
            point_gain: t1("point_gain"),
            recorder: t1("recorder"),
            record: t1("record"),
            reason_for_cancellation: t1("reason_for_void"),
            text_req_cancel: t1("request_void"),
            text_req_cancel_again: t1("request_void_again"),
            confirm: LanguageUtils.lang("ยืนยัน", "Confirm"),
            acknowledge_desc: LanguageUtils.lang("ส่งเอกสารประวัติการทำรายการ<br>ไปในอีเมลของคุณเรียบร้อยแล้ว", "Submit transaction history documents<br>to your email already."),
            confirm_text: LanguageUtils.lang("ต้องการส่งคำขอ<br>ยกเลิกการทำรายการ", "Do you want to send a request<br>to void the transaction"),
            bth: LanguageUtils.lang("กลับไปหน้าหลัก", "Back to home"),
        }
    }

    private bth() {
        return this.$router.replace({
            name: ROUTER_NAMES.rewards_transaction_history
        })
    }

    private get customerName() {
        return this.transaction ? LanguageUtils.lang(
            this.transaction.fullNameTh,
            this.transaction.firstnameEn
        ) : ""
    }

    private get the1Number() {
        return this.transaction?.the1CardNo || ""
    }

    private get displayPaymentPrice() {
        return displayPrice(this.transaction?.totalAmount || 0)
    }

    private get displayDiscountFromRedeemPoints() {
        return displayPrice(-(this.transaction?.redeemedValue || 0))
    }

    private get totalPrice() {
        return displayPrice(this.transaction?.earnValue || 0)
    }

    private get displayPointUsed() {
        return this.transaction?.redeemedPoint || 0
    }

    private get pointGain() {
        return this.transaction?.earnPoint || 0
    }

    private get displayDateTime() {
        if (this.transaction) {
            const md = moment(this.transaction.createdDate, moment.ISO_8601)
            if (md.isValid()) {
                md.locale(LanguageUtils.getCurrentLang())
                return `${ md.format("D MMM") } ${ LanguageUtils.lang(md.year() + 543, md.year()) } / ${ md.format("HH:mm") } ${ LanguageUtils.lang("น.", "") }`
            }
        }
        return ""
    }

    private get requestCancelUser() {
        return this.transaction?.requestVoidBy || ""
    }

    private get empName() {
        return this.transaction?.createdBy || ""
    }

    private get note() {
        return this.transaction?.note || ""
    }

    private get reasonOfCancel() {
        return this.transaction?.noteVoid || ""
    }
}


