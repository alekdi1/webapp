<template>
    <v-card class="reward-daily-summary-card" :data-type="type">
        <div class="card-content-container">
            <div class="px-6 py-4">
                <div class="d-flex">
                    <div class="display-date flex-grow-1">{{ displayDateRange }}</div>
                    <div class="display-date flex-shrink-0">{{ displayDate }}</div>
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
export default class CustomSummaryCard extends Vue {
    @Prop({ default: "redeem" })
    private type!: "redeem" | "transaction" | "sales" | "void"

    @Prop({ default: () => new SummaryGroup() })
    private summary!: SummaryGroup<SummaryRedeemItem | SummaryTransactionItem | SummarySalesItem | SummaryVoidItem>

    @Prop({ default: () => [] })
    private dateRange!: string[]

    private get currentDate () {
        return this.summary.currentDate
    }

    private reloadChart() {
        try {
            // @ts-ignore
            this.$refs["chart"].reload()
            // console.log(this.$refs["chart"])

        } catch (error) {
            console.log(error.message)
        }
    }

    private get displayDate() {
        const วัน = moment(this.currentDate).locale(LanguageUtils.getCurrentLang())
        return `${ วัน.format("D MMM") } ${ วัน.year() + LanguageUtils.lang(543, 0) }`
    }

    private get displayDateRange () {
        const start = moment(this.dateRange[0]).locale(LanguageUtils.getCurrentLang())
        const end = moment(this.dateRange[1]).locale(LanguageUtils.getCurrentLang())
        if (start.isSame(end, "date")) {
            return ""
        }
        const isSameMonth = end.isSame(start, "month")
        const startFormatted = isSameMonth ? start.format("D") : `${start.format("D MMM")} ${ start.year() + LanguageUtils.lang(543, 0)}`
        return `${startFormatted} - ${end.format("D MMM")} ${ end.year() + LanguageUtils.lang(543, 0)}`
    }

    private onDataIndexChange(idx: number) {
        this.$emit("dateChange", {
            date: this.summary.chartLabels[idx],
            index: idx
        })
    }

    private get labels() {
        return this.summary.chartLabels.map(d => moment(d).locale(LanguageUtils.getCurrentLang()).format("D MMM"))
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

    private isToday (date: moment.Moment) {
        return date.isSame(moment(), "day")
    }

    private isYesterday (date: moment.Moment) {
        return date.isSame(moment().subtract(1, "day"), "day")
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