import { Component } from "vue-property-decorator"
import Base from "../../../../public-base"
import { ValidateUtils, DialogUtils } from "@/utils"
import { BranchService, FileService, UserServices } from "@/services"
import { BranchModel } from "@/models"
import { ROUTER_NAMES } from "@/router"

@Component
export default class OrdinaryComponent extends Base {
    private form = new RegisterForm()
    private loading = false
    private selectBranch = new SelectBranch()
    private selectedBranch: BranchModel.Branch | null = null
    private branchList: BranchModel.Branch[] = []

    private async mounted () {
        await this.getBranch()
    }

    private get selectedBranchName() {
        return this.selectedBranch ? this.selectedBranch.displayName : ""
    }

    private selectBranchClick(b: BranchModel.Branch) {
        this.selectedBranch = b
    }

    private async getBranch() {
        try {
            const branches = await BranchService.getBranchList()
            const sortedBranch = branches.sort((a, b) => a.displayName.localeCompare(b.displayName)).filter(x => x.code != "HOF")
            this.branchList = sortedBranch.map(b => {
                // if (b.code === "HOF1") {
                //     b.nameEn, b.nameTh = "สำนักงานใหญ่ 1", "สำนักงานใหญ่ 1"
                // }
                // if (b.code === "HOF2") {
                //     b.nameEn, b.nameTh = "สำนักงานใหญ่ 2", "สำนักงานใหญ่ 2"
                // }
                return b
            })
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }

    private async submit () {
        this.form.validated = true
        const { errors, allValidated } = this.form
        if (!allValidated) {
            let elRef: any = null
            let type = "input"
            if (errors.emptyName) {
                elRef = this.$refs["input-first-name"]
            } else if (errors.emptyLastname) {
                elRef = this.$refs["input-last-name"]
            } else if (this.form.emptyContact) {
                return DialogUtils.showErrorDialog({ text: "กรุณาระบุอีเมลหรือเบอร์โทรศัพท์" }).then(() => {
                    elRef = this.$refs["input-email"]
                })
            } else if (errors.invalidEmail) {
                elRef = this.$refs["input-email"]
            } else if (errors.invalidPhone) {
                elRef = this.$refs["input-phone"]
            } else if (errors.invalidCitizenId) {
                elRef = this.$refs["input-cid"]
            } else if (errors.emptyShopName) {
                elRef = this.$refs["input-shop-name"]
            } else if (!this.selectedBranch) {
                type = ""
                elRef = this.$refs["input-branch-selector"]
            } else if (errors.emptyUploadedFile) {
                return DialogUtils.showErrorDialog({ text: errors.emptyUploadedFile }).then(() => {
                    // @ts-ignore
                    this.$refs["input-upload-image"].scrollIntoView()
                })
            } else if (errors.invalidFile) {
                return DialogUtils.showErrorDialog({ text: errors.invalidFile }).then(() => {
                    // @ts-ignore
                    this.$refs["input-upload-image"].scrollIntoView()
                })
            } else if (errors.uploadingFile) {
                return DialogUtils.showErrorDialog({ text: errors.uploadingFile }).then(() => {
                    // @ts-ignore
                    this.$refs["input-upload-image"].scrollIntoView()
                })
            } else if (errors.emptySelectContact) {
                type = ""
                elRef = this.$refs["input-contact-selector"]
            } else if (errors.invalidSelectedEmailContact) {
                return DialogUtils.showErrorDialog({ text: errors.invalidSelectedEmailContact })
            } else if (errors.invalidSelectedPhoneContact) {
                return DialogUtils.showErrorDialog({ text: errors.invalidSelectedPhoneContact })
            }

            try {
                if (type === "input") {
                    elRef?.focus()
                } else {
                    // @ts-ignore
                    elRef?.scrollIntoView()
                }
            } catch (err) {
                console.log(err)
            }
            return
        }

        this.loading = true
        const { firstname, lastname, email, phone, cid, shopName, selectedMethods, uploadFiles } = this.form
        const fileNames = uploadFiles.map(f => f.name)
        // 1: phone, 2: email, 3: all
        const contactType = selectedMethods.length === 2 ? 3 : selectedMethods[0] === "phone" ? 2 : 1

        console.log("ordinary")
        const resp = await UserServices.onlineRegister({
            firstname,
            lastname,
            email,
            phone,
            branchId: this.selectedBranch ? this.selectedBranch.code : "",
            userType: "I",
            cid,
            shopName,
            contactType,
            fileNames
        })

        this.loading = false
        if (resp.status === "Error") {
            DialogUtils.showErrorDialog({ text: resp.message })
            return
        }

        this.$router.push({
            name: ROUTER_NAMES.success_register
        })
    }
}

class ImageFileUpload {
    id = Math.random().toString(36).replace("0.", "")
    file: File | null = null
    name = ""
    url = ""
    status: "uploading" | "uploaded" | "error" = "uploading"
    percent = 0

    async uploadFile () {
        try {
            if (this.file) {
                const resp = await FileService.uploadRegisterImage(this.file, e => {
                    this.percent = (e.loaded / e.total) * 100
                })
                this.name = resp.name
                this.url = resp.url
                this.status = "uploaded"
            }
        } catch (e) {
            this.status = "error"
        }
    }

    get filename () {
        return this.file?.name || ""
    }
}

class RegisterForm {
    firstname = ""
    lastname = ""
    email = ""
    phone = ""
    cid = ""
    shopName = ""
    selectedMethods: string[] = []
    uploadFiles: ImageFileUpload[] = []
    validated = false

    onFileChange(e: Event) {
        // @ts-ignore
        const input: HTMLInputElement = e.target
        if (input && input.files && input.files.length > 0) {
            const file = input.files.item(0)
            const image = new ImageFileUpload()
            image.file = file
            image.uploadFile()
            this.uploadFiles.push(image)
        }
        input.value = ""
    }

    selectMethod(v: string) {
        const isSelected = this.selectedMethods.find(s => s === v)
        if (isSelected) {
            this.selectedMethods = this.selectedMethods.filter(s => s !== v)
        } else {
            this.selectedMethods.push(v)
        }
    }

    removeFile (file: ImageFileUpload) {
        this.uploadFiles = this.uploadFiles.filter(f => f.id !== file.id)
    }

    get methods() {
        return {
            phone: {
                text: "SMS",
                value: "phone",
                selected: this.isPhone,
                icon: this.isPhone ? require("@/assets/images/icons/icon-phone-circle-active.svg") : require("@/assets/images/icons/icon-phone-circle-disabled.svg")
            },
            email: {
                text: "อีเมล",
                value: "email",
                selected: this.isEmail,
                icon: this.isEmail ? require("@/assets/images/icons/icon-email-circle-active.svg") : require("@/assets/images/icons/icon-email-circle-disabled.svg")
            }
        }
    }

    get isPhone() {
        return this.selectedMethods.some(s => s === "phone")
    }

    get isEmail() {
        return this.selectedMethods.some(s => s === "email")
    }

    get emptyContact () {
        return this.email.length === 0 && this.phone.length === 0
    }

    get errors () {
        return {
            emptyName: ((n) => {
                if (n.length === 0) return "กรุณาระบุชื่อ"
                return null
            })(this.firstname),

            emptyLastname: ((n) => {
                if (n.length === 0) return "กรุณาระบุนามสกุล"
                return null
            })(this.lastname),

            invalidEmail: ((m) => {
                if (this.emptyContact) return "กรุณาระบุอีเมลหรือเบอร์โทรศัพท์"
                if (m.length !== 0 && !ValidateUtils.validateEmail(m)) return "กรุณาระบุอีเมลให้ถูกต้อง"
                return null
            })(this.email),

            invalidPhone: ((m) => {
                if (this.emptyContact) return "กรุณาระบุอีเมลหรือเบอร์โทรศัพท์"
                if (m.length !== 0 && !ValidateUtils.validatePhone(m)) return "กรุณาระบุเบอร์โทรศัพท์ให้ถูกต้อง"
                return null
            })(this.phone),

            invalidCitizenId: ((i) => {
                if (!ValidateUtils.validateCitizenNumber(i)) return "กรุณาระบุหมายเลขบัตรประชาชนให้ถูกต้อง"
                return null
            })(this.cid),

            emptyShopName: ((s) => {
                if (s.length === 0) return "กรุณาระบุชื่อร้านค้า"
                return null
            })(this.shopName),

            emptyUploadedFile: ((fs) => {
                if (fs.length === 0) return "กรุณาอัพโหลดเอกสาร"
                return null
            })(this.uploadFiles),

            invalidFile: ((f) => {
                if (f && f.some(fs => fs.status === "error")) return "กรุณาตรวจสอบไฟล์"
                return null
            })(this.uploadFiles),

            uploadingFile: ((f) => {
                if (f && (f.some(fs => fs.percent !== 100) || f.some(fs => fs.name === ""))) return "กรุณารอเอกสารอัพโหลดให้สำเร็จ"
                return null
            })(this.uploadFiles),

            emptySelectContact: ((s) => {
                if (s.length === 0) return "กรุณาเลือกวิธีติดต่อกลับ"
                return null
            })(this.selectedMethods),

            invalidSelectedEmailContact: ((e) => {
                if (e.length === 0 && this.selectedMethods.includes("email")) return "กรุณากรอกอีเมล"
                return null
            })(this.email),

            invalidSelectedPhoneContact: ((p) => {
                if (p.length === 0 && this.selectedMethods.includes("phone")) return "กรุณากรอกเบอร์โทรศัพท์"
                return null
            })(this.phone)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }
}

class SelectBranch {
    menu = false
}
