import { Component } from "vue-property-decorator"
import Base from "../base"
import { ShopSaleModel, StoreModel, InvoiceModel } from "@/models"
import { RewardServices, ShopSaleServices, StoreServices, VuexServices } from "@/services"
import { CPMForm } from "@/pages/dashboard/models"
import { DialogUtils, LanguageUtils, TimeUtils, NumberUtils, FileUtils } from "@/utils"
import moment from "moment"
import { ROUTER_NAMES } from "@/router"
import ImageFile from "../../components/slip-file.vue"
import axios from "axios"
import cryptoJs from "crypto-js"
import MonthSelectedBtn from "@/components/month-select-btn.vue"
import { OrderingServices } from "@/services"

@Component({
    components: {
        "cpn-req-month-btn": MonthSelectedBtn
    }
})

export default class WatchSaleAtMonth extends Base {
    private typefordownload = "";
    private loading = false
    private ischeckedmonth = false;
    private today = new Date();
    private verifiedFlag = ""
    private isInited = false
    private loadingFile = ""
    private thisyear = 0;
    private lastyear = 0;
    private mastermonths = [{
        monthnumber: 1,
        monthdesc_en: "Jan",
        monthdesc_th: "ม.ค",
        year: 0,
        monthdesc: ""
    },
    {
        monthnumber: 2,
        monthdesc_en: "Feb",
        monthdesc_th: "ก.พ",
        year: 0,
        monthdesc: ""
    },
    {
        monthnumber: 3,
        monthdesc_en: "Mar",
        monthdesc_th: "มี.ค",
        year: 0,
        monthdesc: ""
    },
    {
        monthnumber: 4,
        monthdesc_en: "Apr",
        monthdesc_th: "เม.ย",
        year: 0,
        monthdesc: ""
    },
    {
        monthnumber: 5,
        monthdesc_en: "May",
        monthdesc_th: "พ.ค",
        year: 0,
        monthdesc: ""
    },
    {
        monthnumber: 6,
        monthdesc_en: "Jun",
        monthdesc_th: "มิ.ย",
        year: 0,
        monthdesc: ""
    },
    {
        monthnumber: 7,
        monthdesc_en: "Jul",
        monthdesc_th: "ก.ค",
        year: 0,
        monthdesc: ""
    },
    {
        monthnumber: 8,
        monthdesc_en: "Augt",
        monthdesc_th: "ส.ค",
        year: 0,
        monthdesc: ""
    },
    {
        monthnumber: 9,
        monthdesc_en: "Sep",
        monthdesc_th: "ก.ย",
        year: 0,
        monthdesc: ""
    },
    {
        monthnumber: 10,
        monthdesc_en: "Oct",
        monthdesc_th: "ต.ค",
        year: 0,
        monthdesc: ""
    },
    {
        monthnumber: 11,
        monthdesc_en: "Nov",
        monthdesc_th: "พ.ย",
        year: 0,
        monthdesc: ""
    },
    {
        monthnumber: 12,
        monthdesc_en: "Dec",
        monthdesc_th: "ธ.ค",
        year: 0,
        monthdesc: ""
    }];
    public ary_selected_months = [] as any;
    public ary_saleatmonth_lastyear = [] as any;
    public ary_saleatmonth_thisyear = [] as any;
    public ary_result_months = [];
    private months = [];

    private async mounted() {
        await this.setmonths()
    }

    private get text() {
        return {
            title: this.$t("pages.watch_sales_at_month.title").toString(),
            subtitle: this.$t("pages.watch_sales_at_month.subtitle").toString(),
            allinonefile: this.$t("pages.watch_sales_at_month.allinonefile").toString(),
            splitefile: this.$t("pages.watch_sales_at_month.splitefile").toString(),
            downloaddocumentfile: this.$t("pages.watch_sales_at_month.downloaddocumentfile").toString(),
            note: LanguageUtils.lang("หมายเหตุ", "Note")
        }
    }

    private async setmonths() {
        this.thisyear = (this.today.getFullYear()) + 543;
        this.lastyear = (this.today.getFullYear() - 1) + 543;
        let startmonths = 0;
        startmonths = this.today.getMonth() + 1;
        // startmonths = 3;
        const lastmonth = (startmonths - 6) < 0 ? startmonths - 7 : startmonths - 6;
        const isthailang = this.lang == "th";

        for (let i = lastmonth; i < startmonths; i++) {
            if (i == 0) {
                continue;
            }
            if (i < 0) {
                const rollbackmonth = (12 - Math.abs(i)) + 1;
                const month = this.mastermonths.find(x => x.monthnumber == rollbackmonth);
                const obj: LooseObject = {};
                obj.monthnumber = month?.monthnumber;
                obj.monthdesc_th = month?.monthdesc_th;
                obj.monthdesc_en = month?.monthdesc_en;
                obj.year = (this.today.getFullYear() - 1);
                obj.selected = false
                this.ary_saleatmonth_lastyear.push(obj);
            } else {
                const month = this.mastermonths.find(x => x.monthnumber == i);
                const obj: LooseObject = {};
                obj.monthnumber = month?.monthnumber;
                obj.monthdesc_th = month?.monthdesc_th;
                obj.monthdesc_en = month?.monthdesc_en;
                obj.year = this.today.getFullYear();
                obj.selected = false
                this.ary_saleatmonth_thisyear.push(obj);
            }
        }

        this.ary_saleatmonth_lastyear.sort((a: any, b: any) => (a.monthnumber > b.monthnumber ? -1 : 1))
        this.ary_saleatmonth_thisyear.sort((a: any, b: any) => (a.monthnumber > b.monthnumber ? -1 : 1))
    }

    private get lang() {
        return this.$i18n.locale
    }

    private monthClick(month: any) {
        const checkmonth = this.ary_selected_months.find((x: any) => x?.monthnumber == month?.monthnumber);
        if (checkmonth != undefined || checkmonth != null) {
            const slicemonths = this.ary_selected_months.filter((x: any) => x?.monthnumber != month?.monthnumber);
            this.ary_selected_months = slicemonths;
        } else {
            this.ary_selected_months.push(month);
        }
        // console.log(this.ary_selected_months);
        this.ischeckedmonth = this.months.length > 0 ? true : false;
    }

    private async dowloadpdf() {
        this.typefordownload = "PDF";
        const ary_months_selected: any[] = [];
        const ary_contracts_selected: any[] = [];
        ary_contracts_selected.push(this.$route.query.contract_number);
        this.ary_selected_months.map((x: any) => {
            const year_month: string = x?.year.toString() + "-" + (x?.monthnumber.toString().length == 1 ? '0' : '') + x?.monthnumber.toString();
            ary_months_selected.push(year_month);
        })
        const request: any = {
            contract: ary_contracts_selected,
            report_type: this.typefordownload,
            period: ary_months_selected
        }
        try {
            const response = await OrderingServices.monthlyReport(request);
            await FileUtils.downloadFile(response.file.content, response.file.name, response.file.extension);
        } catch (error) {
            DialogUtils.showErrorDialog({
                text: this.lang == "th" ? "มีข้อผิดพลาดเกิดขึ้น <br> กรุณาลองใหม่ภายหลัง" : "An error occurred <br> Please try again later.",
                title: this.lang == "th" ? "เกิดข้อผิดพลาด" : "An error occurred",
            })
        }

    }
    private async dowloadcsv() {
        this.typefordownload = "XLSX";
        const ary_months_selected: any[] = [];
        const ary_contracts_selected: any[] = [];
        ary_contracts_selected.push(this.$route.query.contract_number);
        this.ary_selected_months.map((x: any) => {
            const year_month: string = x?.year.toString() + "-" + (x?.monthnumber.toString().length == 1 ? '0' : '') + x?.monthnumber.toString();
            ary_months_selected.push(year_month);
        })
        const request: any = {
            contract: ary_contracts_selected,
            report_type: this.typefordownload,
            period: ary_months_selected
        }
        try {
            const response = await OrderingServices.monthlyReport(request);
            await FileUtils.downloadFile(response.file.content, response.file.name, response.file.extension);
        } catch (error) {
            DialogUtils.showErrorDialog({
                text: this.lang == "th" ? "มีข้อผิดพลาดเกิดขึ้น <br> กรุณาลองใหม่ภายหลัง" : "An error occurred <br> Please try again later.",
                title: this.lang == "th" ? "เกิดข้อผิดพลาด" : "An error occurred",
            })
        }
    }
    private goToSuccessPage() {
        this.$router.push({
            name: ROUTER_NAMES.rewards_transaction_download_success,
        })
    }

    private getDateFromYearAndMonth(yearId: number, monthId: number) {
        return moment(`${yearId} ${monthId}`, "YYYY M")
    }
    private async toggleSelectedMonth(mItem: any) {
        mItem.selected = !mItem.selected
        if (mItem.selected) {
            this.ary_selected_months.push(mItem);
        }
        else {
            const slicemonths = this.ary_selected_months.filter((x: any) => x?.monthnumber != mItem?.monthnumber);
            this.ary_selected_months = slicemonths;
        }
        //await this.selectedRequest()
        this.ischeckedmonth = this.ary_selected_months.length > 0 ? true : false;
    }
}

interface LooseObject {
    [key: string]: any
}

