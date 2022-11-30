import { StoreModel, ShopSaleModel } from "@/models"
import { ShopSaleServices, StoreServices, VuexServices } from "@/services"
import { DialogUtils, LanguageUtils } from "@/utils"
import moment from "moment"
import { Component } from "vue-property-decorator"
import Base from "../base"
import numeral from "numeral"
import { ROUTER_NAMES } from "@/router"

const DF = "YYYY-MM-DD"
const getLocalYear = (d: moment.Moment) => LanguageUtils.lang(d.year() + 543, d.year())
const displayDate = (d: moment.Moment) => `${d.format("D MMM")} ${String(getLocalYear(d)).substring(2)}`

@Component
export default class ShopSaleHistoryListPage extends Base {

    private dateRange = new DateRange()
    private loading = false
    private store: StoreModel.Store | null = null
    private salesDateList: SaleDate[] = []

    private get text() {
        return {
            title: LanguageUtils.lang("ประวัติยอดขาย", "Shop sale history"),
            Total_Sales: LanguageUtils.lang("ยอดขายทั้งหมด (บาท)", "Total Sales Amount (THB)")
        }
    }

    private get lang() {
        return this.$i18n.locale
    }

    private get storeFloorRoom() {
        return String(this.$route.query.shop_unit || "")
    }

    private get branchCode() {
        return String(this.$route.params.branch_code || "")
    }

    private async getData() {
        this.loading = true
        try {
            let stores = VuexServices.Root.getStores()
            if (stores.length === 0) {
                stores = await StoreServices.getActiveStoresByBPForShopSale()
                // stores = stores.filter(s => s.floorRoom)
            }

            const store = stores.find(s => (String(s.branch.code) === String(this.branchCode) && String(s.floorRoom) === String(this.storeFloorRoom)))
            this.store = store || null
            await this.getHistoryData()
        } catch (e) {
            console.log(e.message || e)
        }
        this.loading = false
    }

    private async getHistoryData() {
        this.loading = true
        try {
            if (!this.store) {
                throw new Error("Store not found")
            }

            const salesDateList = await ShopSaleServices.getHistory(this.dateRange.start, this.dateRange.end, this.store)
            this.salesDateList = salesDateList.map(i => {
                const dummy = new SaleDate(i)
                console.log(dummy)
                return dummy
            })

        } catch (e) {
            console.log(e.message || e)
            DialogUtils.showErrorDialog({
                text: e.message || "Error while get shop sale history"
            })
        }
        this.loading = false
    }

    private mounted() {
        this.getData()
    }

    private get isEmpty() {
        return this.salesDateList.length === 0
    }

    private confirmSelectDates() {
        const dates = [...this.dateRange.dates].sort()
        // @ts-ignore
        this.$refs["date-range-picker-dialog"].save(dates)
        console.log(dates)
        this.dateRange.show = false

        this.dateRange.start = moment(dates[0], DF).locale(this.lang)
        if (dates.length === 1) {
            this.dateRange.end = moment(dates[0], DF).locale(this.lang)
        } else {
            this.dateRange.end = moment(dates[1], DF).locale(this.lang)
        }

        this.getHistoryData()
    }

    private cancelSelectDate() {
        // @ts-ignore
        this.$refs["date-range-picker-dialog"].save([this.dateRange.start.format(DF), this.dateRange.end.format(DF)])
        this.dateRange.show = false
    }

    private get displaySummaryDates() {
        const { start, end } = this.dateRange
        return `${displayDate(start)}<br />-<br />${displayDate(end)}`
    }

    private get summarySalesAmount() {
        return this.salesDateList.reduce((sum, dateItem) => sum + dateItem.totalAmount, 0)
    }

    private get displaySummarySalesAmount() {
        return numeral(this.summarySalesAmount).format("0,0.00")
    }

    private diffitemdate(item: any) {
        const dummy_a = moment()
        const dummy_b = moment(item.date, "YYYYMMDD")
        return dummy_a.year() == dummy_b.year() && dummy_a.month() == dummy_b.month();
    }

    private editItemClick(item: SaleDate) {
        return this.$router.push({
            name: ROUTER_NAMES.shop_sale_sales_form_edit,
            query: this.$route.query,
            params: {
                ...this.$route.params,
                sale_date: item.item.date
            }
        })
    }

    private viewDetail(data: SaleDate) {
        return this.$router.push({
            name: ROUTER_NAMES.shop_sale_history_detail,
            query: {
                ...this.$route.query
            },
            params: {
                ...this.$route.params,
                date: data.item.date
            }
        })
    }
}

class DateRange {
    show = false
    start = moment().startOf("months").locale(LanguageUtils.getCurrentLang())
    end = moment().locale(LanguageUtils.getCurrentLang())
    dates = [this.start.format(DF), this.end.format(DF)]

    get maxDate() {
        return moment().format(DF)
    }

    get minDate() {
        return moment().subtract(1, "months").startOf("months").format(DF)
    }

    get displayDateRange() {
        const { start, end } = this
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
}

class SaleDate {
    item: ShopSaleModel.ShopSaleDateItem
    constructor(item: ShopSaleModel.ShopSaleDateItem) {
        this.item = item
    }

    get id() {
        return this.item.id
    }

    get isVerified() {
        return this.item.isVerified
    }

    get displayDate() {
        const md = moment(this.item.date, "YYYYMMDD").locale(LanguageUtils.getCurrentLang())
        return md.isValid() ? displayDate(md) : ""
    }

    get totalAmount() {
        return this.item.salesList.reduce((saleSum, saleItem) => {
            return saleItem.creditCard.amount + saleSum + saleItem.data.reduce((dataSum, saleData) => dataSum + saleData.amount, 0)
        }, 0)
    }

    get displayTotalAmount() {
        return numeral(this.totalAmount).format("0,0.00")
    }
}
