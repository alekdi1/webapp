import { BranchModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { BranchService, ContactServices } from "@/services"
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import Base from "../../public-base"
import CryptoJs from "crypto-js"

@Component
export default class ContactCenterAnonymousPage extends Base {

    private loading = false
    private branch: BranchModel.Branch|null = null
    private form = new ContactForm()
    private t = (k: string) => this.$t("pages.contact." + k).toString()
    private stateHash = ""

    private mounted() {
        this.getBranch()
    }

    private async getBranch() {
        this.loading = true
        try {
            const b = await BranchService.getCenterBranch()
            this.branch = b
        } catch (e) {
            console.log(e.message || e)
        }
        this.loading = !true
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
                value: branch?.phone || ""
            }
        ]
    }

    private async submit() {
        this.form.validated = true
        if (this.form.allValidated) {
            this.form.loading = true
            try {
                const { contactName, email, imgs, phone, topic, moreInfo } = this.form
                const rs = await ContactServices.createContactAnonymous({
                    branchId: this.branch?.id || "",
                    contactName: contactName,
                    phone: phone,
                    description: moreInfo,
                    email: email,
                    title: topic,
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

                const hashStateData = {
                    date: new Date().getTime(),
                    form: this.form,
                    result: rs
                }

                const state = CryptoJs.SHA256(JSON.stringify(hashStateData)).toString()
                this.stateHash = state
                this.$router.replace({
                    query: {
                        result: "success",
                        state
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

    private back() {
        this.$router.replace({
            name: ROUTER_NAMES.login,
            query: {
                ts: new Date().getTime().toString()
            }
        })
    }

    private get showResultSuccess() {
        return this.$route.query.result === "success" && this.stateHash === this.$route.query.state
    }

    private get text() {

        return {
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
}

class ImageFormValue {
    file?: File|null
    fileDataUrl = ""
    public id = Math.random().toString(36).replace("0.", "")
    public value = ""

    public onFileInput(e: Event) {
        // @ts-ignore
        const input: HTMLInputElement = e.target
        if (input && input.files && input.files.length > 0) {
            const file = input.files.item(0)
            this.file = file
            this.fileDataUrl = URL.createObjectURL(file)
        }
    }
}

class ContactForm {
    id = Math.random().toString(13).replace("0.", "")
    validated = false
    moreInfo = ""
    loading = false
    maxInfo = 120
    contactName = ""
    phone = ""
    email = ""
    imgs = [
        new ImageFormValue(),
        new ImageFormValue(),
        new ImageFormValue()
    ]

    get topic() {
        return "How to be CPN tenant"
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
            detail: (v => {
                if (!v.trim()) return lang("ระบุรายละเอียดเพิ่มเติม", "Please input detail")
                return null
            })(this.moreInfo),

            contactName: (v => {
                if (!v) return lang("ระบุผู้ติดต่อ", "Please input contact name")
                return null
            })(this.contactName),

            phone: (v => {
                if (!v) return lang("ระบุเบอร์โทรศัพท์มือถือ", "Please input phone number")
                if (!ValidateUtils.validatePhone(v)) return lang("เบอร์โทรศัพท์มือถือไม่ถูกต้อง", "Phone number invalid")
                return null
            })(this.phone),

            email: (v => {
                if (!v) return lang("ระบุอีเมล", "Please input email address")
                if (!ValidateUtils.validateEmail(v)) return lang("อีเมลไม่ถูกต้อง", "Email invalid format")
                return null
            })(this.email)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }

    get submitDisabled() {
        return !this.validated ? false : !this.allValidated
    }
}
