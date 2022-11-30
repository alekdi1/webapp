import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import { ROUTER_NAMES } from "@/router"

@Component
export default class MaintainanceFormSuccessPage extends Base {
    private backToRepairPose () {
        if(this.user.role !== 'QR'){
            this.$router.push({
                name: ROUTER_NAMES.maintainance_shop_list
            })
        }else{
            this.$router.push({
                name: ROUTER_NAMES.maintainance_status_list
            })
        }
    }
}
