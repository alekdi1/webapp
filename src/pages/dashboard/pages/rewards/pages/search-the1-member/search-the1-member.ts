import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/pages/rewards/reward-base"
import { RewardServices, VuexServices } from "@/services"
import { DialogUtils, ValidateUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"

const INPUT_TYPE = {
    the1Number: 0,
    citizenId: 1,
    phoneNumber: 2
}

@Component
export default class RewardsSearchThe1MemberPage extends Base {
    private the1NumberInput = ""
    private citizenIdInput = ""
    private phoneNumberInput = ""
    private inputSelected: number | null = INPUT_TYPE.phoneNumber
    private loading = false
    private the1NumberError = ""
    private citizenIdError = ""
    private phoneNumberError = ""
    private isNoStoreConfig = false

    private get text() {
        return {
            title: this.$t("pages.rewards_search_the1_member.title").toString(),
            select_input: this.$t("pages.rewards_search_the1_member.select_input").toString(),
            input_the1_number: this.$t("pages.rewards_search_the1_member.input_the1_number").toString(),
            input_citizen_id: this.$t("pages.rewards_search_the1_member.input_citizen_id").toString(),
            input_phone_number: this.$t("pages.rewards_search_the1_member.input_phone_number").toString(),
            error_the1_number: this.$t("pages.rewards_search_the1_member.error_the1_number").toString(),
            error_citizen: this.$t("pages.rewards_search_the1_member.error_citizen").toString(),
            error_phone_number: this.$t("pages.rewards_search_the1_member.error_phone_number").toString(),
            error_multiple_member_found: this.$t("pages.rewards_search_the1_member.error_multiple_member_found").toString(),
            confirm: this.$t("confirm").toString()
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
                if (configs.length === 0) {
                    this.isNoStoreConfig = true
                    throw new Error("No store config")
                } 
                this.isNoStoreConfig = false
                await VuexServices.CustomerReward.configs.set(configs)
            }
        } catch (e) {
            console.log(e.message)
            DialogUtils.showErrorDialog({
                text: e.message || "Error"
            })
        }
        this.loading = !true
    }

    private showNoStoreConfig() {
        DialogUtils.showErrorDialog({
            text: "No store config"
        })
    }

    private async mounted() {
        console.log("Mounted")
        await this.checkStoreConfig()
        // @ts-ignore
        this.$refs.phoneNumberInput.focus()
    } 

    private get the1Number() {
        return this.the1NumberInput.replaceAll("-", "")
    }

    private get citizenId() {
        return this.citizenIdInput.replaceAll("-", "")
    }

    private get phoneNumber() {
        return this.phoneNumberInput.replaceAll("-", "").replaceAll("_", "")
    }

    private get the1NumberSelected() {
        return this.inputSelected === INPUT_TYPE.the1Number
    }

    private get citizenIdSelected() {
        return this.inputSelected === INPUT_TYPE.citizenId
    }

    private get phoneNumberSelected() {
        return this.inputSelected === INPUT_TYPE.phoneNumber
    }

    get errors() {
        return {
            the1Number: (v => {
                if (this.the1NumberSelected) {
                    if (!ValidateUtils.validateT1Card(v)) return ""
                    return null
                }
                return null
            })(this.the1Number),

            citizenId: (v => {
                if (this.citizenIdSelected) {
                    if (!ValidateUtils.validateCitizenNumber(v)) return ""
                    return null
                }
                return null
            })(this.citizenId),

            phoneNumber: (v => {
                if (this.phoneNumberSelected) {
                    if (!ValidateUtils.validatePhoneExtra(v)) return ""
                    return null
                }
                return null
            })(this.phoneNumber)
        }
    }

    get allValidated() {
        if (this.inputSelected !== null) {
            return Object.values(this.errors).every(e => e === null)
        }
        return false
    }

    get submitDisabled() {
        return !this.allValidated
    }

    private async submitSearchForm () {
        if (this.isNoStoreConfig) {
            this.showNoStoreConfig()
        } else {
            this.the1NumberError = ""
            this.citizenIdError = ""
            this.phoneNumberError = ""
            const cardNo = this.the1NumberSelected ? this.the1Number : ""
            const nationalId = this.citizenIdSelected ? this.citizenId : ""
            const mobileNo = this.phoneNumberSelected ? this.phoneNumber : ""

            if (this.allValidated) {
                this.loading = true
                try {
                    const rs = await RewardServices.searchMember(cardNo, nationalId, mobileNo)
                    if (rs.successful === true) {
                        const member = RewardServices.mapThe1MemberData(rs.data)
                        await VuexServices.Root.setThe1Member(member)
                        this.goToEarnRedeemForm(member.cardNo)
                    } else {
                        if (rs.error_code === RewardServices.ERROR_CODE.memberNotFound) {
                            if (this.the1NumberSelected) this.the1NumberError = this.text.error_the1_number
                            else if (this.citizenIdSelected) this.citizenIdError = this.text.error_citizen
                            else if (this.phoneNumberSelected) this.phoneNumberError = this.text.error_phone_number
                        } else {
                            console.log(rs.message || rs.error_code)
                            DialogUtils.showErrorDialog({
                                text: this.text.error_multiple_member_found
                            })
                        }
                    }
                } catch (e) {
                    console.log(e.message || e)
                    DialogUtils.showErrorDialog({
                        text: e.message || e
                    })
                }
                this.loading = false
            }
        }
    }

    private goToEarnRedeemForm(cardNo: string) {
        const query = this.$route.query
        query["card_no"] = cardNo
        if (this.citizenIdSelected) {
            query["national_id"] = this.citizenId
        } else if (this.phoneNumberSelected) {
            query["mobile_no"] = this.phoneNumber
        }
        this.$router.push({
            name: ROUTER_NAMES.rewards_earn_redeem_form,
            query: query,
            params: this.$route.params
        })
    }
}