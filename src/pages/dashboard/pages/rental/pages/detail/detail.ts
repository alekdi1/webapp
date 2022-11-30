import { Component } from "vue-property-decorator"
import Base from "../base"
import { RentalModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { DialogUtils, LanguageUtils } from "@/utils"
import { EmployeeServices, RentalServices } from "@/services"
import moment from "moment"

@Component
export default class RentalDetailPage extends Base {
    private rentalDetail = new RentalModel.RentalDetail()

    private async mounted() {
        await this.getRentalDetail()
    }

    private get rentalId() {
        return String(this.$route.query.rentalId || "")
    }

    private async getRentalDetail() {
        try {
            this.rentalDetail = await RentalServices.getRentalDetail(this.rentalId)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }

    private async downloadCurrentCof() {
        try {
            const url = await RentalServices._downloadCofFile(this.rentalDetail.cofRenewFile)
            const url2 = window.URL.createObjectURL(url);
            const link = document.createElement("a")
            link.href = url2
            link.download = this.rentalDetail.cofRenewFile
            link.target = "_blank"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่พบไฟล์รายละเอียดสัญญา", "Contract file not found") })
        }
    }
    private get isCOFCurrentFileEmpty() {
        return this.rentalDetail.cofRenewFile === ""
    }

    private get isLessThanOneYear() {
        return moment(this.rentalDetail.end, "YYYY-MM-DD").diff(moment(), "years", true) < 1
    }

    private get isCOFNumberEmpty() {
        return this.rentalDetail.cofNumber === ""
    }

    private get isCOFRenewFileEmpty() {
        return this.rentalDetail.cofRenewFile === "" 
    }
    
    private get isStatusTypeRenew() {
        return this.rentalDetail.info.type === "contract_renew"
    }

    private viewQuotation() {
        this.$router.push({
            name: ROUTER_NAMES.rental_quotation,
            query: {
                cofNumber: this.rentalDetail.cofRenew
            }
        })
    }

    private get canActionContact() {
        return this.user.isOwner || this.user.permissions.some(p => p.permission === EmployeeServices.PERMISSIONS.contract_renew_refund)
    }

    private get text() {
        return {
            title: this.$t("pages.rental.title").toString(),
            see_new_quotations: this.$t("pages.rental.see_new_quotations").toString()
        }
    }
}
