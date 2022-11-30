import { Component } from "vue-property-decorator"
import Base from "../base"
import { RentalModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { DialogUtils } from "@/utils"
import { EmployeeServices, RentalServices } from "@/services"
import { TimelineItem } from "../../model"
import TimelineView from "../../view/timeline.vue"

@Component({
    components: {
        "cpn-rental-timeline": TimelineView
    }
})
export default class RentalRefundDetailPage extends Base {
    private rentalDetail = new RentalModel.RentalDetail()
    private showTimeline = false

    private async mounted() {
        await this.getRentalDetail()
    }

    private get rentalId () {
        return String(this.$route.query.rentalId || "")
    }

    private async getRentalDetail () {
        try {
            this.rentalDetail = await RentalServices.getRentalDetail(this.rentalId)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }

    private get status () {
        return this.rentalDetail.info.type
    }

    private async downloadCurrentCof () {
        try {
            const url = await RentalServices.downloadCofFile(this.rentalDetail.cofCurrentFile)
            const link = document.createElement("a")
            link.href = url
            link.download = this.rentalDetail.cofCurrentFile
            link.target = "_blank"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }

    private get isCOFCurrentFileEmpty () {
        return this.rentalDetail.cofCurrentFile === ""
    }

    private async submitRefund () {
        try {
            await RentalServices.submitRefund(this.rentalDetail.id)

            this.$router.push({
                name: ROUTER_NAMES.rental_refund_success,
                query: {
                    rentalId: this.rentalId
                }
            })
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }

    private timelineToggle () {
        this.showTimeline = !this.showTimeline
    }

    private get downloadForm () {
        return "https://cpn-services.abbon.co.th/upload/refund_form.pdf"
    }

    private get submitted () {
        return this.rentalDetail.requestRefund === 1
    }

    private get haveTrackingStatus () {
        return !!this.rentalDetail.refundProgress
    }

    private get hideRefundFormButton () {
        return this.timelineData[0].active === false || this.timelineData[4].active || this.timelineData[5].active
    }

    private get timelineData() {
        const timeline: TimelineItem[] = []
        const progress = this.rentalDetail.refundProgress
        for (const p of progress) {
            timeline.push(
                (() => {
                    const t = new TimelineItem()
                    t.active = p.status
                    t.title = p.name
                    t.detail = p.desc
                    return t
                })()
            )
        }
        return timeline
    }

    private get showRequestRefund() {
        return this.canActionContact && !this.submitted && RentalServices.RENTAL_STATUS.refund === this.rentalDetail.info.type
    }

    private get canActionContact() {
        return this.user.isOwner || this.user.permissions.some(p => p.permission === EmployeeServices.PERMISSIONS.contract_renew_refund)
    }

    private get text () {
        return {
            title: this.$t("pages.rental.title").toString(),
            download_current_quotation: this.$t("pages.rental.download_current_quotation").toString(),
            request_refund: this.$t("pages.rental.request_refund").toString(),
            see_refund_status: this.$t("pages.rental.see_refund_status").toString(),
            request_refund_form: this.$t("pages.rental.request_refund_form").toString(),
            refund_status: this.$t("pages.rental.refund_status").toString()
        }
    }
}
