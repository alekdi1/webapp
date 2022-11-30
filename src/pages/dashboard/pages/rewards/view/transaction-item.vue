<template>
    <div>
        <v-card flat class="the1-transaction-item py-4" :disabled="loading !== '' || disabled">
            <v-row>
                <v-col v-if="showCancelUser">
                    <div class="d-flex align-center">
                        <strong class="req-cancel-user-label">{{ text.void_req_by }}: </strong>
                        <span class="req-cancel-user pl-1">{{ requestCancelUser }}</span>
                    </div>
                </v-col>
                <v-col align-self="end" class="d-flex justify-end">
                    <div v-html="displayStatus" />
                </v-col>
            </v-row>

            <div v-if="statusIs.approve_void_rejected && isApproveVoid" class="d-flex align-center">
                <strong class="req-cancel-user-label">{{ text.rejected_approve_by }}: </strong>
                <span class="req-cancel-user pl-1">{{ requestCancelUser }}</span>
            </div>

            <div v-if="statusIs.approve_void_confirmed && isApproveVoid" class="d-flex align-center">
                <strong class="req-cancel-user-label">{{ text.confirmed_approve_by }}: </strong>
                <span class="req-cancel-user pl-1">{{ approvedVoidBy }}</span>
            </div>

            <table class="w100 mb-2 mt-2">
                <tr>
                    <td rowspan="2" style="width: 36px;">
                        <div class="avatar">
                            <v-img :src="require('@/assets/images/icons/customer.svg')" :width="25" height="auto"/>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex">
                            <div class="d-flex flex-grow-1">
                                <span class="user-name">{{ displayMemberName }}</span>
                            </div>
                            <div class="d-flex flex-shrink-0">
                                <div class="transaction-id">{{ transactionId }}</div>
                            </div>
                        </div>

                        <div class="d-flex mt-1">
                            <div class="d-flex flex-grow-1">
                                <span class="the-1-number">The 1: </span>
                                <span class="the-1-number font-weight-bold pl-1">{{ displayNumber }}</span>
                            </div>
                            <div class="d-flex flex-shrink-0">
                                <div class="date-time">{{ displayDateTime }}</div>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>

            <div class="d-flex mt-2" v-if="!isExpan">
                <div class="d-flex flex-grow-1">
                    <span class="label-total-price">{{ text.total_price }}</span>
                </div>

                <div class="d-flex flex-shrink-0">
                    <span class="price-value">{{ displayTotalPrice }}</span>
                </div>
            </div>

            <v-expansion-panels flat v-model="expan">
                <v-expansion-panel>
                    <v-expansion-panel-content>

                        <div class="d-flex mt-1" >
                            <div class="d-flex flex-grow-1">
                                <span class="normal-value">{{ text.spending }}</span>
                            </div>

                            <div class="d-flex flex-shrink-0">
                                <span class="normal-value">{{ displayPrice }}</span>
                            </div>
                        </div>

                        <div class="d-flex mt-1" >
                            <div class="d-flex flex-grow-1">
                                <span class="normal-value">{{ text.dc_point_redeem }}</span>
                            </div>

                            <div class="d-flex flex-shrink-0">
                                <span class="normal-value">{{ displayDiscount }}</span>
                            </div>
                        </div>

                        <div class="d-flex mt-2 mb-3">
                            <div class="d-flex flex-grow-1">
                                <span class="label-total-price">{{ text.total_price }}</span>
                            </div>

                            <div class="d-flex flex-shrink-0">
                                <span class="price-value">{{ displayTotalPrice }}</span>
                            </div>
                        </div>

                        <div class="d-flex mt-1" >
                            <div class="d-flex flex-grow-1">
                                <span class="normal-value">{{ text.point_deducted }}</span>
                            </div>

                            <div class="d-flex flex-shrink-0">
                                <span class="normal-value">{{ displayPointUsed }}</span>
                            </div>
                        </div>

                        <div class="d-flex mt-1" >
                            <div class="d-flex flex-grow-1">
                                <span class="normal-value">{{ text.point_gain }}</span>
                            </div>

                            <div class="d-flex flex-shrink-0">
                                <span class="normal-value">{{ pointGain }}</span>
                            </div>
                        </div>

                        <div class="d-flex mt-1">
                            <div class="d-flex flex-grow-1">
                                <span class="normal-value">{{ text.recorder }}</span>
                            </div>

                            <div class="d-flex flex-shrink-0">
                                <span class="normal-value">{{ empName }}</span>
                            </div>
                        </div>

                        <div v-if="isApproveVoid">
                            <div class="d-flex mt-1" >
                                <div class="d-flex flex-grow-1">
                                    <span class="normal-value">{{ text.request_void_name }}</span>
                                </div>

                                <div class="d-flex flex-shrink-0">
                                    <span class="normal-value">{{ requestCancelUser }}</span>
                                </div>
                            </div>

                            <div class="d-flex mt-1" >
                                <div class="d-flex flex-grow-1">
                                    <span class="normal-value">{{ text.request_void_at }}</span>
                                </div>

                                <div class="d-flex flex-shrink-0">
                                    <span class="normal-value">{{ displayRequestVoidDate }}</span>
                                </div>
                            </div>
                        </div>

                        <div v-if="isApproveVoid && (statusIs.approve_void_confirmed || statusIs.approve_void_rejected)">
                            <div class="d-flex mt-1">
                                <div class="d-flex flex-grow-1">
                                    <span class="normal-value">{{ displayApproveVoidPersonDetail[0] }}</span>
                                </div>

                                <div class="d-flex flex-shrink-0">
                                    <span class="normal-value">{{ approvedVoidBy }}</span>
                                </div>
                            </div>

                            <div class="d-flex mt-1" >
                                <div class="d-flex flex-grow-1">
                                    <span class="normal-value">{{ displayApproveVoidPersonDetail[1] }}</span>
                                </div>

                                <div class="d-flex flex-shrink-0">
                                    <span class="normal-value">{{ displayRequestVoidDate }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex mt-1" >
                            <div class="d-flex flex-grow-1">
                                <span class="normal-value">{{ text.record }}</span>
                            </div>

                            <div class="d-flex flex-shrink-0">
                                <span class="normal-value">{{ note }}</span>
                            </div>
                        </div>

                        <div class="d-flex mt-1" v-if="statusIs.void_request || statusIs.void_approved">
                            <div class="d-flex flex-grow-1">
                                <span class="normal-value">{{ text.reason_for_cancellation }}</span>
                            </div>

                            <div class="d-flex flex-shrink-0">
                                <span class="normal-value" style="font-weight: bold;">{{ reasonOfCancel }}</span>
                            </div>
                        </div>

                        <div class="d-flex justify-center mt-6" v-if="statusIs.success && !isApproveVoid">
                            <v-btn @click="reqCancel" :loading="loading === 'req_cancel'" :disabled="loading !== ''" rounded color="primary" :height="48">
                                <span class="px-8 btn-text">{{ text.text_req_cancel }}</span>
                            </v-btn>
                        </div>

                        <div class="d-flex justify-center mt-6" v-if="statusIs.void_rejected && !isApproveVoid">
                            <v-btn @click="reqCancel" :loading="loading === 'req_cancel'" :disabled="loading !== ''" outlined rounded color="primary" :height="48">
                                <span class="px-8 btn-text text-primary">{{ text.text_req_cancel_again }}</span>
                            </v-btn>
                        </div>

                        <div class="d-flex justify-center mt-6" v-if="statusIs.void_request  && !isHistory && !isApproveVoid">
                            <v-btn @click="rejectCancel" :loading="loading === 'reject'" :disabled="loading !== ''" outlined rounded color="primary" :height="48">
                                <span class="px-4 btn-text text-primary">{{ text.text_reject }}</span>
                            </v-btn>

                            <v-btn @click="approveCancel" :loading="loading === 'approve'" :disabled="loading !== ''" class="ml-3" rounded color="primary" :height="48">
                                <span class="px-4 btn-text">{{ text.text_approve }}</span>
                            </v-btn>
                        </div>

                        <div class="d-flex justify-center mt-6" v-if="statusIs.approve_void_pending && isApproveVoid">
                            <v-btn @click="openApproveVoidDialog('rejected')" :loading="loading === 'reject'" :disabled="loading !== ''" outlined rounded color="primary" :height="48">
                                <span class="px-4 btn-text text-primary">{{ text.text_reject }}</span>
                            </v-btn>

                            <v-btn @click="openApproveVoidDialog('confirmed')" :loading="loading === 'approve'" :disabled="loading !== ''" class="ml-3" rounded color="primary" :height="48">
                                <span class="px-4 btn-text">{{ text.text_approve }}</span>
                            </v-btn>
                        </div>

                    </v-expansion-panel-content>
                    <v-expansion-panel-header />
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card>
        <v-dialog v-model="approveVoidDialog" :width="340" content-class="approve-void-dialog" persistent>
            <v-card>
                <div class="d-flex flex-column align-center">
                    <div class="dialog-text text-center" v-html="approveVoidText"/>

                    <v-btn @click="onApproveDialogConfirmClick" color="primary" :height="48" :loading="loading === 'approve_void'" :disabled="loading  === 'approve_void'" block rounded>
                        <span class="text-uppercase px-4">{{ text.confirm }}</span>
                    </v-btn>

                    <v-btn @click="approveVoidDialog = false" color="primary-dark" class="close-btn" fab>
                        <v-icon color="white">close</v-icon>
                    </v-btn>
                </div>
            </v-card>
        </v-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import { DialogUtils, LanguageUtils } from "@/utils"
import moment from "moment"
import numeral from "numeral"
import { RewardModel, UserModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { RewardServices, VuexServices } from "@/services"

const displayPrice = (v: number) => numeral(v).format("0,0.00")

@Component
export default class The1TransactionItemView extends Vue {

    @Prop({ default: () => new RewardModel.RewardTransaction() })
    private item!: RewardModel.RewardTransaction

    @Prop({ default: () => "" })
    private type!: string

    @Prop({ default: () => new UserModel.User() })
    private user!: UserModel.User

    @Prop({ default: () => new RewardModel.RewardConfig })
    private config!: RewardModel.RewardConfig

    @Prop({ default: false })
    private disabled!: boolean

    private approveVoidDialog = false

    private loading: "reject" | "approve" | "req_cancel" | "approve_void" | "" = ""

    private expan: any = null
    private id = Math.random().toString(36).replace("0.", "").toUpperCase()

    private approveVoidType = ""

    get statusIs() {
        const s = this.item.status
        const $S = RewardServices.TRANSACTION_STATUS
        return {
            success: s === $S.created,
            void_request: s === $S.request_void,
            void_approved: s === $S.voided,
            void_rejected: s === $S.void_rejected,
            approve_void_pending: s === $S.request_void,
            approve_void_confirmed: s === $S.voided,
            approve_void_rejected: s === $S.void_rejected,
        }
    }

    get transactionId() {
        return this.item.transactionId
    }

    get isHistory() {
        return this.type === "history"
    }

    get isApproveVoid () {
        return this.type === "approveVoid"
    }

    get pointGain() {
        return this.item.earnPoint
    }

    get pointUsed() {
        return this.item.redeemedPoint
    }

    get isExpan() {
        return typeof this.expan === "number"
    }

    get showCancelUser() {
        const { statusIs } = this
        return statusIs.void_request || statusIs.void_approved || statusIs.void_rejected
    }

    get displayMemberName() {
        const i = this.item
        return LanguageUtils.lang(i.fullNameTh, i.fullNameEn)
    }

    get displayNumber() {
        return this.item.the1CardNo
    }

    get displayPrice() {
        return displayPrice(this.item.totalAmount)
    }

    get displayTotalPrice() {
        return displayPrice(this.item.earnValue)
    }

    get displayDiscount() {
        return displayPrice(-this.item.redeemedValue)
    }

    get displayPointUsed() {
        return -this.pointUsed
    }

    get displayDateTime() {
        const md = this.isApproveVoid ? moment(this.item.requestVoidDate, "YYYY-MM-DD HH:mm:ss") : moment(this.item.createdDate, moment.ISO_8601)
        if (md.isValid()) {
            md.locale(LanguageUtils.getCurrentLang())
            return `${ md.format("D MMM") } ${ LanguageUtils.lang(md.year() + 543, md.year()) } / ${ md.format("HH:mm") } ${ LanguageUtils.lang("น.", "") }`
        }
        return ""
    }

    get requestCancelUser() {
        return this.item.requestVoidBy
    }

    get approvedVoidBy() {
        return this.item.approvedVoidBy
    }

    get empName() {
        return this.item.createdBy
    }

    private displayDate (date: string) {
        const md = moment(date, "YYYY-MM-DD HH:mm:ss")
        md.locale(LanguageUtils.getCurrentLang())
        return `${md.format("D MMM") } ${ LanguageUtils.lang(md.year() + 543, md.year()) }`
    }

    get displayRequestVoidDate () {
        return this.displayDate(this.item.requestVoidDate)
    }

    get displayApproveVoidDate () {
        return this.displayDate(this.item.approvedVoidDate)
    }

    get note() {
        return this.item.note
    }

    get reasonOfCancel() {
        return this.item.noteVoid
    }

    get displayStatus() {

        const { lang } = LanguageUtils

        const htmlStatus = (color: string, statusText: string) => (
            `<div class="d-flex align-center">
                <span class="material-icons" style="color: ${ color }; font-size: 12px;">circle</span>
                <span class="pl-2" style="font-size: 12px;font-weight: bold;color: ${ color };">${ statusText }</span>
            </div>`
        )

        const $S = RewardServices.TRANSACTION_STATUS
        if (this.isApproveVoid) {
            switch (this.item.status) {
                case $S.request_void: return htmlStatus("#f8bf32", lang("รออนุมัติ", "Pending"))
                case $S.voided: return htmlStatus("#7da580", lang("อนุมัติ", "Confirmed"))
                case $S.void_rejected: return htmlStatus("#ea4b60", lang("ไม่อนุมัติ", "Rejected"))
                default: return ""
            }
        } else {
            switch (this.item.status) {
                case $S.created: return ""
                case $S.request_void: return htmlStatus("#f8bf32", lang("คำขอยกเลิกรออนุมัติ", "Void request waiting for approve"))
                case $S.voided: return htmlStatus("#7da580", lang("ยกเลิกรายการสำเร็จ", "Void success"))
                case $S.void_rejected: return htmlStatus("#ea4b60", lang("คำขอยกเลิกถูกปฏิเสธ", "Void request rejected"))
                default: return ""
            }
        }
    }

    get text() {
        const t = (k: string) => this.$t("the1." + k).toString()
        return {
            total_price: t("total_price"),
            spending: t("total_spending"),
            dc_point_redeem: t("discount_from_point_redeem"),
            point_deducted: t("point_deducted"),
            point_gain: t("point_gain"),
            recorder: t("recorder"),
            record: t("record"),
            reason_for_cancellation: t("reason_for_void"),
            text_req_cancel: t("request_void"),
            text_req_cancel_again: t("request_void_again"),
            text_approve: this.$t("approve").toString(),
            text_reject: this.$t("reject").toString(),
            void_req_by: LanguageUtils.lang("ขอยกเลิกโดย", "Void request by"),
            confirm: this.$t("confirm").toString(),
            reject_request_approve_void: this.$t("pages.approve_void.reject_request_approve_void").toString(),
            confirm_request_approve_void: this.$t("pages.approve_void.confirm_request_approve_void").toString(),
            confirmed_approve_by: this.$t("pages.approve_void.confirmed_approve_by").toString(),
            rejected_approve_by: this.$t("pages.approve_void.rejected_approve_by").toString(),
            request_void_name: this.$t("pages.approve_void.request_void_name").toString(),
            request_void_at: this.$t("pages.approve_void.request_void_at").toString(),
        }
    }

    private async reqCancel() {
        this.loading = "req_cancel"
        try {
            await VuexServices.CustomerReward.transaction.set(this.item)
            this.$router.push({
                name: ROUTER_NAMES.rewards_transaction_cancellation_form,
                params: {
                    transaction_id: this.item.transactionId
                },
                query: {
                    ...(this.$route.query || {})
                }
            })
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }
        this.loading = ""
    }

    private get displayApproveVoidPersonDetail () {
        const { lang } = LanguageUtils
        if (this.statusIs.approve_void_confirmed) {
            return [
                lang("คนที่อนุมัติ", "Voided person"),
                lang("วันเวลาที่อนุมัติ", "Voided date")
            ]
        }
        return [
                lang("คนที่ปฎิเสธ", "Rejected void person"),
                lang("วันเวลาที่เสธ", "Rejected date")
            ]
    }

    private async approveCancel() {
        this.loading = "approve"
        try {
            // TODO: Implement with API
            this.onUpdate()
        } catch (e) {
            console.log(e)
        }
        this.loading = ""
    }

    private async rejectCancel() {
        this.loading = "reject"
        try {
            // TODO: Implement with API

            this.onUpdate()
        } catch (e) {
            console.log(e)
        }
        this.loading = ""
    }

    private onUpdate() {
        this.$emit("updated", this.item)
    }

    private openApproveVoidDialog (type: "rejected" | "confirmed") {
        this.approveVoidDialog = true
        this.approveVoidType = type
    }

    private get approveVoidText () {
        return this.approveVoidType === "rejected" ? this.text.reject_request_approve_void : this.text.confirm_request_approve_void
    }

    private async onApproveDialogConfirmClick () {
        this.loading = "approve_void"
        try {
            const { transactionId, associateId } = this.item
            const { id, username, firstName, lastName } = this.user
            const { branchCode1Biz, partnerCode } = this.config
            if (this.approveVoidType === "rejected") {
                await RewardServices.rejectTransectionVoid({
                    transactionId,
                    associateId,
                    staffId: id,
                    username: username,
                    name: firstName,
                    lastname: lastName,
                    the1BizBranchCode: branchCode1Biz,
                    partnerCode: partnerCode,
                    posNo: null
                })
            } else {
                await RewardServices.approveTransectionVoid({
                    transactionId,
                    associateId,
                    staffId: id,
                    username: username,
                    name: firstName,
                    lastname: lastName,
                    the1BizBranchCode: branchCode1Biz,
                    partnerCode: partnerCode,
                    posNo: null
                })
            }

            this.$router.push({
                name: ROUTER_NAMES.rewards_approve_void_success,
                params: {
                    type: this.approveVoidType
                }
            })
        } catch (e) {
            this.approveVoidDialog = false
            DialogUtils.showErrorDialog({ text:  LanguageUtils.lang("ไม่สามารถทำรายการได้", "Void request failed")})
        }
        this.loading = ""
    }

    private async mounted () {
        const { transaction_id: transactionId, item_id: itemId, action } = this.$route.query

        // auto expend from noti
        if (transactionId === String(this.item.transactionId) && itemId === String(this.item.id) && action === "expand") {
            this.expan = 0
        }
    }
}
</script>

<style lang="scss">
.the1-transaction-item {

    .btn-text {
        font-size: 14.4px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1;
        letter-spacing: 0.14px;
        text-align: center;
    }

    .user-name {
        font-size: 15px;
        font-weight: bold;
        color: #030303;
    }

    .the-1-number {
        font-size: 12px;
        color: #010101;
    }

    .date-time {
        font-size: 12px;
        color: #010101;
    }

    .label-total-price {
        font-size: 12px;
        font-weight: bold;
        color: #000000;
    }

    .price-value {
        font-size: 18px;
        font-weight: bold;
        color: #000000;
    }

    .req-cancel-user {
        font-size: 12px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.2;
        letter-spacing: 0.12px;
        text-align: left;
        color: #000000;
    }

    .req-cancel-user-label {
        font-size: 12px;
        font-weight: bold;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.2;
        letter-spacing: 0.12px;
        text-align: left;
        color: #000000;
    }

    .v-expansion-panels {
        z-index: unset !important;
        .v-expansion-panel-header {
            min-height: unset !important;
            padding: 0 !important;
            flex-direction: row;
            justify-content: center;
            .v-expansion-panel-header__icon {
                margin-left: unset !important;
                .v-icon {
                    font-size: 36px;
                }
            }
        }

        .v-expansion-panel-content {
            .v-expansion-panel-content__wrap {
                padding-left: 0 !important;
                padding-right: 0 !important;
                padding-top: 16px !important;
            }
        }
    }

    .normal-value {
        font-size: 12px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.5;
        letter-spacing: 0.12px;
        text-align: left;
        color: #040404;
    }

    .transaction-id {
        font-size: 12px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.5;
        letter-spacing: 0.12px;
        text-align: right;
        color: #010101;
    }
}
.approve-void-dialog {
    border-radius: 24px;
    overflow: visible;
    .v-card {
        border-radius: 24px;
        padding-left: 48px;
        padding-right: 48px;
        padding-top: 24px;
        padding-bottom: 48px;
        position: relative;

        .dialog-text {
            margin-top: 40px;
            margin-bottom: 32px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: #030303;
        }

        .close-btn {
            width: 48px !important;
            height: 48px !important;
            position: absolute;
            bottom: -24px;
        }
    }
}
</style>