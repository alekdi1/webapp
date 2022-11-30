import { RewardModel } from "@/models"
import { LanguageUtils } from "@/utils"
import moment from "moment"

export class SummaryBase {
    date: Date
    start: Date = new Date()
    end: Date = new Date()
    transactions: RewardModel.RewardTransaction[] = []

    constructor(date: Date, start = new Date(), end = new Date()) {
        this.date = date
        this.start = start
        this.end = end
    }

    get displayWeekDate() {
        const d = moment(this.date)
        const dateText = d.locale(LanguageUtils.getCurrentLang()).format("dddd")
        return LanguageUtils.lang(`วัน${dateText}`, dateText)
    }

    get displayFullDate() {
        const date = moment(this.date).locale(LanguageUtils.getCurrentLang())
        return `${date.format("D MMM")} ${date.year() + LanguageUtils.lang(543, 0)}`
    }

    get displayWeekName() {
        if (moment(this.start).isSame(moment(), "week")) {
            return LanguageUtils.lang("สัปดาห์นี้", "This week")
        }
        if (moment(this.start).isSame(moment().subtract(1, "week"), "week")) {
            return LanguageUtils.lang("สัปดาห์ที่แล้ว", "Last week")
        }
        return ""
    }

    get displayWeekRange() {
        const s = moment(this.start)
        const e = moment(this.end)
        const wsf = e.isSame(s, "month") ? s.locale(LanguageUtils.getCurrentLang()).format("D") : s.locale(LanguageUtils.getCurrentLang()).format("D MMM")
        return `${wsf} - ${e.locale(LanguageUtils.getCurrentLang()).format("D MMM")} ${e.year() + LanguageUtils.lang(543, 0)}`
    }

    get displayMonthName() {
        if (moment(this.start).isSame(moment(), "month")) {
            return LanguageUtils.lang("เดือนนี้", "This month")
        }
        if (moment(this.end).isSame(moment().subtract(1, "month"), "month")) {
            return LanguageUtils.lang("เดือนที่แล้ว", "Last month")
        }
        return moment(this.start).locale(LanguageUtils.getCurrentLang()).format("MMM")
    }

    get displayMonthDateRange() {
        const s = moment(this.start)
        const e = moment(this.end)
        const msf = e.isSame(s, "year") ? s.locale(LanguageUtils.getCurrentLang()).format("D") : s.locale(LanguageUtils.getCurrentLang()).format("D MMM") + ` ${e.year() + LanguageUtils.lang(543, 0)}`
        return `${msf} - ${e.locale(LanguageUtils.getCurrentLang()).format("D MMM")} ${e.year() + LanguageUtils.lang(543, 0)}`
    }
}

export class SummaryRedeemItem extends SummaryBase {

    get earnPointLabel() {
        return LanguageUtils.lang("ยอดการสะสมคะแนน (คะแนน)", "Earn (points)")
    }

    get redeemPointLabel() {
        return LanguageUtils.lang("ยอดการแลกคะแนน (คะแนน)", "Redeem (points)")
    }

    get earnPoint() {
        return this.transactions.reduce((sum, t) => sum + t.earnPoint, 0)
    }

    get redeemedPoint() {
        return this.transactions.reduce((sum, t) => sum + t.redeemedPoint, 0)
    }
}

export class SummaryVoidItem extends SummaryBase {

    pendingTransactions: RewardModel.RewardTransaction[] = []

    get pending() {
        return this.pendingTransactions.length
    }

    get voided() {
        return this.transactions.length
    }

    get pendingVoidLabel() {
        return LanguageUtils.lang("ยอดรออนุมัติการยกเลิกรายการ", "Pending void")
    }

    get voidedLabel() {
        return LanguageUtils.lang("ยอดการยกเลิกรายการ", "Voided")
    }
}

export class SummaryTransactionItem extends SummaryBase {
    invoices = 0
    the1Members = 0

    get totalReceiptLabel() {
        return LanguageUtils.lang("จำนวนใบเสร็จ", "Number of receipts")
    }

    get the1MemberLabel() {
        return LanguageUtils.lang("สมาชิก The 1 ", "The 1 members")
    }
}

export class SummarySalesItem extends SummaryBase {
    priceBeforeDiscount = 0
    priceAfterDiscount = 0

    get priceBeforeDiscountLabel() {
        return LanguageUtils.lang("ยอดขายก่อนหักส่วนลด (บาท)", "Sales before discount (Baht)")
    }

    get priceAfterDiscountLabel() {
        return LanguageUtils.lang("ยอดขายหลังหักส่วนลด (บาท) ", "Sales after discount (Bath)")
    }
}

export class SummaryGroup<T extends SummaryBase> {
    chartLabels: Date[] = []
    chartLabelsRange: Date[][] = []
    chartData: ChartDataset[] = []
    summaryList: T[] = []
    currentDate = new Date()
    currentValues: number[] = []
    currentStartDate = new Date()
    currentEndDate = new Date()

    get summaryListSortLastest() {
        return [...this.summaryList].sort((a, b) => b.date.getTime() - a.date.getTime())
    }
}

export class ChartDataset {
    labelTh = ""
    labelEn = ""
    data: number[] = []

    constructor(th: string, en: string) {
        this.labelTh = th
        this.labelEn = en
    }

    get displayLabel() {
        return LanguageUtils.lang(this.labelTh, this.labelEn)
    }
}


export type SummaryType = "redeem" | "transaction" | "sales" | "void"
