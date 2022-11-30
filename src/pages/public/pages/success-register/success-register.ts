import { ROUTER_NAMES } from "@/router"
import { Component } from "vue-property-decorator"
import Base from "../../public-base"

@Component
export default class SuccessRegisterPage extends Base {

    private goToLogin () {
        this.$router.push({
            name: ROUTER_NAMES.login
        })
    }
}
