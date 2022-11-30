import { Component } from "vue-property-decorator"
import Base from "../base"
import { ROUTER_NAMES } from "@/router"

@Component
export default class WatchSaleCreateSuccessPage extends Base {

    private backToMainSelectOptionPage() {
        this.$router.push({
            name: ROUTER_NAMES.watch_sale_select_branch
        })
    }
}
