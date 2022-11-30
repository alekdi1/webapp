import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { ROUTER_NAMES } from "@/router"
import { LanguageUtils } from "@/utils"

const t = (k: string) => LanguageUtils.i18n.t("pages.user_account." + k).toString()

@Component
export default class ChangeUsernamePwdPage extends Base {

    private get menus() {
        return [
            new Menu(ROUTER_NAMES.dashboard_change_username, t("change_username")),
            new Menu(ROUTER_NAMES.dashboard_change_pwd, t("change_password"))
        ]
    }

    private menuClick(menu: Menu) {
        this.$router.push({
            name: menu.route
        })
    }
}

class Menu {
    route: string
    label: string
    constructor(route: string, label: string) {
        this.route = route
        this.label = label
    }
}
