import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/pages/rewards/reward-base"
import { ROUTER_NAMES } from "@/router"

@Component
export default class ApproveVoidSuccess extends Base {
    private confirmDialog = true

    private get text() {
        const t = (k: string) => this.$t("pages.approve_void." + k).toString()
        return {
            title: t("title"),
            rejected_approve_void: t("rejected_approve_void"),
            confirmed_approve_void: t("confirmed_approve_void")
        }
    }

    private get displayMessage () {
        return this.$route.params.type === "rejected" ? this.text.rejected_approve_void : this.text.confirmed_approve_void
    }

    private goToApprovedVoid () {
        this.$router.push({
            name: ROUTER_NAMES.rewards_approve_void,
            params: {
                type: "approved"
            }
        })
    }
}
