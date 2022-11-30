import { ROUTER_NAMES } from "@/router"
import { Component } from "vue-property-decorator"
import Base from "../base"

@Component
export default class ShopSaleMainSelectOptionPage extends Base {

    private get text() {
        return {
            title: this.$t("pages.shop_sales_main_select_option.title").toString(),
            select_option: this.$t("pages.shop_sales_main_select_option.select_option").toString(),
            sales_create: this.$t("pages.shop_sales_main_select_option.sales_create").toString(),
            sales_history: this.$t("pages.shop_sales_main_select_option.sales_history").toString()
        }
    }

    private goToCreateForm() {
        this.goTo(ROUTER_NAMES.shop_sale_sales_form)
    }

    private goToHistory() {
        this.goTo(ROUTER_NAMES.shop_sale_history_list)
    }

    private goTo(name: string) {
        this.$router.push({
            name,
            query: this.$route.query,
            params: this.$route.params
        })
    }
}