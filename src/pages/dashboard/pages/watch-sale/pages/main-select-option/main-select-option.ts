import { EmployeePermission } from "@/models/employee"
import { ROUTER_NAMES } from "@/router"
import { Component } from "vue-property-decorator"
import Base from "../base"

@Component
export default class WatchSaleMainSelectOptionPage extends Base {

    private hasordering_last_month_report = false;
    private hasanother_reportt = true;

    private async mounted() {
        await this.checkPermission()
    }

    private get text() {
        return {
            title: this.$t("pages.watch_sales_main_select_option.title").toString(),
            select_option: this.$t("pages.watch_sales_main_select_option.select_option").toString(),
            sales_at_month: this.$t("pages.watch_sales_main_select_option.sales_at_month").toString(),
            sales_another_data: this.$t("pages.watch_sales_main_select_option.sales_another_data").toString()
        }
    }

    private goToSaleAtMonth() {
        this.goTo(ROUTER_NAMES.watch_sale_at_month)
    }

    private goToAnotherData() {
        console.log('another !.')
        this.goTo(ROUTER_NAMES.watch_sale_history_list)
    }

    private goTo(name: string) {
        this.$router.push({
            name,
            query: this.$route.query,
            params: this.$route.params
        })
    }
    private checkPermission() {
       const permissions: EmployeePermission[] = this.user.permissions;
       const checkPermission_length: any = permissions.find((a: EmployeePermission) => a.permission == "ordering_last_month_report");

       if (this.user.role == 'owner') {
        this.hasordering_last_month_report = true;
       } else {
        this.hasordering_last_month_report = (checkPermission_length == undefined || checkPermission_length == null) ? false : true;  
       }
    }
}