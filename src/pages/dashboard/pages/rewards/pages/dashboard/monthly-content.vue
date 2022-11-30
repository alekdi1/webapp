<template>
    <div id="reward-monthly-content">
        <div class="transaction-list">
            <v-tabs @change="onTabChange" v-model="summaryTab" :class="{ 'hide-first-item': hideTabSliderOnFirstItem, 'hide-last-item': hideTabSliderOnLastItem }" continuous grow>
                <v-tab :disabled="loading" v-for="(st, idx) in summaryTabs" :key="'summary-tab-' + idx"  >
                    <div class="cpn-text-default text-primary-dark font-weight-bold">{{ st.label }}</div>
                </v-tab>
            </v-tabs>

            <v-tabs-items v-model="summaryTab">
                <v-tab-item :value="0">
                    <template>
                        <summary-card-monthly
                            ref="monthly-summary-card-redeem"
                            :disabled="loading"
                            :loading="loading"
                            :summary="summaryRedeem"
                            class="my-2 mx-1"
                            type="redeem"
                            @dateChange="onSummaryDateChange($event, 'redeem')"/>
                        <div v-if="loading" style="width: 100%; height: 120px; margin-bottom: 64px;" class="d-flex align-center justify-center">
                            <cpn-loading />
                        </div>
                        <div v-else>
                            <v-divider class="mt-3" />
                            <div>
                                <v-card @click="selectSummaryCard(idx, 'monthly-summary-card-redeem', item.start, item.end, summaryRedeem)"
                                    v-for="(item, idx) in summaryRedeem.summaryListSortLastest" :key="'summary-redeem-item-' + idx"
                                    class="pr-2 pt-3 summary-detail-card" elevation="0" v-ripple>
                                    <div class="label-container d-flex flex-row justify-center align-center">
                                        <div class="flex-grow-1 font-weight-bold pl-2 py-1">{{ item.displayMonthName }}</div>
                                        <div class="flex-shrink-0 font-weight-bold">{{ item.displayMonthDateRange }}</div>
                                    </div>
                                    <div class="d-flex flex-row justify-center align-center my-1">
                                        <div class="cpn-text-body-2 flex-grow-1">{{ item.earnPointLabel }}</div>
                                        <div class="flex-shrink-0 font-weight-bold price-text-yellow">{{ item.earnPoint }}</div>
                                    </div>
                                    <div class="d-flex flex-row justify-center align-center my-1">
                                        <div class="cpn-text-body-2 flex-grow-1">{{ item.redeemPointLabel }}</div>
                                        <div class="flex-shrink-0 font-weight-bold price-text-green">{{ item.redeemedPoint }}</div>
                                    </div>
                                    <v-divider />
                                </v-card>
                            </div>
                        </div>
                    </template>
                </v-tab-item>

                <v-tab-item :value="1">
                    <template>
                        <summary-card-monthly
                            ref="monthly-summary-card-transaction"
                            :disabled="loading"
                            :loading="loading"
                            :summary="summaryTransaction"
                            class="my-2 mx-1"
                            type="transaction"
                            @dateChange="onSummaryDateChange($event, 'transaction')"/>
                        <div v-if="loading" style="width: 100%; height: 120px; margin-bottom: 64px;" class="d-flex align-center justify-center">
                            <cpn-loading />
                        </div>
                        <div v-else>
                            <v-divider class="mt-3" />
                            <div>
                                <v-card @click="selectSummaryCard(idx, 'monthly-summary-card-transaction', item.start, item.end, summaryTransaction)"
                                    v-for="(item, idx) in summaryTransaction.summaryListSortLastest" :key="'summary-transaction-item-' + idx"
                                    class="pr-2 pt-3 summary-detail-card" elevation="0" v-ripple>
                                    <div class="label-container d-flex flex-row justify-center align-center">
                                        <div class="flex-grow-1 font-weight-bold pl-2 py-1">{{ item.displayMonthName }}</div>
                                        <div class="flex-shrink-0 font-weight-bold">{{ item.displayMonthDateRange }}</div>
                                    </div>
                                    <div class="d-flex flex-row justify-center align-center my-1">
                                        <div class="cpn-text-body-2 flex-grow-1">{{ item.totalReceiptLabel }}</div>
                                        <div class="flex-shrink-0 font-weight-bold price-text-yellow">{{ item.invoices }}</div>
                                    </div>
                                    <div class="d-flex flex-row justify-center align-center my-1">
                                        <div class="cpn-text-body-2 flex-grow-1">{{ item.the1MemberLabel }}</div>
                                        <div class="flex-shrink-0 font-weight-bold price-text-green">{{ item.the1Members }}</div>
                                    </div>
                                    <v-divider />
                                </v-card>
                            </div>
                        </div>
                    </template>
                </v-tab-item>

                <v-tab-item :value="2">
                    <template>
                        <summary-card-monthly
                            ref="monthly-summary-card-sales"
                            :disabled="loading"
                            :loading="loading"
                            :summary="summarySales"
                            class="my-2 mx-1"
                            type="sales"
                            @dateChange="onSummaryDateChange($event, 'sales')"/>
                        <div v-if="loading" style="width: 100%; height: 120px; margin-bottom: 64px;" class="d-flex align-center justify-center">
                            <cpn-loading />
                        </div>
                        <div v-else>
                            <v-divider class="mt-3" />
                            <div>
                                <v-card @click="selectSummaryCard(idx, 'monthly-summary-card-sales', item.start, item.end, summarySales)"
                                    v-for="(item, idx) in summarySales.summaryListSortLastest" :key="'summary-sales-item-' + idx"
                                    class="pr-2 pt-3 summary-detail-card" elevation="0" v-ripple>
                                    <div class="label-container d-flex flex-row justify-center align-center">
                                        <div class="flex-grow-1 font-weight-bold pl-2 py-1">{{ item.displayMonthName }}</div>
                                        <div class="flex-shrink-0 font-weight-bold">{{ item.displayMonthDateRange }}</div>
                                    </div>
                                    <div class="d-flex flex-row justify-center align-center my-1">
                                        <div class="cpn-text-body-2 flex-grow-1">{{ item.priceBeforeDiscountLabel }}</div>
                                        <div class="flex-shrink-0 font-weight-bold price-text-yellow">{{ item.priceBeforeDiscount }}</div>
                                    </div>
                                    <div class="d-flex flex-row justify-center align-center my-1">
                                        <div class="cpn-text-body-2 flex-grow-1">{{ item.priceAfterDiscountLabel }}</div>
                                        <div class="flex-shrink-0 font-weight-bold price-text-green">{{ item.priceAfterDiscount }}</div>
                                    </div>
                                    <v-divider />
                                </v-card>
                            </div>
                        </div>
                    </template>
                </v-tab-item>

                <v-tab-item :value="3">
                    <template>
                        <summary-card-monthly
                            ref="monthly-summary-card-void"
                            :disabled="loading"
                            :loading="loading"
                            :summary="summaryVoid"
                            class="my-2 mx-1"
                            type="void"
                            @dateChange="onSummaryDateChange($event, 'void')"/>
                        <div v-if="loading" style="width: 100%; height: 120px; margin-bottom: 64px;" class="d-flex align-center justify-center">
                            <cpn-loading />
                        </div>
                        <div v-else>
                            <v-divider class="mt-3" />
                            <div>
                                <v-card @click="selectSummaryCard(idx, 'monthly-summary-card-void', item.start, item.end, summaryVoid)"
                                    v-for="(item, idx) in summaryVoid.summaryListSortLastest" :key="'summary-void-item-' + idx"
                                    class="pr-2 pt-3 summary-detail-card" elevation="0" v-ripple>
                                    <div class="label-container d-flex flex-row justify-center align-center">
                                        <div class="flex-grow-1 font-weight-bold pl-2 py-1">{{ item.displayMonthName }}</div>
                                        <div class="flex-shrink-0 font-weight-bold">{{ item.displayMonthDateRange }}</div>
                                    </div>
                                    <div class="d-flex flex-row justify-center align-center my-1">
                                        <div class="cpn-text-body-2 flex-grow-1">{{ item.pendingVoidLabel }}</div>
                                        <div class="flex-shrink-0 font-weight-bold price-text-yellow">{{ item.pending }}</div>
                                    </div>
                                    <div class="d-flex flex-row justify-center align-center my-1">
                                        <div class="cpn-text-body-2 flex-grow-1">{{ item.voidedLabel }}</div>
                                        <div class="flex-shrink-0 font-weight-bold price-text-green">{{ item.voided }}</div>
                                    </div>
                                    <v-divider />
                                </v-card>
                            </div>
                        </div>
                    </template>
                </v-tab-item>
            </v-tabs-items>
        </div>
    </div>
</template>
<script lang="ts">
import { Component } from "vue-property-decorator"
import Base from "../../reward-base"
import MonthlySummaryCard from "./view/monthly-summary-type.vue"
import { DialogUtils, LanguageUtils } from "@/utils"
import moment from "moment"
import { SummaryGroup, SummaryRedeemItem, SummaryTransactionItem, SummarySalesItem, SummaryVoidItem, ChartDataset } from "./model"
import { RewardServices, StoreServices, VuexServices } from "@/services"

const DF = "YYYY-MM-DD"
const PAGE_SIZE = 10000

@Component({
    components: {
        "summary-card-monthly": MonthlySummaryCard,
    }
})
export default class MonthlyCcontentView extends Base {
    private loading = false
    private summaryTab = 0

    private dataLoaded: string[] = []

    private chartLabelsRange: Date[][] = []

    summaryRedeem = new SummaryGroup<SummaryRedeemItem>()
    summaryTransaction = new SummaryGroup<SummaryTransactionItem>()
    summaryVoid = new SummaryGroup<SummaryVoidItem>()
    summarySales = new SummaryGroup<SummarySalesItem>()


    private async mounted() {
        await this.onTabChange()
    }

    private selectSummaryCard (idx: number, refKey: string, start: Date, end: Date, group: SummaryGroup<SummaryVoidItem | SummarySalesItem | SummaryRedeemItem | SummaryTransactionItem>) {
        group.currentStartDate = start
        group.currentEndDate = end
        this.selectCardDataIndex(refKey, 2 - idx)
    }

    private onSummaryDateChange(data: { date: Date; index: number }, type: string) {
        switch (type) {
            case "redeem": {
                this.$set(this.summaryRedeem, "currentDate", data.date)
                const item = this.summaryRedeem.summaryList[data.index]
                this.$set(this.summaryRedeem, "currentValues", item ? [item.earnPoint, item.redeemedPoint] : [])
                break
            }
            case "transaction": {
                this.$set(this.summaryTransaction, "currentDate", data.date)
                const item = this.summaryTransaction.summaryList[data.index]
                this.$set(this.summaryTransaction, "currentValues", item ? [item.invoices, item.the1Members] : [])
                break
            }
            case "sales": {
                this.$set(this.summarySales, "currentDate", data.date)
                const item = this.summarySales.summaryList[data.index]
                this.$set(this.summarySales, "currentValues", item ? [item.priceBeforeDiscount, item.priceAfterDiscount] : [])
                break
            }
            case "void": {
                this.$set(this.summaryVoid, "currentDate", data.date)
                const item = this.summaryVoid.summaryList[data.index]
                this.$set(this.summaryVoid, "currentValues", item ? [item.pending, item.voided] : [])
                break
            }
        }
    }

    private get summaryTabs() {
        const { lang } = LanguageUtils
        return [
            {
                value: "redeem_summary",
                label: lang("สรุปการสะสมและแลกคะแนน", "Earn & redeem")
            },
            {
                value: "list_summary",
                label: lang("สรุปการทำรายการ", "Transaction")
            },
            {
                value: "sales_summary",
                label: lang("สรุปยอดขาย", "Sales")
            },
            {
                value: "void_summary",
                label: lang("สรุปการยกเลิกรายการ", "Void")
            }
        ]
    }

    private async onTabChange () {
        let refKey = ""
        switch (this.summaryTab) {
            // redeem_summary
            case 0: {
                await this.getTransactions()
                refKey = "monthly-summary-card-redeem"
                break
            }
            // list_summary
            case 1: {
                refKey = "monthly-summary-card-transaction"
                break
            }
            // sales_summary
            case 2: {
                refKey = "monthly-summary-card-sales"
                break
            }
            // void_summary
            case 3: {
                await this.getVoidHistory()
                refKey = "monthly-summary-card-void"
                break
            }
        }
        this.selectCardDataIndex(refKey, this.chartLabelsRange.length - 1)
    }

    private selectCardDataIndex(refKey: string, idx: number) {
        try {
            // @ts-ignore
            this.$refs[refKey].selectChartData(idx)
        } catch (e) {
            // console.log(e)
        }
    }

    private get hideTabSliderOnFirstItem () {
        return this.summaryTab === 0
    }

    private get hideTabSliderOnLastItem () {
        return this.summaryTab === (this.summaryTabs.length - 1)
    }

    // ==================== Get transaction ====================

    private async getConfig() {
        let { configs, store } = this

        if (!store) {
            const stores = await StoreServices.getActiveStoresByBPForReward()
            const storeId = String(this.$route.params.shop_id)
            store = stores.find(s => String(s.id) === storeId) || null
            if (!store) throw new Error(`Store '${ storeId }' not found`)
            await VuexServices.CustomerReward.store.set(store)
        }

        if (configs.length === 0) {
            configs = await RewardServices.getRewardConfigs(this.user.bpNumber, store.branch.code, store.industryCode, store.number, store.floorRoom)
            if (configs.length === 0) throw new Error("No store config")
            await VuexServices.CustomerReward.configs.set(configs)
        }

        return configs.find(c => c.isCpnCode) || configs[0]
    }

    private getMonthRange (month: number) {
        const monthStart = moment().add(month, "month").startOf("month")
        const monthEnd = moment().add(month, "month").endOf("month")
        return monthEnd.diff(moment()) > 0 ? { start: monthStart.toDate(), end: moment().toDate() } : { start: monthStart.toDate(), end: monthEnd.toDate() }
    }

    private async getTransactions () {
        const KEY = "REDEEM"

        if (this.dataLoaded.includes(KEY)) {
            return
        }

        this.dataLoaded.push(KEY)

        this.loading = true
        try {

            const config = await this.getConfig()

            const rs = await RewardServices.getTransactions({
                endDate: moment().format(DF),
                startDate: moment().subtract(2, "month").startOf("month").format(DF),
                partnerCode: config.partnerCode,
                the1BizBranchCode: config.branchCode1Biz,
                paginate: {
                    itemPerPage: PAGE_SIZE,
                    page: 1
                },
                // eslint-disable-next-line
                store: this.store!
            })

            const { transactions } = rs

            const labels: Date[][] = []
            const now = moment().format(DF)
            const processDate = moment().subtract(2, "month").startOf("month")
            const redeemSummary = new ChartDataset("ยอดการแลกคะแนน (คะแนน)", "Redeem (points)")
            const earnSummary = new ChartDataset("ยอดการสะสมคะแนน (คะแนน)", "Earn (points)")

            const totalInvoices = new ChartDataset("จำนวนใบเสร็จ", "Number of receipts")
            const totalThe1 = new ChartDataset("สมาชิก The 1 ", "The 1 members")

            const totalPriceBeforeDiscount = new ChartDataset("ยอดขายก่อนหักส่วนลด (บาท)", "Sales before discount (Baht)")
            const totalPriceAfterDiscount = new ChartDataset("ยอดขายหลังหักส่วนลด (บาท) ", "Sales after discount (Bath)")

            const summaryRedeemDataList: SummaryRedeemItem[] = []
            const summaryTransactionDataList: SummaryTransactionItem[] = []
            const summarySummarySalesItem: SummarySalesItem[] = []

            let monthIdx = -2
            const endMonthDate = moment().subtract(2, "month").endOf("month")

            while (processDate.format(DF) <= now) {
                const md = processDate
                const monthRange = this.getMonthRange(monthIdx)
                labels.push([monthRange.start, monthRange.end])

                let dateSummaryRedeem = 0
                let dateSummaryEarn = 0

                let invoices = 0
                const the1List: {[x: string]: boolean} = {}

                let priceBeforeDiscount = 0
                let priceAfterDiscount = 0

                const dateSummaryItem = new SummaryRedeemItem(md.toDate(), md.toDate(), monthRange.end)
                const dateSummaryTransactionItem = new SummaryTransactionItem(md.toDate(), md.toDate(), monthRange.end)
                const dateSummarySalesItem = new SummarySalesItem(md.toDate(), md.toDate(), monthRange.end)

                for (const t of transactions) {
                    const tcd = moment(t.createdDate, moment.ISO_8601)
                    const dbf = tcd.isSameOrBefore(endMonthDate)
                    const daf = tcd.isSameOrAfter(processDate)
                    if (tcd.isValid() && dbf && daf) {
                        dateSummaryRedeem += t.redeemedPoint
                        dateSummaryEarn += t.earnPoint
                        
                        if (the1List[t.the1CardNo] !== true) {
                            the1List[t.the1CardNo] = true
                        }
                        invoices++

                        priceBeforeDiscount += t.totalAmount
                        priceAfterDiscount += t.earnValue

                        dateSummaryItem.transactions.push(t)
                        dateSummaryTransactionItem.transactions.push(t)
                        dateSummarySalesItem.transactions.push(t)
                    }
                }

                redeemSummary.data.push(dateSummaryRedeem)
                earnSummary.data.push(dateSummaryEarn)

                const members = Object.keys(the1List).length
                totalInvoices.data.push(invoices)
                totalThe1.data.push(members)
                dateSummaryTransactionItem.the1Members += members
                dateSummaryTransactionItem.invoices += invoices

                totalPriceBeforeDiscount.data.push(priceBeforeDiscount)
                totalPriceAfterDiscount.data.push(priceAfterDiscount)

                summaryRedeemDataList.push(dateSummaryItem)
                summaryTransactionDataList.push(dateSummaryTransactionItem)

                dateSummarySalesItem.priceBeforeDiscount += priceBeforeDiscount
                dateSummarySalesItem.priceAfterDiscount += priceAfterDiscount

                summarySummarySalesItem.push(dateSummarySalesItem)

                processDate.add(1, "month")
                endMonthDate.add(1, "month")
                monthIdx += 1
            }

            (() => {
                this.summaryRedeem.summaryList = summaryRedeemDataList
                this.summaryRedeem.chartData = [
                    earnSummary,
                    redeemSummary
                ]
                const cv = [...this.summaryRedeem.summaryList].pop()
                this.summaryRedeem.currentValues = cv ? [cv.earnPoint, cv.redeemedPoint] : []
                this.summaryRedeem.chartLabelsRange = labels

            })();


            (() => {
                this.summarySales.summaryList = summarySummarySalesItem
                this.summarySales.chartData = [
                    totalPriceBeforeDiscount,
                    totalPriceAfterDiscount
                ]
                const cv = [...this.summarySales.summaryList].pop()
                this.summarySales.currentValues = cv ? [cv.priceBeforeDiscount, cv.priceAfterDiscount] : []
                this.summarySales.chartLabelsRange = labels
            })();

            (() => {
                this.summaryTransaction.summaryList = summaryTransactionDataList
                this.summaryTransaction.chartData = [
                    totalInvoices,
                    totalThe1
                ]
                const cv = [...this.summaryTransaction.summaryList].pop()
                this.summaryTransaction.currentValues = cv ? [cv.invoices, cv.the1Members] : []
                this.summaryTransaction.chartLabelsRange = labels
            })();

            this.chartLabelsRange = labels
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }

        this.loading = !true
    }

    private async getVoidHistory () {
        const KEY = "VOID"
        if (this.dataLoaded.includes(KEY)) {
            return
        }
        this.dataLoaded.push(KEY)

        this.loading = true
    
        try {
            const config = await this.getConfig()

            const rsPending = await RewardServices.getPendingApproveVoidHistory({
                the1BizBranchCode: config.branchCode1Biz,
                partnerCode: config.partnerCode,
                paginate: {
                    itemPerPage: PAGE_SIZE,
                    page: 1
                },
                // eslint-disable-next-line
                store: this.store!
            })

            const rsVoided = await RewardServices.getApproveVoidedHistory({
                the1BizBranchCode: config.branchCode1Biz,
                partnerCode: config.partnerCode,
                paginate: {
                    itemPerPage: PAGE_SIZE,
                    page: 1
                },
                // eslint-disable-next-line
                store: this.store!
            })


            const labels: Date[][] = []
            const now = moment().format(DF)
            const processDate = moment().subtract(2, "month").startOf("month")

            const pendingVoid = new ChartDataset("ยอดรออนุมัติการยกเลิกรายการ", "Pending void")
            const voided = new ChartDataset("ยอดการยกเลิกรายการ", "Voided")

            const dateDataList: SummaryVoidItem[] = []

            let monthIdx = -2
            const endMonthDate = moment().subtract(2, "month").endOf("month")

            while (processDate.format(DF) <= now) {
                const md = processDate
                const monthRange = this.getMonthRange(monthIdx)
                labels.push([monthRange.start, monthRange.end])

                let datePending = 0
                let dateVoided = 0

                const dateSummary = new SummaryVoidItem(md.toDate(), md.toDate(), monthRange.end)

                // summary void pending match to date
                for (const t of rsPending.transactions) {
                    const tcd = moment(t.createdDate, moment.ISO_8601)
                    const dbf = tcd.isSameOrBefore(endMonthDate)
                    const daf = tcd.isSameOrAfter(processDate)
                    if (tcd.isValid() && dbf && daf) {
                        datePending++
                        dateSummary.pendingTransactions.push(t)
                    }
                }

                pendingVoid.data.push(datePending)

                // summary voided match to date
                for (const t of rsVoided.transactions) {
                    const tcd = moment(t.createdDate, moment.ISO_8601)
                    const dbf = tcd.isSameOrBefore(endMonthDate)
                    const daf = tcd.isSameOrAfter(processDate)
                    if (tcd.isValid() && dbf && daf) {
                        dateVoided++
                        dateSummary.transactions.push(t)
                    }
                }

                dateDataList.push(dateSummary)

                voided.data.push(dateVoided)

                processDate.add(1, "month")
                endMonthDate.add(1, "month")
                monthIdx += 1
            } // end while

            this.summaryVoid.summaryList = dateDataList
            this.summaryVoid.chartData = [
                pendingVoid,
                voided
            ]
            const cv = [...this.summaryVoid.summaryList].pop()
            this.summaryVoid.currentValues = cv ? [cv.pending, cv.voided] : []
            this.summaryVoid.chartLabelsRange = labels

            this.chartLabelsRange = labels
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }

        this.loading = !true
    }
}
</script>
<style lang="scss">
@import "../../../../../../styles/vars.scss";

#reward-monthly-content {
    .chart-container {
        canvas {
            height: 400px !important;
        }
    }

    .label-container{
        border-left: 4px solid $color-primary;
    }

    .summary-detail-card {
        border-radius: 0 !important;
        &::before {
            background: transparent !important;
        }
    }
}
</style>