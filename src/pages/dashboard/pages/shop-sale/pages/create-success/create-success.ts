import { Component } from "vue-property-decorator"
import Base from "../base"
import { ROUTER_NAMES } from "@/router"

@Component
export default class ShopSaleCreateSuccessPage extends Base {

    private backToMainSelectOptionPage() {
        this.$router.push({
            name: ROUTER_NAMES.shop_sale_select_branch
        })
    }
}
