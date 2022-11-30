import { Component } from "vue-property-decorator"
import { RewardServices, VuexServices } from "@/services"
import { ROUTER_NAMES } from "@/router"
import Base from "@/pages/dashboard/pages/rewards/reward-base"
import { DialogUtils } from "@/utils"

@Component
export default class RewardsMainPage extends Base {

    private loading = false

    private get text() {
        return {
            title: this.$t("pages.rewards_main.title").toString(),
            earn_rate: this.$t("pages.rewards_main.earn_rate").toString(),
            redeem_rate: this.$t("pages.rewards_main.redeem_rate").toString(),
            select_menu: this.$t("pages.rewards_main.select_menu").toString(),
            main_menu: this.$t("pages.rewards_main.main_menu").toString(),
            history_line1_menu: this.$t("pages.rewards_main.history_line1_menu").toString(),
            history_line2_menu: this.$t("pages.rewards_main.history_line2_menu").toString(),
            void_line1_menu: this.$t("pages.rewards_main.void_line1_menu").toString(),
            void_line2_menu: this.$t("pages.rewards_main.void_line2_menu").toString(),
            dashboard_menu: this.$t("pages.rewards_main.dashboard_menu").toString(),
            baht: this.$t("baht").toString(),
            point: this.$t("point").toString()
        }
    }

    private async checkStoreConfig() {
        this.loading = true
        try {
            let { configs } = this

            const store = await this.getStoreFromQuery()

            if (!store) {
                throw new Error(`Store not found`)
            }

            if (configs.length === 0) {
                configs = await RewardServices.getRewardConfigs(this.user.bpNumber, store.branch.code, store.industryCode, store.number, store.floorRoom)
                if (configs.length === 0) throw new Error("No store config")
                await VuexServices.CustomerReward.configs.set(configs)
            }
        } catch (e) {
            console.log(e.message || e)
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }
        this.loading = false
    }

    private async mounted() {
        await this.checkStoreConfig()
    }

    private get menus() {
        interface MenuItem {
            label1: string
            label2: string
            icon: any
            type: "menu"
            route: string
        }

        const { userPermissions } = this
        const menus: MenuItem[] = []

        if (userPermissions.history) {
            menus.push({
                label1: this.text.history_line1_menu,
                label2: this.text.history_line2_menu,
                icon: require("@/assets/images/rewards-history.svg"),
                type: "menu",
                route: ROUTER_NAMES.rewards_transaction_history
            })
        }

        if (userPermissions.approveVoid) {
            menus.push({
                label1: this.text.void_line1_menu,
                label2: this.text.void_line2_menu,
                icon: require("@/assets/images/rewards-void.svg"),
                type: "menu",
                route: ROUTER_NAMES.rewards_approve_void
            })
        }

        if (userPermissions.dashboard) {
            menus.push({
                label1: this.text.dashboard_menu,
                label2: "",
                icon: require("@/assets/images/rewards-dashboard.svg"),
                type: "menu",
                route: ROUTER_NAMES.rewards_dashboard
            })
        }
        
        return menus
    }

    private get earnRateText() {
        return `${this.earnRate} ${this.text.baht} = ${this.pointEarned} ${this.text.point}`
    }

    private get redeemRateText() {
        return `${this.pointSpended} ${this.text.point} = ${this.redeemRate} ${this.text.baht}`
    }

    private get isOwner() {
        return this.user.isOwner
    }

    private goToCreateTransaction() {
        this.goTo(ROUTER_NAMES.rewards_search_the1_member)
    }

    private goTo(name: string) {
        if (name) {
            return this.$router.push({
                name,
                query: this.$route.query,
                params: this.$route.params
            })
        }
    }
}