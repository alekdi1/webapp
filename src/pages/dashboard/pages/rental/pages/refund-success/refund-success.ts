import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import { ROUTER_NAMES } from "@/router"

@Component
export default class RentalRefundSuccessPage extends Base {

    private get rentalId () {
        return String(this.$route.query.rentalId || "")
    }

    private backToRepairPose () {
        this.$router.push({
            name: ROUTER_NAMES.rental_refund_detail,
            query: {
                rentalId: this.rentalId
            }
        })
    }
}
