import { RewardModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { RewardServices, VuexServices } from "@/services"
import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { NumberUtils } from "@/utils"

@Component
export default class RewardsEarnRedeemErrorPage extends Base {
    private member: RewardModel.The1Member | null = null
    private loading = false

    private get text() {
        return {
            privilege_is_full_title: this.$t("pages.rewards_earn_redeem_error.privilege_is_full_title").toString(),
            not_enough_point_title: this.$t("pages.rewards_earn_redeem_error.not_enough_point_title").toString(),
            sorry: this.$t("pages.rewards_earn_redeem_error.sorry").toString(),
            privilege_is_full_error_1: this.$t("pages.rewards_earn_redeem_error.privilege_is_full_error_1").toString(),
            privilege_is_full_error_2: this.$t("pages.rewards_earn_redeem_error.privilege_is_full_error_2").toString(),
            not_enough_point_error: this.$t("pages.rewards_earn_redeem_error.not_enough_point_error").toString(),
            the_1: this.$t("the_1").toString(),
            the_1_point: this.$t("the_1_point").toString(),
            back_to_main: this.$t("back_to_main").toString()
        }
    }

    private get cardNo() {
        return String(this.$route.query.card_no || "")
    }

    private get errorCode() {
        return String(this.$route.query.error_code || "")
    }

    // TODO: create error code or some enum
    private get title() {
        if (this.isPrivilegeIsFullError) {
            return this.text.privilege_is_full_title
        } else if (this.isNotEnoughPointError) {
            return this.text.not_enough_point_title
        } else {
            return ""
        }
    }

    private get isPrivilegeIsFullError() {
        return this.errorCode === RewardServices.ERROR_CODE.pointServiceNotAvailable
    }

    private get isNotEnoughPointError() {
        return this.errorCode === RewardServices.ERROR_CODE.pointNotEnough
    }
    
    private get displayPointBalance() {
        const point = this.member?.pointBalance ?? 0
        return NumberUtils.getNumberFormat(point)
    }

    private get errorImage() {
        if (this.isPrivilegeIsFullError) {
            return "rewards-privilege-is-full.png"
        } else if (this.isNotEnoughPointError) {
            return "rewards-not-enough-point.png"
        } else {
            return ""
        }
    }

    private get errorMessage1() {
        if (this.isPrivilegeIsFullError) {
            return this.text.privilege_is_full_error_1
        } else if (this.isNotEnoughPointError) {
            return this.text.not_enough_point_error
        } else {
            return ""
        }
    }

    private get errorMessage2() {
        if (this.isPrivilegeIsFullError) {
            return this.text.privilege_is_full_error_2
        } else {
            return ""
        }
    }

    private async getMember() {
        this.loading = true
        try {
            this.member = VuexServices.Root.getThe1Member()
            const rs = await RewardServices.searchMember(this.cardNo, "", "")
            const member = RewardServices.mapThe1MemberData(rs.data)
            await VuexServices.Root.setThe1Member(member)

            if (!member) {
                throw new Error("Member not found")
            }
            this.member = member
        } catch (e) {
            console.log(e.message || e)
        }
        this.loading = false
    }

    private async mounted() {
        console.log("Mounted")
        await this.getMember()
    }

    private backToMainPage() {
        this.clearMember()
        const query = this.$route.query
        delete query["associate_transaction_id"]
        delete query["error_code"]
        delete query["card_no"]
        delete query["national_id"]
        delete query["mobile_no"]
        this.$router.push({
            name: ROUTER_NAMES.rewards_main,
            query: query,
            params: this.$route.params
        })
    }

    private async clearMember() {
        await VuexServices.Root.setThe1Member(null)
    }
}