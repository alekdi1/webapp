import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { ContactModel } from "@/models"
import { ContactServices } from "@/services"
import Name from "../../../page-names"
import { DialogUtils, LanguageUtils, StringUtils } from "@/utils"
import moment from "moment"

@Component({
    name: Name.answer_question_detail
})
export default class ContactAnswerQuestionDetailPage extends Base {
    private loading = false
    private t = (k: string) => this.$t("pages.contact." + k).toString()
    private contact: ContactModel.ContactDetail|null = null
    private errorMessage = ""
    private previewImage = false
    private chooseImage = ""


    private mounted() {
        this.getContractData()
    }

    private showPreviewImage(image: any) {
        console.log(image)
        if (image != null) {
            // this.previewImage = true
            // this.chooseImage = image
            window.open(image,'_blank');
        }
    }


    private async getContractData() {
        this.loading = true
        this.errorMessage = ""
        try {
            this.contact = await ContactServices.getContactDetail(this.$route.params.id)
            console.log("contact --> ", this.contact)
        } catch (e) {
            console.log("error --> ", e)
            this.errorMessage = e.message
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }
        this.loading = false
    }

    private get text() {
        return {
            title_suggestions: this.t("title_suggestions"),
            section_title_specify_the_topic: this.t("section_title_specify_the_topic"),
            title_select_from_suggestion: this.t("title_select_from_suggestion"),
            section_title_add_more_detail: this.t("section_title_add_more_detail"),
            section_title_upload_imgs: this.t("section_title_upload_imgs"),
            section_title_contact_name: this.t("section_title_contact_name"),
            phone: this.$t("phone_number").toString(),
            email: this.$t("email").toString()
        }
    }

    private get title() {
        return this.t("contact_branch")
    }

    private get branchName() {
        return this.contact?.branch?.displayName || ""
    }

    private get images() {
        return this.contact?.images || []
    }

    private displayContactUserDate(date: string) {
        const d = moment(date, "YYYY-MM-DD HH:mm:ss")
        return d.isValid() ? d.locale(this.$i18n.locale).format("DD MMM ") + String(LanguageUtils.getLangYear(d)).substring(2, 4) : ""
    }

    private get replyImage() {
        const img = this.contact?.replyImage || ""
        return StringUtils.isUrl(img) ? img : ""
    }
}
