import { Component } from "vue-property-decorator"
import { RentalModel } from "@/models"
import { DialogUtils } from "@/utils"
import { RentalServices } from "@/services"
import Base from "../base"
import { TimelineItem } from "../../model"
import TimelineView from "../../view/timeline.vue"

@Component({
    components: {
        "cpn-rental-timeline": TimelineView
    }
})
export default class RentalExpiredDetailPage extends Base {
    private rentalDetail = new RentalModel.RentalDetail()
    private showTimeline = false

    private async mounted() {
        await this.getRentalDetail()
    }

    private get rentalId () {
        return String(this.$route.query.rentalId || "")
    }

    private get status () {
        return RentalServices.RENTAL_STATUS.expired
    }

    private async getRentalDetail () {
        try {
            this.rentalDetail = await RentalServices.getRentalDetail(this.rentalId)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }

    private get isExpiredWithRefund () {
        return this.timelineData[0].active
    }

    private timelineToggle () {
        this.showTimeline = !this.showTimeline
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

    private get text () {
        return {
            title: this.$t("pages.rental.title").toString()
        }
    }
}
