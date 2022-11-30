import { RewardModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { RewardServices, VuexServices } from "@/services"
import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import moment from "moment"
import { DialogUtils, NumberUtils, TimeUtils } from "@/utils"
import * as htmlToImage from "html-to-image"
import { saveAs } from "file-saver"

@Component
export default class RewardsEarnRedeemSuccessPage extends Base {
    private member: RewardModel.The1Member | null = null
    private earnRedeemData: RewardModel.EarnRedeemData | null = null
    private loading = false
    private downloading = false

    private get text() {
        return {
            title: this.$t("pages.rewards_earn_redeem_success.title").toString(),
            transaction_no: this.$t("pages.rewards_earn_redeem_success.transaction_no").toString(),
            date: this.$t("pages.rewards_earn_redeem_success.date").toString(),
            time: this.$t("pages.rewards_earn_redeem_success.time").toString(),
            total_amount: this.$t("pages.rewards_earn_redeem_success.total_amount").toString(),
            discount_from_redeem: this.$t("pages.rewards_earn_redeem_success.discount_from_redeem").toString(),
            total: this.$t("pages.rewards_earn_redeem_success.total").toString(),
            redeem_point_barcode_label: this.$t("pages.rewards_earn_redeem_success.redeem_point_barcode_label").toString(),
            the_1_redeemed: this.$t("pages.rewards_earn_redeem_success.the_1_redeemed").toString(),
            the_1_earned: this.$t("pages.rewards_earn_redeem_success.the_1_earned").toString(),
            earn_point_barcode_label: this.$t("pages.rewards_earn_redeem_success.earn_point_barcode_label").toString(),
            note: this.$t("pages.rewards_earn_redeem_success.note").toString(),
            download_slip: this.$t("pages.rewards_earn_redeem_success.download_slip").toString(),
            point_update: this.$t("pages.rewards_earn_redeem_success.point_update").toString(),
            room: this.$t("room").toString(),
            the_1: this.$t("the_1").toString(),
            baht: this.$t("baht").toString(),
            point: this.$t("point").toString(),
            back_to_main: this.$t("back_to_main").toString()
        }
    }

    private get cardNo() {
        return String(this.$route.query.card_no || "")
    }

    private get storeName() {
        return String(this.$route.query.shop_name || "")
    }

    private get branchName() {
        return String(this.$route.query.branch_name || "")
    }

    private get storeFloorRoom() {
        return String(this.$route.query.shop_unit || "")
    }

    private get floorRoom() {
        let isMultipleRoom = false
        let room = this.storeFloorRoom
        if (room.includes(";")) {
            room = room.split(";")[0]
            isMultipleRoom = true
        }
        if (room.includes(",")) {
            room = room.split(",")[0]
            isMultipleRoom = true
        }
        if (room.includes("_")) {
            room = room.split("_")[1]
        }
        return isMultipleRoom ? `${room}*` : room
    }

    private async getMember() {
        this.loading = true
        try {
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
    }

    private async mounted() {
        console.log("Mounted")
        await this.getMember()
    }

    private get createdDate() {
        const date = moment(this.earnRedeemData?.earnData.createdAt, "DDMMYYYY_HH:mm:ss:SSS")
        return TimeUtils.convertToLocalDateFormat(moment(date))
    }

    private get createdTime() {
        const date = moment(this.earnRedeemData?.earnData.createdAt, "DDMMYYYY_HH:mm:ss:SSS")
        return TimeUtils.convertToLocalTimeFormat(moment(date))
    }

    private get totalAmount() {
        const total = this.earnRedeemData?.earnData.earnValue
        if (total) {
            return total + this.redeemedDiscount
        }
        return 0
    }

    private get totalAmountText() {
        return NumberUtils.getPriceFormat(this.totalAmount)
    }

    private get redeemedPoint() {
        const point = this.earnRedeemData?.redeemData.redeemedPoint
        if (point) {
            return point
        }
        return 0
    }

    private get earnPoint() {
        const point = this.earnRedeemData?.earnData.earnPoint
        if (point) {
            return point
        }
        return 0
    }

    private get isRedeemed() {
        return this.redeemedPoint > 0
    }

    private get redeemedDiscount() {
        const discount = this.earnRedeemData?.redeemData.redeemedValue
        if (discount) {
            return discount
        }
        return 0
    }

    private get redeemedDiscountText() {
        if (this.redeemedDiscount > 0) {
            return `-${NumberUtils.getPriceFormat(this.redeemedDiscount)}`
        }
        return ""
    }

    private get totalAmountWithDiscount() {
        return this.totalAmount - this.redeemedDiscount
    }

    private get totalAmountWithDiscountText() {
        return NumberUtils.getPriceFormat(this.totalAmountWithDiscount)
    }

    private get redeemedPointText() {
        return `-${this.redeemedPoint}`
    }

    private get earnPointText() {
        return `+${this.earnPoint}`
    }

    private get redeemedReceiptNo() {
        return this.earnRedeemData?.redeemData.receiptNo
    }

    private get earnReceiptNo() {
        return this.earnRedeemData?.earnData.receiptNo
    }

    private get note() {
        return this.earnRedeemData?.note
    }

    private async downloadSlip() {
        this.downloading = true
        try {
            // @ts-ignore
            await this.download()
        } catch (error) {
            //
        }
        this.downloading = false
    }

    public async download() {
        try {
            const isFileSaverSupported = !!new Blob
            console.log(isFileSaverSupported)
            // @ts-ignore
            const transactionResultEl: HTMLDivElement = this.$refs.slip
            const { clientWidth: width, clientHeight: height } = transactionResultEl

            const blob = await htmlToImage.toBlob(transactionResultEl , {
                height,
                width,
                pixelRatio: 1
            })

            if (!blob) {
                throw new Error("Error while convert file")
            }

            const filename = `transaction-${ this.earnRedeemData?.transactionId }.png`
            saveAs(blob, filename)
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || "Download error"
            })
        }
    }

    private backToMainPage() {
        this.clearMember()
        RewardServices.clearLocalEarnRedeemData()
        const query = this.$route.query
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