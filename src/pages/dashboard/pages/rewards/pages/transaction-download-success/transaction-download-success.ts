import { Component } from "vue-property-decorator"
import Base from "../base"
import { ROUTER_NAMES } from "@/router"

@Component
export default class CustomerRewardTransactionDownloadSuccess extends Base {

    private backToMainPage() {
        this.$router.push({
            name: ROUTER_NAMES.rewards_transaction_history,
            query: this.$route.query,
            params: this.$route.params
        })
    }
}
