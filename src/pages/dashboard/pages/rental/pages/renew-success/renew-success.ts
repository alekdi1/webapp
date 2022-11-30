import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import { ROUTER_NAMES } from "@/router"

@Component
export default class RentalRenewSuccessPage extends Base {

    private get confirmed () {
        return String(this.$route.query.type || "") === "confirmed"
    }

    private get displayText () {
        return this.confirmed ? "เราดีใจที่คุณให้ความเชื่อมั่นและเติบโตไปด้วยกันกับเรา</br>เราจะรีบดำเนินการโดยเร็วที่สุด" : "เจ้าหน้าที่จะรีบติดต่อหาคุณโดยเร็วที่สุด"
    }

    private backToRepairPose () {
        this.$router.push({
            name: ROUTER_NAMES.rental_info_list
        })
    }
}
