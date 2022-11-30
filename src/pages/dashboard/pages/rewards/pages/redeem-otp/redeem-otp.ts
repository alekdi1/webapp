import { RewardModel } from "@/models"
import { RewardServices, VuexServices } from "@/services"
import { DialogUtils, NumberUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/pages/rewards/reward-base"
import { ROUTER_NAMES } from "@/router"
import moment from "moment"

@Component
export default class RewardsRedeemOTPPage extends Base {
    private member: RewardModel.The1Member | null = null
    private earnRedeemData: RewardModel.EarnRedeemData | null = null
    private otp = ""
    private numInputs = 6
    private isOTPInvalid = false
    private timer: ReturnType<typeof setTimeout> | null = null
    private newAssociateTransactionId = ""
    private loading = false

    private get text() {
        return {
            title: this.$t("pages.rewards_redeem_otp.title").toString(),
            input_otp: this.$t("pages.rewards_redeem_otp.input_otp").toString(),
            sms_sent: this.$t("pages.rewards_redeem_otp.sms_sent").toString(),
            input_otp_in_3_sec: this.$t("pages.rewards_redeem_otp.input_otp_in_3_sec").toString(),
            otp_ref_code: this.$t("pages.rewards_redeem_otp.otp_ref_code").toString(),
            otp_expired: this.$t("pages.rewards_redeem_otp.otp_expired").toString(),
            please_resend_otp_again: this.$t("pages.rewards_redeem_otp.please_resend_otp_again").toString(),
            otp_error: this.$t("pages.rewards_redeem_otp.otp_error").toString(),
            the_1: this.$t("the_1").toString(),
            the_1_point: this.$t("the_1_point").toString(),
            resend_otp_again: this.$t("resend_otp_again").toString(),
            confirm: this.$t("confirm").toString()
        }
    }

    private get cardNo() {
        return String(this.$route.query.card_no || "")
    }

    private get associateTransactionId() {
        return String(this.$route.query.associate_transaction_id || "")
    }

    private async getMember() {
        this.loading = true
        try {

            let { configs } = this

            const store = await this.getStoreFromQuery()

            if (!store) {
                return DialogUtils.showErrorDialog({
                    text: `Store not found`
                }).then(() => this.$router.replace({
                    name: ROUTER_NAMES.rewards_shop_list
                }))
            }

            if (configs.length === 0) {
                configs = await RewardServices.getRewardConfigs(this.user.bpNumber, store.branch.code, store.industryCode, store.number, store.floorRoom)
                if (configs.length === 0) {
                    return DialogUtils.showErrorDialog({
                        text: "No store config"
                    }).then(() => {
                        this.$router.replace({
                            name: ROUTER_NAMES.rewards_shop_list
                        })
                    })
                }
                await VuexServices.CustomerReward.configs.set(configs)
            }

            let member = VuexServices.Root.getThe1Member()
            if (!member) {
                const rs = await RewardServices.searchMember(this.cardNo, "", "")
                member = RewardServices.mapThe1MemberData(rs.data)
                await VuexServices.Root.setThe1Member(member)
            }

            if (!member) {
                this.loading = false
                throw new Error("Member not found")
            }
            this.member = member
            this.getEarnRedeemData()
        } catch (e) {
            console.log(e.message || e)
            this.loading = false
        }
    }

    private async getEarnRedeemData() {
        const earnRedeemData = RewardServices.getLocalEarnRedeemData()
        if (!earnRedeemData) {
            this.loading = false
            throw new Error("Data not found")
        }
        this.earnRedeemData = earnRedeemData
        this.loading = false
        this.startTimer()
    }

    private async mounted() {
        console.log("Mounted")
        await this.getMember()
    }

    private get displayPointBalance() {
        const point = this.member?.pointBalance ?? 0
        return NumberUtils.getNumberFormat(point)
    }
    
    private handleOnChange(value: string) {
        if (this.isOTPInvalid) {
            this.isOTPInvalid = !this.isOTPInvalid
        }
        this.otp = value
    }

    private isActive(index: number) {
        return index <= this.otp.length
    }

    private get otpRefCode() {
        return this.earnRedeemData?.otp?.otpRefCode
    }

    private startTimer() {
        this.stopTimer()
        const origins = [
            "https://serveqasphase1.centralpattana.co.th",
            "https://serve.centralpattana.co.th"    
        ]
        if (origins.includes(window.origin)) {
            this.timer = setTimeout(this.otpExpired, 180000)
        } else {
            this.timer = setTimeout(this.otpExpired, 60000)
        } 
    }

    private stopTimer() {
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }
    }

    private async otpExpired() {
        const result = await DialogUtils.showOTPExpiredWithActionDialog({
            text: `${this.text.otp_expired}<br>${this.text.please_resend_otp_again}`
        })
        if (result.isConfirmed || result.isDismissed) {
            await this.resendOTP()
        }
    }

    get errors() {
        return {
            otp: (v => {
                if (!v || v.length !== this.numInputs) return ""
                return null
            })(this.otp)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }

    get submitDisabled() {
        return !this.allValidated
    }

    private async submitOTPForm () {
        if (this.allValidated) {
            this.loading = true
            
            const earnedPoint = this.earnRedeemData?.earnData.earnPoint ?? 0
            const availableConfig = this.getAvailableConfig(this.configs, earnedPoint)
            if (availableConfig) {
                let useAssociateTransactionId = this.associateTransactionId
                if (this.newAssociateTransactionId) {
                    useAssociateTransactionId = this.newAssociateTransactionId
                }

                try {
                    const rs = await RewardServices.verifyTransactionEarnRedeem(
                        useAssociateTransactionId, 
                        this.earnRedeemData?.otp?.otpRefCode ?? "", 
                        this.otp, 
                        this.earnRedeemData?.otp?.targetTransactionId ?? "",
                        availableConfig.partnerCode,
                        availableConfig.branchCode1Biz
                    )

                    if (rs.status === "Success") {
                        const earnRedeemData = RewardServices.mapEarnRedeemData(rs.data.data)
                        RewardServices.storeEarnRedeemDataToLocal(earnRedeemData)
                        this.stopTimer()
                        this.goToEarnRedeemSuccess()
                    }
                } catch (e) {
                    console.log(e)
                    if (e.data.error_code) {
                        if (e.data.error_code === RewardServices.ERROR_CODE.otpInvalid) {
                            this.isOTPInvalid = true
                        } else if (e.data.error_code === RewardServices.ERROR_CODE.pointNotEnough) {
                            this.goToEarnRedeemError(e.data.error_code)
                        } else {
                            DialogUtils.showErrorDialog({
                                text: e.message || e
                            })
                        }
                    } else {
                        DialogUtils.showErrorDialog({
                            text: e.message || e
                        })
                    }
                }
            } else {
                this.goToEarnRedeemError(RewardServices.ERROR_CODE.pointServiceNotAvailable)
            }
            this.loading = false
        }
    }

    private async getIpAddress() {
        try {
            const rs = await fetch("https://api.ipify.org/?format=json")
            const data = await rs.json()
            return data.ip || ""
        } catch (e) {
            return ""
        }
    }

    private async resendOTP() {
        // @ts-ignore
        this.$refs.otpInput.clearInput()
        
        this.stopTimer()
        this.loading = true
        
        const earnedPoint = this.earnRedeemData?.earnData.earnPoint ?? 0
        const availableConfig = this.getAvailableConfig(this.configs, earnedPoint)
        if (availableConfig) {
            const deviceRef = await this.getIpAddress()
            const reAssociateTransactionId = `WEB_${this.user.customerNo}${this.user.id}_${moment().format("YYYYMMDDHHMMSS")}`
            const earnedValue = this.earnRedeemData?.earnData.earnValue ?? 0
            const redeemedValue = this.earnRedeemData?.redeemData.redeemedValue ?? 0
            const total = earnedValue + redeemedValue
            const businessDate = moment().format("DDMMYYYY")

            try {
                const rs = await RewardServices.createTransactionEarnRedeem(
                    this.cardNo,
                    total,
                    deviceRef,
                    reAssociateTransactionId,
                    earnedValue,
                    true,
                    "01",
                    this.earnRedeemData?.redeemData.redeemedPoint ?? 0,
                    businessDate,
                    this.member,
                    availableConfig.partnerCode,
                    availableConfig.branchCode1Biz,
                    this.earnRedeemData?.note ?? "",
                    this.store?.floorRoom ?? ""
                )

                if (rs.status === "Success") {
                    console.log("resendOTP result: ", rs)
                    const earnRedeemData = RewardServices.mapEarnRedeemData(rs.data)
                    RewardServices.storeEarnRedeemDataToLocal(earnRedeemData)
                    this.earnRedeemData = earnRedeemData
                    this.newAssociateTransactionId = reAssociateTransactionId
                    this.startTimer()
                }
            } catch (e) {
                console.log(e)
                if (e.data.error_code === RewardServices.ERROR_CODE.pointServiceNotAvailable || e.data.error_code === RewardServices.ERROR_CODE.pointNotEnough) {
                    this.goToEarnRedeemError(e.data.error_code)
                } else {
                    DialogUtils.showErrorDialog({
                        text: e.message || e
                    })
                }
            }
        } else {
            this.goToEarnRedeemError(RewardServices.ERROR_CODE.pointServiceNotAvailable)
        }
        this.loading = false
    }

    private goToEarnRedeemError(errorCode: string) {
        const query = this.$route.query
        query["error_code"] = errorCode
        this.$router.push({
            name: ROUTER_NAMES.rewards_earn_redeem_error,
            query: query,
            params: this.$route.params
        })
    }

    private goToEarnRedeemSuccess() {
        const query = this.$route.query
        delete query["associate_transaction_id"]
        this.$router.push({
            name: ROUTER_NAMES.rewards_earn_redeem_success,
            query: query,
            params: this.$route.params
        })
    }

    private beforeDestroy() {
        this.stopTimer()
    }
}