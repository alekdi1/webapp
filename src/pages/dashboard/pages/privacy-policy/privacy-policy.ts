import { AuthService } from "@/services"
import { DialogUtils, LanguageUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"

@Component
export default class PivacyPolicyPage extends Base {

    private loading = false
    private consent = {
        th: "",
        en: ""
    }

    private async mounted() {
        this.loading = true
        try {
            const rs = await  AuthService.getConsent()
            this.consent = {
                en: rs.consentHtmlEn,
                th: rs.consentHtmlTh
            }
        } catch (e) {
            console.log(e.message || e)
            DialogUtils.showErrorDialog({
                text: e.message || "ไม่สามารถโหลดข้อมูลได้"
            })
        }
        this.loading = false
    }

    private get consentHtml() {
        return LanguageUtils.lang(this.consent.th, this.consent.en)
    }
}
