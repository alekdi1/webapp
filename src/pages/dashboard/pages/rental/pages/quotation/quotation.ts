import { Component } from "vue-property-decorator"
import Base from "../base"
import { RentalModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { DialogUtils, FileUtils, LanguageUtils, TimeUtils, ValidateUtils } from "@/utils"
import { AuthService, EmployeeServices, RentalServices } from "@/services"
import moment from "moment"
// import { Endpoints } from "@/config"
// import axios from "axios"

@Component
export default class RentalQuotationPage extends Base {
    private quotationDetail = new RentalModel.Quotation()
    private contactForm = new ContactForm()
    private loading = false
    private downloading = false
    private confirming = false

    private async mounted() {
        await this.getQuotationDetail()
    }

    private get cofNumber() {
        return String(this.$route.query.cofNumber || "")
    }

    private async getQuotationDetail() {
        try {
            this.quotationDetail = await RentalServices.getQuotationDetail(this.cofNumber)
            console.log('this.quotationDetail --> ', this.quotationDetail)
            // this.quotationDetail.submittedRenew = false // for test
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e })
            return this.$router.go(-1)
        }
    }

    private get submittedRenew() {
        return this.quotationDetail.submittedRenew
    }

    private get displayConfirmButtonText() {
        return this.submittedRenew ? LanguageUtils.lang("ยืนยันราคาเรียบร้อยแล้ว", "Confirmed") : LanguageUtils.lang("ยืนยันราคา", "Confirm")
    }

    private get disabled() {
        return this.loading || this.contactForm.loading || this.downloading
    }

    private get isCOFRenewEmpty() {
        return this.quotationDetail.cofRenewFile === ""
    }

    private get displaySubmittedRenewDate() {
        const submittedDate = moment(this.quotationDetail.submittedRenewDate, "YYYY-MM-DD HH:mm:ss")
        const localDate = TimeUtils.convertToLocalDateFormat(submittedDate)
        return LanguageUtils.lang(`วันที่กดยืนยันราคา ${localDate}`, `Confirmed date ${localDate}`)
    }

    private async confirmedPrice() {
        this.confirming = true
        try {
            await RentalServices.submitRenewQuotation(this.cofNumber)
            this.$router.push({
                name: ROUTER_NAMES.rental_renew_success,
                query: {
                    type: "confirmed"
                }
            })
            return
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e })
        }
        this.confirming = false
    }

    private async downloadRenewCof() {
        try {
            const url = await RentalServices._downloadCofFile(this.quotationDetail.cofRenewFile)
            const url2 = window.URL.createObjectURL(url);
            const link = document.createElement("a")
            link.href = url2
            link.download = this.quotationDetail.cofRenewFile
            link.target = "_blank"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (e) {
            console.log("error --> ", e)
            DialogUtils.showErrorDialog({ text: e.message || e })
        }
    }

    private async submitContact() {
        this.contactForm.validate = true
        if (this.contactForm.error !== null) {
            return
        }
        this.contactForm.loading = true
        try {
            const { value } = this.contactForm

            await RentalServices.submitQuotationDropLead(this.cofNumber, value)

            this.$router.push({
                name: ROUTER_NAMES.rental_renew_success
            })

            // clear form
            this.contactForm = new ContactForm()
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || LanguageUtils.lang("ไม่สามารถส่งข้อมูลได้", "Can not submit this information")
            })
        }
        this.contactForm.loading = !true
    }

    private get canActionContact() {
        return this.user.isOwner || this.user.permissions.some(p => p.permission === EmployeeServices.PERMISSIONS.contract_renew_refund)
    }

    private get text() {
        return {
            new_quotations: this.$t("pages.rental.new_quotations").toString(),
            download_new_quotations: this.$t("pages.rental.download_new_quotations").toString(),
            contact_us: this.$t("pages.rental.contact_us").toString(),
            contact_desc: LanguageUtils.lang("หากคุณมีข้อสงสัยสามารถทิ้งข้อมูลให้เราติดต่อกลับเพื่อเจรจาต่อรองได้", "If you have questions, please leave your contact information for us to contact you back to negotiate."),
        }
    }

    private showConfirmfromStatus(request: RentalModel.Quotation) {
        const statuses = [
            "Confirm Final Renew Contract ",
            "Interface Create Contact",
            "Interface Create Contract Error Center Invoice",
            "Admin Update Request",
            "Contract Correction",
            "Specify Cashier & Credit card",
            "Verify Cash Collection",
            "Admin Update Request Cash",
            "Verify Contract ",
            "Update Information (Tmis)",
            "Update Information",
            "Completed"
        ]
        // return statuses.map(x => {
        //     return x.replaceAll(' ','').toLowerCase()
        // }).includes(request.status.replaceAll(' ','').toLowerCase());
        return true
    }

    private showContactStaffFromStatus(request: RentalModel.Quotation) {
        const statuses = [
            "Draft",
            "Initial Process",
            "Submit",
            "Active",
            "Update Rejected Request",
            "Manager Approval",
            "Food Approval",
            "Manager Approval ",
            "AL Approval",
            "Change renew Approval",
            "Team Lead of Leasing",
            "Cat Head of Leasing",
            "Asset Leasing Approval",
            "Confirm Final Renew Contract ",
            "Interface Create Contact",
            "Interface Create Contract Error Center Invoice",
            "Admin Update Request"
        ]
        // return statuses.map(x => {
        //     return x.replaceAll(' ','').toLowerCase()
        // }).includes(request.status.replaceAll(' ','').toLowerCase());
        return true
    }
}

class ContactForm {
    selectedMethod = "phone"
    value = ""
    validate = false
    loading = false

    get methods() {
        return {
            phone: {
                value: "phone",
                selected: this.isPhone,
                icon: this.isPhone ? require("@/assets/images/icons/icon-phone-circle-active.svg") : require("@/assets/images/icons/icon-phone-circle-disabled.svg")
            },
            email: {
                value: "email",
                selected: this.isEmail,
                icon: this.isEmail ? require("@/assets/images/icons/icon-email-circle-active.svg") : require("@/assets/images/icons/icon-email-circle-disabled.svg")
            }
        }
    }

    private get isPhone() {
        return this.selectedMethod === "phone"
    }

    private get isEmail() {
        return this.selectedMethod === "email"
    }

    selectMethod(v: string) {
        this.selectedMethod = v
        this.value = ""
    }

    get inputPlaceholder() {
        return this.isPhone ?
            LanguageUtils.lang("ระบุหมายเลขโทรศัพท์ของคุณ", "Input your phone number")
            :
            LanguageUtils.lang("ระบุอีเมลของคุณ", "Input your email")
    }

    get error() {
        const { value } = this
        if (!value) {
            return this.isPhone ?
                LanguageUtils.lang("ระบุหมายเลขโทรศัพท์ของคุณ", "Input your phone number")
                :
                LanguageUtils.lang("ระบุอีเมลของคุณ", "Input your email")
        }

        if (this.isPhone && !ValidateUtils.validatePhone(value)) {
            return LanguageUtils.lang("หมายเลขโทรศัพท์ไม่ถูกต้อง", "Your phone number invalid")
        }

        if (this.isEmail && !ValidateUtils.validateEmail(value)) {
            return LanguageUtils.lang("อีเมลไม่ถูกต้อง", "email invalid")
        }

        return null
    }
}

