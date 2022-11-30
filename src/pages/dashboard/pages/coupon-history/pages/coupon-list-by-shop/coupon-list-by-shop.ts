import { EmployeePermission } from "@/models/employee"
import { DialogUtils, FileUtils, LanguageUtils, TimeUtils, StorageUtils } from "@/utils"
import moment from "moment"
import { BranchModel, StoreModel } from "@/models"
import { Component } from "vue-property-decorator"
import Base from "../base"
import { StoreServices, CouponServices, BranchService } from "@/services"
import numeral from "numeral"

const DF = "YYYY-MM-DD"
const getLocalYear = (d: moment.Moment) => LanguageUtils.lang(d.year() + 543, d.year())
//const displayDate = (d: moment.Moment) => `${d.format("D MMM")} ${String(getLocalYear(d)).substring(2)}`
const dateValue = (m: moment.Moment) => m.format(DF)

@Component
export default class CouponHistoryCouponListPage extends Base {
    private couponHistory: CouponServices.CouponHistory[] = []
    private branchList: BranchModel.Branch[] = []
    private hasPermission = false
    private loading = false
    private tabState = new HistoryTabState()
    private showOnlyMyTransactions = false
    private reportItems = new HistoryReportItem()
    private isLoading = false
    private search = ""
    private myStores: StoreModel.Store[] = []
    private reportmodel: SelectedReport[] = []
    private pdfBase64 = "";
    private isLoadingexel = false;
    private shop_number = "";
    private branch_code = "";
    private industrycode = "";
    private floor_room = "";
    private reportMenu: ReportItem[] = [{
        label: LanguageUtils.lang("ยอดขาย", "Sale Report"),
        value: "1",
        active: false
    }, {
        label: LanguageUtils.lang("ยอดขาย (สำหรับบัญชี)", "Sale Report (for accounting)"),
        value: "2",
        active: false
    }, {
        label: LanguageUtils.lang("สินค้าคงเหลือ", "Stock Balance"),
        value: "3",
        active: false
    }]

    private storeFloorRoom() {
        return String(this.$route.query.shop_unit || "")
    }

    private floorRoom() {
        let isMultipleRoom = false
        let room = this.storeFloorRoom()
        if (room.includes(";")) {
            room = room.split(";")[0]
            isMultipleRoom = true
        }
        if (room.includes(",")) {
            room = room.split(",")[0]
            isMultipleRoom = true
        }
        if (room.includes("_")) {
            room = room.split("_")[1]
        }
        return isMultipleRoom ? `${room}*` : room
    }

    private async mounted() {
        // await this.checkPermission()
        // await this.checkPermission()
        await this.setshopdetail()
        await this.getCouponHistory()
        await this.getBranchList()
    }

    private checkPermission() {
        if (typeof this.user === undefined) {
            return
        }
        const permissions: EmployeePermission[] = this.user.permissions;
        let ordering_report = true;
        let ordering_acc_report = true;
        let orderingStock_report = true;

        if (this.user.role != 'owner') {
            const checkOrdering_length: any = permissions.find((a: EmployeePermission) => a.permission == "ordering_report");
            ordering_report = (checkOrdering_length == undefined || checkOrdering_length == null) ? false : true;

            const checkOderingAcc_length: any = permissions.find((a: EmployeePermission) => a.permission == "ordering_accounting_report");
            ordering_acc_report = (checkOderingAcc_length == undefined || checkOderingAcc_length == null) ? false : true;

            const checkOderingStock_length: any = permissions.find((a: EmployeePermission) => a.permission == "ordering_stock_report");
            orderingStock_report = (checkOderingStock_length == undefined || checkOderingStock_length == null) ? false : true;
        }

        if (ordering_report) {
            this.reportMenu.push({
                label: LanguageUtils.lang("ยอดขาย", "Sale Report"),
                value: "1",
                active: false
            })
        }

        if (ordering_acc_report) {
            this.reportMenu.push({
                label: LanguageUtils.lang("ยอดขาย (สำหรับบัญชี)", "Sale Report (for accounting)"),
                value: "2",
                active: false
            })
        }

        if (orderingStock_report) {
            this.reportMenu.push({
                label: LanguageUtils.lang("สินค้าคงเหลือ", "Stock Balance"),
                value: "3",
                active: false
            })
        }
    }

    private getMenu() {
        const activetab = this.reportmodel.filter(i => i.startdate == this.tabState.customStartDate && i.enddate == this.tabState.customEndDate)
        this.reportMenu.forEach(function (item) {
            item.active = false
        })
        this.reportMenu.forEach(function (r) {
            activetab.forEach(function (a) {
                if (r.value == a.value)
                    r.active = true
            })
        })
    }

    private selectTab(t: TabItem) {
        if (t.value === this.tabState.current && this.tabState.current !== "custom") {
            return
        }
        this.reportItems = new HistoryReportItem()
        this.$set(this.tabState, "current", t.value)
        //this.paginate = new Paginate()
        const dr = (() => {
            switch (this.tabState.current) {
                case "30days": return {
                    start: dateValue(moment().subtract(29, "days")),
                    end: dateValue(moment())
                }

                case "7days": return {
                    start: dateValue(moment().subtract(6, "days")),
                    end: dateValue(moment())
                }

                case "today": return {
                    start: dateValue(moment()),
                    end: dateValue(moment())
                }

                default: return {
                    start: this.tabState.customStartDate,
                    end: this.tabState.customEndDate
                }
            }
        })()
        this.tabState.dates = [dr.start, dr.end]
        // @ts-ignore
        this.$refs["date-range-picker-dialog"].save(this.tabState.dates)
        this.tabState.customStartDate = dr.start
        this.tabState.customEndDate = dr.end
        //this.getHistory()
        this.getMenu()
    }

    private async setshopdetail() {
        try {
            if(this.user.role == 'QR'){
                const StoreList = await CouponServices.getStoreListByTenantId(StorageUtils.getItem("QR_TENANT_NO"))
                this.shop_number= String(StoreList?.shop_number || '')
                this.branch_code= String(StoreList?.branch_code || '')
                this.floor_room= String(StoreList?.floor_room || '')
                this.industrycode= String(StoreList?.industry_code || '')
            }else{
                const queryUrl = this.$route.query;
                this.shop_number = String( queryUrl?.shop_number ||'')
                this.branch_code = String(queryUrl?.branch_code||'')
                this.industrycode = String(queryUrl?.industrycode||'')
                this.floor_room = String(queryUrl?.floor_room||'')
            }
        } catch (e) {
            console.error(e.message || e)
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }
    private async getShopList() {
        try {
            this.isLoading = true
            this.myStores = await StoreServices.getActiveStoresByBPForCouponHistory()
            this.isLoading = false
        } catch (e) {
            console.error(e.message || e)
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }

    private async getBranchList() {
        try {
            this.isLoading = true
            this.branchList = await BranchService.getBranchList()
            this.isLoading = false
        } catch (e) {
            console.error(e.message || e)
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }

    private get displayStoreList() {
        // const srh = this.search.toLowerCase()
        const startdate = moment(this.tabState.customStartDate).startOf('day')
        const enddate = moment(this.tabState.customEndDate).startOf('day')
        const displayHistory = this.couponHistory.filter(x => {
            const check1 = moment(x.datetimeUsed).startOf('day').isSameOrAfter(startdate)
            const check2 = moment(x.datetimeUsed).startOf('day').isSameOrBefore(enddate)
            return check1 && check2
        })
        return displayHistory.sort((n1,n2) => parseInt(n2.transactionId) - parseInt(n1.transactionId));
    }

    private confirmSelectDates() {
        const dates = [...this.tabState.dates].sort()
        // @ts-ignore
        this.$refs["date-range-picker-dialog"].save(dates)
        this.tabState.showDatePicker = false

        this.tabState.customStartDate = moment(dates[0], DF).locale(this.lang).format(DF)
        if (dates.length === 1) {
            this.tabState.customEndDate = moment(dates[0], DF).locale(this.lang).format(DF)
        } else {
            this.tabState.customEndDate = moment(dates[1], DF).locale(this.lang).format(DF)
        }
        this.selectTab(this.tabState.customItem)
    }

    private get lang() {
        return this.$i18n.locale
    }

    private cancelSelectDate() {
        // @ts-ignore
        this.$refs["date-range-picker-dialog"].save([this.tabState.customStartDate, this.tabState.customEndDate])
        this.tabState.showDatePicker = false
    }

    private showCustomDateRange() {
        this.tabState.showDatePicker = true
    }

    private get text() {
        const { lang } = LanguageUtils
        return {
            title: this.$t("pages.coupon_history.coupon_history_title").toString(),
            sub_title: lang("", ""),
            your_coupon: lang("คูปองของคุณ", "Coupon owner"),
            transaction_id_prefix: lang("Transaction ID", "Transaction ID"),
            used_at_shop: lang("ที่ร้าน", "At shop"),
            used_at_time: lang("รับสิทธิ์ วันที่ ", "At time"),
            used_at_minimumExpense: lang("จำนวนเงิน", "Amount"),
            button_t: lang("Export ประวัติรายการแลกคูปอง", "Export Coupon history used."),
            currency: lang("บาท", "baht"),
            branch: lang("สาขา", "branch"),
        }
    }

    private async getCouponHistory() {
        // const queryUrl = this.$route.query;
        const request = {
            shopNumber: this.shop_number,
            branchCode: this.branch_code,
            industryCode: this.industrycode,
            floorRoom: this.floor_room,
        }
        try {
            this.isLoading = true
            this.couponHistory = await CouponServices.getCouponHistory(request,this.user.role == 'QR')
            this.isLoading = false
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }

    private displayDate(date: string) {
        const md = moment(date, "YYYY-MM-DD HH:mm:ss").locale(LanguageUtils.getCurrentLang())
        return LanguageUtils.lang(
            // `${md.format("DD MMM YYYY HH:mm")} ${String(md.year() + 543).substr(2)}`,
            `${md.format("DD MMM YYYY เวลา HH:mm น.")}`,
            md.format("DD MMM YYYY HH:mm a")
        )
    }

    private cashFormat(n: any) {
        return numeral(n).format("0,0.00")
    }

    private branchDesc(branchCode: string) {
        const branch = this.branchList.find(x => x.code == branchCode)
        return branch == undefined ? "" : LanguageUtils.lang(`${this.text.branch} ` + branch?.nameTh, branch?.nameEn + ` ${this.text.branch}`)
    }

    private async exportCouponHistory() {
        this.isLoadingexel = true;
        const queryUrl = this.$route.query;
        const request = {
            shopNumber: this.shop_number,
            branchCode: this.branch_code,
            industryCode: this.industrycode,
            floorRoom: this.floor_room,
            fromDate: moment(this.tabState.customStartDate).format("YYYY-MM-DD"),
            toDate: moment(this.tabState.customEndDate).format("YYYY-MM-DD"),
        }
        try {
            const response = await CouponServices.exportCouponHistory(request,this.user.role == 'QR');
            await FileUtils.downloadFile(response.file.content, response.file.name, response.file.extension);
        } catch (error) {
            console.log("error --> ", error)
            DialogUtils.showErrorDialog({
                text: this.lang == "th" ? "มีข้อผิดพลาดเกิดขึ้น <br> กรุณาลองใหม่ภายหลัง" : "An error occurred <br> Please try again later.",
                title: this.lang == "th" ? "เกิดข้อผิดพลาด" : "An error occurred",
            })
        }
        this.isLoadingexel = false;
    }
}


type ReportType = "1" | "2" | "3" | ""
interface ReportItem {
    value: ReportType
    label: string
    active?: boolean
    icon?: string
}

interface SelectedReport extends ReportItem {
    startdate: string
    enddate: string
    fulldate: string
    tabtype: string
}


type TabType = "today" | "7days" | "30days" | "custom"
interface TabItem {
    value: TabType
    label: string
    active?: boolean
}

class HistoryReportItem {
    current: ReportType = ""
    get items(): ReportItem[] {
        const { lang } = LanguageUtils
        return [
            {
                label: lang("ยอดขาย", "Sales Report"),
                value: "1",
                active: this.current === "1"
            },
            {
                label: lang("ยอดขาย(สำหรับบัญชี)", "Sales Report (for accounting)"),
                value: "2",
                active: this.current === "2"
            },
            {
                label: lang("30 วันสินค้าคงเหลือ", "Stock Balance"),
                value: "3",
                active: this.current === "3"
            }
        ]
    }
}


class HistoryTabState {
    current: TabType = "today"

    customStartDate = dateValue(moment())
    customEndDate = dateValue(moment())
    dates = [this.customStartDate, this.customEndDate]
    showDatePicker = false
    // Report: ReportType = "SalesReport"
    typeTab = 0

    get maxDate() {
        return moment().format(DF)
    }

    get tabs(): TabItem[] {
        const { lang } = LanguageUtils
        return [
            {
                label: lang("วันนี้", "Today"),
                value: "today",
                active: this.current === "today"
            },
            {
                label: lang("7 วัน", "7 Days"),
                value: "7days",
                active: this.current === "7days"
            },
            {
                label: lang("30 วัน", "30 Days"),
                value: "30days",
                active: this.current === "30days"
            }
        ]
    }

    get customItem(): TabItem {
        return {
            label: "",
            value: "custom",
            active: this.current === "custom"
        }
    }

    get displayDateRange() {
        const { customStartDate: start, customEndDate: end } = this
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

    get htmlTabDateRange() {
        return (Math.abs(moment(this.customStartDate, DF).diff(moment(this.customEndDate, DF), "days")) + 1) + " " + LanguageUtils.lang("วัน", "Days")
    }
}
