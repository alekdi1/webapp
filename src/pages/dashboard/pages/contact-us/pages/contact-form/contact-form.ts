import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { BranchModel, UserModel } from "@/models"
import { BranchService, ContactServices } from "@/services"
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import { CPMForm } from "@/pages/dashboard/models"
import Name from "../../../page-names"
import { ROUTER_NAMES } from "@/router"

const getTopics = () => {
    return [
        {
            id: "service",
            nameTh: "การบริการ",
            nameEn: "Service"
        },
        {
            id: "maintainance",
            nameTh: "แจ้งปัญหาแอปพลิเคชัน",
            nameEn: "Maintenance"
        },
        {
            id: "promotion_activity",
            nameTh: "โปรโมชัน/กิจกรรม",
            nameEn: "Promotion/Activity"
        },
        {
            id: "payment",
            nameTh: "ชำระเงิน/ใบแจ้งหนี้/ใบเสร็จ",
            nameEn: "Payment"
        },
        {
            id: "rental_information",
            nameTh: "ข้อมูลการเช่า",
            nameEn: "Rental Information"
        },
        {
            id: "center_infomation",
            nameTh: "ข้อมูลศูนย์การค้า",
            nameEn: "Shopping Centers Information"
        },
        {
            id: "other",
            nameTh: "อื่นๆ",
            nameEn: "Other"
        }
    ].map(i => {
        const t = new Topic()
        t.id = i.id
        t.nameEn = i.nameEn
        t.nameTh = i.nameTh
        return t
    })
}

@Component({
    name: Name.contact_form
})
export default class ContactFormPage extends Base {

    private branch?: BranchModel.Branch|null = null
    private loading = false
    private t = (k: string) => this.$t("pages.contact." + k).toString()
    private form = new ContactForm()
    private userContact?: UserModel.User|null = null

    private mounted() {
        this.getBranch()
        this.userContact = this.user;
        this.form.contactName.value = this.userContact.firstName + " " + this.userContact.lastName
        this.form.phone.value = this.userContact.mobileNo; 
        this.form.email.value = this.userContact.email; 
    }

    private async getBranch() {
        this.loading = true
        try {
            this.branch = await BranchService.getBranchById(this.$route.params.branch_id)
            console.log("this.branch --> ", this.branch)
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || "Get branch error"
            })
        }
        this.loading = false
    }

    private get text() {

        return {
            contact_head_office: LanguageUtils.lang("ติดต่อสำนักงานใหญ่", "Contact head office"),
            title_suggestions: this.t("title_suggestions"),
            section_title_specify_the_topic: this.t("section_title_specify_the_topic"),
            title_select_from_suggestion: this.t("title_select_from_suggestion"),
            section_title_add_more_detail: this.t("section_title_add_more_detail"),
            phd_input_more_detail: this.t("phd_input_more_detail"),
            section_title_upload_imgs: this.t("section_title_upload_imgs"),
            section_title_contact_name: this.t("section_title_contact_name"),
            phd_input_name: this.t("phd_input_name"),
            phd_input_phone: this.t("phd_input_phone"),
            phd_email: this.t("phd_email"),
            phone: this.$t("phone_number").toString(),
            email: this.$t("email").toString(),
            phd_suggestions: this.t("phd_suggestions"),
            submit_send: this.t("submit_send")
        }
    }

    private get title() {
        return this.branch?.isHeadOffice ? this.text.contact_head_office : LanguageUtils.lang("ติดต่อ" + this.branch?.nameTh || "", "Contact branch " + this.branch?.nameEn || "")
    }

    private get branchName() {
        return this.branch?.displayName || ""
    }

    private get branchInfo() {
        const { branch } = this
        return [
            {
                label: this.$t("address").toString(),
                value: branch?.fullAddress || ""
            },
            {
                label: this.$t("business_hours").toString(),
                value: branch?.officeHours || ""
            },
            {
                label: this.$t("phone_number").toString(),
                value:  `<a href='tel:${branch?.phone}'>${branch?.phone}</a>` || ""
            },
            // {
            //     label: this.$t("email").toString(),
            //     value: branch?.email || ""
            // },
            // {
            //     label: this.$t("website").toString(),
            //     value: branch?.website || ""
            // },
        ]
    }

    private async submit() {
        this.form.validated = true
        const { contactName, email, imgs, phone, topic, moreDetail } = this.form

        if (this.form.allValidated) {
            if (!email.value && !phone.value) {
                return DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("กรุณากรอกอีเมลหรือเบอร์โทรศัพท์", "Please input email or phone")
                })
                .then(() => {
                    // @ts-ignore
                    const input: HTMLInputElement = this.$refs["input-email"]
                    if (input) {
                        input.focus()
                    }
                })
            }

            this.form.loading = true
            try {
                
                const rs = await ContactServices.createContact({
                    branchId: this.$route.params.branch_id,
                    contactName: contactName.value,
                    phone: phone.value,
                    description: moreDetail.value,
                    email: email.value,
                    title: topic.value,
                    images: (() => {
                        const files: File[] = []
                        for (const img of imgs) {
                            const { file } = img
                            if (file) {
                                files.push(file)
                            }
                        }
                        return files
                    })()
                })
                console.log(rs)
                this.$router.replace({
                    query: {
                        result: "success"
                    }
                })
            } catch (e) {
                DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("ไม่สามารถส่งข้อมูลได้", "Error while sending data")
                })
            }
            this.form.loading = false
        }
    }

    private get showSuccess() {
        return this.$route.query.result === "success"
    }

    private back() {
        this.$router.replace({
            name: ROUTER_NAMES.dashboard_contact_us_select_branch
        })
    }
}

class ContactForm {
    validated = false
    loading = false
    topic = new CPMForm.FormValue()
    moreDetail = new CPMForm.FormValue()
    contactName = new CPMForm.FormValue()
    phone = new CPMForm.FormValue()
    email = new CPMForm.FormValue()
    selectedTopic: Topic|null = null
    topics = getTopics()

    imgs = [
        new CPMForm.ImageFormValue(),
        new CPMForm.ImageFormValue(),
        new CPMForm.ImageFormValue()
    ]

    maxInfo = 120

    selectTopic(t: Topic) {
        this.selectedTopic = t
        this.topic.value = t.name
    }

    isTopicSelected(t: Topic) {
        return this.selectedTopic?.id === t.id
    }

    onFileChange(e: Event, id: string) {
        const idx = this.imgs.findIndex(img => img.id === id)
        if (idx > -1) {
            const img = this.imgs[idx]
            img.onFileInput(e)
        }
        this.imgs = [...this.imgs]
    }

    remove(id: string) {
        const idx = this.imgs.findIndex(img => img.id === id)
        if (idx > -1) {
            const img = this.imgs[idx]
            img.file = null
            img.fileDataUrl = ""
        }
        this.imgs = [...this.imgs]
    }

    get errors() {
        const { lang } = LanguageUtils
        return {
            topic: (v => {
                if (!v) return lang("ระบุหัวข้อติดต่อสอบถาม", "Please input topic")
                return null
            })(this.topic.value),

            detail: (v => {
                if (!v.trim()) return lang("ระบุรายละเอียดเพิ่มเติม", "Please input detail")
                return null
            })(this.moreDetail.value),

            contactName: (v => {
                if (!v) return lang("ระบุผู้ติดต่อ", "Please input contact name")
                return null
            })(this.contactName.value),

            phone: (v => {
                // if (!v) return lang("ระบุเบอร์โทรศัพท์มือถือ", "Please input phone number")
                if (v && !ValidateUtils.validatePhone(v)) return lang("เบอร์โทรศัพท์มือถือไม่ถูกต้อง", "Phone number invalid")
                return null
            })(this.phone.value),

            email: (v => {
                // if (!v) return lang("ระบุอีเมล", "Please input email address")
                if (v && !ValidateUtils.validateEmail(v)) return lang("อีเมลไม่ถูกต้อง", "Email invalid format")
                return null
            })(this.email.value)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }

    get submitDisabled() {
        return !this.validated ? false : !this.allValidated
    }
}

class Topic {
    id = ""
    nameTh = ""
    nameEn = ""

    get name() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }
}
