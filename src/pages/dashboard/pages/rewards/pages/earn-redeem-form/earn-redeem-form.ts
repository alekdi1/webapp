import { RewardModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { RewardServices, VuexServices } from "@/services"
import { DialogUtils, LanguageUtils, NumberUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/pages/rewards/reward-base"
import moment from "moment"

// 01: Redeem with point, 02: Redeem with spending amount
const REDEEM_TYPE = {
    redeemWithPoint: "01",
    redeemWithDiscount: "02"
}

@Component
export default class RewardsEarnRedeemFormPage extends Base {

    private noteLimit = 50
    private member: RewardModel.The1Member | null = null
    private totalAmountText = ""
    private redeemType = REDEEM_TYPE.redeemWithDiscount
    private redeemDiscount = ""
    private redeemPoint = ""
    private note = ""
    private minPointRedeemAlert = ""
    private minPointEarnAlert = ""
    private loading = false

    private get text() {
        return {
            title: this.$t("pages.rewards_earn_redeem_form.title").toString(),
            total_amount_title: this.$t("pages.rewards_earn_redeem_form.total_amount_title").toString(),
            redeem_title_1: this.$t("pages.rewards_earn_redeem_form.redeem_title_1").toString(),
            redeem_title_2: this.$t("pages.rewards_earn_redeem_form.redeem_title_2").toString(),
            redeem_subtitle: this.$t("pages.rewards_earn_redeem_form.redeem_subtitle").toString(),
            redeem_use_point: this.$t("pages.rewards_earn_redeem_form.redeem_use_point").toString(),
            ex_redeem_rate: this.$t("pages.rewards_earn_redeem_form.ex_redeem_rate").toString(),
            earn_title: this.$t("pages.rewards_earn_redeem_form.earn_title").toString(),
            earn_point: this.$t("pages.rewards_earn_redeem_form.earn_point").toString(),
            note_title: this.$t("pages.rewards_earn_redeem_form.note_title").toString(),
            not_enough_point: this.$t("pages.rewards_earn_redeem_form.not_enough_point").toString(),
            less_than_minimum: this.$t("pages.rewards_earn_redeem_form.less_than_minimum").toString(),
            less_than_min_point_redeem: this.$t("pages.rewards_earn_redeem_form.less_than_min_point_redeem").toString(),
            less_than_min_point_earn: this.$t("pages.rewards_earn_redeem_form.less_than_min_point_earn").toString(),
            the_1: this.$t("the_1").toString(),
            the_1_point: this.$t("the_1_point").toString(),
            discount: this.$t("discount").toString(),
            baht: this.$t("baht").toString(),
            point: this.$t("point").toString(),
            next: this.$t("next").toString()
        }
    }

    private get cardNo() {
        return String(this.$route.query.card_no || "")
    }

    private get mobileNo() {
        return String(this.$route.query.mobile_no || "")
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

    private get canRedeem() {
        // If home telephone hide redeem section
        if (this.mobileNo.length === 9) {
            return false
        }
        return true
    }

    private get pointBalance() {
        return this.member?.pointBalance ?? 0
    }

    private get displayPointBalance() {
        return NumberUtils.getNumberFormat(this.pointBalance)
    }

    private get totalAmount() {
        const total = this.totalAmountText.replaceAll(",", "")
        if (total) {
            return parseFloat(total)
        }
        return 0.0
    }

    private get displayTotalAmount() {
        return NumberUtils.getPriceFormat(this.totalAmount)
    }

    private get discount() {
        let discount = 0.0
        if (this.redeemDiscount) {
            const discountFloat = parseFloat(this.redeemDiscount)
            const redeem = Math.floor(discountFloat / this.redeemRate)
            discount = Math.floor(redeem * this.redeemRate)
        }
        if (discount > 0.0 && this.isEnoughPoint && this.isMoreThanMinPointRedeem) {
            return discount
        }
        return 0.0
    }

    private get displayTotalDiscount() {
        if (this.discount > 0.0) {
            return `-${NumberUtils.getPriceFormat(this.discount)}`
        }
        return ""
    }

    private get totalAmountWithDiscount() {
        let total = 0.0
        let discount = 0.0
        if (this.totalAmount > 0.0) {
            total = this.totalAmount
            if (this.discount > 0.0) {
                discount = this.discount
            }
        }
        return total - discount
    }

    private get displayTotalAmountWithDiscount() {
        return NumberUtils.getPriceFormat(this.totalAmountWithDiscount)
    }

    private get isRedeemWithDiscount() {
        return this.redeemType === REDEEM_TYPE.redeemWithDiscount
    }

    private get isRedeemWithPoint() {
        return this.redeemType === REDEEM_TYPE.redeemWithPoint
    }

    private redeemWithDiscount() {
        if (this.isEnoughPoint === false) {
            const redeem = Math.floor(this.pointBalance / this.pointSpended)
            this.redeemPoint = `${(redeem * this.pointSpended)}`
            this.redeemPointChanged(this.redeemPoint)
        } else {
            const discount = parseFloat(this.redeemDiscount)
            const redeem = Math.floor(discount / this.redeemRate)
            this.redeemDiscount = `${(redeem * this.redeemRate)}`
            this.redeemDiscountChanged(this.redeemDiscount)
        }
        this.redeemType = REDEEM_TYPE.redeemWithDiscount
    }

    private redeemWithPoint() {
        if (this.isEnoughPoint === false) {
            const redeem = Math.floor(this.pointBalance / this.pointSpended)
            this.redeemPoint = `${(redeem * this.pointSpended)}`
            this.redeemPointChanged(this.redeemPoint)
        } else {
            const point = parseInt(this.redeemPoint)
            const redeem = Math.floor(point / this.pointSpended)
            this.redeemPoint = `${(redeem * this.pointSpended)}`
            this.redeemPointChanged(this.redeemPoint)
        }
        return this.redeemType = REDEEM_TYPE.redeemWithPoint
    }

    private get isEnoughPoint() {
        if (this.redeemPoint) {
            const point = parseInt(this.redeemPoint)
            return point <= this.pointBalance
        }
        return true
    }

    private get isMoreThanMinPointRedeem() {
        let isMoreThan = true
        if (this.redeemPoint) {
            const pointInt = parseInt(this.redeemPoint)
            const redeem = Math.floor(pointInt / this.pointSpended)
            const point = Math.floor(redeem * this.pointSpended)
            isMoreThan = point >= this.minPointRedeem
        }
        if (isMoreThan) {
            this.minPointRedeemAlert = ""
        }
        return isMoreThan
    }

    private get isMoreThanMinPointEarn() {
        let isMoreThan = false
        if (this.earnPoint > 0) {
            isMoreThan = this.earnPoint >= this.minPointEarn
        }
        if (isMoreThan) {
            this.minPointEarnAlert = ""
        }
        return isMoreThan
    }

    private get showTopAlert() {
        return this.minPointRedeemAlert !== "" || this.minPointEarnAlert !== ""
    }

    private get topAlertMessage() {
        if (this.minPointRedeemAlert) {
            return this.minPointRedeemAlert
        } else if (this.minPointEarnAlert) {
            return this.minPointEarnAlert
        } else {
            return ""
        }
    }

    private get displayRedeemDiscount() {
        if (this.redeemDiscount) {
            if (this.isEnoughPoint) {
                if (this.isMoreThanMinPointRedeem) {
                    const discount = parseFloat(this.redeemDiscount)
                    return NumberUtils.getPriceFormat(discount)
                } else {
                    return this.text.less_than_minimum
                }
            } else {
                return this.text.not_enough_point
            }
        }
        return NumberUtils.getPriceFormat(0)
    }

    private get displayRedeemPoint() {
        if (this.redeemPoint) {
            if (this.isEnoughPoint) {
                if (this.isMoreThanMinPointRedeem) {
                    const point = parseInt(this.redeemPoint)
                    return NumberUtils.getNumberFormat(point)
                } else {
                    return this.text.less_than_minimum
                }
            } else {
                return this.text.not_enough_point
            }
        }
        return "0"
    }

    private get earnPoint() {
        const earn = Math.floor(this.totalAmountWithDiscount / this.earnRate)
        return Math.floor(earn * this.pointEarned)
    }

    private get displayEarnPoint() {
        const earnPoint = this.earnPoint
        const earnPointText = NumberUtils.getNumberFormat(earnPoint)
        return earnPoint > 0 ? `+${earnPointText}` : "0"
    }

    private get noteCounter() {
        return `${this.note.length}/${this.noteLimit}`
    }

    private get redeemedValue() {
        if (this.isRedeemWithDiscount) {
            let discount = 0
            if (this.redeemDiscount) {
                const discountFloat = parseFloat(this.redeemDiscount)
                const redeem = Math.floor(discountFloat / this.redeemRate)
                discount = Math.floor(redeem * this.redeemRate)
            }
            if (discount > 0 && this.isEnoughPoint && this.isMoreThanMinPointRedeem) {
                return discount
            }
            return 0
        } else {
            let point = 0
            if (this.redeemPoint) {
                const pointInt = parseInt(this.redeemPoint)
                const redeem = Math.floor(pointInt / this.pointSpended)
                point = Math.floor(redeem * this.pointSpended)
            }
            if (point > 0 && this.isEnoughPoint && this.isMoreThanMinPointRedeem) {
                return point
            }
            return 0
        }
    }

    private get isEarnWithRedeem() {
        return this.redeemedValue > 0
    }

    private get errors() {
        const { lang } = LanguageUtils
        return {
            totalAmountText: (v => {
                if (!v) return lang("กรุณาระบุยอดใช้จ่าย", "กรุณาระบุยอดใช้จ่าย")
                return null
            })(this.totalAmountText),

            isEnoughPoint: (v => {
                if (!v) return lang("กรุณาระบุส่วนลดหรือคะแนนให้ถูกต้อง", "กรุณาระบุส่วนลดหรือคะแนนให้ถูกต้อง")
                return null
            })(this.isEnoughPoint)
        }
    }

    private get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }

    private get submitDisabled() {
        return !this.allValidated
    }

    private focusTotalAmount() {
        this.totalAmountText = this.totalAmount > 0.0 ? `${this.totalAmount}` : ""
    }

    private blurTotalAmount() {
        this.totalAmountText = this.totalAmount > 0.0 ? NumberUtils.getPriceFormat(this.totalAmount) : ""
    }

    private blurDiscount() {
        const discount = parseFloat(this.redeemDiscount)
        const redeem = Math.floor(discount / this.redeemRate)
        this.redeemDiscount = `${(redeem * this.redeemRate)}`
    }

    private blurPoint() {
        const point = parseInt(this.redeemPoint)
        const redeem = Math.floor(point / this.pointSpended)
        this.redeemPoint = `${(redeem * this.pointSpended)}`
    }

    private totalAmountTextChanged(event: any) {
        if (this.totalAmount > 1000000000.99) {
            const index = event.target.selectionStart
            this.totalAmountText = this.totalAmountText.slice(0, index - 1) + this.totalAmountText.slice(index)
        }
        this.isMoreThanMinPointEarn
    }

    private redeemDiscountChanged(value: string) {
        if (value.length > 10) {
            value = value.slice(0,10)
            this.redeemDiscount = value
        }
        const discount = parseFloat(value)
        if (Number.isNaN(discount)) {
            this.redeemPoint = ""
            return
        }
        const redeem = Math.floor(discount / this.redeemRate)
        const point = Math.floor(redeem * this.pointSpended)
        this.redeemPoint = Number.isNaN(point) ? "" : `${point}`
    }

    private redeemPointChanged(value: string) {
        if (value.length > 11) {
            value = value.slice(0,11)
            this.redeemPoint = value
        }
        const point = parseInt(value)
        if (Number.isNaN(point)) {
            this.redeemDiscount = ""
            return
        }
        const redeem = Math.floor(point / this.pointSpended)
        const discount = Math.floor(redeem * this.redeemRate)
        this.redeemDiscount = Number.isNaN(discount) ? "" : `${discount}`
    }

    private redeemDiscountEXText(redeem: number) {
        const point = NumberUtils.getNumberFormat(Math.floor(redeem * this.pointSpended))
        const discountText = NumberUtils.getNumberFormat(Math.floor(redeem * this.redeemRate))
        return `${this.text.discount} ${discountText} ${this.text.baht} ${point} ${this.text.point}`
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

    private async submitEarnRedeemForm() {
        if (this.allValidated) {
            if (this.isMoreThanMinPointRedeem === false) {
                this.minPointRedeemAlert = this.text.less_than_min_point_redeem
                return
            }
            
            if (this.isMoreThanMinPointEarn === false) {
                this.minPointEarnAlert = this.text.less_than_min_point_earn
                return
            }

            this.loading = true

            const availableConfig = this.getAvailableConfig(this.configs, this.earnPoint)
            if (availableConfig) {
                const deviceRef = await this.getIpAddress()
                const associateTransactionId = `WEB_${this.user.customerNo}${this.user.id}_${moment().format("YYYYMMDDHHMMSS")}`
                const earnedValue = this.totalAmountWithDiscount
                const businessDate = moment().format("DDMMYYYY")

                try {
                    const rs = await RewardServices.createTransactionEarnRedeem(
                        this.cardNo,
                        this.totalAmount,
                        deviceRef,
                        associateTransactionId,
                        earnedValue,
                        this.isEarnWithRedeem,
                        this.redeemType,
                        this.redeemedValue,
                        businessDate,
                        this.member,
                        availableConfig.partnerCode,
                        availableConfig.branchCode1Biz,
                        this.note,
                        this.store?.floorRoom ?? ""
                    )

                    if (rs.status === "Success") {
                        console.log("create result: ", rs)
                        const earnRedeemData = RewardServices.mapEarnRedeemData(rs.data)
                        RewardServices.storeEarnRedeemDataToLocal(earnRedeemData)
                        if (earnRedeemData.otp) {
                            this.goToRedeemOTP(associateTransactionId)
                        } else {
                            this.goToEarnRedeemSuccess()
                        }
                    }
                } catch (e) {
                    console.log(e)
                    if (e.data.error_code === RewardServices.ERROR_CODE.pointServiceNotAvailable) {
                        this.goToEarnRedeemError(e.data.error_code)
                    } else {
                        DialogUtils.showErrorDialog({
                            text: e.message || LanguageUtils.lang("การส่งข้อมูลล้มเหลว", "Error while sending data")
                        })
                    }
                }
            } else {
                this.goToEarnRedeemError(RewardServices.ERROR_CODE.pointServiceNotAvailable)
            }

            this.loading = false
        }
    }

    private goToRedeemOTP(associateTransactionId: string) {
        const query = this.$route.query
        query["associate_transaction_id"] = associateTransactionId
        this.$router.push({
            name: ROUTER_NAMES.rewards_redeem_otp,
            query: query,
            params: this.$route.params
        })
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
        this.$router.push({
            name: ROUTER_NAMES.rewards_earn_redeem_success,
            query: this.$route.query,
            params: this.$route.params
        })
    }
}