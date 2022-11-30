import { EmployeePermission } from "@/models/employee"
import { DialogUtils, FileUtils, LanguageUtils, TimeUtils } from "@/utils"
import moment from "moment"
import { Component } from "vue-property-decorator"
import Base from "../base"
import { OrderingServices } from "@/services"

const DF = "YYYY-MM-DD"
const getLocalYear = (d: moment.Moment) => LanguageUtils.lang(d.year() + 543, d.year())
//const displayDate = (d: moment.Moment) => `${d.format("D MMM")} ${String(getLocalYear(d)).substring(2)}`
const dateValue = (m: moment.Moment) => m.format(DF)

/*class Paginate {
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
}*/

@Component
export default class WatchSaleHistoryListPage extends Base {
    private hasPermission = false
    private loading = false
    private tabState = new HistoryTabState()
    private showOnlyMyTransactions = false
    private reportItems = new HistoryReportItem()
    private branchName = this.$route.query.branch_name
    private contractNumber = this.$route.query.contract_number
    private branchRoom = this.floorRoom()
    //private ordering_report = this.checkPermission("ordering_report")
    //private ordering_stock_report = this.checkPermission("orderingordering_stock_report_report")
    private pdfBase64 = "";
    //private paginate = new Paginate()
    private reportmodel: SelectedReport[] = []

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
        await this.checkPermission()
    }

    private checkPermission() {
        if (typeof this.user === undefined) {
            return
        }

        // console.log('user', this.user);
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

    private reportMenu: ReportItem[] = []

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

    private ReportFilter() {
        if (this.tabState.customStartDate != this.tabState.customEndDate) {
            return this.reportMenu.filter(x => x.value != '3')
        }
        return this.reportMenu
    }

    private selectReport(r: SelectedReport) {
        r.active = !r.active
        if (!r.active) {
            this.reportmodel = this.reportmodel.filter(obj => obj.value !== r.value || obj.startdate != this.tabState.customStartDate || obj.enddate != this.tabState.customEndDate);
            return
        }

        let full_date

        if (this.tabState.customStartDate == this.tabState.customEndDate) {
            full_date = TimeUtils.convertToLocalDateFormat(moment(this.tabState.customStartDate))
        }
        else {
            full_date = TimeUtils.convertToLocalDateFormat(moment(this.tabState.customStartDate))
                + " - " + TimeUtils.convertToLocalDateFormat(moment(this.tabState.customEndDate))
        }

        //r.tabtype = this.tabState.current
        //r.startdate = this.tabState.customStartDate
        //r.enddate = this.tabState.customEndDate
        //this.$set(this.reportItems, "current", r.value)
        this.reportmodel.push({
            startdate: this.tabState.customStartDate,
            enddate: this.tabState.customEndDate,
            fulldate: full_date,
            tabtype: this.tabState.current,
            value: r.value,
            label: r.label
        })
    }

    private removeReport(r: SelectedReport) {
        this.reportmodel = this.reportmodel.filter(obj => obj.value != r.value || obj.startdate != r.startdate || obj.enddate != r.enddate);
        this.getMenu()
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

    private download(type: string) {
        console.log(type)
        this.downloadVendorReport(type)
    }

    private preview(report_type: string) {
        console.log('report_type', this.tabState.dates);
        this.previewVendorReport(report_type)
    }

    private hidePreview() {
        this.pdfBase64 = "";
    }

    private async downloadVendorReport(type: string) {

        const requestReports = this.reportmodel;
        if (requestReports.length == 0) return;

        const requestList: any[] = [];
        requestReports.forEach(report => {
            requestList.push({
                contract: this.contractNumber,
                report_type: report.value,
                from: report.startdate,
                to: report.enddate
            })
        })

        try {
            const res = await OrderingServices.downloadVendorReport({
                file_type: type,
                requestList: requestList
            })
            await FileUtils.downloadFile(res.file.content, res.file.name, res.file.extension);

        } catch (e) {
            console.log(e.message || e)
            if (e.message == "unsuccess") {
                DialogUtils.showErrorDialog({
                    title: LanguageUtils.lang("เกิดข้อผิดพลาด", "Request failed"),
                    text: LanguageUtils.lang(e.error.titleTh, e.error.titleEn)
                })

            } else {
                DialogUtils.showErrorDialog({
                    title: LanguageUtils.lang("เกิดข้อผิดพลาด", "Request failed"),
                    text: LanguageUtils.lang("กรุณาลองใหม่อีกครั้งภายหลัง", "Please try again later.")
                })
            }


        }
    }

    private async previewVendorReport(report_type: string) {
        try {
            this.pdfBase64 = await OrderingServices.previewVendorReport({
                file_type: "PDF",
                requestList: [
                    {
                        contract: this.contractNumber,
                        report_type: report_type,
                        from: this.tabState.dates[0],
                        to: this.tabState.dates[1]
                    }
                ]
            })
            this.pdfBase64 = "data:application/pdf;base64," + this.pdfBase64
        } catch (e) {
            console.log(e.message || e)
            if (e.message == "unsuccess") {
                DialogUtils.showErrorDialog({
                    title: LanguageUtils.lang("เกิดข้อผิดพลาด", "Request failed"),
                    text: LanguageUtils.lang(e.error.titleTh, e.error.titleEn)
                })

            } else {
                DialogUtils.showErrorDialog({
                    title: LanguageUtils.lang("เกิดข้อผิดพลาด", "Request failed"),
                    text: LanguageUtils.lang("กรุณาลองใหม่อีกครั้งภายหลัง", "Please try again later.")
                })
            }

        }
    }

    private closeEmbed() {
        this.pdfBase64 = "";
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
