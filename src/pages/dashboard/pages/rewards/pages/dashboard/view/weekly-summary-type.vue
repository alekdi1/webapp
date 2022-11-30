<template>
    <v-card class="reward-daily-summary-card" :data-type="type">
        <div class="card-content-container">
            <div class="px-6 py-4">
                <div class="d-flex">
                    <div class="display-date flex-grow-1">{{ displayWeekLabel }}</div>
                    <div class="display-date flex-shrink-0">{{ displayDateRange }}</div>
                </div>

                <v-row class="mt-3" no-gutters>
                    <v-col cols="5" class="px-0">
                        
                    </v-col>
                    <v-col cols="7">
                        <div class="summary-label text-right">{{ data1Label }}</div>
                        <div class="summary-value text-right" style="color: #f8bf32;">{{ displayData1Total }}</div>

                        <v-divider class="my-1"/>

                        <div class="summary-label text-right">{{ data2Label }}</div>
                        <div class="summary-value text-right" style="color: #7da580;">{{ displayData2Total }}</div>
                    </v-col>
                </v-row>
            </div>

            <div class="chart-container">
                <cpn-reward-apex-chart :datasets="summary.chartData" :labels="labels" @onDataIndexChange="onDataIndexChange" ref="chart"/>
            </div>
        </div>
    </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import moment from "moment"
import { SummaryGroup, SummaryRedeemItem, SummaryTransactionItem, SummarySalesItem, SummaryVoidItem } from "../model"
import { LanguageUtils } from "@/utils"
import ApexChart from "./apex-chart.vue"
import numeral from "numeral"

@Component({
    components: {
        "cpn-reward-apex-chart": ApexChart
    }
})
export default class DailySummaryCard extends Vue {
    @Prop({ default: "redeem" })
    private type!: "redeem" | "transaction" | "sales" | "void"

    @Prop({ default: () => new SummaryGroup() })
    private summary!: SummaryGroup<SummaryRedeemItem | SummaryTransactionItem | SummarySalesItem | SummaryVoidItem>

    private get displayDateRange () {
        const startWeekDate = moment(this.summary.currentStartDate).startOf("week").locale(LanguageUtils.getCurrentLang())
        const endWeekDate = moment(this.summary.currentEndDate).endOf("week").locale(LanguageUtils.getCurrentLang())
        const isSameMonth = endWeekDate.isSame(startWeekDate, "month")
        const startWeekDateFormatted = isSameMonth ? startWeekDate.format("D") : `${startWeekDate.format("D MMM")} ${ endWeekDate.year() + LanguageUtils.lang(543, 0)}`
        return `${startWeekDateFormatted} - ${endWeekDate.format("D MMM")} ${ endWeekDate.year() + LanguageUtils.lang(543, 0)}`
    }

    get displayWeekLabel () {
        if (moment(this.summary.currentStartDate).isSame(moment(), "week")) {
            return LanguageUtils.lang("สัปดาห์นี้", "This week")
        }
        if (moment(this.summary.currentStartDate).isSame(moment().subtract(1, "week"), "week")) {
            return LanguageUtils.lang("สัปดาห์ที่แล้ว", "Last week")
        }
        return ""
    }

    private onDataIndexChange(idx: number) {
        this.$emit("dateChange", {
            date: this.summary.chartLabelsRange[idx],
            index: idx
        })
    }

    private getWeekFormat (weekStart: moment.Moment, weekEnd: moment.Moment) {
        const weekStartFormatted = weekEnd.isSame(weekStart, "month") ? weekStart.locale(LanguageUtils.getCurrentLang()).format("D") : weekStart.locale(LanguageUtils.getCurrentLang()).format("D MMM")
        return `${weekStartFormatted} - ${weekEnd.format("D MMM")} ${ weekEnd.year() + LanguageUtils.lang(543, 0)}`
    }

    private get labels() {
        return this.summary.chartLabelsRange.map(d => {
            const startWeekDate = moment(d[0]).startOf("week")
            const endWeekDate = moment(d[1]).endOf("week").locale(LanguageUtils.getCurrentLang())
            return `${startWeekDate.format("D")} - ${endWeekDate.format("D")}\n${endWeekDate.format("MMM")} ${ endWeekDate.year() + LanguageUtils.lang(543, 0)}`
        })
    }

    private get emptyChartData() {
        return {
            labels: [],
            datasets: []
        }
    }

    private onMouseMove() {
        console.log("onMouseMove")
    }

    private get data1Label() {
        switch (this.type) {
            case "redeem": return LanguageUtils.lang("ยอดการสะสมคะแนน (คะแนน)", "Earn (points)")
            case "transaction": return LanguageUtils.lang("จำนวนใบเสร็จ", "Number of receipts")
            case "sales": return LanguageUtils.lang("ยอดขายก่อนหักส่วนลด (บาท)", "Sales before discount (Baht)")
            case "void": return LanguageUtils.lang("ยอดรออนุมัติการยกเลิกรายการ", "Pending void")
            default: return ""
        }
    }

    private get data2Label() {
        switch (this.type) {
            case "redeem": return LanguageUtils.lang("ยอดการแลกคะแนน (คะแนน)", "Redeem (points)")
            case "transaction": return LanguageUtils.lang("สมาชิก The 1 ", "The 1 members")
            case "sales": return LanguageUtils.lang("ยอดขายหลังหักส่วนลด (บาท) ", "Sales after discount (Bath)")
            case "void": return LanguageUtils.lang("ยอดการยกเลิกรายการ", "Voided")
            default: return ""
        }
    }

    private get displayData1Total() {
        const { data1Total } = this
        if (this.type === "sales") {
            return numeral(data1Total).format("0,0.00")
        }
        return data1Total
    }

    private get data1Total() {
        try {
            return this.summary.currentValues.length > 0 ? this.summary.currentValues[0] : 0
        } catch (e) {
            return 0
        }
    }

    private get data2Total() {
        try {
            return this.summary.currentValues.length > 1 ? this.summary.currentValues[1] : 0
        } catch (e) {
            return 0
        }
    }

    private get displayData2Total() {
        const { data2Total } = this
        if (this.type === "sales") {
            return numeral(data2Total).format("0,0.00")
        }
        return data2Total
    }

    private selectChartData(idx = 0) {
        try {
            // @ts-ignore
            this.$refs["chart"].selectDataAtIndex(idx)
        } catch (e) {
            //
        }
    }
}
</script>
<style lang="scss">
.reward-daily-summary-card {

    border-radius: 8px !important;
    $color-prim1: #f8bf32;
    $color-prim2: #7da580;

    &[data-type="redeem"] {
        background-image: url("../../../../../../../assets/images/reward/redeem.png");
        background-position: -48px 56px;
    }

    &[data-type="transaction"] {
        background-image: url("../../../../../../../assets/images/reward/transaction.webp");
        background-position: 4px 56px;
    }

    &[data-type="void"] {
        background-image: url("../../../../../../../assets/images/reward/void.webp");
        background-position: 16px 56px;
    }

    &[data-type="sales"] {
        background-image: url("../../../../../../../assets/images/reward/sales.webp");
        background-position: -100px 56px;
    }

    .display-date {
        font-size: 15px;
        font-weight: bold;
        color: #010101;
    }

    .summary-label {
        font-size: 12px;
        color: #000000;
    }

    .summary-value {
        font-size: 28px;
        font-weight: bold;
        color: $color-prim1;
    }

    .chart-container {
        width: 100%;
    }
}
</style>